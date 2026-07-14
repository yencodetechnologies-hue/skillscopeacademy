import React, { useState, useRef, useEffect } from "react";

function DynamicField({
  label,
  onLabelChange,
  placeholder,
  values,
  setValues
}) {

  const [editingLabel, setEditingLabel] = useState(false)
  const labelInputRef = useRef(null)

  useEffect(() => {
    if (editingLabel && labelInputRef.current) labelInputRef.current.focus()
  }, [editingLabel])

  const handleChange = (index, value) => {
    const updated = [...values];
    updated[index] = value;
    setValues(updated);
  };

  const addField = () => {
    setValues([...values, ""]);
  };

  const deleteField = (index) => {
    const updated = values.filter((_, i) => i !== index);
    setValues(updated);
  };

  return (
    <div className="form-group">

      {/* Editable label heading */}
      {label !== "" && (
        <div className="editable-heading-row">
          {editingLabel ? (
            <input
              ref={labelInputRef}
              className="editable-label-input"
              value={label}
              onChange={(e) => onLabelChange && onLabelChange(e.target.value)}
              onBlur={() => setEditingLabel(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingLabel(false)}
            />
          ) : (
            <span className="editable-label-display">
              {label}
              {onLabelChange && (
                <button
                  type="button"
                  className="editable-label-pencil"
                  onClick={() => setEditingLabel(true)}
                  title="Edit label"
                >
                  ✏
                </button>
              )}
            </span>
          )}
        </div>
      )}

      {values.map((item, index) => (
        <div className="dynamic-field" key={index}>

          <input
            type="text"
            placeholder={placeholder}
            value={item}
            onChange={(e) =>
              handleChange(index, e.target.value)
            }
          />

          {index !== 0 && (
            <button
              type="button"
              className="delete-btn"
              onClick={() => deleteField(index)}
            >
              ✕
            </button>
          )}

        </div>
      ))}

      <button
        type="button"
        className="add-description-btn"
        onClick={addField}
      >
        Add
      </button>

    </div>
  );
}

export default DynamicField;