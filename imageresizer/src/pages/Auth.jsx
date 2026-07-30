import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Chrome, ImagePlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth({ mode }) {
  const isSignup = mode === 'signup';
  const { login, signup, loginWithGoogle, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  const submit = async (values) => {
    setLoading(true);
    try {
      await (isSignup ? signup(values) : login(values));
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    const email = getValues('email');
    if (!email) return toast.error('Enter your email first.');
    await forgotPassword(email);
  };

  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-white/60 bg-white/75 shadow-glow backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 lg:grid-cols-[.9fr_1.1fr]">
      <div className="hidden bg-slate-950 p-8 text-white lg:block">
        <ImagePlus size={34} />
        <h1 className="mt-8 text-3xl font-extrabold">{isSignup ? 'Create your resizing workspace' : 'Welcome back'}</h1>
        <p className="mt-4 leading-7 text-slate-300">Secure uploads, persistent history, conversion tools, and storage analytics in one responsive app.</p>
      </div>
      <div className="p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">{isSignup ? 'Sign up' : 'Log in'}</h2>
        <form className="mt-6 grid gap-4" onSubmit={handleSubmit(submit)}>
          {isSignup && (
            <div>
              <label className="label">Name</label>
              <input className="input" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name.message}</p>}
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="mt-1 text-sm text-rose-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" {...register('password', { required: 'Password is required', minLength: 6 })} />
            {errors.password && <p className="mt-1 text-sm text-rose-500">Password must be at least 6 characters.</p>}
          </div>
          <button className="btn-primary" disabled={loading}>{loading ? 'Working...' : isSignup ? 'Create account' : 'Log in'}</button>
        </form>
        {!isSignup && (
          <button className="mt-3 text-sm font-semibold text-teal-700 dark:text-teal-300" onClick={reset}>Forgot password?</button>
        )}
        <button className="btn-secondary mt-5 w-full" onClick={loginWithGoogle}>
          <Chrome size={18} /> Continue with Google
        </button>
        <p className="mt-5 text-sm text-slate-500 dark:text-slate-300">
          {isSignup ? 'Already have an account?' : 'New here?'}{' '}
          <Link className="font-bold text-slate-950 dark:text-white" to={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Log in' : 'Create one'}
          </Link>
        </p>
      </div>
    </div>
  );
}
