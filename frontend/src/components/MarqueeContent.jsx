import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/MarqueeContent.css";
const API_URL = import.meta.env.VITE_API_URL;

function MarqueeContent() {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");

  const [selectedContent, setSelectedContent] = useState(null);

  const [content, setContent] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);

  // ============================
  // FETCH CONTENT
  // ============================

  const fetchContents = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/api/marquee`
      );

      setContents(response.data.data || []);
    } catch (error) {
      console.error(
        "Error fetching marquee content:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  // ============================
  // OPEN ADD MODAL
  // ============================

  const handleAdd = () => {
    setModalType("add");

    setSelectedContent(null);

    setContent("");
    setIsActive(true);

    setShowModal(true);
  };

  // ============================
  // OPEN VIEW MODAL
  // ============================

  const handleView = (item) => {
    setModalType("view");

    setSelectedContent(item);

    setContent(item.content);
    setIsActive(item.isActive);

    setShowModal(true);
  };

  // ============================
  // OPEN EDIT MODAL
  // ============================

  const handleEdit = (item) => {
    setModalType("edit");

    setSelectedContent(item);

    setContent(item.content);
    setIsActive(item.isActive);

    setShowModal(true);
  };

  // ============================
  // CLOSE MODAL
  // ============================

  const closeModal = () => {
    setShowModal(false);

    setSelectedContent(null);

    setContent("");
    setIsActive(true);
  };

  // ============================
  // SAVE / UPDATE
  // ============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Please enter marquee content");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        content: content.trim(),
        isActive,
      };

      // ADD
      if (modalType === "add") {
        await axios.post(
          `${API_URL}/api/marquee`,
          payload
        );
      }

      // EDIT
      if (modalType === "edit") {
        await axios.put(
          `${API_URL}/api/marquee/${selectedContent._id}`,
          payload
        );
      }

      await fetchContents();

      closeModal();

    } catch (error) {
      console.error(
        "Error saving marquee:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="marquee-container">

      {/* ============================
          HEADER
      ============================ */}

      <div className="marquee-header">

        <div>
          <h2>Marquee Content</h2>

          <p>
            Manage website marquee content
          </p>
        </div>

        {/* <button
          className="add-content-btn"
          onClick={handleAdd}
        >
          + Add Content
        </button> */}

      </div>


      {/* ============================
          TABLE
      ============================ */}

      <div className="table-wrapper">

        <table className="marquee-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Content</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>


          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="4"
                  className="empty-state"
                >
                  Loading...
                </td>
              </tr>

            ) : contents.length === 0 ? (

              <tr>
                <td
                  colSpan="4"
                  className="empty-state"
                >
                  No marquee content found
                </td>
              </tr>

            ) : (

              contents.map((item, index) => (

                <tr key={item._id}>

                  <td>
                    {index + 1}
                  </td>


                  {/* CONTENT */}

                  <td>

                    <div className="content-text">
                      {item.content}
                    </div>

                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      className={`status-badge ${
                        item.isActive
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {item.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </td>


                  {/* ACTIONS */}

                  <td>

                    <div className="action-buttons">

                      <button
                        className="view-btn sm-icon-btn"
                        onClick={() =>
                          handleView(item)
                        }
                      >
                        👁 
                      </button>


                      <button
                        className="edit-btn sm-icon-btn"
                        onClick={() =>
                          handleEdit(item)
                        }
                      >
                        ✏️ 
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      {/* ============================
          MODAL
      ============================ */}

      {showModal && (

        <div className="marquee-modal-overlay">

          <div className="marquee-modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <h3>
                {modalType === "add"
                  ? "Add Marquee Content"
                  : modalType === "edit"
                  ? "Edit Marquee Content"
                  : "View Marquee Content"}
              </h3>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {/* CONTENT */}

              <div className="form-group">

                <label>
                  Marquee Content
                </label>

                <textarea
                  value={content}
                  onChange={(e) =>
                    setContent(e.target.value)
                  }
                  placeholder="Enter marquee content..."
                  rows="4"
                  disabled={modalType === "view"}
                />

              </div>


              {/* STATUS */}

              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  value={isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setIsActive(
                      e.target.value === "active"
                    )
                  }
                  disabled={modalType === "view"}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>

                </select>

              </div>


              {/* FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Close
                </button>


                {modalType !== "view" && (

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : modalType === "edit"
                      ? "Update"
                      : "Save"}
                  </button>

                )}

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default MarqueeContent;