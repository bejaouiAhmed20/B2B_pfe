# 📊 Diagrammes de Déploiement - Tunisair Partner Hub

## 📋 Fichiers Disponibles

### **1. deployment_diagram.puml**
**Diagramme de déploiement complet et détaillé**
- Architecture complète avec tous les composants
- Technologies spécifiques et versions
- Connexions réseau détaillées
- Notes de sécurité et configuration

### **2. deployment_diagram_simple.puml**
**Diagramme de déploiement simplifié**
- Vue d'ensemble de l'architecture
- Composants principaux uniquement
- Idéal pour présentations exécutives
- Focus sur les flux principaux

### **3. deployment_diagram_production.puml**
**Diagramme de déploiement production**
- Infrastructure de production complète
- Load balancing et haute disponibilité
- Monitoring et sécurité avancée
- Stratégies de backup et scaling

## 🛠️ Comment Utiliser les Diagrammes

### **Prérequis**
- **PlantUML** installé
- **Java** (requis pour PlantUML)
- **Extension VSCode** : PlantUML (optionnel)

### **Génération des Diagrammes**

#### **Méthode 1 : Ligne de Commande**
```bash
# Installer PlantUML
npm install -g node-plantuml

# Générer les diagrammes
plantuml deployment_diagram.puml
plantuml deployment_diagram_simple.puml
plantuml deployment_diagram_production.puml
```

#### **Méthode 2 : VSCode**
1. Installer l'extension "PlantUML"
2. Ouvrir le fichier .puml
3. Utiliser `Ctrl+Shift+P` → "PlantUML: Preview Current Diagram"
4. Exporter en PNG/SVG/PDF

#### **Méthode 3 : En Ligne**
1. Aller sur http://www.plantuml.com/plantuml/
2. Copier le contenu du fichier .puml
3. Générer et télécharger l'image

## 📊 Description des Diagrammes

### **Diagramme Complet (deployment_diagram.puml)**

#### **Composants Inclus :**
- **Poste Client Web** : React App + Vite Server
- **Appareil Mobile** : Flutter App + Dart Runtime
- **Serveur Application** : Node.js + Express + Services
- **Base de Données** : MySQL + Configuration
- **Services Externes** : Google Gemini, Gmail SMTP, Storage

#### **Détails Techniques :**
- Ports de communication spécifiques
- Technologies et versions exactes
- Protocoles de communication
- Notes de sécurité et déploiement

### **Diagramme Simplifié (deployment_diagram_simple.puml)**

#### **Vue d'Ensemble :**
- Architecture 4-tiers simplifiée
- Connexions principales uniquement
- Technologies clés mentionnées
- Idéal pour documentation générale

### **Diagramme Production (deployment_diagram_production.puml)**

#### **Infrastructure Avancée :**
- **DMZ** avec Load Balancer et Web Server
- **Application Tier** avec instances multiples
- **Data Tier** avec Master/Slave MySQL
- **Cache Layer** avec Redis
- **Monitoring** avec Prometheus/Grafana

#### **Fonctionnalités Production :**
- Haute disponibilité
- Load balancing
- Réplication de données
- Monitoring et logs
- Sécurité avancée

## 🎯 Utilisation Recommandée

### **Pour la Documentation Technique :**
→ Utiliser `deployment_diagram.puml`

### **Pour les Présentations :**
→ Utiliser `deployment_diagram_simple.puml`

### **Pour l'Architecture Production :**
→ Utiliser `deployment_diagram_production.puml`

## 🔧 Personnalisation

### **Modifier les Couleurs :**
```plantuml
skinparam node {
    BackgroundColor YourColor
    BorderColor YourBorderColor
}
```

### **Ajouter des Composants :**
```plantuml
node "Nouveau Serveur" as NewServer {
    component "Nouveau Service" as NewService
}
```

### **Modifier les Connexions :**
```plantuml
NewServer ||--|| ExistingServer : "Protocol\nDescription"
```

## 📈 Évolutions Futures

### **Microservices Architecture :**
- Séparer les services en conteneurs
- Ajouter orchestration (Kubernetes)
- Service mesh (Istio)

### **Cloud Native :**
- Migration vers cloud public
- Serverless functions
- Managed databases

### **DevOps Integration :**
- CI/CD pipelines
- Infrastructure as Code
- Automated deployments

## 🔐 Considérations de Sécurité

### **Réseau :**
- Firewall rules
- VPN access
- Network segmentation

### **Application :**
- HTTPS everywhere
- JWT token security
- Input validation

### **Données :**
- Encryption at rest
- Backup encryption
- Access control

## 📞 Support

Pour toute question concernant les diagrammes de déploiement :
1. Vérifier la syntaxe PlantUML
2. Consulter la documentation officielle
3. Tester avec des outils en ligne
4. Adapter selon vos besoins spécifiques

Ces diagrammes représentent l'architecture actuelle et peuvent être adaptés selon l'évolution du projet Tunisair Partner Hub.
