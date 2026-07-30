import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-sm font-bold text-teal-700 dark:text-teal-300">404</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-950 dark:text-white">Page not found</h1>
        <Link className="btn-primary mt-6" to="/">Go home</Link>
      </div>
    </div>
  );
}
