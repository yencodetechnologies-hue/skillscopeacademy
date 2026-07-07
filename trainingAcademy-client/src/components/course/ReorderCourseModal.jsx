import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./ReorderCourseModal.css";
import { API_URL } from "../../data/service";

export default function ReorderCourseModal({ isOpen, onClose, courses, categoryList, refreshCourses }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [orderedCourses, setOrderedCourses] = useState([]);
    const [isReordering, setIsReordering] = useState(false);
    const [saveStatus, setSaveStatus] = useState(""); // "saving" | "saved" | ""

    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    // Group courses by category name
    const categoryMap = {};
    courses.forEach((course) => {
        const cat = course.category?.name || course.category || "Uncategorized";
        if (!categoryMap[cat]) categoryMap[cat] = [];
        categoryMap[cat].push(course);
    });

    // ✅ Use categoryList order (from Category model) if available
    // fallback to courses-derived order
    const orderedCategoryList = categoryList && categoryList.length > 0
        ? categoryList
            .map(c => ({ name: c.name, count: categoryMap[c.name]?.length || 0 }))
            .filter(c => c.count > 0) // only show categories that have courses
        : Object.keys(categoryMap).map(cat => ({
            name: cat,
            count: categoryMap[cat].length,
        }));

    // When category selected, load its courses into local ordered state
    useEffect(() => {
        if (selectedCategory) {
            setOrderedCourses([...(categoryMap[selectedCategory] || [])]);
            setIsReordering(false);
            setSaveStatus("");
        }
    }, [selectedCategory]);

    if (!isOpen) return null;

    // ── DRAG HANDLERS ──────────────────────────────
    const handleDragStart = (index) => {
        dragItem.current = index;
    };

    const handleDragEnter = (index) => {
        if (dragItem.current === index) return;
        dragOverItem.current = index;

        const updated = [...orderedCourses];
        const dragged = updated.splice(dragItem.current, 1)[0];
        updated.splice(index, 0, dragged);
        dragItem.current = index;
        setOrderedCourses(updated);
        setIsReordering(true);
        setSaveStatus("");
    };

    const handleDragEnd = async () => {
        dragItem.current = null;
        dragOverItem.current = null;
        setIsReordering(false);

        setSaveStatus("saving");
        try {
            const payload = {
                courses: orderedCourses.map((c, index) => ({
                    id: c._id,
                    sortOrder: index,
                })),
            };
            await axios.put(`${API_URL}/api/courses/reorder/all`, payload);
            setSaveStatus("saved");
            refreshCourses();
            setTimeout(() => setSaveStatus(""), 2000);
        } catch (err) {
            console.log("Reorder save error:", err);
            setSaveStatus("");
        }
    };

    const handleDragOver = (e) => e.preventDefault();

    return (
        <>
            {/* BACKDROP */}
            <div className="rco-backdrop" onClick={onClose} />

            {/* MODAL */}
            <div className="rco-modal" role="dialog" aria-modal="true">

                {/* Header */}
                <div className="rco-header">
                    <div>
                        <h2 className="rco-title">Manage Course Order</h2>
                        <p className="rco-subtitle">
                            Select a category, then drag courses to reorder. Order reflects on the landing page.
                        </p>
                    </div>
                    <button className="rco-close-btn" onClick={onClose} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="rco-body">

                    {/* Category selector — ✅ same order as Category model */}
                    <div className="rco-category-section">
                        <p className="rco-section-label">Select category</p>
                        <div className="rco-category-list">
                            {orderedCategoryList.map((cat) => (
                                <div
                                    key={cat.name}
                                    className={`rco-category-item ${selectedCategory === cat.name ? "rco-category-item--active" : ""}`}
                                    onClick={() => setSelectedCategory(cat.name)}
                                >
                                    <span className="rco-category-name">{cat.name}</span>
                                    {cat.count > 0 && (
                                        <span className="rco-category-count">{cat.count} courses</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Course reorder section */}
                    {selectedCategory ? (
                        <div className="rco-courses-section">
                            <p className="rco-courses-heading">
                                Courses in {selectedCategory}
                                {isReordering && <span className="rco-reordering-tag"> (reordering...)</span>}
                                {saveStatus === "saving" && <span className="rco-saving-tag"> (saving...)</span>}
                                {saveStatus === "saved" && <span className="rco-saved-tag"> ✓ saved</span>}
                            </p>

                            <div className="rco-course-list">
                                {orderedCourses.map((course, index) => (
                                    <div
                                        key={course._id}
                                        className="rco-course-item"
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragEnter={() => handleDragEnter(index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={handleDragOver}
                                    >
                                        <span className="rco-drag-handle">
                                            <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                                                <circle cx="4" cy="3"  r="1.5" fill="currentColor"/>
                                                <circle cx="4" cy="8"  r="1.5" fill="currentColor"/>
                                                <circle cx="4" cy="13" r="1.5" fill="currentColor"/>
                                                <circle cx="8" cy="3"  r="1.5" fill="currentColor"/>
                                                <circle cx="8" cy="8"  r="1.5" fill="currentColor"/>
                                                <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
                                            </svg>
                                        </span>
                                        <span className="rco-course-title">
                                            {course.title?.length > 55
                                                ? course.title.substring(0, 55) + "..."
                                                : course.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rco-empty-hint">
                            Select a category above to reorder its courses.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}