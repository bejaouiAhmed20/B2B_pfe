# 📧 Guide du Système d'Email - Tunisair Partner Hub

## Vue d'ensemble

Le système d'email automatisé de Tunisair Partner Hub envoie des notifications personnalisées aux utilisateurs pour différents événements de la plateforme.

## 🚀 Fonctionnalités Implémentées

### **1. Email de Bienvenue (Nouveau Client)**
**Déclencheur** : Création d'un nouveau compte utilisateur
**Contenu** :
- Message de bienvenue personnalisé
- Identifiants de connexion (email + mot de passe)
- Lien direct vers la page de connexion
- Guide des fonctionnalités disponibles
- Recommandation de changer le mot de passe

### **2. Email de Confirmation de Réservation**
**Déclencheur** : Création d'une nouvelle réservation
**Contenu** :
- Détails complets du vol (itinéraire, dates, prix)
- Numéro de réservation
- Informations sur les passagers et la classe
- Statut de la réservation
- Instructions pour le voyage

### **3. Email d'Approbation de Demande de Solde**
**Déclencheur** : Approbation d'une demande de solde par l'admin
**Contenu** :
- Confirmation de l'approbation
- Montant approuvé
- Nouveau solde du compte
- Commentaire de l'administrateur (optionnel)
- Instructions pour utiliser le solde

### **4. Email de Rejet de Demande de Solde**
**Déclencheur** : Rejet d'une demande de solde par l'admin
**Contenu** :
- Notification du rejet
- Montant demandé
- Raison du rejet (commentaire admin)
- Instructions pour soumettre une nouvelle demande

## 🛠️ Configuration Technique

### **Variables d'Environnement (.env)**
```env
# Configuration Email
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-app
CLIENT_URL=http://localhost:3000
```

### **Service Email (emailService.ts)**
```typescript
import { sendWelcomeEmail } from './services/emailService';

// Exemple d'utilisation
const emailData = {
  userEmail: 'client@example.com',
  userName: 'Jean Dupont',
  userFirstName: 'Jean',
  password: 'motdepasse123',
  loginUrl: 'http://localhost:3000/login'
};

await sendWelcomeEmail(emailData);
```

## 📋 Intégrations dans les Contrôleurs

### **1. UserController - Création d'utilisateur**
```typescript
// Dans addUser()
const emailData = {
  userEmail: email,
  userName: nom,
  userFirstName: nom.split(' ')[0],
  password: originalPassword,
  loginUrl: process.env.CLIENT_URL || 'http://localhost:3000/login'
};

await sendWelcomeEmail(emailData);
```

### **2. ReservationController - Nouvelle réservation**
```typescript
// Dans addReservation() et createReservation()
const emailData = {
  userEmail: user.email,
  userName: user.nom,
  flightTitle: flight.titre,
  departureAirport: flight.airport_depart?.nom,
  arrivalAirport: flight.arrival_airport?.nom,
  // ... autres données
};

await sendReservationConfirmationEmail(emailData);
```

### **3. RequestSoldeController - Gestion des demandes**
```typescript
// Dans approveRequest()
const emailData = {
  userEmail: request.client.email,
  userName: request.client.nom,
  requestedAmount: parseFloat(request.montant.toString()),
  status: 'approved',
  newBalance: parseFloat(compte.solde.toString())
};

await sendSoldeRequestResponseEmail(emailData);
```

## 🎨 Design des Emails

### **Caractéristiques du Design**
- **Couleur principale** : Rouge Tunisair (#CC0A2B)
- **Design responsive** : Compatible mobile et desktop
- **Templates HTML** : Emails riches avec mise en forme
- **Branding cohérent** : Logo et couleurs Tunisair
- **Lisibilité optimisée** : Police Arial, contrastes élevés

### **Structure des Templates**
1. **En-tête** : Logo Tunisair + titre
2. **Contenu principal** : Message personnalisé
3. **Détails** : Informations spécifiques (encadrées)
4. **Actions** : Boutons ou liens (si applicable)
5. **Pied de page** : Mentions légales

## 🧪 Tests et Validation

### **Fichier de Test (test-email.ts)**
```bash
# Exécuter les tests d'email
cd server
npx ts-node test-email.ts
```

### **Tests Inclus**
1. ✅ Configuration email
2. ✅ Email de bienvenue
3. ✅ Confirmation de réservation
4. ✅ Approbation de demande de solde
5. ✅ Rejet de demande de solde

## 🔧 Dépannage

### **Problèmes Courants**

#### **1. Erreur d'authentification Gmail**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution** :
- Activer l'authentification à 2 facteurs sur Gmail
- Générer un mot de passe d'application
- Utiliser le mot de passe d'application dans EMAIL_PASSWORD

#### **2. Emails non reçus**
**Vérifications** :
- Vérifier le dossier spam/courrier indésirable
- Confirmer que EMAIL_USER et EMAIL_PASSWORD sont corrects
- Tester avec `testEmailConfiguration()`

#### **3. Erreur de template HTML**
**Solution** :
- Vérifier la syntaxe des templates
- Tester les variables dynamiques
- Valider le HTML avec un validateur

## 📊 Monitoring et Logs

### **Logs d'Email**
```typescript
// Logs automatiques dans la console
console.log(`Email de bienvenue envoyé à ${email}`);
console.log(`Échec de l'envoi de l'email à ${email}`);
```

### **Gestion d'Erreurs**
- Les erreurs d'email n'interrompent pas les processus métier
- Logs détaillés pour le débogage
- Fallback gracieux en cas d'échec

## 🚀 Déploiement

### **Configuration Production**
```env
# Production
EMAIL_USER=noreply@tunisair.com
EMAIL_PASSWORD=mot-de-passe-securise
CLIENT_URL=https://partner.tunisair.com
```

### **Recommandations**
- Utiliser un service email professionnel (SendGrid, AWS SES)
- Configurer SPF, DKIM, DMARC pour la délivrabilité
- Monitorer les taux de délivrance
- Implémenter des templates d'email versionnés

## 📈 Métriques et Analytics

### **Métriques Recommandées**
- Taux de délivrance des emails
- Taux d'ouverture
- Taux de clics sur les liens
- Erreurs d'envoi par type

### **Améliorations Futures**
- Templates d'email personnalisables
- Support multilingue étendu
- Notifications push en complément
- Système de préférences utilisateur
- Analytics détaillés des emails

## 🔐 Sécurité

### **Bonnes Pratiques**
- Mots de passe d'application Gmail
- Variables d'environnement sécurisées
- Validation des adresses email
- Protection contre le spam
- Chiffrement des communications

Le système d'email est maintenant entièrement fonctionnel et intégré dans tous les processus métier de la plateforme Tunisair Partner Hub !
