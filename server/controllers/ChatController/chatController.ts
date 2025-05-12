import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API with your key
const API_KEY = 'AIzaSyDik7bpo_rfdYVTzDR8ym0QCOzBIJDTsQ8';
const MODEL_VERSION = 'gemini-1.5-flash';
const genAI = new GoogleGenerativeAI(API_KEY);

// Simple function to call Gemini API
async function callGemini(userMessage: string, language: string = 'fr'): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_VERSION });
    
    let prompt = '';
    if (language === 'fr') {
      prompt = `Tu es un assistant de voyage B2B serviable. Réponds à la question suivante de manière concise et professionnelle en français: ${userMessage}`;
    } else {
      prompt = `You are a helpful B2B travel assistant. Answer the following question concisely and professionally: ${userMessage}`;
    }
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return language === 'fr' 
      ? 'Désolé, j\'ai rencontré une erreur lors du traitement de votre demande.' 
      : 'Sorry, I encountered an error while processing your request.';
  }
}

// Main chat handler
export async function handleChat(req: Request, res: Response) {
  try {
    const userMessage: string = req.body.message || '';
    const language: string = req.body.language || 'fr'; // Default to French
    
    if (!userMessage) {
      return res.status(400).json({ error: 'Aucun message fourni.' });
    }
    
    console.log('Message reçu:', userMessage);
    
    // Check if user is asking for all flights
    const askingForFlights = /tous les vols|all flights|liste des vols|affiche les vols|montre les vols|donne-moi les vols/i.test(userMessage);
    
    let reply = '';
    if (askingForFlights) {
      // For now, just respond with a message about flights
      if (language === 'fr') {
        reply = "Je ne peux pas accéder à la base de données des vols pour le moment. Veuillez me donner plus de détails sur votre voyage (ville de départ, destination, dates) pour que je puisse vous aider.";
      } else {
        reply = "I cannot access the flight database at the moment. Please provide me with more details about your trip (departure city, destination, dates) so I can assist you.";
      }
    } else {
      // Get response from Gemini
      reply = await callGemini(userMessage, language);
    }
    
    return res.json({ reply });
  } catch (err) {
    console.error('Erreur dans le gestionnaire de chat:', err);
    return res.status(500).json({ 
      error: 'Erreur interne du serveur', 
      details: String(err) 
    });
  }
}
