export const welcomeEmailTemplate = (userName: string, userEmail: string, password: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            padding: 30px 0;
            text-align: center;
        }
        .header img {
            width: 200px;
            height: auto;
        }
        .content {
            padding: 30px;
            color: #333;
        }
        h1 {
            color: #CC0A2B;
            margin-top: 0;
            font-size: 24px;
        }
        .credentials {
            background: #FFF5F7;
            padding: 20px;
            border-left: 4px solid #CC0A2B;
            margin: 25px 0;
            border-radius: 4px;
        }
        .button {
            display: inline-block;
            background: #CC0A2B;
            color: white !important;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            margin: 15px 0;
            font-weight: bold;
            transition: background 0.3s;
        }
        .button:hover {
            background: #B00824;
        }
        .footer {
            background: #CC0A2B;
            padding: 20px;
            text-align: center;
            color: white;
            font-size: 12px;
        }
        strong {
            color: #CC0A2B;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://th.bing.com/th/id/R.f8ee0095affe74ac856e5a81ad4d8b21?rik=aKSiO7M2935%2bRA&pid=ImgRaw&r=0" alt="Logo Tunisair">
        </div>
        
        <div class="content">
            <h1>Bienvenue à bord, ${userName} ! ✈️</h1>
            
            <p>Nous sommes honorés de vous accueillir au sein de la famille Tunisair Business Solutions.</p>
            
            <div class="credentials">
                <h3 style="margin-top:0;">Vos identifiants d'accès :</h3>
                <p><strong>Adresse e-mail :</strong> ${userEmail}</p>
                <p><strong>Mot de passe temporaire :</strong> ${password}</p>
            </div>

            <p>Pour votre sécurité, nous vous recommandons de :</p>
            <ul>
                <li>Changer votre mot de passe dès votre première connexion</li>
                <li>Activer la vérification en deux étapes</li>
                <li>Ne jamais partager vos identifiants</li>
            </ul>

            <a href="http://localhost:3000/login" class="button">Accéder à mon espace professionnel</a>

            <p>En cas de question, notre équipe support est disponible 24h/24 :<br>
            <strong>✉️ support@tunisair.com.tn</strong><br>
            <strong>📞 (+216) 70 10 10 10</strong></p>

            <p>À très vite dans les airs,</p>
            <p><strong>L'équipe Tunisair Business Solutions</strong></p>
        </div>

        <div class="footer">
            <p>© 2024 Tunisair - Tous droits réservés</p>
            <p>Cet e-mail est envoyé automatiquement, merci de ne pas y répondre</p>
        </div>
    </div>
</body>
</html>
`;