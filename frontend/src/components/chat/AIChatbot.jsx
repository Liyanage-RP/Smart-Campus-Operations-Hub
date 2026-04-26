import { useState, useRef, useEffect } from 'react';
import { HiOutlineChatAlt2, HiOutlineX, HiOutlinePaperAirplane, HiOutlineSparkles } from 'react-icons/hi';
import './AIChatbot.css';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your Smart Campus AI assistant. How can I help you with facilities or bookings today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCvFzvNeZ9Fei6GXlj3xeFKM3_ykOSD7_U', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `You are a helpful campus facility management assistant for "Smart Campus Operations Hub". 
            The system manages lecture halls, labs, meeting rooms, and equipment.
            Help the user with questions about booking facilities, checking availability, or general campus info.
            Keep responses concise and professional.
            
            User message: ${userMsg}` }]
          }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't process that. Please try again.";
      
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-chatbot-wrapper ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <HiOutlineSparkles className="sparkle-icon" />
          <HiOutlineChatAlt2 size={24} />
        </button>
      )}

      {isOpen && (
        <div className="chat-window glass-card">
          <div className="chat-header">
            <div className="header-info">
              <HiOutlineSparkles className="header-icon" />
              <div>
                <h3>Campus AI</h3>
                <span>Always active</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}><HiOutlineX /></button>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.role}`}>
                <div className="message-bubble">
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              placeholder="Ask anything about facilities..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim() || loading}>
              <HiOutlinePaperAirplane />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
