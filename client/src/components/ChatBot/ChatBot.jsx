import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

function ChatBotComponent() {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [language] = useState('fr'); // Default to French
    const [showQuickActions, setShowQuickActions] = useState(true);

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
                    text: `Bonjour ! Je suis votre assistant Tunisair B2B.\n\n` +
                          `Je peux vous aider avec :\n` +
                          `• Réservations de vols\n` +
                          `• Gestion de profil\n` +
                          `• Fonctions administrateur\n` +
                          `• Support technique\n` +
                          `• Actualités\n\n` +
                          `Tapez "aide" pour voir toutes les commandes disponibles !`
                }
            ]);
        }
    }, []);

    // Send predefined message
    const sendPredefinedMessage = async (text) => {
        setShowQuickActions(false);
        await sendMessageWithText(text);
    };

    // Send message with specific text
    const sendMessageWithText = async (text) => {
        // Add user message to chat immediately
        setMessages(prev => [...prev, { sender: 'user', text }]);
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

    // Send message to backend
    const sendMessage = async () => {
        const text = inputText.trim();
        if (!text) return;

        setInputText('');
        setShowQuickActions(false);
        await sendMessageWithText(text);
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
                                    {msg.text.split('\n').map((line, lineIdx) => (
                                        <div key={lineIdx}>{line}</div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Quick Action Buttons */}
                        {showQuickActions && messages.length <= 1 && (
                            <div className="quick-actions">
                                <div className="quick-actions-title">Actions rapides :</div>
                                <div className="quick-buttons">
                                    <button
                                        className="quick-btn"
                                        onClick={() => sendPredefinedMessage('vols')}
                                    >
                                        Voir les vols
                                    </button>
                                    <button
                                        className="quick-btn"
                                        onClick={() => sendPredefinedMessage('réservation')}
                                    >
                                        Guide réservation
                                    </button>
                                    <button
                                        className="quick-btn"
                                        onClick={() => sendPredefinedMessage('admin')}
                                    >
                                        Fonctions admin
                                    </button>
                                    <button
                                        className="quick-btn"
                                        onClick={() => sendPredefinedMessage('aide')}
                                    >
                                        Aide complète
                                    </button>
                                </div>
                            </div>
                        )}

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
                            →
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
