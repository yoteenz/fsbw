import { Navigate, Route, Routes } from 'react-router-dom';
import VirtualProductionDebugHomePage from './page';
import VirtualProductionDebugBoardPage from './board-page';

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: '2rem', background: '#0a0a0c', color: '#f2f0eb', minHeight: '100vh' }}>
      <p style={{ color: '#c9a962', fontSize: '0.7rem', letterSpacing: '0.12em' }}>VIRTUAL PRODUCTION OS · DEBUG</p>
      <h1>{title}</h1>
      <p style={{ color: '#8a8798' }}>Architecture foundation — data model and routes registered.</p>
      <a href="/__virtual-production" style={{ color: '#c9a962' }}>← Debug home</a>
    </div>
  );
}

export default function VirtualProductionDebugRoutes() {
  return (
    <Routes>
      <Route index element={<VirtualProductionDebugHomePage />} />
      <Route path="brand-canon" element={<Placeholder title="Brand Canon" />} />
      <Route path="character-canon" element={<Placeholder title="Character Canon" />} />
      <Route path="campaign" element={<VirtualProductionDebugBoardPage />} />
      <Route path="storyboard" element={<Placeholder title="Storyboard" />} />
      <Route path="shot-board" element={<VirtualProductionDebugBoardPage />} />
      <Route path="shot-detail" element={<Placeholder title="Shot Detail" />} />
      <Route path="production" element={<VirtualProductionDebugBoardPage />} />
      <Route path="qc" element={<VirtualProductionDebugBoardPage />} />
      <Route path="repair" element={<Placeholder title="Repair Workflow" />} />
      <Route path="assembly" element={<Placeholder title="Assembly Foundation" />} />
      <Route path="*" element={<Navigate to="/__virtual-production" replace />} />
    </Routes>
  );
}
