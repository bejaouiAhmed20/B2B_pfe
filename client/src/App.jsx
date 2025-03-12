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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;