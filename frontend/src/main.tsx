import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RecoveryWallet from './RecoveryWallet';
import './index.css';

const router = createBrowserRouter([{ path: '/', Component: RecoveryWallet }]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
