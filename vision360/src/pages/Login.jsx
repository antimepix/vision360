import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";


export default function Login() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

    /*const handleSubmit = (e) => {
        e.preventDefault();
        const cleanCode = code.trim().toUpperCase();

        // Special case for "1234" which shouldn't be upper-cased but it's fine
        const user = ROLE_MAP[code.trim()] || ROLE_MAP[cleanCode];

        if (user) {
            localStorage.setItem("userRole", user.role);
            navigate(user.redirect);
            window.location.reload(); // Force reload to update Navbar and Routes
        } else {
            setError("Code incorrect. Veuillez réessayer.");
        }
    };*/

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: code }),
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
            window.location.reload(); // si tu en as besoin pour refresh la navbar/routes
        } catch (err) {
            console.error(err);
            setError("Erreur réseau (API inaccessible)");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Vision360</h1>
                <p>Veuillez entrer votre code d'accès</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Code d'accès"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                setError("");
                            }}
                            autoFocus
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="login-button">
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
}
