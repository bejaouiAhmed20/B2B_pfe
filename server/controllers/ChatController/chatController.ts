import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Flight } from '../../models/Flight';
import { User } from '../../models/User';
import { Reservation } from '../../models/Reservation';
import { Airport } from '../../models/Airport';
import { News } from '../../models/News';
import { Location } from '../../models/Location';

// Initialize Gemini API with your key
const API_KEY = 'AIzaSyDik7bpo_rfdYVTzDR8ym0QCOzBIJDTsQ8';
const MODEL_VERSION = 'gemini-1.5-flash';
const genAI = new GoogleGenerativeAI(API_KEY);

// Project knowledge base
const PROJECT_KNOWLEDGE = {
  projectInfo: {
    name: "Tunisair B2B Platform",
    description: "Plateforme de réservation B2B pour Tunisair permettant aux entreprises de gérer leurs voyages d'affaires",
    technologies: ["React", "Node.js", "TypeScript", "MySQL", "Material-UI", "Express.js"],
    features: ["Réservations de vols", "Gestion des utilisateurs", "Tableau de bord", "Réclamations", "Contrats", "Popups", "Chatbot IA"]
  },

  userGuides: {
    login: "Pour vous connecter : 1) Allez sur la page de connexion, 2) Entrez votre email et mot de passe, 3) Cliquez sur 'Se connecter'",
    booking: "Pour réserver un vol : 1) Recherchez des vols, 2) Sélectionnez votre vol, 3) Choisissez vos sièges, 4) Confirmez la réservation",
    profile: "Pour modifier votre profil : 1) Allez dans 'Mon Profil', 2) Modifiez vos informations, 3) Sauvegardez",
    claims: "Pour faire une réclamation : 1) Allez dans 'Réclamations', 2) Cliquez sur 'Nouvelle réclamation', 3) Remplissez le formulaire",
    dashboard: "Le tableau de bord affiche : statistiques des vols, revenus, réservations par classe, destinations populaires"
  },

  adminGuides: {
    flights: "Gestion des vols : Créer, modifier, supprimer des vols depuis l'interface admin",
    users: "Gestion des utilisateurs : Voir tous les utilisateurs, modifier leurs rôles et statuts",
    reservations: "Gestion des réservations : Voir toutes les réservations, les modifier ou les annuler",
    dashboard: "Tableau de bord admin : Voir les statistiques en temps réel avec graphiques dynamiques",
    news: "Gestion des actualités : Créer et publier des actualités pour les clients",
    popups: "Gestion des popups : Créer des popups informatifs qui s'affichent aux clients"
  },

  technicalInfo: {
    architecture: "Architecture 3-tiers : Frontend React + Backend Node.js + Base de données MySQL",
    authentication: "Authentification JWT avec rôles (admin/client)",
    database: "Base de données relationnelle avec entités : Users, Flights, Reservations, Airports, etc.",
    api: "API RESTful avec endpoints pour toutes les fonctionnalités",
    deployment: "Serveur de développement sur localhost:3000 (client) et localhost:5000 (serveur)"
  },

  troubleshooting: {
    loginIssues: "Problèmes de connexion : Vérifiez vos identifiants, videz le cache, contactez l'admin",
    bookingIssues: "Problèmes de réservation : Vérifiez la disponibilité, votre solde, ou contactez le support",
    performanceIssues: "Problèmes de performance : Rafraîchissez la page, vérifiez votre connexion internet"
  }
};

// Enhanced function to detect user intent and provide specific help
function detectIntent(message: string): string {
  const msg = message.toLowerCase();
 
  // Login/Authentication
  if (msg.includes('connexion') || msg.includes('login') || msg.includes('connecter')) {
    return 'login';
  }

  // Booking/Reservation
  if (msg.includes('réserver') || msg.includes('réservation') || msg.includes('vol') || msg.includes('booking')) {
    return 'booking';
  }

  // Profile management
  if (msg.includes('profil') || msg.includes('compte') || msg.includes('profile')) {
    return 'profile';
  }

  // Claims/Complaints
  if (msg.includes('réclamation') || msg.includes('plainte') || msg.includes('problème')) {
    return 'claims';
  }

  // Dashboard
  if (msg.includes('tableau de bord') || msg.includes('dashboard') || msg.includes('statistiques')) {
    return 'dashboard';
  }

  // Admin functions
  if (msg.includes('admin') || msg.includes('gestion') || msg.includes('gérer')) {
    return 'admin';
  }

  // Technical help
  if (msg.includes('technique') || msg.includes('erreur') || msg.includes('bug') || msg.includes('problème technique')) {
    return 'technical';
  }

  // Project info
  if (msg.includes('projet') || msg.includes('plateforme') || msg.includes('tunisair') || msg.includes('b2b')) {
    return 'project';
  }

  return 'general';
}

// Function to get specific help based on intent
function getSpecificHelp(intent: string, language: string = 'fr'): string {
  const guides = PROJECT_KNOWLEDGE.userGuides;
  const adminGuides = PROJECT_KNOWLEDGE.adminGuides;
  const tech = PROJECT_KNOWLEDGE.technicalInfo;
  const project = PROJECT_KNOWLEDGE.projectInfo;

  switch (intent) {
    case 'login':
      return language === 'fr' ? guides.login : "To log in: 1) Go to login page, 2) Enter email and password, 3) Click 'Login'";

    case 'booking':
      return language === 'fr' ? guides.booking : "To book a flight: 1) Search flights, 2) Select your flight, 3) Choose seats, 4) Confirm booking";

    case 'profile':
      return language === 'fr' ? guides.profile : "To edit profile: 1) Go to 'My Profile', 2) Edit information, 3) Save changes";

    case 'claims':
      return language === 'fr' ? guides.claims : "To make a claim: 1) Go to 'Claims', 2) Click 'New Claim', 3) Fill the form";

    case 'dashboard':
      return language === 'fr' ? guides.dashboard : "Dashboard shows: flight statistics, revenue, bookings by class, popular destinations";

    case 'admin':
      return language === 'fr' ?
        `Fonctions admin disponibles :\n- ${adminGuides.flights}\n- ${adminGuides.users}\n- ${adminGuides.reservations}\n- ${adminGuides.dashboard}\n- ${adminGuides.news}\n- ${adminGuides.popups}` :
        "Admin functions: Flight management, User management, Reservation management, Dashboard, News, Popups";

    case 'technical':
      return language === 'fr' ?
        `Architecture technique :\n- ${tech.architecture}\n- ${tech.authentication}\n- ${tech.database}\n- ${tech.api}\n- ${tech.deployment}` :
        "Technical architecture: 3-tier with React frontend, Node.js backend, MySQL database";

    case 'project':
      return language === 'fr' ?
        `${project.name} : ${project.description}\nTechnologies : ${project.technologies.join(', ')}\nFonctionnalités : ${project.features.join(', ')}` :
        `${project.name}: ${project.description}\nTechnologies: ${project.technologies.join(', ')}\nFeatures: ${project.features.join(', ')}`;

    default:
      return '';
  }
}

// Function to get real-time data from database
async function getRealTimeData(dataType: string): Promise<any> {
  try {
    switch (dataType) {
      case 'flights':
        const flights = await Flight.find({
          relations: ['airport_depart', 'arrival_airport'],
          take: 5,
          order: { date_depart: 'ASC' }
        });
        return flights;

      case 'reservations':
        const reservations = await Reservation.find({
          take: 5,
          order: { id: 'DESC' }
        });
        return reservations;

      case 'users':
        const userCount = await User.count();
        return { count: userCount };

      case 'news':
        const news = await News.find({
          take: 3,
          order: { id: 'DESC' }
        });
        return news;

      default:
        return null;
    }
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    return null;
  }
}

// Function to format flight data for chat response
function formatFlightData(flights: any[], language: string = 'fr'): string {
  if (!flights || flights.length === 0) {
    return language === 'fr' ?
      "Aucun vol disponible pour le moment." :
      "No flights available at the moment.";
  }

  const flightList = flights.map(flight => {
    const departure = flight.airport_depart?.nom || flight.airport_depart?.code || 'N/A';
    const arrival = flight.arrival_airport?.nom || flight.arrival_airport?.code || 'N/A';
    const date = new Date(flight.date_depart).toLocaleDateString();
    const price = flight.prix || 'N/A';

    return language === 'fr' ?
      `Vol: ${departure} → ${arrival}\nDate: ${date}\nPrix: ${price} TND\n` :
      `Flight: ${departure} → ${arrival}\nDate: ${date}\nPrice: ${price} TND\n`;
  }).join('\n');

  return language === 'fr' ?
    `Voici les prochains vols disponibles :\n\n${flightList}` :
    `Here are the next available flights:\n\n${flightList}`;
}

// Enhanced function to provide contextual help
async function getContextualHelp(message: string, language: string = 'fr'): Promise<string> {
  const intent = detectIntent(message);
  const specificHelp = getSpecificHelp(intent, language);

  if (specificHelp) {
    return specificHelp;
  }

  // Check if user is asking for real-time data
  if (message.toLowerCase().includes('vols') || message.toLowerCase().includes('flights')) {
    const flights = await getRealTimeData('flights');
    return formatFlightData(flights, language);
  }

  if (message.toLowerCase().includes('actualités') || message.toLowerCase().includes('news')) {
    const news = await getRealTimeData('news');
    if (news && news.length > 0) {
      const newsList = news.map((item: any) => `• ${item.titre}`).join('\n');
      return language === 'fr' ?
        `Dernières actualités :\n${newsList}` :
        `Latest news:\n${newsList}`;
    }
  }

  // Provide general help menu
  return language === 'fr' ?
    `Assistant Tunisair B2B - Comment puis-je vous aider ?\n\n` +
    `Commandes disponibles :\n` +
    `• "connexion" - Aide pour se connecter\n` +
    `• "réservation" - Guide de réservation\n` +
    `• "profil" - Gestion du profil\n` +
    `• "réclamation" - Faire une réclamation\n` +
    `• "admin" - Fonctions administrateur\n` +
    `• "vols" - Voir les vols disponibles\n` +
    `• "projet" - Informations sur la plateforme\n` +
    `• "technique" - Aide technique\n\n` +
    `Astuce : Posez-moi n'importe quelle question sur l'utilisation de la plateforme !` :
    `Tunisair B2B Assistant - How can I help you?\n\n` +
    `Available commands:\n` +
    `• "login" - Login help\n` +
    `• "booking" - Booking guide\n` +
    `• "profile" - Profile management\n` +
    `• "claims" - Make a claim\n` +
    `• "admin" - Admin functions\n` +
    `• "flights" - View available flights\n` +
    `• "project" - Platform information\n` +
    `• "technical" - Technical help\n\n` +
    `Tip: Ask me any question about using the platform!`;
}

// Enhanced function to call Gemini API with project context
async function callGemini(userMessage: string, language: string = 'fr'): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_VERSION });

    const projectContext = `
    Tu es l'assistant IA de la plateforme Tunisair B2B, une plateforme de réservation de vols d'affaires.

    CONTEXTE DU PROJET:
    - Nom: ${PROJECT_KNOWLEDGE.projectInfo.name}
    - Description: ${PROJECT_KNOWLEDGE.projectInfo.description}
    - Technologies: ${PROJECT_KNOWLEDGE.projectInfo.technologies.join(', ')}
    - Fonctionnalités: ${PROJECT_KNOWLEDGE.projectInfo.features.join(', ')}

    ARCHITECTURE TECHNIQUE:
    - ${PROJECT_KNOWLEDGE.technicalInfo.architecture}
    - ${PROJECT_KNOWLEDGE.technicalInfo.authentication}
    - ${PROJECT_KNOWLEDGE.technicalInfo.database}
    - ${PROJECT_KNOWLEDGE.technicalInfo.api}

    Tu dois aider les utilisateurs avec:
    1. L'utilisation de la plateforme (connexion, réservations, profil, réclamations)
    2. Les fonctions administrateur (gestion des vols, utilisateurs, dashboard)
    3. Les informations techniques sur le projet
    4. Le dépannage et résolution de problèmes

    Réponds toujours de manière professionnelle, concise et utile.
    `;

    let prompt = '';
    if (language === 'fr') {
      prompt = `${projectContext}\n\nQuestion de l'utilisateur: ${userMessage}\n\nRéponds en français de manière professionnelle et utile:`;
    } else {
      prompt = `You are the AI assistant for Tunisair B2B platform, a business flight booking platform.

      PROJECT CONTEXT:
      - Name: ${PROJECT_KNOWLEDGE.projectInfo.name}
      - Description: Business flight booking platform for Tunisair
      - Technologies: ${PROJECT_KNOWLEDGE.projectInfo.technologies.join(', ')}
      - Features: ${PROJECT_KNOWLEDGE.projectInfo.features.join(', ')}

      Help users with platform usage, admin functions, technical info, and troubleshooting.

      User question: ${userMessage}

      Answer professionally and helpfully:`;
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
      return res.status(400).json({
        error: language === 'fr' ? 'Aucun message fourni.' : 'No message provided.'
      });
    }

    console.log('Message reçu:', userMessage);

    let reply = '';

    // First, try to get contextual help (this includes real-time data and specific guides)
    const contextualHelp = await getContextualHelp(userMessage, language);

    // If we have specific contextual help, use it
    if (contextualHelp && !contextualHelp.includes('Comment puis-je vous aider') && !contextualHelp.includes('How can I help')) {
      reply = contextualHelp;
    } else {
      // Otherwise, use Gemini AI with project context
      reply = await callGemini(userMessage, language);
    }

    // Add helpful suggestions at the end for general queries
    if (userMessage.toLowerCase().includes('aide') || userMessage.toLowerCase().includes('help') ||
        userMessage.toLowerCase().includes('bonjour') || userMessage.toLowerCase().includes('hello')) {
      const suggestions = language === 'fr' ?
        '\n\nSuggestions :\n• Tapez "vols" pour voir les vols disponibles\n• Tapez "réservation" pour le guide de réservation\n• Tapez "admin" pour les fonctions administrateur' :
        '\n\nSuggestions:\n• Type "flights" to see available flights\n• Type "booking" for booking guide\n• Type "admin" for admin functions';

      if (!reply.includes('Suggestions')) {
        reply += suggestions;
      }
    }

    return res.json({ reply });
  } catch (err) {
    console.error('Erreur dans le gestionnaire de chat:', err);
    const language = req.body.language || 'fr';
    return res.status(500).json({
      error: language === 'fr' ? 'Erreur interne du serveur' : 'Internal server error',
      details: String(err)
    });
  }
}
