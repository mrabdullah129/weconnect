import { supabaseAdmin } from '../config/supabase.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  created_at: user.created_at
});

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new AppError('Name, email, and password are required.', 400);

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    // Keep email/password signups immediately usable for the app's custom auth flow.
    email_confirm: true,
    user_metadata: { name }
  });
  if (error) throw new AppError(error.message, 400);

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .upsert({ id: data.user.id, name, email, role: 'user' })
    .select('*')
    .single();
  if (profileError) throw new AppError(profileError.message, 500);

  res.status(201).json({ user: publicUser(profile), token: signToken({ sub: profile.id, role: profile.role }) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError('Email and password are required.', 400);

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
  if (error) {
    const message = error.message || '';

    if (/email not confirmed/i.test(message)) {
      const listRes = await supabaseAdmin.auth.admin.listUsers();
      const users = listRes?.data?.users || listRes?.users || [];
      const found = users.find((u) => u.email === email);

      if (found) {
        const provider = found.identities && found.identities[0] && found.identities[0].provider;
        if (!provider || provider === 'email') {
          const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(found.id, {
            email_confirm: true
          });

          if (!confirmError) {
            const retry = await supabaseAdmin.auth.signInWithPassword({ email, password });
            if (!retry.error && retry.data?.user) {
              const { data: profile } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', retry.data.user.id)
                .single();

              const user = profile || {
                id: retry.data.user.id,
                name: retry.data.user.user_metadata?.name || retry.data.user.email?.split('@')[0],
                email: retry.data.user.email,
                role: 'user'
              };

              if (!profile) {
                await supabaseAdmin.from('users').insert(user);
              }

              return res.json({ user: publicUser(user), token: signToken({ sub: user.id, role: user.role }) });
            }
          }
        }

        if (provider && provider !== 'email') {
          throw new AppError('Account was created with an OAuth provider. Use social login or reset your password.', 401);
        }
      }

      throw new AppError('Email is not confirmed yet. Please check your inbox or use Forgot password.', 401);
    }

    // Try to detect if the user exists and was created via an OAuth provider.
    try {
      const listRes = await supabaseAdmin.auth.admin.listUsers();
      const users = listRes?.data?.users || listRes?.users || [];
      const found = users.find((u) => u.email === email);
      if (found) {
        const provider = found.identities && found.identities[0] && found.identities[0].provider;
        if (provider && provider !== 'email') {
          throw new AppError('Account was created with an OAuth provider. Use social login or reset your password.', 401);
        }
      }
    } catch (e) {
      // ignore detection errors and fall through to generic message
    }

    if (/invalid login credentials/i.test(message) || /invalid email or password/i.test(message)) {
      throw new AppError('Invalid email or password.', 401);
    }

    throw new AppError(message || 'Authentication failed.', 401);
  }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const user = profile || {
    id: data.user.id,
    name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
    email: data.user.email,
    role: 'user'
  };

  if (!profile) {
    await supabaseAdmin.from('users').insert(user);
  }

  res.json({ user: publicUser(user), token: signToken({ sub: user.id, role: user.role }) });
});

export const exchangeSupabaseSession = asyncHandler(async (req, res) => {
  const { access_token: accessToken } = req.body;
  if (!accessToken) throw new AppError('Supabase access token is required.', 400);

  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) throw new AppError('Invalid Supabase session.', 401);

  const profile = {
    id: data.user.id,
    name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
    email: data.user.email,
    role: 'user'
  };

  const { data: user, error: profileError } = await supabaseAdmin
    .from('users')
    .upsert(profile, { onConflict: 'id' })
    .select('*')
    .single();
  if (profileError) throw new AppError(profileError.message, 500);

  res.json({ user: publicUser(user), token: signToken({ sub: user.id, role: user.role }) });
});

export const logout = asyncHandler(async (_req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
