import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";


export default function Login() {
    const [step, setStep] = useState("role"); // "role" or "password"
    const [selectedRole, setSelectedRole] = useState(null);
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const roles = [
        { id: "damien", label: "Coordinateur des formations", icon: "👔" },
        { id: "eleve", label: "Élève", icon: "🎓" },
        { id: "admin", label: "Administration", icon: "🏢" }
    ];

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setStep("password");
        setError("");
    };

    const handleBack = () => {
        setStep("role");
        setSelectedRole(null);
        setCode("");
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password: code,
                    role: selectedRole.id
                }),
            });

            const contentType = response.headers.get("content-type") || "";
            const data = contentType.includes("application/json")
                ? await response.json()
                : { ok: false, message: await response.text() };

            if (!response.ok || !data.ok) {
                setError(data.message || "Code incorrect. Veuillez réessayer.");
                return;
            }

            localStorage.setItem("userRole", data.role);
            navigate(data.redirect);
            window.location.reload();
        } catch (err) {
            console.error(err);
            setError("Erreur réseau (API inaccessible)");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Vision360</h1>

                {step === "role" ? (
                    <>
                        <p>Choisissez votre profil</p>
                        <div className="role-selection">
                            {roles.map((r) => (
                                <button
                                    key={r.id}
                                    className="role-button"
                                    onClick={() => handleRoleSelect(r)}
                                >
                                    <span className="role-icon">{r.icon}</span>
                                    <span className="role-label">{r.label}</span>
                                </button>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <p>Connexion en tant que <strong>{selectedRole.label}</strong></p>
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <input
                                    type="password"
                                    placeholder="Mot de passe"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value);
                                        setError("");
                                    }}
                                    autoFocus
                                />
                            </div>

                            {error && <p className="error-message">{error}</p>}

                            <div className="button-group">
                                <button type="button" className="back-button" onClick={handleBack}>
                                    Retour
                                </button>
                                <button type="submit" className="login-button">
                                    Se connecter
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
