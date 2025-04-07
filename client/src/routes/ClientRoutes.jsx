import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClientLayout from '../layouts/ClientLayout';
import ClientDashboard from '../pages/Client/Dashboard';
import ClientProfile from '../pages/Client/Profile';
import ClientReclamations from '../pages/Client/Reclamations';
// Import other client pages as needed

const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<ClientDashboard />} />
        <Route path="profile" element={<ClientProfile />} />
        <Route path="reclamations" element={<ClientReclamations />} />
        {/* Add other client routes as needed */}
      </Route>
    </Routes>
  );
};

export default ClientRoutes;