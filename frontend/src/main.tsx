import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RecoveryWallet from './RecoveryWallet';
import CreateAccount from './CreateAccount'; // Import AccountPage component
import AccountPage from './AccountPage'; // Import AccountPage component
import './index.css';
import HomePage from './HomePage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/setup', element: <RecoveryWallet /> },
  { path: '/account', element: <AccountPage /> },
  { path: '/create', element: <CreateAccount /> } // Add new route for AccountPage
]);

const rootElement = document.getElementById('root');

if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
