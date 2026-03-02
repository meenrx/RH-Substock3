import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Inventory from './pages/Inventory';
import Formulary from './pages/Formulary';
import Import from './pages/Import';
import Audit from './pages/Audit';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="import" element={<Import />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="formulary" element={<Formulary />} />
        <Route path="audit" element={<Audit />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
