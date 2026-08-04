import { useEffect, useState } from "react";
import "../styles/EmailTemplates.css";

const API_URL = import.meta.env.VITE_API_URL;

function EmailTemplates() {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
  fetchTemplates();
}, []);

const toggleStatus = async (id) => {
  try {
    const res = await fetch(
      `${API_URL}/api/email-template/toggle/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    // Refresh table
    fetchTemplates();

  } catch (err) {
    console.error(err);
  }
};

// useEffect(() => {
//   fetchTemplates();
// }, []);

const fetchTemplates = async () => {
  try {
    const res = await fetch(`${API_URL}/api/email-template`);

    const data = await res.json();

    setTemplates(data);
  } catch (err) {
    console.log(err);
  }
};
  

  const loadTemplates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/email-template`);

      const data = await res.json();

      setTemplates(data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="email-template-page">

    <div className="email-template-header">
        <h1>Email Templates</h1>
        <p>
            Enable or disable automatic email templates.
        </p>
    </div>

    <div className="email-template-table-wrap">

        <div className="email-template-meta">
            {templates.length} Templates
        </div>

        <table className="email-template-table">

            <thead>
                <tr>
                    <th>Template Type</th>
                    <th>Status</th>
                </tr>
            </thead>

            <tbody>

                {templates.length === 0 ? (

                    <tr>
                        <td
                            colSpan="2"
                            className="email-template-empty"
                        >
                            No templates found.
                        </td>
                    </tr>

                ) : (

                    templates.map((template) => (

                        <tr key={template._id}>

                            <td>{template.type}</td>

                            <td>

                                <button
                                    className={`template-status-btn ${
                                        template.status === "Active"
                                            ? "active"
                                            : "inactive"
                                    }`}
                                    onClick={() => toggleStatus(template._id)}
                                >
                                    {template.status}
                                </button>

                            </td>

                        </tr>

                    ))

                )}

            </tbody>

        </table>

    </div>

</div>
  );
}

export default EmailTemplates;