import React from "react";

export default function CampusLegend({ userRole, isUnlocked, unlockCode, setUnlockCode, onUnlock }) {
    return (
        <div className="campus-legend-container">
            <div className="legend">
                <div className="legend-item">
                    <span className="legend-color libre"></span> Libre
                </div>
                <div className="legend-item">
                    <span className="legend-color utilisee"></span> Utilisee
                </div>
            </div>

            {userRole === "eleve" && (
                <div className="campus-unlock-zone">
                    {isUnlocked ? (
                        <span className="unlock-status-badge">✓ Mode Édition Activé</span>
                    ) : (
                        <form className="unlock-form" onSubmit={onUnlock}>
                            <input
                                type="password"
                                placeholder="Code d'édition..."
                                value={unlockCode}
                                onChange={(e) => setUnlockCode(e.target.value)}
                                className="unlock-input"
                            />
                            <button type="submit" className="unlock-btn">
                                Débloquer
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
