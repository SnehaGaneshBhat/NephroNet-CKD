import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, LogOut, Settings, ShieldCheck, UserCircle } from "lucide-react";

const AccountPage = ({ user, onBack, onLogout }) => {
  const displayUser = user || {
    name: "Guest user",
    email: "Not signed in",
    plan: "Preview",
  };

  return (
    <section className="account-page">
      <div className="section-wrap account-layout">
        <button className="auth-back account-back" onClick={onBack}>
          <ArrowLeft size={17} />
          Back to app
        </button>

        <motion.div
          className="account-hero glass-panel"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42 }}
        >
          <div className="account-avatar">
            <UserCircle size={58} />
          </div>
          <div>
            <span>Account workspace</span>
            <h1>{displayUser.name}</h1>
            <p>{displayUser.email}</p>
          </div>
          <button className="secondary-btn" onClick={onLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </motion.div>

        <div className="account-grid">
          {[
            {
              icon: FileText,
              title: "Saved reports",
              value: "0",
              copy: "Future analyzed reports will appear here once persistent storage is connected.",
            },
            {
              icon: ShieldCheck,
              title: "Profile context",
              value: displayUser.plan,
              copy: "Keep patient context handy for faster report analysis sessions.",
            },
            {
              icon: Settings,
              title: "Preferences",
              value: "Ready",
              copy: "Notification, privacy, and report export settings can live here next.",
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                className="surface-card account-card"
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
              >
                <div className="card-icon">
                  <Icon size={23} />
                </div>
                <h2>{item.title}</h2>
                <strong>{item.value}</strong>
                <p>{item.copy}</p>
              </motion.article>
            );
          })}
        </div>
      </div>

      <style>{`
        .account-page {
          min-height: 100svh;
          background:
            radial-gradient(circle at 14% 18%, rgba(204, 195, 235, 0.6), transparent 24rem),
            linear-gradient(180deg, #fbf9ff, #f5f0ff);
        }

        .account-layout {
          display: grid;
          gap: 1rem;
        }

        .account-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 0;
          background: transparent;
          color: var(--plum);
          font-weight: 850;
          justify-self: start;
        }

        .account-hero {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
          border-radius: 8px;
          padding: clamp(1rem, 3vw, 1.4rem);
          color: white;
          background:
            radial-gradient(circle at 85% 10%, rgba(120, 215, 198, 0.22), transparent 18rem),
            linear-gradient(135deg, var(--plum), var(--plum-2));
        }

        .account-avatar {
          display: grid;
          width: 5.2rem;
          height: 5.2rem;
          place-items: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.14);
        }

        .account-hero span {
          color: rgba(255, 255, 255, 0.66);
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .account-hero h1 {
          margin: 0.2rem 0;
          font-size: clamp(2rem, 4vw, 4rem);
          font-weight: 900;
          letter-spacing: 0;
          line-height: 1;
        }

        .account-hero p {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
        }

        .account-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .account-card {
          padding: 1.25rem;
        }

        .account-card h2 {
          margin: 1rem 0 0.45rem;
          color: var(--ink);
          font-size: 1.15rem;
          font-weight: 900;
        }

        .account-card strong {
          display: block;
          color: var(--plum);
          font-size: 1.6rem;
          font-weight: 900;
        }

        .account-card p {
          margin: 0.9rem 0 0;
          color: var(--muted);
          line-height: 1.65;
        }

        @media (max-width: 850px) {
          .account-hero,
          .account-grid {
            grid-template-columns: 1fr;
          }

          .account-hero .secondary-btn {
            justify-self: start;
          }
        }
      `}</style>
    </section>
  );
};

export default AccountPage;
