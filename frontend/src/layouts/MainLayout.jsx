import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  X, Sparkles, AlertCircle, Check, Copy, LogOut, 
  Search, Plus
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Shorten Modal state
  const [showModal, setShowModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successCode, setSuccessCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [newUrlTrigger, setNewUrlTrigger] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessCode('');
    setCopied(false);

    if (!originalUrl) {
      setError('Please enter a destination URL.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/shorten', { originalUrl, customAlias: customAlias || undefined });
      setSuccessCode(response.data.code);
      setOriginalUrl('');
      setCustomAlias('');
      // Trigger update on lists
      setNewUrlTrigger(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL.');
    } finally {
      setLoading(false);
    }
  };

  const copyShortUrl = () => {
    if (!successCode) return;
    const shortUrl = `http://localhost:5001/${successCode}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-background text-on-background font-body-md flex flex-col relative overflow-x-hidden">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-background border-b border-outline-variant">
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <NavLink to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-primary">link</span>
            <span className="text-headline-md font-headline-md font-bold text-primary">Short.ly</span>
          </NavLink>
          
          <nav className="hidden md:flex gap-gutter items-center">
            <NavLink 
              to="/" 
              className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md"
            >
              Home
            </NavLink>

            <NavLink 
              to="/dashboard" 
              end
              className={({ isActive }) =>
                `py-1 font-label-md text-label-md transition-all ${
                  isActive && location.pathname === '/dashboard'
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              Dash
            </NavLink>
            
            {isAdmin && (
              <NavLink 
                to="/dashboard/admin" 
                className={({ isActive }) =>
                  `py-1 font-label-md text-label-md transition-all ${
                    isActive
                      ? 'text-primary font-bold border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  }`
                }
              >
                Admin Panel
              </NavLink>
            )}
            
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#">Product</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary">search</button>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(prev => !prev)}
                className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container flex items-center justify-center hover:border-primary/50 transition cursor-pointer"
                title="User Account"
              >
                <img 
                  className="w-full h-full object-cover" 
                  alt="Profile" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUzYn6vHORZ4W7Mcj9kKQ249RKhx0bCIcAR6R-Hkh6D2Xg4KihtFqRt-TV_U33YpblBhoyThGwvtAd9xJKgm3UKNMqx7ngc6jL6rhhEssPM9Em-RS_V3_0HkgqbpV25oa0Pmf7AxYJ0lJWXGTeEg0jIccqifG3LbsPIezo9097FIZVGamodGcKmTW1ezxGX21afFqX1hIdHxfugnUsTBpH1SD3OCsRFz4wdkVe6xN3cFC1f6Z-VB8x"
                />
              </button>
              
              {showProfileDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setShowProfileDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-surface-container border border-outline-variant rounded-lg p-2 shadow-2xl z-50 animate-scaleIn">
                    <div className="px-3 py-2 border-b border-outline-variant/30 mb-1.5 text-left">
                      <p className="text-xs font-bold text-gray-200 truncate">{user?.username || 'User'}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user?.email || ''}</p>
                    </div>
                    <Link 
                      to="/" 
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded text-xs text-on-surface-variant hover:bg-white/5 hover:text-white transition"
                    >
                      <span className="material-symbols-outlined text-[16px]">home</span>
                      <span>Return to Home</span>
                    </Link>
                    <button 
                      onClick={() => { setShowProfileDropdown(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-red-400 hover:bg-red-500/10 transition text-left"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="mt-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-lg flex-grow flex flex-col justify-between w-full">
        <div className="flex-grow w-full">
          <Outlet context={{ newUrlTrigger }} />
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-high flex justify-around items-center py-2 px-margin-mobile border-t border-outline-variant shadow-lg z-50 rounded-t-xl">
        <NavLink 
          to="/dashboard" 
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center p-2 rounded-lg transition-transform ${
              isActive && location.pathname === '/dashboard'
                ? 'text-secondary font-bold scale-105'
                : 'text-on-surface-variant hover:bg-surface-variant/50'
            }`
          }
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-label-sm font-label-sm">Dash</span>
        </NavLink>

        {isAdmin && (
          <NavLink 
            to="/dashboard/admin" 
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-lg transition-transform ${
                isActive
                  ? 'text-primary font-bold scale-105'
                  : 'text-on-surface-variant hover:bg-surface-variant/50'
              }`
            }
          >
            <span className="material-symbols-outlined">shield_person</span>
            <span className="text-label-sm font-label-sm">Admin</span>
          </NavLink>
        )}

        <button 
          onClick={handleLogout}
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 p-2 rounded-lg transition"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-sm font-label-sm">Logout</span>
        </button>
      </nav>

      {/* Floating Action Button */}
      <button 
        onClick={() => { setShowModal(true); setError(''); setSuccessCode(''); }}
        className="fixed bottom-24 right-margin-mobile md:bottom-12 md:right-margin-desktop bg-primary text-on-primary w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
        <span className="absolute right-full mr-4 px-3 py-1 bg-surface-container-high border border-outline-variant rounded-md text-label-md font-label-md text-on-surface opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          New Link
        </span>
      </button>

      {/* Shorten Modal dialog overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#060912]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-xl border border-white/10 relative space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-100 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Shorten New Destination URL</span>
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successCode ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-1.5 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>URL shortened successfully!</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Shortened Link</label>
                  <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant p-3.5 rounded-lg">
                    <span className="text-primary font-bold text-sm flex-grow truncate">{`http://localhost:5001/${successCode}`}</span>
                    <button
                      onClick={copyShortUrl}
                      className="p-2 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition flex-shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleShorten} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="modal-url">Work Destination URL</label>
                  <input
                    id="modal-url"
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://github.com/shorten-io/api-docs"
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm input-focus-ring outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="modal-alias">Custom Alias (optional)</label>
                  <input
                    id="modal-alias"
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="dev-auth"
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm input-focus-ring outline-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-1.5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:brightness-110 active:scale-95 transition-all"
                  >
                    {loading ? 'Creating...' : 'Shorten'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default MainLayout;
