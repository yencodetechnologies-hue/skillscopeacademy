import React from "react";

function DynamicField({
  label,
  placeholder,
  values,
  setValues
}) {

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

      <label>{label}</label>

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
        Add {label}
      </button>

    </div>
  );
}

export default DynamicField;