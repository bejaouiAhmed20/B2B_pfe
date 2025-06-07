# 🏗️ Architecture du Système - Tunisair Partner Hub

## 7. L'architecture du système

### 7.1. Architecture physique

#### **🌐 Vue d'ensemble de l'infrastructure**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE PHYSIQUE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   CLIENT    │    │   MOBILE    │    │   SERVEUR   │         │
│  │    WEB      │    │    APP      │    │   BACKEND   │         │
│  │             │    │             │    │             │         │
│  │ React.js    │    │ Flutter     │    │ Node.js     │         │
│  │ Port: 3000  │    │ Dart        │    │ Port: 5000  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                   │                   │              │
│         └───────────────────┼───────────────────┘              │
│                             │                                  │
│                    ┌─────────────┐                             │
│                    │   BASE DE   │                             │
│                    │  DONNÉES    │                             │
│                    │             │                             │
│                    │   MySQL     │                             │
│                    │ Port: 3306  │                             │
│                    └─────────────┘                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **🖥️ Composants Physiques**

##### **1. Serveur Backend (Node.js)**
- **Technologie** : Node.js + TypeScript
- **Port** : 5000
- **Localisation** : `server/`
- **Responsabilités** :
  - API RESTful
  - Authentification JWT
  - Gestion des données
  - Services métier
  - Chatbot IA (Google Gemini)
  - Service d'email (Nodemailer)

##### **2. Client Web (React.js)**
- **Technologie** : React.js + Vite
- **Port** : 3000
- **Localisation** : `client/`
- **Responsabilités** :
  - Interface utilisateur web
  - Gestion des états (Context API)
  - Routage (React Router)
  - Communication API (Axios)

##### **3. Application Mobile (Flutter)**
- **Technologie** : Flutter + Dart
- **Localisation** : `test_api/`
- **Responsabilités** :
  - Interface mobile native
  - Gestion des états
  - Communication API (Dio)
  - Navigation mobile

##### **4. Base de Données (MySQL)**
- **Technologie** : MySQL 8.0+
- **Port** : 3306
- **Base** : `b2b_db4`
- **Responsabilités** :
  - Stockage des données
  - Relations entre entités
  - Transactions ACID
  - Indexation et performance

#### **🔗 Connexions Réseau**

```
Client Web (3000) ──HTTP/HTTPS──► Serveur Backend (5000)
                                         │
Mobile App ────────HTTP/HTTPS──────────►│
                                         │
                                         ▼
                                  MySQL Database (3306)
```

#### **📡 Services Externes**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICES EXTERNES                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   GOOGLE    │    │   GMAIL     │    │   STORAGE   │         │
│  │   GEMINI    │    │   SMTP      │    │   LOCAL     │         │
│  │     AI      │    │             │    │             │         │
│  │             │    │ Email       │    │ Uploads/    │         │
│  │ Chatbot     │    │ Service     │    │ Images      │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2. Architecture logique

#### **🏛️ Architecture en Couches**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE LOGIQUE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              COUCHE PRÉSENTATION                            │ │
│  │                                                             │ │
│  │  ┌─────────────┐              ┌─────────────┐              │ │
│  │  │   CLIENT    │              │   MOBILE    │              │ │
│  │  │     WEB     │              │    APP      │              │ │
│  │  │             │              │             │              │ │
│  │  │ • React.js  │              │ • Flutter   │              │ │
│  │  │ • Material  │              │ • Material  │              │ │
│  │  │ • Tailwind  │              │ • Widgets   │              │ │
│  │  │ • Responsive│              │ • Native    │              │ │
│  │  └─────────────┘              └─────────────┘              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │               COUCHE SERVICES                               │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │     API     │  │   CHATBOT   │  │    EMAIL    │        │ │
│  │  │  RESTFUL    │  │     IA      │  │   SERVICE   │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Express   │  │ • Gemini AI │  │ • Nodemailer│        │ │
│  │  │ • Routes    │  │ • Context   │  │ • Templates │        │ │
│  │  │ • Middleware│  │ • Real-time │  │ • SMTP      │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              COUCHE MÉTIER                                  │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │CONTRÔLEURS  │  │  SERVICES   │  │MIDDLEWARES  │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Auth      │  │ • Business  │  │ • Auth JWT  │        │ │
│  │  │ • User      │  │ • Logic     │  │ • CORS      │        │ │
│  │  │ • Flight    │  │ • Validation│  │ • Upload    │        │ │
│  │  │ • Booking   │  │ • Email     │  │ • Error     │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              COUCHE DONNÉES                                 │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │   MODÈLES   │  │     ORM     │  │   BASE DE   │        │ │
│  │  │  ENTITÉS    │  │  TypeORM    │  │  DONNÉES    │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • User      │  │ • Relations │  │ • MySQL     │        │ │
│  │  │ • Flight    │  │ • Migrations│  │ • Tables    │        │ │
│  │  │ • Booking   │  │ • Queries   │  │ • Indexes   │        │ │
│  │  │ • News      │  │ • Entities  │  │ • Constraints│       │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **🔄 Flux de Données**

##### **1. Flux d'Authentification**
```
Client/Mobile ──► API Auth ──► JWT Middleware ──► User Controller ──► Database
     ▲                                                                    │
     └────────────────── JWT Token ◄─────────────────────────────────────┘
```

##### **2. Flux de Réservation**
```
Client ──► Reservation API ──► Flight Controller ──► Business Logic ──► Database
   │                                    │                    │              │
   │                                    ▼                    ▼              │
   │                            Email Service ──► SMTP ──► Client Email     │
   │                                                                        │
   └──────────────── Confirmation Response ◄──────────────────────────────┘
```

##### **3. Flux du Chatbot**
```
Client ──► Chat API ──► Intent Detection ──► Context Analysis ──► Response
   ▲                           │                     │              │
   │                           ▼                     ▼              │
   │                    Database Query ──► Gemini AI ──────────────┘
   │                           │              │
   └─────── AI Response ◄──────┴──────────────┘
```

#### **🎯 Patterns Architecturaux Utilisés**

##### **1. Pattern MVC (Model-View-Controller)**
```
┌─────────────────────────────────────────────────────────────────┐
│                        PATTERN MVC                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    VIEW     │    │ CONTROLLER  │    │    MODEL    │         │
│  │             │    │             │    │             │         │
│  │ • React     │◄──►│ • Express   │◄──►│ • TypeORM   │         │
│  │ • Flutter   │    │ • Routes    │    │ • Entities  │         │
│  │ • Components│    │ • Logic     │    │ • Database  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

##### **2. Pattern Repository**
```
Controller ──► Service ──► Repository ──► Database
    │             │            │
    │             │            └─── Abstraction des données
    │             └──────────────── Logique métier
    └─────────────────────────────── Gestion des requêtes
```

##### **3. Pattern Middleware Chain**
```
Request ──► CORS ──► Auth ──► Validation ──► Controller ──► Response
```

#### **📊 Modèle de Données**

##### **Entités Principales**
```
┌─────────────────────────────────────────────────────────────────┐
│                     MODÈLE DE DONNÉES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    USER     │    │   FLIGHT    │    │ RESERVATION │         │
│  │             │    │             │    │             │         │
│  │ • id        │    │ • id        │    │ • id        │         │
│  │ • nom       │◄──┐│ • titre     │◄──┐│ • user_id   │         │
│  │ • email     │   ││ • prix      │   ││ • flight_id │         │
│  │ • role      │   ││ • date_dep  │   ││ • prix_total│         │
│  │ • solde     │   ││ • date_ret  │   ││ • statut    │         │
│  └─────────────┘   │└─────────────┘   │└─────────────┘         │
│         │          │        │         │        │               │
│         │          │        │         │        │               │
│  ┌─────────────┐   │ ┌─────────────┐  │ ┌─────────────┐        │
│  │   COMPTE    │   │ │   AIRPORT   │  │ │    NEWS     │        │
│  │             │   │ │             │  │ │             │        │
│  │ • user_id   │───┘ │ • nom       │──┘ │ • titre     │        │
│  │ • solde     │     │ • code      │    │ • contenu   │        │
│  │ • created   │     │ • location  │    │ • image_url │        │
│  └─────────────┘     └─────────────┘    └─────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **🔐 Sécurité et Authentification**

##### **Architecture de Sécurité**
```
┌─────────────────────────────────────────────────────────────────┐
│                    SÉCURITÉ SYSTÈME                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    HTTPS    │    │     JWT     │    │   BCRYPT    │         │
│  │             │    │             │    │             │         │
│  │ • SSL/TLS   │    │ • Token     │    │ • Hash      │         │
│  │ • Encryption│    │ • Expiration│    │ • Salt      │         │
│  │ • Secure    │    │ • Signature │    │ • Secure    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │    CORS     │    │ VALIDATION  │    │   ROLES     │         │
│  │             │    │             │    │             │         │
│  │ • Origins   │    │ • Input     │    │ • Admin     │         │
│  │ • Methods   │    │ • Sanitize  │    │ • Client    │         │
│  │ • Headers   │    │ • Escape    │    │ • Permissions│        │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **📱 Architecture Mobile (Flutter)**

##### **Structure de l'Application Mobile**
```
┌─────────────────────────────────────────────────────────────────┐
│                  ARCHITECTURE MOBILE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    UI LAYER                                 │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │   SCREENS   │  │   WIDGETS   │  │ NAVIGATION  │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Home      │  │ • Custom    │  │ • Routes    │        │ │
│  │  │ • Login     │  │ • Reusable  │  │ • Guards    │        │ │
│  │  │ • Flights   │  │ • Material  │  │ • Drawer    │        │ │
│  │  │ • Profile   │  │ • Cards     │  │ • Tabs      │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 BUSINESS LAYER                              │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │   MODELS    │  │  SERVICES   │  │    STATE    │        │ │
│  │  │             │  │             │  │ MANAGEMENT  │        │ │
│  │  │ • User      │  │ • API       │  │             │        │ │
│  │  │ • Flight    │  │ • Auth      │  │ • Provider  │        │ │
│  │  │ • Booking   │  │ • Storage   │  │ • Notifier  │        │ │
│  │  │ • News      │  │ • Network   │  │ • State     │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   DATA LAYER                                │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │     DIO     │  │ SHARED PREFS│  │   STORAGE   │        │ │
│  │  │   HTTP      │  │             │  │             │        │ │
│  │  │             │  │ • Token     │  │ • Cache     │        │ │
│  │  │ • Requests  │  │ • Settings  │  │ • Files     │        │ │
│  │  │ • Responses │  │ • User Data │  │ • Images    │        │ │
│  │  │ • Interceptors│ │ • Offline  │  │ • Offline   │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **🌐 Architecture Web (React)**

##### **Structure de l'Application Web**
```
┌─────────────────────────────────────────────────────────────────┐
│                   ARCHITECTURE WEB                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 PRESENTATION LAYER                          │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │    PAGES    │  │ COMPONENTS  │  │   LAYOUTS   │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Admin     │  │ • ChatBot   │  │ • Client    │        │ │
│  │  │ • Client    │  │ • Flight    │  │ • Admin     │        │ │
│  │  │ • Auth      │  │ • Forms     │  │ • Auth      │        │ │
│  │  │ • Error     │  │ • Tables    │  │ • Protected │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  LOGIC LAYER                                │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │   CONTEXT   │  │   HOOKS     │  │   ROUTES    │        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │ • Auth      │  │ • Custom    │  │ • Public    │        │ │
│  │  │ • Popup     │  │ • State     │  │ • Private   │        │ │
│  │  │ • Theme     │  │ • Effect    │  │ • Admin     │        │ │
│  │  │ • Global    │  │ • API       │  │ • Client    │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  SERVICE LAYER                              │ │
│  │                                                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │    AXIOS    │  │   STORAGE   │  │    UTILS    │        │ │
│  │  │     API     │  │             │  │             │        │ │
│  │  │             │  │ • Local     │  │ • Helpers   │        │ │
│  │  │ • HTTP      │  │ • Session   │  │ • Validators│        │ │
│  │  │ • Auth      │  │ • Cache     │  │ • Formatters│        │ │
│  │  │ • Interceptors│ │ • Token    │  │ • Constants │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### **🔄 Communication Inter-Composants**

##### **API Communication Pattern**
```
┌─────────────────────────────────────────────────────────────────┐
│                 COMMUNICATION PATTERN                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (React/Flutter)                                      │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │   HTTP      │                                               │
│  │ REQUEST     │ ──────────────────────────────────────────┐   │
│  │             │                                           │   │
│  │ • Headers   │                                           │   │
│  │ • Body      │                                           │   │
│  │ • Auth      │                                           │   │
│  └─────────────┘                                           │   │
│                                                            │   │
│                                                            ▼   │
│                                                    ┌─────────────┐
│                                                    │   BACKEND   │
│                                                    │   SERVER    │
│                                                    │             │
│                                                    │ • Routes    │
│                                                    │ • Middleware│
│                                                    │ • Controllers│
│                                                    └─────────────┘
│                                                            │   │
│  ┌─────────────┐                                           │   │
│  │   HTTP      │ ◄─────────────────────────────────────────┘   │
│  │ RESPONSE    │                                               │
│  │             │                                               │
│  │ • Status    │                                               │
│  │ • Data      │                                               │
│  │ • Headers   │                                               │
│  └─────────────┘                                               │
│         │                                                       │
│         ▼                                                       │
│  Frontend Update                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Cette architecture garantit une séparation claire des responsabilités, une scalabilité optimale et une maintenance facilitée du système Tunisair Partner Hub.
