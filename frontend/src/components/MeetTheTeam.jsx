import React from "react";
import { motion } from "framer-motion";
import { Code2, Component, PenTool, Users } from "lucide-react";

const teamMembers = [
  {
    name: "Sneha Bhat",
    role: "Student engineer",
    specialty: "Frontend systems and product flow",
    bio: "Second-year Computer Science and Design student contributing to the app experience, interface logic, and user journey.",
    icon: Component,
  },
  {
    name: "Aditi Mishra",
    role: "Student engineer",
    specialty: "AI workflow and data thinking",
    bio: "Second-year Computer Science and Design student working on the analysis concept, model flow, and technical framing.",
    icon: Code2,
  },
  {
    name: "Roopa Shree",
    role: "Student engineer",
    specialty: "UX research and interaction design",
    bio: "Second-year Computer Science and Design student shaping the patient-facing experience and content structure.",
    icon: Users,
  },
  {
    name: "Nireeksha K R",
    role: "Student engineer",
    specialty: "Visual design and implementation",
    bio: "Second-year Computer Science and Design student contributing to the product polish, interface details, and presentation layer.",
    icon: PenTool,
  },
];

const MeetTheTeam = () => {
  return (
    <div className="section-wrap team-layout">
      <div className="team-header">
        <span className="eyebrow">
          <Users size={16} />
          people behind the model
        </span>
        <h2 className="section-title">A student team building with care and curiosity.</h2>
        <p className="section-copy">
          NephroNet is a student-built prototype by second-year Computer Science and Design students. We are not
          clinicians; the project explores how thoughtful engineering and design can make CKD report information easier
          to understand.
        </p>
      </div>

      <div className="team-grid">
        {teamMembers.map((member, index) => {
          const Icon = member.icon;
          return (
            <motion.article
              className="surface-card team-card"
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -7 }}
            >
              <div className="team-number">0{index + 1}</div>
              <div className="card-icon">
                <Icon size={24} />
              </div>
              <h3>{member.name}</h3>
              <strong>{member.role}</strong>
              <span>{member.specialty}</span>
              <p>{member.bio}</p>
            </motion.article>
          );
        })}
      </div>

      <style>{`
        .team-layout {
          display: grid;
          gap: 2rem;
        }

        .team-header {
          max-width: 840px;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }

        .team-card {
          position: relative;
          min-height: 22rem;
          padding: 1.35rem;
          overflow: hidden;
        }

        .team-card::after {
          content: "";
          position: absolute;
          inset: auto -3rem -4rem auto;
          width: 12rem;
          height: 12rem;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(204, 195, 235, 0.5), transparent 68%);
          transition: transform 220ms ease;
        }

        .team-card:hover::after {
          transform: scale(1.2);
        }

        .team-number {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: rgba(78, 59, 83, 0.14);
          font-size: 3rem;
          font-weight: 900;
          line-height: 1;
        }

        .team-card h3 {
          margin: 1.1rem 0 0.35rem;
          color: var(--ink);
          font-size: 1.35rem;
          font-family: "Times New Roman", serif;
          font-weight: 700;
        }

        .team-card strong,
        .team-card span,
        .team-card p {
          display: block;
          position: relative;
          z-index: 1;
        }

        .team-card strong {
          color: var(--plum);
          font-size: 0.92rem;
          font-family: "Times New Roman", serif;
          font-weight: 700;
        }

        .team-card span {
          margin-top: 0.35rem;
          color: #287565;
          font-size: 0.82rem;
          font-family: "Times New Roman", serif;
          font-weight: 700;
        }

        .team-card p {
          margin: 1.2rem 0 0;
          color: var(--muted);
          font-family: "Times New Roman", serif;
          line-height: 1.7;
        }

        @media (max-width: 900px) {
          .team-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .team-card {
            min-height: auto;
          }
        }

        @media (max-width: 640px) {
          .team-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MeetTheTeam;
