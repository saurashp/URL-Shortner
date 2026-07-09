import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Sparkles, CheckCircle2, AlertCircle, Copy, Check, Terminal, Shield, Bolt,
  ArrowRight
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Shortener form state
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiry, setExpiry] = useState('7d'); // Default to 7d matching backend default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Mouse move shifting effect for background glows
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 10 - 5;
      const y = (e.clientY / window.innerHeight) * 10 - 5;
      setOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    setCopied(false);

    if (!originalUrl) {
      setError('Target URL is required.');
      return;
    }

    if (!isAuthenticated) {
      setError('Please log in or create an account to shorten URLs and track analytics.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/shorten', {
        originalUrl,
        customAlias: customAlias || undefined
      });
      setSuccessData(response.data);
      setOriginalUrl('');
      setCustomAlias('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL. Check the format or alias and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!successData) return;
    const shortLink = `http://localhost:5001/${successData.code}`;
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-background text-on-background selection:bg-primary/30 min-h-screen font-body-md relative overflow-x-hidden flex flex-col justify-between">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant">
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>link</span>
            <span className="text-headline-md font-headline-md font-bold text-primary">Short.ly</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-stack-lg">
            <Link to="/" className="text-primary font-bold border-b-2 border-primary hover:text-primary transition-colors duration-200 text-label-md font-label-md pb-0.5">
              Home
            </Link>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-md font-label-md" href="#features-section">
              Features
            </a>
            
            {isAuthenticated ? (
              <Link to="/dashboard" className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-md font-label-md">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-md font-label-md">
                  Login
                </Link>
                <Link to="/register" className="text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-md font-label-md">
                  Register
                </Link>
              </>
            )}
            
            <a 
              className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors duration-200 text-label-md font-label-md" 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              <span>GitHub</span>
            </a>
          </nav>

          <div className="flex items-center gap-stack-md">
            {isAuthenticated ? (
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
                        to="/dashboard" 
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded text-xs text-on-surface-variant hover:bg-white/5 hover:text-white transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">dashboard</span>
                        <span>Dashboard</span>
                      </Link>
                      <button 
                        onClick={() => { setShowProfileDropdown(false); logout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-red-400 hover:bg-red-500/10 transition text-left"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="pt-32 pb-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative overflow-hidden flex-grow w-full">
        
        {/* Shifting Gradient Glow Decorations */}
        <div 
          style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -z-10 transition-transform duration-300 ease-out"
        ></div>
        <div 
          style={{ transform: `translate(${-offset.x}px, ${-offset.y}px)` }}
          className="absolute top-1/2 -right-24 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full -z-10 transition-transform duration-300 ease-out"
        ></div>

        {/* Hero Section */}
        <section className="text-center mb-stack-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-display-lg font-display-lg text-on-background mb-4 tracking-tighter">
            Shorten URLs. <span class="text-primary">Share Smarter.</span>
          </h1>
          <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            The high-performance URL management platform built for modern engineering teams. Track performance with precision and optimize every touchpoint.
          </p>
        </section>

        {/* URL Shortener Form */}
        <section className="max-w-4xl mx-auto mb-16">
          <div className="glass-card p-6 md:p-8 rounded-xl shadow-2xl transition-all hover:border-primary/40">
            <form onSubmit={handleShorten} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Target URL */}
                <div className="md:col-span-12 flex flex-col gap-2">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest" htmlFor="target-url">
                    Target URL
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      link
                    </span>
                    <input 
                      id="target-url"
                      type="url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      placeholder="https://github.com/saurash/portfolio-2024-v2-production"
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary active-glow transition-all font-label-md"
                      required
                    />
                  </div>
                </div>

                {/* Custom Alias */}
                <div className="md:col-span-7 flex flex-col gap-2">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest" htmlFor="custom-alias">
                    Custom Alias (Optional)
                  </label>
                  <div className="flex items-center">
                    <div className="px-4 py-4 bg-surface-container-high border-y border-l border-outline-variant rounded-l-lg text-outline font-label-md">
                      short.ly/
                    </div>
                    <input 
                      id="custom-alias"
                      type="text"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      placeholder="portfolio"
                      className="w-full px-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-r-lg text-on-surface focus:outline-none focus:border-primary active-glow transition-all font-label-md"
                    />
                  </div>
                </div>

                {/* Link Expiry */}
                <div className="md:col-span-5 flex flex-col gap-2">
                  <label className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest" htmlFor="expiry-select">
                    Link Expiry
                  </label>
                  <div className="relative">
                    <select 
                      id="expiry-select"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:border-primary active-glow transition-all font-label-md appearance-none cursor-pointer"
                    >
                      <option value="never">Never</option>
                      <option value="1h">1H</option>
                      <option value="24h">24H</option>
                      <option value="7d">7D (Default)</option>
                      <option value="30d">30D</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-outline">
                      expand_more
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Submit */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full btn-primary-gradient py-4 rounded-lg text-on-primary font-bold text-headline-md font-headline-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                    <span>Generate Short Link</span>
                  </>
                )}
              </button>

            </form>

            {/* Guest/Validation Reminders */}
            {error && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {!isAuthenticated && (
                  <Link 
                    to="/login"
                    className="px-4 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-1"
                  >
                    <span>Login now</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Success Results Card */}
        {successData && (
          <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-stack-md animate-in slide-in-from-bottom-6 duration-500">
            <div className="md:col-span-2 glass-card p-6 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    <span>Created Successfully</span>
                  </span>
                  <span className="text-label-sm font-label-sm text-outline">
                    ID: {successData.code}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between bg-surface-container-lowest p-4 rounded-lg border border-outline-variant">
                  <span className="text-headline-md font-label-md text-primary font-bold">
                    {`short.ly/${successData.code}`}
                  </span>
                  <button 
                    onClick={handleCopy}
                    className="p-2 hover:bg-surface-variant rounded-md transition-colors group"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-secondary" />
                    ) : (
                      <Copy className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <Link 
                  to="/dashboard"
                  className="flex-1 border border-outline-variant py-2 rounded-lg text-label-md font-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <span className="material-symbols-outlined text-[18px]">analytics</span>
                  <span>View Analytics</span>
                </Link>
                <button className="flex-1 border border-outline-variant py-2 rounded-lg text-label-md font-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  <span>Share QR</span>
                </button>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl bg-surface-container-high/50 border-secondary/20 flex flex-col justify-between">
              <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest">
                Live Performance
              </span>
              <div className="flex-grow flex flex-col justify-center py-4">
                <div className="text-[48px] font-bold text-on-background leading-none">0</div>
                <div className="text-label-md font-label-md text-on-surface-variant">Total Clicks</div>
              </div>
              <div className="pt-4 border-t border-outline-variant flex justify-between text-label-sm font-label-sm">
                <span className="text-outline">Status</span>
                <span className="text-secondary font-bold">ACTIVE</span>
              </div>
            </div>
          </section>
        )}

        {/* Visual Feature Grid (Bento) */}
        <section id="features-section" className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 glass-card p-8 rounded-xl overflow-hidden relative group">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-primary text-[40px] mb-4">bolt</span>
              <h3 className="text-headline-md font-headline-md mb-2 text-on-surface font-bold">Ultra-Low Latency</h3>
              <p className="text-on-surface-variant text-sm">
                Global edge network redirection ensures your users hit their destination in under 50ms.
              </p>
            </div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-[160px]">speed</span>
            </div>
          </div>
          
          <div className="glass-card p-8 rounded-xl bg-primary-container/10 border-primary/20">
            <span className="material-symbols-outlined text-primary text-[32px] mb-4">terminal</span>
            <h3 className="text-label-md font-bold mb-2 text-on-surface">API-First</h3>
            <p className="text-label-sm text-on-surface-variant">
              Seamless integration for CI/CD pipelines.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl">
            <span className="material-symbols-outlined text-secondary text-[32px] mb-4">security</span>
            <h3 className="text-label-md font-bold mb-2 text-on-surface">Auto-Expire</h3>
            <p className="text-label-sm text-on-surface-variant">
              Self-destructing links for sensitive data.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-32 bg-surface-dim border-t border-outline-variant py-stack-lg">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto gap-stack-md text-center">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">link</span>
              <span className="text-body-lg font-bold text-primary">Short.ly</span>
            </div>
            <p className="text-label-sm font-label-sm text-on-surface-variant">© 2024 Short.ly. Made by Saurash</p>
          </div>
          <div className="flex gap-8 flex-wrap justify-center">
            <a className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="#">API</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="#">Privacy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="#">GitHub</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="#">Status</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
