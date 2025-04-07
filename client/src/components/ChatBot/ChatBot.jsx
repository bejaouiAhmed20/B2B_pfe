import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  IconButton, 
  Typography, 
  Avatar, 
  List, 
  ListItem, 
  Fab, 
  Collapse,
  CircularProgress
} from '@mui/material';
import { Send, Close, Chat as ChatIcon, FlightTakeoff } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const ChatContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  width: 350,
  maxHeight: 500,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1000,
  boxShadow: theme.shadows[10],
  borderRadius: '10px',
  overflow: 'hidden'
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  backgroundColor: '#CC0A2B', // Tunisair red
  color: 'white',
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  maxHeight: 350,
  backgroundColor: '#f5f5f5'
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1.5),
  borderRadius: isUser ? '18px 18px 0 18px' : '18px 18px 18px 0',
  backgroundColor: isUser ? '#CC0A2B' : 'white',
  color: isUser ? 'white' : 'black',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  boxShadow: theme.shadows[1],
  wordBreak: 'break-word'
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1.5),
  backgroundColor: 'white',
  borderTop: '1px solid #e0e0e0'
}));

const ChatFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  backgroundColor: '#CC0A2B',
  color: 'white',
  '&:hover': {
    backgroundColor: '#a00823',
  }
}));

// API key and configuration
const API_KEY = 'AIzaSyDik7bpo_rfdYVTzDR8ym0QCOzBIJDTsQ8';
const MODEL_VERSION = 'gemini-1.5-flash'; // Updated to a valid model version

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Bonjour ! Je suis l'assistant virtuel de Tunisair B2B. Comment puis-je vous aider avec vos réservations de vols ou informations sur nos destinations ?", 
      isUser: false 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => {
    setOpen(!open);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL_VERSION}:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are an intelligent and helpful assistant for Tunisair B2B, a professional flight booking platform designed for businesses. This platform is available as both a web and mobile application and enables corporate partners and travel agencies to search, book, manage, and modify flights through a user-friendly B2B interface.
Your role is to assist users strictly with topics related to flights and Tunisair services, including flight bookings, reservations, ticketing, schedules, availability, baggage information, airport and in-flight services, business travel policies, destinations served by Tunisair, and features of the B2B platform.
You must not answer questions unrelated to Tunisair or its services. If the user asks about unrelated topics, politely redirect the conversation to matters involving Tunisair.
You must always respond in the same language the user uses. If the user writes in Arabic, you respond in Arabic. If they use French or English, you respond in that language. If the user switches languages during the conversation, adapt accordingly.
Keep your responses concise, clear, and professional, and provide accurate and helpful information based on the user's input.

The user asked: ${input}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      const data = await response.json();
      
      // Improved error handling and response parsing
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const botResponse = { 
          text: data.candidates[0].content.parts[0].text, 
          isUser: false 
        };
        setMessages(prev => [...prev, botResponse]);
      } else if (data.error) {
        console.error('API error:', data.error);
        throw new Error(data.error.message || 'API error occurred');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages(prev => [...prev, { 
        text: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer plus tard.", 
        isUser: false 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <Collapse in={open} timeout={300}>
        <ChatContainer>
          <ChatHeader>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'white', mr: 1 }}>
                <FlightTakeoff sx={{ color: '#CC0A2B' }} />
              </Avatar>
              <Typography variant="subtitle1">Assistant Tunisair</Typography>
            </Box>
            <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </ChatHeader>
          
          <MessagesContainer>
            {messages.map((message, index) => (
              <MessageBubble key={index} isUser={message.isUser}>
                <Typography variant="body2">{message.text}</Typography>
              </MessageBubble>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} sx={{ color: '#CC0A2B' }} />
              </Box>
            )}
            <div ref={messagesEndRef} />
          </MessagesContainer>
          
          <InputContainer>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Posez votre question..."
              size="small"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={loading}
              sx={{ mr: 1 }}
            />
            <IconButton 
              color="primary" 
              onClick={sendMessage} 
              disabled={!input.trim() || loading}
              sx={{ color: '#CC0A2B' }}
            >
              <Send />
            </IconButton>
          </InputContainer>
        </ChatContainer>
      </Collapse>
      
      {!open && (
        <ChatFab onClick={toggleChat} aria-label="chat">
          <ChatIcon />
        </ChatFab>
      )}
    </>
  );
};

export default ChatBot;