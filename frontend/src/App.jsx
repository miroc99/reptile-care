import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const TankDetail = lazy(() => import('./pages/TankDetail'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Settings = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-3)' }}>
      載入中…
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tank/:tankId" element={<TankDetail />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="settings" element={<Settings />} />

            {/* Legacy redirects */}
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="tanks" element={<Navigate to="/" replace />} />
            <Route path="control" element={<Navigate to="/" replace />} />
            <Route path="dev" element={<Navigate to="/settings" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
