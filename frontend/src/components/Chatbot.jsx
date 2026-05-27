import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { askChatbot } from "../api";

const responses = [
  {
    match: ["cause", "causes"],
    text: "Common CKD causes include diabetes, high blood pressure, cardiovascular disease, autoimmune disease, family history, and long-term use of certain medications.",
  },
  {
    match: ["symptom", "sign"],
    text: "CKD can be silent early. Later signs may include fatigue, swelling in the feet or hands, urination changes, high blood pressure, nausea, and difficulty concentrating.",
  },
  {
    match: ["prevent", "prevention", "precaution"],
    text: "Prevention focuses on blood pressure control, diabetes management, healthy weight, less sodium, regular activity, avoiding smoking, and routine kidney function tests.",
  },
  {
    match: ["diet", "food", "eat", "carbohydrate", "carbohydrates", "carbs", "sugar", "starch"],
    text: "CKD diets are personalized. Many plans reduce sodium, limit processed foods, and adjust protein, potassium, phosphorus, and fluids based on lab results.",
  },
  {
    match: ["diabetes", "diabetic", "blood sugar", "glucose", "hba1c", "a1c"],
    text: "Diabetes management for kidney health usually means keeping blood sugar in your target range, checking HbA1c as advised, choosing high-fiber slower carbohydrates, limiting sugary drinks, staying active, taking prescribed medicines consistently, and monitoring kidney tests such as eGFR and urine albumin.",
  },
  {
    match: ["test", "screening", "diagnosis"],
    text: "Common screening includes creatinine and eGFR blood tests, urine albumin testing, blood pressure checks, and sometimes imaging such as ultrasound.",
  },
];

const getBotResponse = (message) => {
  const lower = message.toLowerCase();
  const found = responses.find((item) => item.match.some((word) => lower.includes(word)));
  return (
    found?.text ||
    "I can help with CKD causes, symptoms, prevention, diet, testing, stages, and treatment basics. For personal medical decisions, please consult a healthcare provider."
  );
};

const Chatbot = ({ reportContext = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hi, I am your CKD assistant. Ask me about kidney disease basics, screening, diet, prevention, or your latest analyzed report.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const clean = inputMessage.trim();
    if (!clean || isTyping) return;

    setMessages((prev) => [...prev, { type: "user", text: clean }]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const data = await askChatbot(clean, reportContext);
      console.debug("NephroNet chatbot response source:", data.response_source, data);
      setMessages((prev) => [...prev, { type: "bot", text: data.answer || getBotResponse(clean) }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [...prev, { type: "bot", text: getBotResponse(clean) }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button className="chat-launcher" onClick={() => setIsOpen(true)} aria-label="Open CKD assistant">
        <MessageCircle size={25} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            className="chat-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22 }}
          >
            <header>
              <div>
                <Bot size={18} />
                <span>CKD Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} aria-label="Close CKD assistant">
                <X size={17} />
              </button>
            </header>

            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={`${message.text}-${index}`} className={`chat-message ${message.type}`}>
                  {message.text}
                </div>
              ))}
              {isTyping && <div className="chat-message bot typing">Thinking...</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <input
                value={inputMessage}
                onChange={(event) => setInputMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder="Ask about CKD..."
              />
              <button onClick={sendMessage} aria-label="Send message" disabled={isTyping}>
                <Send size={17} />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <style>{`
        .chat-launcher {
          position: fixed;
          right: 1.25rem;
          bottom: 1.25rem;
          z-index: 80;
          display: grid;
          width: 3.8rem;
          height: 3.8rem;
          place-items: center;
          border: 1px solid rgba(255, 255, 255, 0.32);
          border-radius: 50%;
          color: white;
          background: linear-gradient(135deg, var(--plum), var(--plum-2), var(--rose));
          box-shadow: 0 20px 55px rgba(78, 59, 83, 0.32);
        }

        .chat-panel {
          position: fixed;
          right: 1.25rem;
          bottom: 5.6rem;
          z-index: 90;
          display: grid;
          grid-template-rows: auto 1fr auto;
          width: min(23rem, calc(100vw - 2rem));
          height: min(34rem, calc(100svh - 7rem));
          overflow: hidden;
          border: 1px solid rgba(78, 59, 83, 0.16);
          border-radius: 8px;
          background: rgba(251, 249, 255, 0.94);
          box-shadow: 0 30px 90px rgba(33, 24, 41, 0.26);
          backdrop-filter: blur(18px);
        }

        .chat-panel header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem;
          color: white;
          background: linear-gradient(135deg, var(--plum), var(--plum-2));
        }

        .chat-panel header div,
        .chat-panel header button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chat-panel header span {
          font-weight: 900;
        }

        .chat-panel header button,
        .chat-input button {
          border: 0;
          color: inherit;
          background: transparent;
        }

        .chat-messages {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          overflow-y: auto;
          padding: 0.85rem;
        }

        .chat-message {
          max-width: 86%;
          padding: 0.7rem 0.78rem;
          border-radius: 8px;
          font-size: 0.88rem;
          font-family: "Times New Roman", serif;
          line-height: 1.45;
        }

        .chat-message.bot {
          align-self: flex-start;
          color: var(--ink);
          background: white;
          border: 1px solid var(--line);
        }

        .chat-message.user {
          align-self: flex-end;
          color: white;
          background: var(--plum);
        }

        .typing {
          color: var(--muted) !important;
        }

        .chat-input {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.5rem;
          padding: 0.75rem;
          border-top: 1px solid var(--line);
        }

        .chat-input input {
          min-width: 0;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 0.72rem 0.85rem;
          outline: none;
        }

        .chat-input input:focus {
          border-color: var(--plum);
          box-shadow: 0 0 0 4px rgba(78, 59, 83, 0.08);
        }

        .chat-input button {
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 50%;
          color: white;
          background: var(--plum);
        }

        .chat-input button:disabled {
          cursor: wait;
          opacity: 0.55;
        }
      `}</style>
    </>
  );
};

export default Chatbot;
