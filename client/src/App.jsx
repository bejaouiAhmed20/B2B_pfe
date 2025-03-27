import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DashboardHome from './pages/Admin/DashboardHome';
import Flights from './pages/Admin/Flights';
import Locations from './pages/Admin/Locations';
import Airports from './pages/Admin/Airports';
import News from './pages/Admin/News';
import AddNews from './pages/Admin/AddNews';
import Coupons from './pages/Admin/Coupons';
import AddCoupon from './pages/Admin/AddCoupon';
import Popups from './pages/Admin/Popups';
import Login from './pages/Auth/login';
import AddClient from './pages/Admin/AddClient';
import Clients from './pages/Admin/clients';
import AddLocation from './pages/Admin/AddLocation';
import AddAirport from './pages/Admin/AddAirport';
import DashboardLayout from './pages/Admin/dashboard';
import AddFlight from './pages/Admin/AddFlight';
import Reservations from './pages/Admin/Reservations';
import AddReservation from './pages/Admin/AddReservation';
import RequestSoldeManagement from './pages/Admin/RequestSoldeManagement';
import LoginClient from './pages/Auth/LoginClient';
import FlightDescription from './pages/Client/FlightDescription';
import Profile from './pages/Client/Profile';
import RequestSolde from './pages/Client/RequestSolde';
import Home from './pages/client/Home';
// Import the client Reservations component with an alias to avoid naming conflict
import ReservationsClient from './pages/client/Reservations';

// Add these imports at the top of your file
import Contracts from './pages/Admin/Contracts';
import AddContract from './pages/Admin/AddContract';
import ClientLayout from './pages/client/ClientLayout';
import Flight from './pages/client/Flight';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-client" element={<LoginClient />} />
        
        {/* Client Routes */}
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<Home />} />
          <Route path="flights" element={<Flight />} />
          <Route path="flights/:id" element={<FlightDescription />} />
          <Route path='profile' element={<Profile />} />
          <Route path='reservations' element={<ReservationsClient />} />
          <Route path='request-solde' element={<RequestSolde />} />
          <Route path="reclamations" element={<Reclamation />} />
        </Route>
        
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="/admin/clients" element={<Clients />} />
          <Route path="/admin/clients/add" element={<AddClient />} />
          <Route path="/admin/flights" element={<Flights />} />
          <Route path="/admin/flights/add" element={<AddFlight />} />   
          <Route path="locations" element={<Locations />} />
          <Route path="locations/add" element={<AddLocation />} />
          <Route path="airports" element={<Airports />} />
          <Route path="airports/add" element={<AddAirport />} />
          <Route path="/admin/news" element={<News />} />
          <Route path="/admin/news/add" element={<AddNews />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="coupons/add" element={<AddCoupon />} />
          <Route path="popups" element={<Popups />} />
          <Route path="/admin/reservations" element={<Reservations />} />
          <Route path="/admin/reservations/add" element={<AddReservation />} />
          <Route path="request-solde" element={<RequestSoldeManagement />} />
          // Inside your admin routes section:
          // Fix the route paths in app.jsx - remove the unnecessary slashes
          <Route path="/admin/contracts" element={<Contracts />} />
          <Route path="/admin/add-contract" element={<AddContract />} />
          <Route path="reclamations" element={<AdminReclamations />} />
        </Route>
        // Add these routes to your existing routes
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;