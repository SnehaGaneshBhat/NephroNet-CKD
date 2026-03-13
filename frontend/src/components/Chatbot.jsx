import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m your CKD assistant. I can help you with information about Chronic Kidney Disease, including causes, precautions, symptoms, and treatment options. How can I assist you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // CKD-related responses
    if (message.includes('cause') || message.includes('causes') || message.includes('what causes')) {
      return "The main causes of Chronic Kidney Disease include:\n\n• Diabetes (most common cause)\n• High blood pressure\n• Heart disease\n• Family history of kidney disease\n• Autoimmune diseases like lupus\n• Prolonged use of certain medications\n• Age (risk increases after 60)\n• Obesity\n• Smoking\n\nRegular check-ups are important if you have these risk factors.";
    }
    
    if (message.includes('symptom') || message.includes('signs')) {
      return "Common symptoms of CKD include:\n\n• Fatigue and weakness\n• Swelling in hands/feet/ankles\n• Changes in urination (frequency, color, amount)\n• High blood pressure\n• Nausea and vomiting\n• Loss of appetite\n• Muscle cramps\n• Difficulty concentrating\n• Itchy skin\n\nEarly stages often have no symptoms, which is why screening is important.";
    }
    
    if (message.includes('prevention') || message.includes('precaution') || message.includes('prevent')) {
      return "To prevent or slow CKD progression:\n\n• Control blood sugar if diabetic\n• Manage blood pressure\n• Maintain healthy weight\n• Exercise regularly\n• Eat a balanced diet (low salt, low protein if advised)\n• Stay hydrated\n• Avoid smoking and limit alcohol\n• Regular kidney function tests\n• Take medications as prescribed\n• Avoid overuse of painkillers (NSAIDs)";
    }
    
    if (message.includes('treatment') || message.includes('cure') || message.includes('manage')) {
      return "CKD treatment focuses on:\n\n• Slowing disease progression\n• Managing complications\n• Improving quality of life\n\nTreatment options include:\n• Medications for blood pressure and diabetes\n• Dietary changes\n• Fluid restrictions\n• Dialysis (in advanced stages)\n• Kidney transplant (for end-stage renal disease)\n• Regular monitoring and follow-ups\n\nEarly detection and management are key to better outcomes.";
    }
    
    if (message.includes('diet') || message.includes('food') || message.includes('eat')) {
      return "For CKD patients, dietary recommendations include:\n\n• Limit sodium (salt) intake\n• Control protein intake (as advised by doctor)\n• Limit potassium and phosphorus if needed\n• Stay within fluid limits\n• Choose heart-healthy foods\n• Limit processed foods\n• Eat fresh fruits and vegetables (within limits)\n• Work with a renal dietitian for personalized meal plans";
    }
    
    if (message.includes('test') || message.includes('screening') || message.includes('diagnosis')) {
      return "CKD screening and diagnosis includes:\n\n• Blood tests (creatinine, eGFR)\n• Urine tests (protein, albumin)\n• Blood pressure monitoring\n• Imaging tests (ultrasound, CT scan)\n• Kidney biopsy in some cases\n\nRegular screening is recommended for:\n• People with diabetes or hypertension\n• Those over 60 years old\n• People with family history of kidney disease";
    }
    
    if (message.includes('stage') || message.includes('progression')) {
      return "CKD has 5 stages based on eGFR:\n\n• Stage 1: eGFR ≥90 (mild damage)\n• Stage 2: eGFR 60-89 (mild decrease)\n• Stage 3: eGFR 30-59 (moderate decrease)\n• Stage 4: eGFR 15-29 (severe decrease)\n• Stage 5: eGFR <15 (kidney failure)\n\nEarly detection and treatment can slow progression through stages.";
    }
    
    // Default response
    return "I can help you with information about:\n\n• CKD causes and risk factors\n• Symptoms and early warning signs\n• Prevention and lifestyle changes\n• Treatment options and management\n• Dietary recommendations\n• Screening and diagnosis\n• Disease stages and progression\n\nPlease ask me about any of these topics, or consult your healthcare provider for personalized medical advice.";
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMsg = { type: 'user', text: inputMessage };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      const botMsg = { type: 'bot', text: botResponse };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Icon */}
      <button
        onClick={() => {
          console.log('Chatbot icon clicked!');
          setIsOpen(true);
        }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 z-[9999] border-4 border-white"
        style={{ 
          backgroundColor: '#6B46C1',
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999
        }}
      >
        <MessageCircle className="h-8 w-8 text-white" />
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 w-56 h-[600px] bg-purple-100 rounded-2xl shadow-2xl flex flex-col z-[9999] border-2 border-purple-300"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#E6E6FA',
            opacity: 1
          }}
        >
          {/* Header */}
          <div className="bg-purple-600 text-white p-3 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span className="font-semibold text-xs">CKD Assistant</span>
            </div>
            <button
              onClick={() => {
                console.log('Closing chatbot');
                setIsOpen(false);
              }}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ flex: 1, overflowY: 'auto', backgroundColor: '#E6E6FA' }}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] p-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-800 border border-purple-200'
                  }`}
                >
                  <p className="text-xs whitespace-pre-line leading-tight">{message.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 p-2 rounded-lg border border-purple-200">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-purple-300" style={{ backgroundColor: '#E6E6FA' }}>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about CKD..."
                className="w-full px-2 py-1 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs bg-white"
              />
              <button
                onClick={() => {
                  console.log('Send button clicked');
                  handleSendMessage();
                }}
                className="w-full bg-purple-600 text-white py-1 rounded-lg hover:bg-purple-700 transition-colors text-xs"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
