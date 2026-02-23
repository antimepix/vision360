import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const ROLE_MAP = {
    "3b4fbc3584d7070dc13bc38f28e6f5be5b088d2b84269650518ce89d5333cce2": { role: "damien", redirect: "/" },
    "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4": { role: "eleve", redirect: "/campus" },
    "a41ace4e47ca4b2dd7907663212291edcb4dbbf9ccb45e0b9239cfa461350265": { role: "admin", redirect: "/" },
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
