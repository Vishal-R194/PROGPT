import { useState } from "react";
import "./Auth.css";
const API_URL = import.meta.env.VITE_API_URL;

function Auth({ onLogin }) {
    const [isSignup, setIsSignup] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const endpoint = isSignup ? "signup" : "login";

            const response = await fetch(
                `${API_URL}/api/auth/${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        ...(isSignup && { name: name.trim() }),
                        email: email.trim(),
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || data.message || "Authentication failed."
                );
            }

            if (!data.token || !data.user) {
                throw new Error("The server returned an invalid response.");
            }

            localStorage.setItem("progpt_token", data.token);
            localStorage.setItem(
                "progpt_user",
                JSON.stringify(data.user)
            );

            onLogin(data.token, data.user);
        } catch (err) {
            setError(
                err.message || "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="authPage">
            <div className="authCard">
                <div className="authLogo">PROGPT</div>

                <h1>
                    {isSignup ? "Create your account" : "Welcome back"}
                </h1>

                <p className="authSubtitle">
                    {isSignup
                        ? "Create an account to start chatting."
                        : "Log in to continue your conversations."}
                </p>

                <form onSubmit={handleSubmit}>
                    {isSignup && (
                        <div className="authField">
                            <label htmlFor="authName">Full name</label>
                            <input
                                id="authName"
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={50}
                                autoComplete="name"
                                required
                            />
                        </div>
                    )}

                    <div className="authField">
                        <label htmlFor="authEmail">Email address</label>
                        <input
                            id="authEmail"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="authField">
                        <label htmlFor="authPassword">Password</label>
                        <input
                            id="authPassword"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={
                                isSignup ? "new-password" : "current-password"
                            }
                            minLength={isSignup ? 8 : undefined}
                            required
                        />
                    </div>

                    {error && (
                        <p className="authError" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        className="authSubmit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : isSignup
                                ? "Create account"
                                : "Log in"}
                    </button>
                </form>

                <p className="authSwitch">
                    {isSignup
                        ? "Already have an account?"
                        : "Don't have an account?"}{" "}
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignup(!isSignup);
                            setError("");
                        }}
                    >
                        {isSignup ? "Log in" : "Sign up"}
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Auth;