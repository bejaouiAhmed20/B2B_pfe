import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Interface pour les données de réservation
interface ReservationEmailData {
  userEmail: string;
  userName: string;
  flightTitle: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  classType: string;
  totalPrice: number;
  reservationId: string;
  status: string;
}

// Interface pour les données de demande de solde
interface SoldeRequestEmailData {
  userEmail: string;
  userName: string;
  requestedAmount: number;
  status: 'approved' | 'rejected';
  adminComment?: string;
  newBalance?: number;
}

// Interface pour les données de nouveau client
interface NewClientEmailData {
  userEmail: string;
  userName: string;
  userFirstName: string;
  password: string;
  loginUrl: string;
}

// Fonction pour envoyer un email de bienvenue à un nouveau client
export const sendWelcomeEmail = async (data: NewClientEmailData): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.userEmail,
      subject: '🎉 Bienvenue sur Tunisair Partner Hub - Vos identifiants de connexion',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #CC0A2B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #CC0A2B; }
            .button { display: inline-block; background: #CC0A2B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue chez Tunisair Partner Hub</h1>
              <p>Votre plateforme B2B pour les réservations de vols</p>
            </div>
            <div class="content">
              <h2>Bonjour ${data.userFirstName} ${data.userName},</h2>

              <p>Félicitations ! Votre compte Tunisair Partner Hub a été créé avec succès. Vous pouvez maintenant accéder à notre plateforme de réservation B2B.</p>

              <div class="credentials">
                <h3>🔐 Vos identifiants de connexion :</h3>
                <p><strong>Email :</strong> ${data.userEmail}</p>
                <p><strong>Mot de passe :</strong> ${data.password}</p>
              </div>

              <p><strong>⚠️ Important :</strong> Pour votre sécurité, nous vous recommandons de changer votre mot de passe lors de votre première connexion.</p>

              <div style="text-align: center;">
                <a href="${data.loginUrl}" class="button">Se connecter maintenant</a>
              </div>

              <h3>🚀 Que pouvez-vous faire avec votre compte ?</h3>
              <ul>
                <li>Réserver des vols Tunisair avec des tarifs préférentiels</li>
                <li>Gérer vos réservations en temps réel</li>
                <li>Accéder à votre solde et historique des transactions</li>
                <li>Contacter notre support dédié aux partenaires</li>
                <li>Recevoir les dernières actualités et offres spéciales</li>
              </ul>

              <p>Si vous avez des questions ou besoin d'assistance, notre équipe support est à votre disposition.</p>

              <p>Cordialement,<br>
              <strong>L'équipe Tunisair Partner Hub</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Tunisair Partner Hub. Tous droits réservés.</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de bienvenue envoyé à ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    return false;
  }
};

// Fonction pour envoyer un email de confirmation de réservation
export const sendReservationConfirmationEmail = async (data: ReservationEmailData): Promise<boolean> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.userEmail,
      subject: `✈️ Confirmation de réservation - Vol ${data.flightTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #CC0A2B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .reservation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #CC0A2B; }
            .status { padding: 5px 15px; border-radius: 20px; color: white; font-weight: bold; }
            .status-confirmed { background: #28a745; }
            .status-pending { background: #ffc107; color: #333; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Confirmation de Réservation</h1>
              <p>Tunisair Partner Hub</p>
            </div>
            <div class="content">
              <h2>Bonjour ${data.userName},</h2>

              <p>Votre réservation a été enregistrée avec succès. Voici les détails de votre vol :</p>

              <div class="reservation-details">
                <h3>📋 Détails de la réservation</h3>

                <div class="detail-row">
                  <span class="detail-label">Numéro de réservation :</span>
                  <span><strong>${data.reservationId}</strong></span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Vol :</span>
                  <span>${data.flightTitle}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Itinéraire :</span>
                  <span>${data.departureAirport} → ${data.arrivalAirport}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Date de départ :</span>
                  <span>${data.departureDate}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Date de retour :</span>
                  <span>${data.returnDate}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Nombre de passagers :</span>
                  <span>${data.passengers}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Classe :</span>
                  <span>${data.classType}</span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Prix total :</span>
                  <span><strong>${data.totalPrice} TND</strong></span>
                </div>

                <div class="detail-row">
                  <span class="detail-label">Statut :</span>
                  <span class="status ${data.status === 'confirmed' ? 'status-confirmed' : 'status-pending'}">${data.status === 'confirmed' ? 'Confirmé' : 'En attente'}</span>
                </div>
              </div>

              <h3>📝 Prochaines étapes :</h3>
              <ul>
                <li>Conservez ce numéro de réservation pour vos dossiers</li>
                <li>Vous recevrez une confirmation finale 24h avant le départ</li>
                <li>Vérifiez les documents de voyage requis</li>
                <li>Arrivez à l'aéroport 2h avant le départ pour les vols internationaux</li>
              </ul>

              <p>Pour toute modification ou question concernant votre réservation, contactez notre service client.</p>

              <p>Bon voyage !<br>
              <strong>L'équipe Tunisair Partner Hub</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Tunisair Partner Hub. Tous droits réservés.</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de confirmation de réservation envoyé à ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    return false;
  }
};

// Fonction pour envoyer un email de réponse à une demande de solde
export const sendSoldeRequestResponseEmail = async (data: SoldeRequestEmailData): Promise<boolean> => {
  try {
    const isApproved = data.status === 'approved';
    const subject = isApproved
      ? `✅ Demande de solde approuvée - ${data.requestedAmount} TND`
      : `❌ Demande de solde rejetée - ${data.requestedAmount} TND`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: data.userEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${isApproved ? '#28a745' : '#dc3545'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .status-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${isApproved ? '#28a745' : '#dc3545'}; }
            .amount { font-size: 24px; font-weight: bold; color: ${isApproved ? '#28a745' : '#dc3545'}; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isApproved ? '✅ Demande Approuvée' : '❌ Demande Rejetée'}</h1>
              <p>Réponse à votre demande de solde</p>
            </div>
            <div class="content">
              <h2>Bonjour ${data.userName},</h2>

              <p>Nous avons traité votre demande de solde. Voici la réponse de notre équipe :</p>

              <div class="status-box">
                <h3>📋 Détails de la demande</h3>
                <p><strong>Montant demandé :</strong> <span class="amount">${data.requestedAmount} TND</span></p>
                <p><strong>Statut :</strong> <strong style="color: ${isApproved ? '#28a745' : '#dc3545'};">${isApproved ? 'APPROUVÉE' : 'REJETÉE'}</strong></p>
                ${isApproved && data.newBalance ? `<p><strong>Nouveau solde :</strong> <span class="amount">${data.newBalance} TND</span></p>` : ''}
                ${data.adminComment ? `<p><strong>Commentaire de l'administrateur :</strong><br>${data.adminComment}</p>` : ''}
              </div>

              ${isApproved ? `
                <h3>🎉 Félicitations !</h3>
                <p>Votre demande de solde a été approuvée. Le montant a été ajouté à votre compte et vous pouvez maintenant l'utiliser pour vos réservations.</p>

                <h3>💡 Que faire maintenant ?</h3>
                <ul>
                  <li>Connectez-vous à votre compte pour voir votre nouveau solde</li>
                  <li>Vous pouvez maintenant effectuer des réservations</li>
                  <li>Votre solde sera automatiquement déduit lors des réservations</li>
                </ul>
              ` : `
                <h3>😔 Demande non approuvée</h3>
                <p>Malheureusement, votre demande de solde n'a pas pu être approuvée cette fois-ci.</p>

                <h3>🔄 Prochaines étapes :</h3>
                <ul>
                  <li>Vérifiez les informations fournies dans votre demande</li>
                  <li>Contactez notre service client pour plus d'informations</li>
                  <li>Vous pouvez soumettre une nouvelle demande si nécessaire</li>
                </ul>
              `}

              <p>Pour toute question concernant cette décision, n'hésitez pas à contacter notre service client.</p>

              <p>Cordialement,<br>
              <strong>L'équipe Tunisair Partner Hub</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Tunisair Partner Hub. Tous droits réservés.</p>
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email de réponse de demande de solde envoyé à ${data.userEmail}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de demande de solde:', error);
    return false;
  }
};

// Fonction de test de la configuration email
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log('Configuration email validée avec succès');
    return true;
  } catch (error) {
    console.error('Erreur de configuration email:', error);
    return false;
  }
};
