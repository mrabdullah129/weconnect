import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Books from './pages/books/Books';
import Categories from './pages/categories/Categories';
import Authors from './pages/authors/Authors';
import Publishers from './pages/publishers/Publishers';
import Members from './pages/members/Members';
import Borrow from './pages/borrow/Borrow';
import Returns from './pages/returns/Returns';
import Fines from './pages/fines/Fines';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--surface)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow)',
                borderRadius: '10px',
                fontSize: '14px',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/authors" element={<Authors />} />
                <Route path="/publishers" element={<Publishers />} />
                <Route path="/members" element={<Members />} />
                <Route path="/borrow" element={<Borrow />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/fines" element={<Fines />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
