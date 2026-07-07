import React from 'react';

const ValidationToast = ({ show, onOk, missingFields }) => {
    if (!show) return null;

    return (
        <div className="er-validation-toast">
            <div className="er-toast-header">
                <div className="er-toast-icon">⚠️</div>
                <h3 className="er-toast-title">Missing Information</h3>
            </div>
            <div className="er-toast-body">
                Please complete the following mandatory fields before proceeding:
                <ul className="er-toast-list">
                    {missingFields.map((field, idx) => (
                        <li key={idx}>{field}</li>
                    ))}
                </ul>
            </div>
            <button className="er-toast-ok-btn" onClick={onOk}>
                OK
            </button>
        </div>
    );
};

export default ValidationToast;
