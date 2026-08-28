import "../styles/AdminProfile.css";
import { useContext, useMemo, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

function getInitials(name = "") {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function AdminProfile({ onClose }) {
    const { user: contextUser } = useContext(AuthContext);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [storedUser, setStoredUser] = useState(null);

    /* ── Read the logged-in user straight from localStorage ──
       Falls back to AuthContext if nothing is stored yet. */
    useEffect(() => {
        try {
            const raw = localStorage.getItem("user");
            if (raw) setStoredUser(JSON.parse(raw));
        } catch (err) {
            console.error("Failed to parse stored user:", err);
        }
    }, []);

    /* ── Close on Escape ── */
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const user = storedUser || contextUser || {};

    const displayName = user?.name || user?.companyName || user?.contactPerson || "User";
    const initials = useMemo(() => getInitials(displayName), [displayName]);

    const fields = [
        {
            label: "Full Name",
            value: displayName !== "User" ? displayName : null,
        },
        {
            label: "Phone / Mobile",
            value: user?.mobileNumber || user?.mobile || user?.phone || user?.contactNumber,
        },
        {
            label: "Email",
            value: user?.email,
        },
    ];

    const accountId = user?.id || user?._id;

    const handleBackdrop = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="profile-modal-backdrop" onClick={handleBackdrop}>
            <div className="profile-modal-box">

                {/* ── Close ── */}
                <button className="profile-modal-close" onClick={onClose} aria-label="Close">
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div className="profile-page profile-page-modal">
                    <div className="profile-page-inner">

                        {/* ── Section title ── */}
                        <div className="profile-page-title">
                            <i className="fa-regular fa-address-card"></i>
                            <span>Data Profile</span>
                        </div>

                        {/* ── Card ── */}
                        <div className="profile-card">

                            {/* Photo */}
                            <div className="profile-photo-col">
                                <div className="profile-photo-ring">
                                    <div className="profile-photo-avatar">{initials}</div>
                                </div>
                                <span className="profile-photo-role">{user?.role || "Member"}</span>
                            </div>

                            {/* Details */}
                            <div className="profile-info-col">
                                {fields.map((f, i) => (
                                    <div className="profile-info-row" key={i}>
                                        <span className="profile-info-label">{f.label}</span>
                                        <span className="profile-info-colon">:</span>
                                        <span className="profile-info-value">
                                            {f.value || <span className="profile-info-empty">Not provided</span>}
                                        </span>
                                    </div>
                                ))}

                                {/* Edit password */}
                               {/* <button
                                    type="button"
                                    className="profile-info-row profile-edit-password"
                                    onClick={() => setShowPasswordForm((v) => !v)}
                                >
                                    <span className="profile-info-label">Edit Password</span>
                                    <span className="profile-info-colon">:</span>
                                    <span className="profile-info-value profile-edit-password-action">
                                        <i className="fa-solid fa-key"></i>
                                        Change
                                    </span>
                                </button>*/}

                                {showPasswordForm && (
                                    <div className="profile-password-form">
                                        <div className="profile-password-field">
                                            <label>Current Password</label>
                                            <input type="password" placeholder="••••••••" />
                                        </div>
                                        <div className="profile-password-field">
                                            <label>New Password</label>
                                            <input type="password" placeholder="••••••••" />
                                        </div>
                                        <div className="profile-password-field">
                                            <label>Confirm New Password</label>
                                            <input type="password" placeholder="••••••••" />
                                        </div>
                                        <button type="button" className="profile-password-save">
                                            Save Password
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* ── Account overview strip ── */}
                        <div className="profile-overview">
                            <div className="profile-overview-item">
                                <span className="profile-overview-icon">
                                    <i className="fa-solid fa-shield-halved"></i>
                                </span>
                                <div>
                                    <span className="profile-overview-label">Account Type</span>
                                    <span className="profile-overview-value">{user?.role || "—"}</span>
                                </div>
                            </div>

                            <div className="profile-overview-item">
                                <span className="profile-overview-icon">
                                    <i className="fa-solid fa-fingerprint"></i>
                                </span>
                                <div>
                                    <span className="profile-overview-label">Account ID</span>
                                    <span className="profile-overview-value profile-overview-mono">
                                        {accountId ? `#${accountId.toString().slice(-8).toUpperCase()}` : "—"}
                                    </span>
                                </div>
                            </div>

                            <div className="profile-overview-item">
                                <span className="profile-overview-icon">
                                    <i className="fa-solid fa-circle-check"></i>
                                </span>
                                <div>
                                    <span className="profile-overview-label">Status</span>
                                    <span className="profile-overview-value profile-overview-active">Active</span>
                                </div>
                            </div>

                            {"payLater" in user && (
                                <div className="profile-overview-item">
                                    <span className="profile-overview-icon">
                                        <i className="fa-solid fa-clock"></i>
                                    </span>
                                    <div>
                                        <span className="profile-overview-label">Pay Later</span>
                                        <span
                                            className={
                                                user.payLater
                                                    ? "profile-overview-value profile-overview-active"
                                                    : "profile-overview-value profile-overview-inactive"
                                            }
                                        >
                                            {user.payLater ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default AdminProfile;
