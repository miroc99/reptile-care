import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TankManagement from './pages/TankManagement';
import TankDetail from './pages/TankDetail';
import Schedule from './pages/Schedule';
import ManualControl from './pages/ManualControl';
import Alerts from './pages/Alerts';
import DevTools from './pages/DevTools';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tanks" element={<TankManagement />} />
          <Route path="/tank/:tankId" element={<TankDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/control" element={<ManualControl />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/dev" element={<DevTools />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
