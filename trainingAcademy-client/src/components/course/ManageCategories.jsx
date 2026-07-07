import { useEffect, useMemo, useRef, useState } from "react";
import "./ManageCategories.css";
import axios from "axios";
import { API_URL } from "../../data/service";
import { cdnImage } from "../../utils/cdnImage";

// Reusable image picker. Mode: "keep" | "file" | "url".
// `allowKeep` is true only on edit (so user can leave the existing image alone).
function ImagePicker({ mode, setMode, file, setFile, url, setUrl, fallbackUrl, allowKeep }) {
    const fileInputRef = useRef(null);

    const previewUrl = useMemo(() => {
        if (mode === "file" && file) return URL.createObjectURL(file);
        if (mode === "url" && url) return url;
        if (mode === "keep" && fallbackUrl) return fallbackUrl;
        return "";
    }, [mode, file, url, fallbackUrl]);

    return (
        <div className="mcc-img-picker">
            <div className="mcc-img-toggle">
                {allowKeep && (
                    <button
                        type="button"
                        className={`mcc-img-toggle-btn ${mode === "keep" ? "is-active" : ""}`}
                        onClick={() => { setMode("keep"); setFile(null); setUrl(""); }}
                    >Keep current</button>
                )}
                <button
                    type="button"
                    className={`mcc-img-toggle-btn ${mode === "file" ? "is-active" : ""}`}
                    onClick={() => { setMode("file"); setUrl(""); }}
                >Upload</button>
                <button
                    type="button"
                    className={`mcc-img-toggle-btn ${mode === "url" ? "is-active" : ""}`}
                    onClick={() => { setMode("url"); setFile(null); }}
                >URL</button>
            </div>

            <div className="mcc-img-input-row">
                <div className="mcc-img-input-grow">
                    {mode === "file" && (
                        <>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <button
                                type="button"
                                className="mcc-file-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M7 1.5v8M3.5 5L7 1.5 10.5 5M2.5 11.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Choose image
                            </button>
                            {file && <span className="mcc-file-name">{file.name}</span>}
                        </>
                    )}

                    {mode === "url" && (
                        <input
                            type="url"
                            className="mcc-input mcc-input--small"
                            placeholder="https://example.com/image.jpg"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    )}

                    {mode === "keep" && (
                        <span className="mcc-keep-hint">
                            {fallbackUrl ? "Keeping existing image" : "No image set"}
                        </span>
                    )}
                </div>

                {previewUrl && (
                    <img src={previewUrl} alt="preview" className="mcc-img-preview" />
                )}
            </div>
        </div>
    );
}

export default function ManageCategories({ isOpen, onClose, onRefresh }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    // Add form
    const [newName, setNewName] = useState("");
    const [newMode, setNewMode] = useState("file");
    const [newFile, setNewFile] = useState(null);
    const [newUrl, setNewUrl] = useState("");
    const [addError, setAddError] = useState("");
    const [adding, setAdding] = useState(false);

    // Edit form
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editMode, setEditMode] = useState("keep");
    const [editFile, setEditFile] = useState(null);
    const [editUrl, setEditUrl] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);

    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            resetAddForm();
            cancelEdit();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/categories`);
            setCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch categories:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const resetAddForm = () => {
        setNewName("");
        setNewMode("file");
        setNewFile(null);
        setNewUrl("");
        setAddError("");
    };

    const handleAdd = async () => {
        const trimmed = newName.trim();
        if (!trimmed) { setAddError("Please enter a category name."); return; }
        const duplicate = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
        if (duplicate) { setAddError("Category name already exists."); return; }

        try {
            setAdding(true);
            const fd = new FormData();
            fd.append("name", trimmed);
            if (newMode === "file" && newFile) fd.append("image", newFile);
            else if (newMode === "url" && newUrl.trim()) fd.append("imageUrl", newUrl.trim());

            await axios.post(`${API_URL}/api/categories`, fd);
            // Reload the in-modal list so the new row appears immediately
            // and stay open so the admin can keep adding/editing without
            // having to reopen Manage Categories every time.
            await fetchCategories();
            resetAddForm();
            onRefresh && onRefresh();
        } catch (err) {
            setAddError(err.response?.data?.message || "Failed to add category.");
        } finally {
            setAdding(false);
        }
    };

    const startEdit = (cat) => {
        setEditingId(cat._id);
        setEditName(cat.name);
        setEditMode("keep");
        setEditFile(null);
        setEditUrl("");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName("");
        setEditMode("keep");
        setEditFile(null);
        setEditUrl("");
    };

    const saveEdit = async (id) => {
        const trimmed = editName.trim();
        if (!trimmed) return;
        try {
            setSavingEdit(true);
            const fd = new FormData();
            fd.append("name", trimmed);
            if (editMode === "file" && editFile) fd.append("image", editFile);
            else if (editMode === "url") fd.append("imageUrl", editUrl.trim());
            // "keep" sends nothing — backend preserves the existing image.

            await axios.put(`${API_URL}/api/categories/${id}`, fd);
            // Pull the fresh list before collapsing the edit row so the new
            // name/image is shown right away. We keep the modal open so the
            // admin can continue editing other categories.
            await fetchCategories();
            cancelEdit();
            onRefresh && onRefresh();
        } catch (err) {
            console.error("Failed to update category:", err);
            alert(err.response?.data?.message || "Save failed.");
        } finally {
            setSavingEdit(false);
        }
    };

    const requestDelete = (cat) => setDeleteTarget(cat);

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await axios.delete(`${API_URL}/api/categories/${deleteTarget._id}`);
            if (res.data.message === "Category deactivated") {
                setCategories(prev => prev.map(c => c._id === deleteTarget._id ? { ...c, active: false } : c));
            } else {
                setCategories(prev => prev.filter(c => c._id !== deleteTarget._id));
            }
            onRefresh && onRefresh();
        } catch (err) {
            console.error("Failed to delete category:", err);
        }
        setDeleteTarget(null);
    };

    const cancelDelete = () => setDeleteTarget(null);

    const handleDragStart = (index) => { dragItem.current = index; };

    const handleDragEnter = (index) => {
        if (dragItem.current === index) return;
        dragOverItem.current = index;
        const updated = [...categories];
        const dragged = updated.splice(dragItem.current, 1)[0];
        updated.splice(index, 0, dragged);
        dragItem.current = index;
        setCategories(updated);
    };

    const handleDragEnd = async () => {
        dragItem.current = null;
        dragOverItem.current = null;
        try {
            const payload = {
                categories: categories.map((cat, index) => ({ id: cat._id, order: index })),
            };
            await axios.put(`${API_URL}/api/categories/reorder/all`, payload);
            onRefresh && onRefresh();
        } catch (err) {
            console.error("Failed to save category order:", err);
        }
    };

    const activeCount = categories.filter(c => c.active).length;
    const editingCat = categories.find(c => c._id === editingId);

    return (
        <>
            <div className="mcc-backdrop" onClick={onClose} />

            <div className="mcc-modal" role="dialog" aria-modal="true" aria-labelledby="mcc-title">

                {/* Header */}
                <div className="mcc-header">
                    <div>
                        <h2 id="mcc-title" className="mcc-title">Manage Course Categories</h2>
                        <p className="mcc-subtitle">Add, edit, or remove course categories</p>
                    </div>
                    <button className="mcc-close-btn" onClick={onClose} aria-label="Close">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {/* Add new category */}
                <div className="mcc-add-card">
                    <div className="mcc-add-row">
                        <div className="mcc-input-wrap">
                            <input
                                type="text"
                                className={`mcc-input ${addError ? "mcc-input--error" : ""}`}
                                placeholder="Enter new category name"
                                value={newName}
                                onChange={(e) => { setNewName(e.target.value); if (addError) setAddError(""); }}
                                onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                            />
                            {addError && <span className="mcc-error-msg">{addError}</span>}
                        </div>
                        <button className="mcc-add-btn" onClick={handleAdd} disabled={adding}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            {adding ? "Adding..." : "Add"}
                        </button>
                    </div>

                    <ImagePicker
                        mode={newMode}
                        setMode={setNewMode}
                        file={newFile}
                        setFile={setNewFile}
                        url={newUrl}
                        setUrl={setNewUrl}
                        allowKeep={false}
                    />
                </div>

                {/* Category list */}
                <div className="mcc-list">
                    {loading ? (
                        <p style={{ textAlign: "center", color: "#888", padding: "20px" }}>Loading...</p>
                    ) : (
                        categories.map((cat, index) => {
                            const isEditing = editingId === cat._id;
                            return (
                                <div
                                    key={cat._id}
                                    className={`mcc-item ${!cat.active ? "mcc-item--inactive" : ""} ${isEditing ? "mcc-item--editing" : ""}`}
                                    draggable={!isEditing}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragEnter={() => handleDragEnter(index)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    {/* Top row of the item */}
                                    <div className="mcc-item-top">
                                        <span className="mcc-drag-handle" title="Drag to reorder">
                                            <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                                                <circle cx="4" cy="3"  r="1.5" fill="currentColor"/>
                                                <circle cx="4" cy="8"  r="1.5" fill="currentColor"/>
                                                <circle cx="4" cy="13" r="1.5" fill="currentColor"/>
                                                <circle cx="8" cy="3"  r="1.5" fill="currentColor"/>
                                                <circle cx="8" cy="8"  r="1.5" fill="currentColor"/>
                                                <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
                                            </svg>
                                        </span>

                                        {cat.image ? (
                                            <img
                                                src={cdnImage(cat.image, { w: 120 })}
                                                alt={cat.name}
                                                className="mcc-row-thumb"
                                                loading="lazy"
                                                decoding="async"
                                                width="60"
                                                height="60"
                                            />
                                        ) : (
                                            <div className="mcc-row-thumb mcc-row-thumb--empty" aria-label="No image">
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <path d="M2 11l3-3 2 2 3-3 2 2v3H2zM4 5a1 1 0 100-2 1 1 0 000 2z" fill="currentColor"/>
                                                </svg>
                                            </div>
                                        )}

                                        {isEditing ? (
                                            <input
                                                className="mcc-edit-input"
                                                value={editName}
                                                autoFocus
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") saveEdit(cat._id);
                                                    if (e.key === "Escape") cancelEdit();
                                                }}
                                            />
                                        ) : (
                                            <div className="mcc-item-info">
                                                <span className="mcc-item-name">{cat.name}</span>
                                                <span className="mcc-item-count">{cat.courseCount} courses</span>
                                                {!cat.active && <span className="mcc-inactive-badge">Deactivated</span>}
                                            </div>
                                        )}

                                        <div className="mcc-item-actions">
                                            {isEditing ? (
                                                <>
                                                    <button className="mcc-save-btn" onClick={() => saveEdit(cat._id)} disabled={savingEdit}>
                                                        {savingEdit ? "Saving..." : "Save"}
                                                    </button>
                                                    <button className="mcc-cancel-btn" onClick={cancelEdit}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="mcc-action-btn mcc-action-btn--edit" onClick={() => startEdit(cat)} title="Edit category">
                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                            <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                                                        </svg>
                                                    </button>
                                                    <button className="mcc-action-btn mcc-action-btn--delete" onClick={() => requestDelete(cat)} title="Delete category">
                                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                            <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Edit panel (shown only when editing) */}
                                    {isEditing && (
                                        <div className="mcc-edit-panel">
                                            <div className="mcc-edit-panel-label">Image</div>
                                            <ImagePicker
                                                mode={editMode}
                                                setMode={setEditMode}
                                                file={editFile}
                                                setFile={setEditFile}
                                                url={editUrl}
                                                setUrl={setEditUrl}
                                                fallbackUrl={editingCat?.image}
                                                allowKeep={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="mcc-footer">
                    <span>Total Categories: <strong>{activeCount}</strong></span>
                    <span className="mcc-footer-hint">• Drag to reorder (order appears on front page)</span>
                </div>
            </div>

            {/* Delete confirmation */}
            {deleteTarget && (
                <>
                    <div className="mcc-dialog-backdrop" />
                    <div className="mcc-dialog" role="alertdialog" aria-labelledby="mcc-dialog-title">
                        <h3 id="mcc-dialog-title" className="mcc-dialog-title">Delete Category</h3>
                        <p className="mcc-dialog-body">
                            {deleteTarget.courseCount > 0
                                ? `This category has courses and will be deactivated instead of deleted.`
                                : `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone.`}
                        </p>
                        <div className="mcc-dialog-actions">
                            <button className="mcc-dialog-cancel" onClick={cancelDelete}>Cancel</button>
                            <button className="mcc-dialog-confirm" onClick={confirmDelete}>
                                {deleteTarget.courseCount > 0 ? "Deactivate" : "Delete"}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
