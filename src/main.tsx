import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import AppShell from './AppShell.tsx';
import './index.css';
import './ux-simplified.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
