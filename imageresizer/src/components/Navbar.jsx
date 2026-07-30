import { Link, NavLink } from 'react-router-dom';
import { ImagePlus, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/resize', label: 'Resize Tool' },
  { to: '/history', label: 'History' },
  { to: '/profile', label: 'Profile' }
];

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const navLinks = isAdmin ? [...links, { to: '/admin', label: 'Admin' }] : links;

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-base font-extrabold text-slate-950 dark:text-white">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
            <ImagePlus size={20} />
          </span>
          Smart Image Resizer
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {user &&
            navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-secondary !px-3" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <button className="btn-secondary hidden sm:inline-flex" onClick={logout}>
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <Link className="btn-primary hidden sm:inline-flex" to="/login">
              Login
            </Link>
          )}
          <button className="btn-secondary !px-3 md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-950 md:hidden">
          <div className="grid gap-2">
            {(user ? navLinks : [{ to: '/login', label: 'Login' }, { to: '/signup', label: 'Signup' }]).map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">
                {link.label}
              </NavLink>
            ))}
            {user && (
              <button className="btn-secondary justify-start" onClick={logout}>
                <LogOut size={18} /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
