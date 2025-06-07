import dotenv from 'dotenv';
import { 
  sendWelcomeEmail, 
  sendReservationConfirmationEmail, 
  sendSoldeRequestResponseEmail,
  testEmailConfiguration 
} from './services/emailService';

// Load environment variables
dotenv.config();

async function testEmailFunctionality() {
  console.log('🧪 Test de la fonctionnalité email...\n');

  // Test 1: Configuration email
  console.log('1️⃣ Test de la configuration email...');
  const configTest = await testEmailConfiguration();
  if (configTest) {
    console.log('✅ Configuration email validée\n');
  } else {
    console.log('❌ Erreur de configuration email\n');
    return;
  }

  // Test 2: Email de bienvenue
  console.log('2️⃣ Test de l\'email de bienvenue...');
  const welcomeEmailData = {
    userEmail: 'test@example.com', // Remplacez par votre email pour tester
    userName: 'Test User',
    userFirstName: 'Test',
    password: 'motdepasse123',
    loginUrl: 'http://localhost:3000/login'
  };

  const welcomeTest = await sendWelcomeEmail(welcomeEmailData);
  if (welcomeTest) {
    console.log('✅ Email de bienvenue envoyé avec succès\n');
  } else {
    console.log('❌ Échec de l\'envoi de l\'email de bienvenue\n');
  }

  // Test 3: Email de confirmation de réservation
  console.log('3️⃣ Test de l\'email de confirmation de réservation...');
  const reservationEmailData = {
    userEmail: 'test@example.com', // Remplacez par votre email pour tester
    userName: 'Test User',
    flightTitle: 'Vol Tunis - Paris',
    departureAirport: 'Tunis-Carthage',
    arrivalAirport: 'Charles de Gaulle',
    departureDate: '25/12/2024',
    returnDate: '02/01/2025',
    passengers: 2,
    classType: 'business',
    totalPrice: 1200,
    reservationId: 'RES-TEST-001',
    status: 'confirmée'
  };

  const reservationTest = await sendReservationConfirmationEmail(reservationEmailData);
  if (reservationTest) {
    console.log('✅ Email de confirmation de réservation envoyé avec succès\n');
  } else {
    console.log('❌ Échec de l\'envoi de l\'email de confirmation de réservation\n');
  }

  // Test 4: Email d'approbation de demande de solde
  console.log('4️⃣ Test de l\'email d\'approbation de demande de solde...');
  const approvalEmailData = {
    userEmail: 'test@example.com', // Remplacez par votre email pour tester
    userName: 'Test User',
    requestedAmount: 500,
    status: 'approved' as const,
    adminComment: 'Demande approuvée après vérification des documents.',
    newBalance: 1500
  };

  const approvalTest = await sendSoldeRequestResponseEmail(approvalEmailData);
  if (approvalTest) {
    console.log('✅ Email d\'approbation de demande de solde envoyé avec succès\n');
  } else {
    console.log('❌ Échec de l\'envoi de l\'email d\'approbation de demande de solde\n');
  }

  // Test 5: Email de rejet de demande de solde
  console.log('5️⃣ Test de l\'email de rejet de demande de solde...');
  const rejectionEmailData = {
    userEmail: 'test@example.com', // Remplacez par votre email pour tester
    userName: 'Test User',
    requestedAmount: 1000,
    status: 'rejected' as const,
    adminComment: 'Documents insuffisants. Veuillez fournir une preuve de paiement.'
  };

  const rejectionTest = await sendSoldeRequestResponseEmail(rejectionEmailData);
  if (rejectionTest) {
    console.log('✅ Email de rejet de demande de solde envoyé avec succès\n');
  } else {
    console.log('❌ Échec de l\'envoi de l\'email de rejet de demande de solde\n');
  }

  console.log('🎉 Tests terminés !');
}

// Exécuter les tests
if (require.main === module) {
  testEmailFunctionality().catch(console.error);
}

export { testEmailFunctionality };
