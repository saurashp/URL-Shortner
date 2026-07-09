import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

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

    if (!username || !email || !password || !confirmPassword) {
      setAuthError('Please fill in all fields.');
      return;
    }

    const isEmailValid = validateEmail(email);
    if (!isEmailValid) return;

    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setAuthError('You must agree to the Terms of Service.');
      return;
    }

    setLoading(true);
    const result = await register(username, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setAuthError(result.error);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Registration Card */}
      <div className="glass-card rounded-xl p-stack-lg shadow-xl">
        <div className="text-center mb-stack-lg">
          <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">Create Account</h1>
          <p className="text-body-md font-body-md text-on-surface-variant">Join thousands of developers shortening links.</p>
        </div>

        {authError && (
          <div className="mb-4 flex items-center gap-1.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            <span className="material-symbols-outlined text-red-400 text-[16px]">error</span>
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-stack-md">
          
          {/* Name Field */}
          <div className="space-y-unit">
            <label className="text-label-md font-label-md text-on-surface-variant block ml-1" htmlFor="name">Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">
                  badge
                </span>
              </div>
              <input
                id="name"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg py-3 pl-10 pr-4 font-body-md input-focus-ring transition-all placeholder:text-outline"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-unit">
            <label className="text-label-md font-label-md text-on-surface-variant block ml-1" htmlFor="email">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">
                  mail
                </span>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="dev@short.ly"
                className={`w-full bg-surface-container-lowest border text-on-surface rounded-lg py-3 pl-10 pr-4 font-body-md input-focus-ring transition-all placeholder:text-outline ${
                  emailError ? 'border-error' : 'border-outline-variant'
                }`}
                required
              />
            </div>
            {emailError && (
              <div className="flex items-center gap-1 mt-1 text-error animate-in fade-in duration-300">
                <span className="material-symbols-outlined text-[14px]">error</span>
                <span className="text-label-sm font-label-sm">{emailError}</span>
              </div>
            )}
          </div>

          {/* Password Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
            
            <div className="space-y-unit">
              <label className="text-label-md font-label-md text-on-surface-variant block ml-1" htmlFor="password">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">
                    lock
                  </span>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg py-3 pl-10 pr-4 font-body-md input-focus-ring transition-all placeholder:text-outline"
                  required
                />
              </div>
            </div>

            <div className="space-y-unit">
              <label className="text-label-md font-label-md text-on-surface-variant block ml-1" htmlFor="confirm-password">Confirm</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors text-[20px]">
                    verified_user
                  </span>
                </div>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg py-3 pl-10 pr-4 font-body-md input-focus-ring transition-all placeholder:text-outline"
                  required
                />
              </div>
            </div>

          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center gap-stack-sm pt-2">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant bg-surface-container-lowest text-primary focus:ring-primary cursor-pointer"
            />
            <label className="text-label-sm font-label-sm text-on-surface-variant cursor-pointer select-none" htmlFor="terms">
              I agree to the <a className="text-primary hover:underline font-semibold" href="#">Terms of Service</a>
            </label>
          </div>

          {/* Primary Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-stack-md bg-gradient-to-b from-primary-container to-primary-container/80 text-on-primary-container font-headline-md py-3 rounded-lg border border-primary/20 shadow-lg hover:shadow-primary/10 active:scale-95 transition-all duration-200 flex items-center justify-center gap-stack-sm disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Create Account</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>

        </form>

        <div className="mt-stack-lg pt-stack-md border-t border-outline-variant/30 text-center">
          <p className="text-body-md font-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline ml-1">Login</Link>
          </p>
        </div>
      </div>

      {/* Trust Badges / Social Proof */}
      <div className="mt-stack-lg flex justify-around items-center opacity-60 flex-wrap gap-y-2">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">security</span>
          <span className="text-label-sm font-label-sm uppercase tracking-wider">Secure SSL</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">database</span>
          <span className="text-label-sm font-label-sm uppercase tracking-wider">Encrypted Data</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">speed</span>
          <span className="text-label-sm font-label-sm uppercase tracking-wider">99.9% Uptime</span>
        </div>
      </div>

    </div>
  );
};

export default Register;
