// admin/SectionContentManager.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SectionContentManager.css";
import { API_URL } from "../data/service";

export default function SectionContentManager() {
  // ===== Quick facts state =====
  const [facts, setFacts] = useState([]);
  const [factsLoading, setFactsLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // "view" | "edit" | null
  const [activeFact, setActiveFact] = useState(null);
  const [factSaving, setFactSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchFacts();
  }, []);

  const fetchFacts = async () => {
    setFactsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/section-content/quick-facts/all`);
      setFacts(res.data);
    } catch (err) {
      console.error("Failed to fetch quick facts:", err);
      setFacts([]);
    }
    setFactsLoading(false);
  };

  const openView = (fact) => {
    setActiveFact(fact);
    setErrors({});
    setModalMode("view");
  };

  const openEdit = (fact) => {
    setActiveFact({ ...fact });
    setErrors({});
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveFact(null);
    setErrors({});
  };

  const handleFactChange = (field, value) => {
    setActiveFact((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const valTrimmed = (activeFact.val || "").trim();
    const labelTrimmed = (activeFact.label || "").trim();

    // Value validation
    if (!valTrimmed) {
      newErrors.val = "Value is required.";
    } else if (valTrimmed.length > 20) {
      newErrors.val = "Value must be minimum 20 characters.";
    }

    // Label validation
    if (!labelTrimmed) {
      newErrors.label = "Label is required.";
    } else if (labelTrimmed.length > 20) {
      newErrors.label = "Label must be minimum 20 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFactSave = async () => {
    if (!validate()) return;

    setFactSaving(true);
    try {
      await axios.put(`${API_URL}/api/section-content/quick-facts/${activeFact._id}`, {
        val: activeFact.val.trim(),
        label: activeFact.label.trim(),
      });
    } catch (err) {
      console.error("Failed to save quick fact:", err);
    }
    setFactSaving(false);
    closeModal();
    fetchFacts();
  };

  return (
    <div className="sc-admin">
      {/* ===== Quick Facts Table ===== */}
      <div className="qf-section">
        <h3>Quick Facts Bar</h3>
        <p className="qf-subtitle">Manage the value and label shown for each item</p>

        {factsLoading ? (
          <p>Loading...</p>
        ) : (
          <table className="qf-table">
            <thead>
              <tr>
                <th>Icon</th>
                <th>Value</th>
                <th>Label</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {facts.map((fact) => (
                <tr key={fact._id}>
                  <td className="qf-icon-cell">{fact.icon}</td>
                  <td>{fact.val}</td>
                  <td>{fact.label}</td>
                  <td className="qf-actions-cell">
                    <button className="qf-view-btn" onClick={() => openView(fact)}>View</button>
                    <button className="qf-edit-btn" onClick={() => openEdit(fact)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== View/Edit Modal ===== */}
      {modalMode && activeFact && (
        <div className="qf-modal-overlay" onClick={closeModal}>
          <div className="qf-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{modalMode === "edit" ? "Edit Quick Fact" : "View Quick Fact"}</h3>

            <label>Icon</label>
            <div className="qf-icon-display">{activeFact.icon}</div>

            <label>Value</label>
            {modalMode === "edit" ? (
              <>
                <input
                  type="text"
                  maxLength={20}
                  className={errors.val ? "input-error" : ""}
                  value={activeFact.val || ""}
                  onChange={(e) => handleFactChange("val", e.target.value)}
                />
                {errors.val && <span className="error-message">{errors.val}</span>}
              </>
            ) : (
              <p className="qf-view-text">{activeFact.val}</p>
            )}

            <label>Label</label>
            {modalMode === "edit" ? (
              <>
                <input
                  type="text"
                  maxLength={20}
                  className={errors.label ? "input-error" : ""}
                  value={activeFact.label || ""}
                  onChange={(e) => handleFactChange("label", e.target.value)}
                />
                {errors.label && <span className="error-message">{errors.label}</span>}
              </>
            ) : (
              <p className="qf-view-text">{activeFact.label}</p>
            )}

            <div className="qf-modal-actions">
              <button className="qf-cancel-btn" onClick={closeModal}>Close</button>
              {modalMode === "edit" && (
                <button className="qf-save-btn" onClick={handleFactSave} disabled={factSaving}>
                  {factSaving ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
