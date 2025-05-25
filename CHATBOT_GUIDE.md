# 🤖 Guide du Chatbot IA Tunisair B2B

## Vue d'ensemble

Le chatbot IA de la plateforme Tunisair B2B est un assistant intelligent qui peut répondre à toutes les questions concernant le projet et guider les utilisateurs dans l'utilisation de la plateforme.

## 🚀 Fonctionnalités Principales

### 1. **Assistant Intelligent**
- Utilise l'IA Google Gemini pour des réponses contextuelles
- Base de connaissances complète du projet
- Détection automatique de l'intention de l'utilisateur
- Réponses en français et anglais

### 2. **Données en Temps Réel**
- Accès direct à la base de données
- Affichage des vols disponibles
- Informations sur les réservations
- Actualités récentes

### 3. **Guides Intégrés**
- Guide de connexion
- Guide de réservation
- Guide des fonctions administrateur
- Support technique

## 📋 Commandes Disponibles

### **Commandes Utilisateur**
| Commande | Description | Exemple |
|----------|-------------|---------|
| `connexion` | Aide pour se connecter | "Comment me connecter ?" |
| `réservation` | Guide de réservation | "Comment réserver un vol ?" |
| `profil` | Gestion du profil | "Comment modifier mon profil ?" |
| `réclamation` | Faire une réclamation | "Comment faire une réclamation ?" |
| `vols` | Voir les vols disponibles | "Montre-moi les vols" |
| `actualités` | Dernières actualités | "Quelles sont les actualités ?" |

### **Commandes Administrateur**
| Commande | Description | Exemple |
|----------|-------------|---------|
| `admin` | Fonctions administrateur | "Fonctions admin disponibles" |
| `gestion` | Gestion des entités | "Comment gérer les vols ?" |
| `dashboard` | Tableau de bord | "Comment utiliser le dashboard ?" |
| `utilisateurs` | Gestion des utilisateurs | "Comment gérer les utilisateurs ?" |

### **Commandes Techniques**
| Commande | Description | Exemple |
|----------|-------------|---------|
| `technique` | Aide technique | "Architecture du projet" |
| `projet` | Informations sur le projet | "Qu'est-ce que Tunisair B2B ?" |
| `erreur` | Dépannage | "J'ai une erreur de connexion" |
| `aide` | Menu d'aide complet | "Aide" |

## 🎯 Fonctionnalités Avancées

### **Détection d'Intention**
Le chatbot analyse automatiquement les messages pour détecter l'intention :
- **Connexion** : Mots-clés comme "connexion", "login", "connecter"
- **Réservation** : Mots-clés comme "réserver", "vol", "booking"
- **Administration** : Mots-clés comme "admin", "gestion", "gérer"
- **Technique** : Mots-clés comme "technique", "erreur", "bug"

### **Données Contextuelles**
- **Vols** : Affiche les 5 prochains vols avec détails
- **Actualités** : Montre les 3 dernières actualités
- **Statistiques** : Informations sur les utilisateurs et réservations

### **Boutons d'Action Rapide**
Interface avec boutons prédéfinis pour :
- ✈️ Voir les vols
- 📅 Guide réservation
- 👤 Fonctions admin
- ❓ Aide complète

## 🛠️ Architecture Technique

### **Backend (Node.js/TypeScript)**
```
server/controllers/ChatController/chatController.ts
├── PROJECT_KNOWLEDGE - Base de connaissances
├── detectIntent() - Détection d'intention
├── getSpecificHelp() - Aide spécifique
├── getRealTimeData() - Données temps réel
├── getContextualHelp() - Aide contextuelle
└── callGemini() - IA Google Gemini
```

### **Frontend (React)**
```
client/src/components/ChatBot/
├── ChatBot.jsx - Composant principal
├── ChatBot.css - Styles
└── index.js - Export
```

### **Base de Connaissances**
Le chatbot contient une base de connaissances complète incluant :
- Informations sur le projet
- Guides utilisateur détaillés
- Guides administrateur
- Informations techniques
- Solutions de dépannage

## 🎨 Interface Utilisateur

### **Design Moderne**
- Interface avec dégradés colorés
- Animations fluides
- Boutons d'action rapide
- Messages formatés avec emojis

### **Responsive**
- Adapté aux écrans mobiles
- Grille responsive pour les boutons
- Scrollbar personnalisée

## 📊 Exemples d'Utilisation

### **Exemple 1 : Voir les vols**
```
Utilisateur: "vols"
Chatbot: "Voici les prochains vols disponibles :

✈️ Tunis → Paris
📅 25/05/2025
💰 450 TND

✈️ Tunis → Madrid
📅 26/05/2025
💰 380 TND"
```

### **Exemple 2 : Guide de réservation**
```
Utilisateur: "réservation"
Chatbot: "Pour réserver un vol :
1) Recherchez des vols
2) Sélectionnez votre vol
3) Choisissez vos sièges
4) Confirmez la réservation"
```

### **Exemple 3 : Fonctions admin**
```
Utilisateur: "admin"
Chatbot: "Fonctions admin disponibles :
- Gestion des vols : Créer, modifier, supprimer des vols
- Gestion des utilisateurs : Voir tous les utilisateurs
- Gestion des réservations : Voir toutes les réservations
- Tableau de bord admin : Statistiques en temps réel"
```

## 🔧 Configuration

### **Variables d'Environnement**
- `API_KEY` : Clé API Google Gemini
- `MODEL_VERSION` : Version du modèle (gemini-1.5-flash)

### **Dépendances**
- `@google/generative-ai` : IA Google Gemini
- `express` : Serveur web
- `react` : Interface utilisateur

## 🚀 Déploiement

Le chatbot est automatiquement disponible sur :
- **Client** : `http://localhost:3000` (bouton en bas à droite)
- **API** : `http://localhost:5000/api/chat`

## 💡 Conseils d'Utilisation

1. **Soyez spécifique** : Plus votre question est précise, meilleure sera la réponse
2. **Utilisez les mots-clés** : Le chatbot reconnaît des mots-clés spécifiques
3. **Explorez les boutons** : Utilisez les boutons d'action rapide pour commencer
4. **Posez des questions ouvertes** : Le chatbot peut répondre à des questions complexes

## 🔄 Mises à Jour Futures

- Support multilingue étendu
- Intégration avec plus de données en temps réel
- Fonctionnalités de réservation directe
- Analytics des conversations
- Apprentissage automatique des préférences utilisateur
