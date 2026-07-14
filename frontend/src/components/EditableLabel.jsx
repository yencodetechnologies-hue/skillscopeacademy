import { useState, useRef, useEffect } from "react"

/**
 * EditableLabel — shows a label with a pencil icon.
 * Click the pencil (or the label text) to edit inline.
 * Press Enter or click away to confirm.
 */
function EditableLabel({ value, onChange, className = "" }) {
    const [editing, setEditing] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => {
        if (editing && inputRef.current) inputRef.current.focus()
    }, [editing])

    const done = () => setEditing(false)

    if (editing) {
        return (
            <input
                ref={inputRef}
                className={`editable-label-input ${className}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={done}
                onKeyDown={(e) => e.key === "Enter" && done()}
            />
        )
    }

    return (
        <span
            className={`editable-label-display ${className}`}
            onClick={() => setEditing(true)}
            title="Click to edit label"
        >
            {value}
            <button
                type="button"
                className="editable-label-pencil"
                onClick={(e) => { e.stopPropagation(); setEditing(true) }}
                title="Edit label"
            >
                ✏
            </button>
        </span>
    )
}

export default EditableLabel