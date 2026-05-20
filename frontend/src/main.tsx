import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import SignInPage from '@/pages/SignInPage';
import ChatsPage from '@/pages/ChatsPage';

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <SignInPage />,
  },
  {
    path: '/chats',
    element: <ChatsPage />,
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
