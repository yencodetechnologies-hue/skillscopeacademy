import { useState } from "react"
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable,
} from "@dnd-kit/core"
import "../../styles/Digital.css"
import deskTop      from "../../assets/dekstop-computer.png"
import imageForDnD  from "../../assets/imagefordraganddrop.png"
import pdf          from "../../assets/pngimage.png"
import iphone       from "../../assets/phone.png"
import photoCopier  from "../../assets/photocopier.jpg"
import laptop       from "../../assets/laptop.jpg"
import barCode      from "../../assets/barcode-scanner.jpg"
import logo        from "../../assets/SafetyTrainingAcademylogo.png"

const digitalQuestions = [
    { type: "drag-files"  },
    { type: "drag-labels" },
    { type: "input-url"   },
]

// ─── Reusable Draggable wrapper ───────────────────────────────────────────────
function Draggable({ id, data, children, className }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id, data })
    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={className}
            style={{
                visibility: isDragging ? "hidden" : "visible",
                touchAction: "none"
            }}
        >
            {children}
        </div>
    )
}

// ─── Reusable Droppable wrapper ───────────────────────────────────────────────
function Droppable({ id, children, className, dataAttr }) {
    const { setNodeRef, isOver } = useDroppable({ id })
    return (
        <div
            ref={setNodeRef}
            className={className}
            style={{ outline: isOver ? "2px dashed #4caf50" : undefined }}
            {...dataAttr}
        >
            {children}
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────
function Digital({ next }) {
    const [index, setIndex] = useState(0)

    const [files, setFiles] = useState([
        { id: "file-1", type: "pdf"   },
        { id: "file-2", type: "pdf"   },
        { id: "file-3", type: "image" },
    ])
    const [fileDrop, setFileDrop] = useState({ checklist: [], images: [] })

    const [labels, setLabels] = useState([
        "Desktop Computer",
        "2 in 1 / Laptop / Macbook",
        "iPhone / iPad",
        "Barcode Scanner",
        "Photocopier",
    ])
    const [labelDrop, setLabelDrop] = useState({})
    const [url, setUrl] = useState("")

    // active drag item — used for DragOverlay
    const [activeItem, setActiveItem] = useState(null)

    const question = digitalQuestions[index]

    // ── Sensors: PointerSensor = mouse/stylus, TouchSensor = mobile touch ─────
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 100, tolerance: 5 },
        })
    )

    // ── Drag start — capture active item for overlay ──────────────────────────
    const handleDragStart = ({ active }) => {
        setActiveItem(active.data.current)
    }

    // ── Drag end — apply drop logic ───────────────────────────────────────────
    const handleDragEnd = ({ active, over }) => {
        setActiveItem(null)
        if (!over) return

        const item   = active.data.current
        const zoneId = over.id

        if (question.type === "drag-files") {
            if (zoneId === "checklist" && item.type !== "pdf")   return
            if (zoneId === "images"    && item.type !== "image")  return
            setFileDrop(prev => ({ ...prev, [zoneId]: [...prev[zoneId], item] }))
            setFiles(prev => prev.filter(f => f.id !== item.id))
        }

        if (question.type === "drag-labels") {
            const validZones = ["desktop", "phone", "printer", "laptop", "scanner"]
            if (!validZones.includes(zoneId)) return
            setLabelDrop(prev => ({ ...prev, [zoneId]: item }))
            setLabels(prev => prev.filter(l => l !== item))
        }
    }

    // ── Logic ─────────────────────────────────────────────────────────────────
    const labelDone = Object.keys(labelDrop).length === 5

    const handleNext = () => {
        if (question.type === "drag-files") {
            if (fileDrop.checklist.length !== 2 || fileDrop.images.length !== 1) return
        }
        if (question.type === "drag-labels" && !labelDone) return
        if (question.type === "input-url"   && !url)       return

        if (index < digitalQuestions.length - 1) {
            setIndex(index + 1)
        } else {
            let score = 0
            fileDrop.checklist.forEach(f => { if (f.type === "pdf")   score++ })
            fileDrop.images.forEach(f    => { if (f.type === "image") score++ })

            const correctLabels = {
                desktop: "Desktop Computer",
                laptop:  "2 in 1 / Laptop / Macbook",
                phone:   "iPhone / iPad",
                scanner: "Barcode Scanner",
                printer: "Photocopier",
            }
            Object.keys(correctLabels).forEach(key => {
                if (labelDrop[key] === correctLabels[key]) score++
            })
            if (url.trim() === "https://safetytrainingacademy.edu.au") score++

            const formattedAnswers = {}
            fileDrop.checklist.forEach((f, i) => { formattedAnswers[`0-${i}`]     = f.type })
            fileDrop.images.forEach((f, i)    => { formattedAnswers[`0-${i + 2}`] = f.type })
            const order = ["desktop", "laptop", "phone", "scanner", "printer"]
            order.forEach((key, i) => { formattedAnswers[`1-${i}`] = labelDrop[key] })
            formattedAnswers["2"] = url

            next(formattedAnswers)
        }
    }

    const handlePrev  = () => { if (index > 0) setIndex(index - 1) }

    const handleReset = () => {
        if (question.type === "drag-files") {
            setFiles([
                { id: "file-1", type: "pdf"   },
                { id: "file-2", type: "pdf"   },
                { id: "file-3", type: "image" },
            ])
            setFileDrop({ checklist: [], images: [] })
        }
        if (question.type === "drag-labels") {
            setLabels(["Desktop Computer", "2 in 1 / Laptop / Macbook", "iPhone / iPad", "Barcode Scanner", "Photocopier"])
            setLabelDrop({})
        }
        if (question.type === "input-url") setUrl("")
    }

    // ── DragOverlay content — follows the finger/cursor while dragging ─────────
    const renderOverlay = () => {
        if (!activeItem) return null
        if (question.type === "drag-files") {
            return (
                <div className="draggable" style={{ opacity: 0.9, cursor: "grabbing" }}>
                    <img src={activeItem.type === "pdf" ? pdf : imageForDnD} alt="" />
                </div>
            )
        }
        if (question.type === "drag-labels") {
            return (
                <div className="draggable green" style={{ opacity: 0.9, cursor: "grabbing" }}>
                    {activeItem}
                </div>
            )
        }
        return null
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="digital-container">
            <h4 className="digital-title">DIGITAL LITERACY</h4>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* ── Q1 : DRAG FILES ── */}
                {question.type === "drag-files" && (
                    <>
                        <p className="digital-instruction">
                            Drag PDFs to Checklist Book and image to Images
                        </p>
                        <div className="digital-main">

                            <div className="digital-left">
                                {files.map((f) => (
                                    <Draggable key={f.id} id={f.id} data={f} className="draggable">
                                        <img src={f.type === "pdf" ? pdf : imageForDnD} alt="" />
                                    </Draggable>
                                ))}
                            </div>

                            <div className="digital-image-wrapper">
                                <img src={deskTop} className="digital-bg-img" alt="" />

                                <Droppable
                                    id="checklist"
                                    className={`drop-zone overlay-drop checklist ${fileDrop.checklist.length > 0 ? "filled" : ""}`}
                                    dataAttr={{ "data-zone": "checklist" }}
                                >
                                    Checklist Book ({fileDrop.checklist.length}/2)
                                </Droppable>

                                <Droppable
                                    id="images"
                                    className={`drop-zone overlay-drop images ${fileDrop.images.length > 0 ? "filled" : ""}`}
                                    dataAttr={{ "data-zone": "images" }}
                                >
                                    {fileDrop.images.length > 0 ? "Images ✓" : "Images"}
                                </Droppable>
                            </div>

                        </div>
                        <button className="reset-btn" onClick={handleReset}>Reset</button>
                    </>
                )}

                {/* ── Q2 : DRAG LABELS ── */}
                {question.type === "drag-labels" && (
                    <>
                        <p className="digital-instruction">Drag each label to correct device</p>
                        <div className="digital-main labels-layout">

                            <div className="digital-left">
                                {labels.map((l, i) => (
                                    <Draggable key={l} id={`label-${i}`} data={l} className="draggable green">
                                        {l}
                                    </Draggable>
                                ))}
                            </div>

                            <div className="digital-right grid">
                                {[
                                    { src: deskTop,     key: "desktop" },
                                    { src: iphone,      key: "phone"   },
                                    { src: photoCopier, key: "printer" },
                                    { src: laptop,      key: "laptop"  },
                                    { src: barCode,     key: "scanner" },
                                ].map(({ src, key }) => (
                                    <div className="device" key={key}>
                                        <img src={src} alt={key} />
                                        <Droppable
                                            id={key}
                                            className={`drop-zone ${labelDrop[key] ? "filled" : ""}`}
                                            dataAttr={{ "data-device": key }}
                                        >
                                            {labelDrop[key] || "Drop here"}
                                        </Droppable>
                                    </div>
                                ))}
                            </div>

                        </div>
                        <button className="reset-btn" onClick={handleReset}>Reset</button>
                        {labelDone && <p className="success">✔ Marked Complete</p>}
                    </>
                )}

                {/* ── Q3 : URL INPUT ── */}
                {question.type === "input-url" && (
                    <>
                        <p className="digital-instruction">
                            Your trainer asks you to find information about Safety training academy.
                        </p>
                        <img src={logo} className="digital-logo" alt="" />
                        <p className="url-label">Fill in the URL</p>
                        <input
                            className="url-input"
                            placeholder="https://"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </>
                )}

                {/* Floating clone that follows pointer/finger during drag */}
                <DragOverlay dropAnimation={null}>
                    {renderOverlay()}
                </DragOverlay>

            </DndContext>

            <div className="digital-footer">
                <button onClick={handlePrev}>Previous</button>
                <span>Question {index + 1} of 3</span>
                <button onClick={handleNext}>
                    {index === 2 ? "Submit Section" : "Next"}
                </button>
            </div>
        </div>
    )
}

export default Digital