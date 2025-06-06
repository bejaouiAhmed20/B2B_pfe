import React from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements
} from 'react-router-dom';
import ErrorPage from './pages/ErrorPage';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';
import { PopupProvider } from './contexts/PopupContext';
import PopupManager from './components/PopupManager';
import DashboardHome from './pages/Admin/DashboardHome';
import Flights from './pages/Admin/Flights';
import Locations from './pages/Admin/Locations';
import Airports from './pages/Admin/Airports';
import News from './pages/Admin/News';
import AddNews from './pages/Admin/AddNews';
import Coupons from './pages/Admin/Coupons';
import AddCoupon from './pages/Admin/AddCoupon';
import Popups from './pages/Admin/Popups';
import AddPopup from './pages/Admin/AddPopup';
import AddClient from './pages/Admin/AddClient';
import Clients from './pages/Admin/clients';
import AddLocation from './pages/Admin/AddLocation';
import AddAirport from './pages/Admin/AddAirport';
import DashboardLayout from './pages/Admin/Dashboard';
import AddFlight from './pages/Admin/AddFlight';
import AdminReservations from './pages/Admin/Reservations';
import AddReservation from './pages/Admin/AddReservation';
import RequestSoldeManagement from './pages/Admin/RequestSoldeManagement';
import LoginClient from './pages/Auth/LoginClient';
import Profile from './pages/Client/Profile';
import RequestSolde from './pages/Client/RequestSolde';
import Home from './pages/client/Home';
// Import the client Reservations component with an alias to avoid naming conflict
import ClientReservations from './pages/Client/Reservations';
import AdminReclamations from './pages/Admin/Reclamations';
import Planes from './pages/Admin/Planes';
import AddPlane from './pages/Admin/AddPlane';
import Seats from './pages/Admin/Seats';
import AddSeat from './pages/Admin/AddSeat';
import Flight from './pages/Client/Flight';
import Reclamation from './pages/Client/Reclamation';
import Contracts from './pages/Admin/Contracts';
import AddContract from './pages/Admin/AddContract';
import ClientContract from './pages/Client/Contract';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
// Import the ReservationsTable component
import ReservationsTable from './pages/Client/ReservationsTable';
// Import the News components for client side
import ClientNews from './pages/Client/News';
import NewsDetail from './pages/Client/NewsDetail';
import ClientLayout from './pages/Client/ClientLayout';
import FlightDescription from './pages/Client/FlightDescription';
import LocationDetail from './pages/Client/LocationDetail';
import Contact from './pages/Auth/Contact';
import Login from './pages/Auth/Login';

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route errorElement={<ErrorPage />}>
        {/* Redirection intelligente de la page d'accueil */}
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-client" element={<LoginClient />} />

        {/* Client Routes - Protected */}
        <Route
          path="/client"
          element={
            <ProtectedRoute>
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="flights" element={<Flight />} />
          <Route path="flights/:id" element={<FlightDescription />} />
          <Route path='profile' element={<Profile />} />
          <Route path='reservations' element={<ClientReservations />} />
          <Route path='request-solde' element={<RequestSolde />} />
          <Route path="reclamations" element={<Reclamation />} />
          <Route path="reservations-table" element={<ReservationsTable />} />
          <Route path="contract" element={<ClientContract />} />
          {/* News routes */}
          <Route path="news" element={<ClientNews />} />
          <Route path="news/:id" element={<NewsDetail />} />
          {/* Locations routes */}
          <Route path="locations/:id" element={<LocationDetail />} />
        </Route>

        {/* Admin Routes - Protected with admin requirement */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/add" element={<AddClient />} />
          <Route path="flights" element={<Flights />} />
          <Route path="flights/add" element={<AddFlight />} />
          <Route path="locations" element={<Locations />} />
          <Route path="locations/add" element={<AddLocation />} />
          <Route path="airports" element={<Airports />} />
          <Route path="airports/add" element={<AddAirport />} />
          <Route path="news" element={<News />} />
          <Route path="news/add" element={<AddNews />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="coupons/add" element={<AddCoupon />} />
          <Route path="popups" element={<Popups />} />
          <Route path="popups/add" element={<AddPopup />} />
          <Route path="popups/edit/:id" element={<AddPopup />} />
          <Route path="reservations" element={<AdminReservations />} />
          <Route path="reservations/add" element={<AddReservation />} />
          <Route path="request-solde" element={<RequestSoldeManagement />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="contracts/add" element={<AddContract />} />
          <Route path="reclamations" element={<AdminReclamations />} />
          {/* Add routes for Planes and Seats */}
          <Route path="planes" element={<Planes />} />
          <Route path="planes/add" element={<AddPlane />} />
          <Route path="seats" element={<Seats />} />
          <Route path="seats/add" element={<AddSeat />} />
        </Route>

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
    )
  );

  return (
    <PopupProvider>
      <RouterProvider router={router} />
      <PopupManager />
    </PopupProvider>
  );
}

export default App;