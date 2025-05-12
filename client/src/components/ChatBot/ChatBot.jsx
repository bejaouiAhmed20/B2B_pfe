import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

function ChatBotComponent() {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [language] = useState('fr'); // Default to French
    
    const chatContainerRef = useRef(null);

    // Scroll to bottom whenever messages update
    useEffect(() => {
        if (chatContainerRef.current && isOpen) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Toggle chat open/closed
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    // Initial welcome message in French
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                { 
                    sender: 'assistant', 
                    text: 'Bonjour ! Comment puis-je vous aider avec vos arrangements de voyage d\'affaires aujourd\'hui ?' 
                }
            ]);
        }
    }, []);

    // Send message to backend
    const sendMessage = async () => {
        const text = inputText.trim();
        if (!text) return;
        
        // Add user message to chat immediately
        setMessages(prev => [...prev, { sender: 'user', text }]);
        setInputText('');
        setLoading(true);
        
        try {
            const res = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: text,
                    language: language
                })
            });
            
            if (!res.ok) {
                throw new Error(`Le serveur a répondu avec le statut: ${res.status}`);
            }
            
            const data = await res.json();
            
            if (data.reply) {
                // Add assistant response to chat
                setMessages(prev => [...prev, { sender: 'assistant', text: data.reply }]);
            } else {
                // Handle server error
                const errorMsg = data.error || 'Erreur: Pas de réponse du serveur.';
                setMessages(prev => [...prev, { sender: 'assistant', text: errorMsg }]);
            }
        } catch (err) {
            console.error('Échec de l\'envoi du message:', err);
            setMessages(prev => [...prev, { 
                sender: 'assistant', 
                text: `Erreur: impossible d'obtenir une réponse. Détails: ${err.message}` 
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-wrapper">
            {isOpen ? (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <h3>Assistant B2B</h3>
                        <button className="close-button" onClick={toggleChat}>×</button>
                    </div>
                    <div className="chat-messages" ref={chatContainerRef}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.sender}-message`}>
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message assistant-message">
                                <div className="message-bubble typing">
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="chat-input">
                        <input 
                            type="text"
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                            placeholder="Tapez votre message..."
                            disabled={loading}
                        />
                        <button onClick={sendMessage} disabled={loading || !inputText.trim()}>
                            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                </div>
            ) : (
                <button className="chatbot-button" onClick={toggleChat}>
                    Assistant B2B
                </button>
            )}
        </div>
    );
}

export default ChatBotComponent;
