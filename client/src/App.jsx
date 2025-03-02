import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './pages/Auth/Login';
import DashboardLayout from './pages/Admin/Dashboard';
import DashboardHome from './pages/Admin/DashboardHome';
import Clients from './pages/Admin/Clients';
import Flights from './pages/Admin/Flights';
import Locations from './pages/Admin/Locations';
import Airports from './pages/Admin/Airports';
import News from './pages/Admin/News';
import Coupons from './pages/Admin/Coupons';
import Popups from './pages/Admin/Popups';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="clients" element={<Clients />} />
          <Route path="flights" element={<Flights />} />
          <Route path="locations" element={<Locations />} />
          <Route path="airports" element={<Airports />} />
          <Route path="news" element={<News />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="popups" element={<Popups />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App