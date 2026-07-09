import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === 'true';

  const validateEmail = (val) => {
    if (!val) {
      setEmailError('Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('Invalid email format. Please check and try again.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) {
      validateEmail(val);
    }
  };

  const handleEmailBlur = () => {
    if (email) {
      validateEmail(email);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      return;
    }

    if (!password) {
      setAuthError('Password is required.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setAuthError(result.error);
    }
  };

  return (
    <div className="glass-panel p-stack-lg rounded-xl shadow-xl flex flex-col gap-stack-md relative overflow-hidden">
      {/* Decorative Glow Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-80"></div>

      <div className="mb-stack-sm">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Welcome Back</h1>
        <p className="text-body-md font-body-md text-on-surface-variant">Enter your credentials to access your dashboard.</p>
      </div>

      {sessionExpired && (
        <div className="flex items-center gap-1.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          <span>Your session has expired. Please log in again.</span>
        </div>
      )}

      {authError && (
        <div className="flex items-center gap-1.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
        
        {/* Email Field */}
        <div className="flex flex-col gap-unit">
          <label className="text-label-sm font-label-sm text-on-surface-variant" htmlFor="email">Email Address</label>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] transition-colors group-focus-within:text-primary">
              mail
            </span>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="developer@short.ly"
              className={`w-full h-12 bg-surface-container-lowest rounded-lg pl-10 pr-4 text-on-surface text-body-md font-body-md input-focus-ring outline-none transition-all border ${
                emailError ? 'border-error' : 'border-outline-variant'
              }`}
              required
            />
          </div>
          {/* Validation UI: Error State */}
          {emailError && (
            <div className="flex items-center gap-1 mt-1 text-error animate-in fade-in duration-300">
              <span className="material-symbols-outlined text-[14px]">error</span>
              <span className="text-label-sm font-label-sm">{emailError}</span>
            </div>
          )}
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-unit">
          <div className="flex justify-between items-center">
            <label className="text-label-sm font-label-sm text-on-surface-variant" htmlFor="password">Password</label>
            <button className="text-label-sm font-label-sm text-primary hover:underline transition-all" type="button">
              Forgot Password
            </button>
          </div>
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] transition-colors group-focus-within:text-primary">
              lock
            </span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-12 text-on-surface text-body-md font-body-md input-focus-ring outline-none transition-all"
              required
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors" 
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-stack-sm mt-stack-sm">
          <button 
            type="submit"
            disabled={loading}
            className="primary-button-gradient h-12 rounded-lg text-on-primary font-bold text-body-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Login</span>
                <span className="material-symbols-outlined text-[20px]">login</span>
              </>
            )}
          </button>
          
          <div className="relative flex items-center py-stack-sm">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink mx-4 text-label-sm font-label-sm text-on-surface-variant">OR</span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>
          
          <button 
            type="button"
            onClick={() => navigate('/register')}
            className="h-12 border border-outline-variant rounded-lg text-on-surface font-semibold text-body-md flex items-center justify-center gap-2 hover:bg-surface-variant/30 active:scale-95 transition-all"
          >
            <span>Register</span>
            <span className="material-symbols-outlined text-[20px]">person_add</span>
          </button>
        </div>

      </form>

      <div className="mt-stack-sm flex items-center justify-center">
        <p className="text-label-sm font-label-sm text-on-surface-variant text-center">
          By logging in, you agree to our{' '}
          <a className="text-primary hover:underline font-semibold" href="#">Terms of Service</a>.
        </p>
      </div>

    </div>
  );
};

export default Login;
