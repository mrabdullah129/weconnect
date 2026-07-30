import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Auth from '../pages/Auth';
import Dashboard from '../pages/Dashboard';
import ResizeTool from '../pages/ResizeTool';
import History from '../pages/History';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/login', element: <Auth mode="login" /> },
      { path: '/signup', element: <Auth mode="signup" /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <Dashboard /> },
          { path: '/resize', element: <ResizeTool /> },
          { path: '/history', element: <History /> },
          { path: '/profile', element: <Profile /> }
        ]
      },
      {
        element: <ProtectedRoute admin />,
        children: [{ path: '/admin', element: <Admin /> }]
      },
      { path: '*', element: <NotFound /> }
    ]
  }
]);
