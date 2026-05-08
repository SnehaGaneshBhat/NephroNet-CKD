import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, LockKeyhole, Mail, Sparkles, UserPlus } from "lucide-react";
import ThreeWelcome from "./ThreeWelcome";

const AuthPage = ({ initialMode = "login", onBack, onAuthenticated }) => {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    window.location.hash = nextMode;
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    const displayName = form.name || form.email?.split("@")[0] || "NephroNet User";
    onAuthenticated?.({
      name: displayName,
      email: form.email || "student@nephronet.app",
      plan: "Student preview",
    });
  };

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <button className="auth-back" onClick={onBack}>
          <ArrowLeft size={17} />
          Back to NephroNet
        </button>

        <div className="auth-grid">
          <motion.div
            className="auth-visual glass-panel"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
          >
            <ThreeWelcome />
            <div className="auth-visual-copy">
              <span>
                <Sparkles size={15} />
                welcome console
              </span>
              <h1>Step into your kidney-care workspace.</h1>
              <p>
                A calm account space for saved reports, profile context, and future CKD analysis history.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="auth-card surface-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div className="auth-tabs">
              <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>
                Login
              </button>
              <button className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>
                Sign up
              </button>
            </div>

            <form onSubmit={submit}>
              <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
              <p>
                {mode === "login"
                  ? "Continue into your NephroNet account."
                  : "Set up a simple profile for the NephroNet preview."}
              </p>

              {mode === "signup" && (
                <label>
                  <span>Name</span>
                  <div>
                    <UserPlus size={17} />
                    <input
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                </label>
              )}

              <label>
                <span>Email</span>
                <div>
                  <Mail size={17} />
                  <input
                    type="text"
                    inputMode="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </label>

              <label>
                <span>Password</span>
                <div>
                  <LockKeyhole size={17} />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </label>

              <button className="primary-btn auth-submit" type="submit">
                {mode === "login" ? "Login" : "Create account"}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100svh;
          color: white;
          background:
            radial-gradient(circle at 76% 18%, rgba(120, 215, 198, 0.18), transparent 24rem),
            radial-gradient(circle at 10% 85%, rgba(217, 145, 196, 0.18), transparent 24rem),
            linear-gradient(135deg, #211829, var(--plum) 52%, #7b5b82 100%);
        }

        .auth-shell {
          width: min(1180px, calc(100% - 2rem));
          margin: 0 auto;
          padding: 1.2rem 0 clamp(2rem, 5vw, 4rem);
        }

        .auth-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          border: 0;
          color: rgba(255, 255, 255, 0.78);
          background: transparent;
          font-weight: 850;
        }

        .auth-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(20rem, 0.72fr);
          gap: 1rem;
          align-items: stretch;
          min-height: calc(100svh - 6rem);
        }

        .auth-visual,
        .auth-card {
          border-radius: 8px;
        }

        .auth-visual {
          position: relative;
          display: grid;
          grid-template-rows: 1fr auto;
          min-height: 36rem;
          overflow: hidden;
          padding: clamp(1rem, 3vw, 1.5rem);
        }

        .three-welcome {
          min-height: 26rem;
        }

        .three-welcome canvas {
          display: block;
          width: 100%;
          height: 100%;
        }

        .auth-visual-copy {
          position: relative;
          z-index: 1;
          max-width: 680px;
        }

        .auth-visual-copy span {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .auth-visual-copy h1 {
          margin: 0.9rem 0 0;
          font-size: clamp(2.5rem, 5vw, 5rem);
          font-weight: 900;
          letter-spacing: 0;
          line-height: 0.92;
        }

        .auth-visual-copy p {
          max-width: 520px;
          margin: 1rem 0 0;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.7;
        }

        .auth-card {
          align-self: center;
          padding: 1.1rem;
          color: var(--ink);
        }

        .auth-tabs {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.35rem;
          padding: 0.35rem;
          border-radius: 999px;
          background: var(--lilac);
        }

        .auth-tabs button {
          border: 0;
          border-radius: 999px;
          padding: 0.72rem;
          color: var(--muted);
          background: transparent;
          font-weight: 900;
        }

        .auth-tabs button.active {
          color: white;
          background: linear-gradient(135deg, var(--plum), var(--plum-2));
          box-shadow: 0 14px 30px rgba(78, 59, 83, 0.2);
        }

        .auth-card form {
          display: grid;
          gap: 0.95rem;
          padding: 1rem 0.25rem 0.25rem;
        }

        .auth-card h2 {
          margin: 0.4rem 0 0;
          font-size: 2rem;
          font-weight: 900;
        }

        .auth-card form > p {
          margin: -0.45rem 0 0.25rem;
          color: var(--muted);
        }

        .auth-card label {
          display: grid;
          gap: 0.42rem;
        }

        .auth-card label span {
          color: var(--plum);
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .auth-card label div {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 0 0.8rem;
          background: white;
        }

        .auth-card label svg {
          color: var(--plum);
        }

        .auth-card input {
          width: 100%;
          min-width: 0;
          height: 3.1rem;
          border: 0;
          outline: 0;
          color: var(--ink);
        }

        .auth-submit {
          width: 100%;
          margin-top: 0.35rem;
        }

        @media (max-width: 760px) {
          .auth-grid {
            grid-template-columns: 1fr;
          }

          .auth-visual {
            min-height: auto;
          }
        }
      `}</style>
    </section>
  );
};

export default AuthPage;
