# 🔧 Spécifications Techniques - Tunisair Partner Hub

## 📋 Technologies et Versions

### **Backend (Serveur)**
```json
{
  "runtime": "Node.js 18+",
  "language": "TypeScript 5.8.2",
  "framework": "Express.js 4.21.2",
  "orm": "TypeORM 0.3.20",
  "database": "MySQL 8.0+",
  "authentication": "JWT + bcrypt",
  "email": "Nodemailer 6.10.1",
  "ai": "Google Gemini API 0.24.1",
  "upload": "Multer 1.4.5",
  "validation": "Express Validator",
  "cors": "CORS 2.8.5"
}
```

### **Frontend Web (Client)**
```json
{
  "framework": "React 19.0.0",
  "language": "JavaScript ES6+",
  "bundler": "Vite 6.2.0",
  "ui": "Material-UI 6.4.11",
  "styling": "Tailwind CSS 3.4.17",
  "routing": "React Router 7.2.0",
  "http": "Axios 1.8.1",
  "charts": "Recharts 2.15.2",
  "pdf": "jsPDF 3.0.1",
  "animation": "Framer Motion 12.12.1"
}
```

### **Mobile (Flutter)**
```yaml
flutter: "SDK ^3.7.0"
dependencies:
  - dio: "^5.4.0"           # HTTP client
  - shared_preferences: "^2.2.0"  # Local storage
  - image_picker: "^1.0.4"  # Image selection
  - google_fonts: "^6.1.0"  # Typography
  - intl: "^0.18.1"         # Internationalization
```

## 🗄️ Structure de Base de Données

### **Configuration MySQL**
```sql
-- Base de données
CREATE DATABASE b2b_db4 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Configuration
host: localhost
port: 3306
username: root
password: ""
charset: utf8mb4_unicode_ci
```

### **Tables Principales**

#### **Users (Utilisateurs)**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  numero_telephone VARCHAR(20),
  pays VARCHAR(100),
  adresse TEXT,
  est_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **Flights (Vols)**
```sql
CREATE TABLE flights (
  id INT PRIMARY KEY AUTO_INCREMENT,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  date_depart DATETIME NOT NULL,
  date_retour DATETIME NOT NULL,
  airport_depart_id INT,
  arrival_airport_id INT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (airport_depart_id) REFERENCES airports(id),
  FOREIGN KEY (arrival_airport_id) REFERENCES airports(id)
);
```

#### **Reservations (Réservations)**
```sql
CREATE TABLE reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  flight_id INT NOT NULL,
  nombre_passagers INT NOT NULL,
  class_type VARCHAR(50) DEFAULT 'economy',
  prix_total DECIMAL(10,2) NOT NULL,
  statut VARCHAR(50) DEFAULT 'pending',
  date_reservation DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (flight_id) REFERENCES flights(id) ON DELETE CASCADE
);
```

## 🔐 Sécurité et Authentification

### **JWT Configuration**
```typescript
// Token Structure
{
  "userId": number,
  "role": "admin" | "client",
  "iat": timestamp,
  "exp": timestamp (24h)
}

// Secret Key
JWT_SECRET: process.env.JWT_SECRET
```

### **Password Hashing**
```typescript
// Bcrypt Configuration
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

### **CORS Policy**
```typescript
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## 📡 API Endpoints

### **Authentication Routes**
```
POST   /api/auth/login          # Connexion utilisateur
POST   /api/auth/register       # Inscription (admin only)
GET    /api/auth/verify         # Vérification token
```

### **User Management**
```
GET    /api/users              # Liste utilisateurs (admin)
GET    /api/users/:id          # Détails utilisateur
POST   /api/users              # Créer utilisateur (admin)
PUT    /api/users/:id          # Modifier utilisateur
DELETE /api/users/:id          # Supprimer utilisateur (admin)
```

### **Flight Management**
```
GET    /api/flights            # Liste vols (avec filtres)
GET    /api/flights/:id        # Détails vol
POST   /api/flights            # Créer vol (admin)
PUT    /api/flights/:id        # Modifier vol (admin)
DELETE /api/flights/:id        # Supprimer vol (admin)
```

### **Reservation System**
```
GET    /api/reservations       # Liste réservations
GET    /api/reservations/:id   # Détails réservation
POST   /api/reservations       # Nouvelle réservation
PUT    /api/reservations/:id   # Modifier réservation
DELETE /api/reservations/:id   # Annuler réservation
```

### **Chatbot AI**
```
POST   /api/chat               # Conversation avec IA
```

## 🤖 Configuration Chatbot IA

### **Google Gemini Setup**
```typescript
// Configuration
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Environment Variables
API_KEY=your_gemini_api_key
MODEL_VERSION=gemini-1.5-flash
```

### **Fonctionnalités IA**
- **Détection d'intention** : Analyse des mots-clés
- **Base de connaissances** : Informations projet complètes
- **Données temps réel** : Accès direct à la base de données
- **Réponses contextuelles** : Intégration avec Gemini AI
- **Support multilingue** : Français et anglais

## 📧 Configuration Email

### **Nodemailer Setup**
```typescript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Environment Variables
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=http://localhost:3000
```

### **Types d'Emails**
1. **Email de bienvenue** : Nouveaux utilisateurs
2. **Confirmation de réservation** : Après réservation
3. **Approbation/Rejet** : Demandes de solde

## 📱 Configuration Mobile (Flutter)

### **API Service Configuration**
```dart
class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  
  final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: Duration(seconds: 5),
    receiveTimeout: Duration(seconds: 3),
  ));
}
```

### **State Management**
```dart
// Shared Preferences for local storage
SharedPreferences prefs = await SharedPreferences.getInstance();

// Token storage
await prefs.setString('auth_token', token);
String? token = prefs.getString('auth_token');
```

## 🌐 Configuration Web (React)

### **Axios Configuration**
```javascript
// API Base Configuration
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### **Context API Setup**
```javascript
// Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## 🚀 Déploiement et Performance

### **Scripts de Démarrage**

#### **Backend**
```bash
# Développement
npm run dev          # ts-node-dev avec hot reload

# Production
npm run build        # Compilation TypeScript
npm start           # Démarrage production
```

#### **Frontend Web**
```bash
# Développement
npm run dev         # Vite dev server (port 3000)

# Production
npm run build       # Build optimisé
npm run preview     # Aperçu production
```

#### **Mobile**
```bash
# Développement
flutter run         # Hot reload

# Production
flutter build apk   # Build Android
flutter build ios   # Build iOS
```

### **Optimisations Performance**
- **Backend** : Connection pooling MySQL, caching, compression
- **Frontend** : Code splitting, lazy loading, image optimization
- **Mobile** : Widget optimization, state management efficient

Cette architecture technique garantit une performance optimale, une sécurité robuste et une maintenance facilitée du système Tunisair Partner Hub.
