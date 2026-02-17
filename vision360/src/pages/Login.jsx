import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const ROLE_MAP = {
    PONASSIE: { role: "damien", redirect: "/" },
    1234: { role: "eleve", redirect: "/campus" },
    CHATRIE: { role: "admin", redirect: "/" },
};

export default function Login() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
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
