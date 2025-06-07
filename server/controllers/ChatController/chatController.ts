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
    dashboard: "Le tableau de bord affiche : statistiques des vols, revenus, réservations par classe, destinations populaires",
    contract: "Pour consulter votre contrat : 1) Allez dans 'Mon Contrat', 2) Consultez les détails, 3) Téléchargez le PDF si nécessaire",
    solde: "Pour demander un solde : 1) Allez dans 'Demande Solde', 2) Remplissez le formulaire, 3) Attendez l'approbation"
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

  // Booking/Reservation (more specific to avoid conflict with "vols")
  if (msg.includes('réserver') || msg.includes('réservation') || msg.includes('booking') ||
      msg.includes('comment réserver') || msg.includes('guide réservation')) {
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

  // Contract
  if (msg.includes('contrat') || msg.includes('contract')) {
    return 'contract';
  }

  // Solde/Balance
  if (msg.includes('solde') || msg.includes('balance') || msg.includes('crédit')) {
    return 'solde';
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
function getSpecificHelp(intent: string): string {
  const guides = PROJECT_KNOWLEDGE.userGuides;
  const tech = PROJECT_KNOWLEDGE.technicalInfo;
  const project = PROJECT_KNOWLEDGE.projectInfo;

  switch (intent) {
    case 'login':
      return guides.login;

    case 'booking':
      return guides.booking;

    case 'profile':
      return guides.profile;

    case 'claims':
      return guides.claims;

    case 'dashboard':
      return guides.dashboard;

    case 'contract':
      return guides.contract;

    case 'solde':
      return guides.solde;

    case 'technical':
      return `Architecture technique :\n- ${tech.architecture}\n- ${tech.authentication}\n- ${tech.database}\n- ${tech.api}\n- ${tech.deployment}`;

    case 'project':
      return `${project.name} : ${project.description}\nTechnologies : ${project.technologies.join(', ')}\nFonctionnalités : ${project.features.join(', ')}`;

    default:
      return '';
  }
}

// Function to get real-time data from database
async function getRealTimeData(dataType: string): Promise<any> {
  try {
    switch (dataType) {
      case 'flights':
        const currentDate = new Date();
        const flights = await Flight.createQueryBuilder('flight')
          .leftJoinAndSelect('flight.airport_depart', 'airport_depart')
          .leftJoinAndSelect('flight.arrival_airport', 'arrival_airport')
          .where('flight.date_depart >= :currentDate', { currentDate })
          .orderBy('flight.date_depart', 'ASC')
          .take(5)
          .getMany();

        // Ensure we have valid data
        const validFlights = flights.filter(flight =>
          flight && flight.date_depart &&
          (flight.airport_depart || flight.arrival_airport)
        );

        return validFlights;

      case 'reservations':
        const reservations = await Reservation.find({
          take: 5,
          order: { id: 'DESC' }
        });
        return reservations || [];

      case 'users':
        const userCount = await User.count();
        return { count: userCount || 0 };

      case 'news':
        const news = await News.find({
          take: 3,
          order: { id: 'DESC' }
        });
        return news || [];

      default:
        return null;
    }
  } catch (error) {
    console.error('Error fetching real-time data:', error);
    return null;
  }
}

// Function to format flight data for chat response
function formatFlightData(flights: any[]): string {
  if (!flights || flights.length === 0) {
    return "Aucun vol disponible pour le moment. Veuillez vérifier plus tard ou contacter notre service client.";
  }

  try {
    const flightList = flights.map((flight) => {
      // Safe data extraction with fallbacks
      const departure = flight.airport_depart?.nom ||
                       flight.airport_depart?.code ||
                       flight.airport_depart_id ||
                       'Aéroport de départ';

      const arrival = flight.arrival_airport?.nom ||
                     flight.arrival_airport?.code ||
                     flight.airport_arrivee_id ||
                     'Aéroport d\'arrivée';

      // Safe date formatting
      let formattedDate = 'Date à confirmer';
      if (flight.date_depart) {
        try {
          const date = new Date(flight.date_depart);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString('fr-FR', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        } catch (dateError) {
          console.error('Date formatting error:', dateError);
        }
      }

      // Safe price formatting
      const price = flight.prix ? `${flight.prix} TND` : 'Prix à confirmer';

      // Flight title if available
      const title = flight.titre ? `\nVol: ${flight.titre}` : '';

      return `🛫 ${departure} → ${arrival}${title}\n📅 ${formattedDate}\n💰 ${price}\n`;
    }).join('\n');

    return `✈️ Voici les prochains vols disponibles :\n\n${flightList}\n💡 Pour réserver, utilisez notre interface de réservation ou contactez notre service client.`;

  } catch (error) {
    console.error('Error formatting flight data:', error);
    return "Erreur lors de l'affichage des vols. Veuillez réessayer ou contacter notre service client.";
  }
}

// Enhanced function to provide contextual help
async function getContextualHelp(message: string): Promise<string> {
  const msg = message.toLowerCase();

  // Check for real-time data requests FIRST (before intent detection)
  // This ensures "vols" shows available flights instead of booking guide
  if (msg.includes('vols disponibles') || msg.includes('voir les vols') || msg === 'vols' || msg.includes('liste des vols')) {
    const flights = await getRealTimeData('flights');
    return formatFlightData(flights);
  }

  if (msg.includes('actualités') || msg.includes('news') || msg.includes('dernières actualités')) {
    const news = await getRealTimeData('news');
    if (news && news.length > 0) {
      const newsList = news.map((item: any) => {
        const title = item.titre || 'Actualité sans titre';
        const date = item.createdAt ?
          new Date(item.createdAt).toLocaleDateString('fr-FR') :
          'Date non disponible';
        return `📰 ${title}\n   📅 ${date}`;
      }).join('\n\n');
      return `📢 Dernières actualités :\n\n${newsList}\n\n💡 Pour plus de détails, consultez la section Actualités de notre plateforme.`;
    } else {
      return "📢 Aucune actualité disponible pour le moment. Veuillez vérifier plus tard.";
    }
  }

  // Then check for specific intents
  const intent = detectIntent(message);
  const specificHelp = getSpecificHelp(intent);

  if (specificHelp) {
    return specificHelp;
  }

  // Provide general help menu
  return `Assistant Tunisair B2B - Comment puis-je vous aider ?\n\n` +
    `Commandes disponibles :\n` +
    `• "connexion" - Aide pour se connecter\n` +
    `• "réservation" - Guide de réservation\n` +
    `• "profil" - Gestion du profil\n` +
    `• "réclamation" - Faire une réclamation\n` +
    `• "contrat" - Consulter votre contrat\n` +
    `• "solde" - Demander un solde\n` +
    `• "vols" - Voir les vols disponibles\n` +
    `• "projet" - Informations sur la plateforme\n` +
    `• "technique" - Aide technique\n\n` +
    `Astuce : Posez-moi n'importe quelle question sur l'utilisation de la plateforme !`;
}

// Enhanced function to call Gemini API with project context
async function callGemini(userMessage: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_VERSION });

    const projectContext = `
    Tu es l'assistant IA officiel de Tunisair B2B, spécialisé dans l'aide aux clients de notre plateforme de réservation de vols d'affaires.

    INFORMATIONS SUR LA PLATEFORME:
    - Plateforme: ${PROJECT_KNOWLEDGE.projectInfo.name}
    - Mission: Faciliter les réservations de vols d'affaires pour les entreprises partenaires de Tunisair
    - Services: Réservations, gestion de profil, contrats, demandes de solde, réclamations, actualités

    TON RÔLE:
    - Aider UNIQUEMENT les clients (pas les administrateurs)
    - Fournir des informations précises et vérifiées
    - Guider les utilisateurs dans l'utilisation de la plateforme
    - Répondre aux questions sur les procédures et fonctionnalités
    - Orienter vers le service client si nécessaire

    RÈGLES IMPORTANTES:
    1. Réponds TOUJOURS en français
    2. Sois professionnel, courtois et précis
    3. Si tu ne connais pas une information, dis-le clairement
    4. Ne donne JAMAIS d'informations sur les fonctions administrateur
    5. Encourage l'utilisation des fonctionnalités de la plateforme
    6. En cas de problème technique, oriente vers le service client

    COMMANDES DISPONIBLES POUR LES CLIENTS:
    - "vols" : Voir les vols disponibles
    - "réservation" : Guide de réservation
    - "contrat" : Consulter son contrat
    - "solde" : Demander un solde
    - "réclamation" : Faire une réclamation
    - "profil" : Gérer son profil
    - "actualités" : Voir les dernières nouvelles

    Réponds de manière utile et précise à la question du client.
    `;

    const prompt = `${projectContext}\n\nQuestion du client: ${userMessage}\n\nRéponds en français de manière professionnelle et utile:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return 'Désolé, j\'ai rencontré une erreur lors du traitement de votre demande.';
  }
}

// Main chat handler
export async function handleChat(req: Request, res: Response) {
  try {
    const userMessage: string = req.body.message || '';

    if (!userMessage) {
      console.log('❌ Aucun message fourni dans la requête');
      return res.status(400).json({
        error: 'Aucun message fourni.'
      });
    }

    console.log('📨 Message reçu:', userMessage);

    let reply = '';
    let responseSource = '';

    // First, try to get contextual help (this includes real-time data and specific guides)
    const contextualHelp = await getContextualHelp(userMessage);

    // If we have specific contextual help, use it
    if (contextualHelp && !contextualHelp.includes('Comment puis-je vous aider')) {
      reply = contextualHelp;
      responseSource = 'contextual';
      console.log('✅ Réponse contextuelle fournie');
    } else {
      // Otherwise, use Gemini AI with project context
      console.log('🤖 Utilisation de Gemini AI...');
      reply = await callGemini(userMessage);
      responseSource = 'gemini';
      console.log('✅ Réponse Gemini fournie');
    }

    // Add helpful suggestions at the end for general queries
    if (userMessage.toLowerCase().includes('aide') || userMessage.toLowerCase().includes('bonjour')) {
      const suggestions = '\n\n💡 Suggestions :\n• Tapez "vols" pour voir les vols disponibles\n• Tapez "réservation" pour le guide de réservation\n• Tapez "contrat" pour consulter votre contrat\n• Tapez "solde" pour les demandes de solde';

      if (!reply.includes('Suggestions')) {
        reply += suggestions;
      }
    }

    // Ensure we have a valid reply
    if (!reply || reply.trim() === '') {
      reply = "Je suis désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer ou contacter notre service client.";
      console.log('⚠️ Réponse vide, utilisation du message par défaut');
    }

    console.log(`📤 Réponse envoyée (source: ${responseSource}):`, reply.substring(0, 100) + '...');

    return res.json({ reply });
  } catch (err) {
    console.error('❌ Erreur dans le gestionnaire de chat:', err);
    return res.status(500).json({
      error: 'Erreur interne du serveur. Veuillez réessayer plus tard.',
      details: process.env.NODE_ENV === 'development' ? String(err) : undefined
    });
  }
}
