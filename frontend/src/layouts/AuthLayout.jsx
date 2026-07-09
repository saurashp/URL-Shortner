import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const AuthLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname.startsWith('/login');

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-md text-body-md selection:bg-primary selection:text-on-primary-container relative overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-background border-b border-outline-variant">
        <div className="flex justify-between items-center h-16 px-margin-desktop max-w-container-max mx-auto">
          <Link to="/" className="flex items-center gap-unit hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-primary">link</span>
            <span className="text-headline-md font-headline-md font-bold text-primary">Short.ly</span>
          </Link>
          
          <div className="flex items-center gap-stack-md">
            {/* Dynamic Navigation Links based on route context */}
            <nav className="hidden md:flex items-center gap-stack-lg">
              {isLoginPage ? (
                <>
                  <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-label-md text-label-md" href="#">Product</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-label-md text-label-md" href="#">Resources</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-label-md text-label-md" href="#">Pricing</a>
                  <div className="h-4 w-px bg-outline-variant mx-stack-sm"></div>
                  <Link to="/login" className="text-primary font-bold border-b-2 border-primary font-label-md text-label-md pb-1">Log In</Link>
                </>
              ) : (
                <>
                  <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-label-md text-label-md" href="#">Features</a>
                  <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 font-label-md text-label-md" href="#">Pricing</a>
                  <div className="h-4 w-px bg-outline-variant mx-stack-sm"></div>
                  <Link to="/register" className="text-primary font-bold border-b-2 border-primary font-label-md text-label-md pb-1">Sign Up</Link>
                </>
              )}
            </nav>

            <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex items-center justify-center px-margin-mobile pt-24 pb-stack-lg relative overflow-hidden">
        
        {/* Atmospheric Background Effect */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px]"></div>
        </div>

        {/* Content Wrapper */}
        <div className="w-full max-w-[480px] z-10">
          <Outlet />
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-stack-lg bg-surface-dim border-t border-outline-variant relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop max-w-container-max mx-auto gap-stack-md text-center md:text-left">
          <div className="text-body-lg font-bold text-primary">Short.ly</div>
          <div className="flex gap-stack-md flex-wrap justify-center">
            <a className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="#">API</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="#">Privacy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="#">GitHub</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-label-sm font-label-sm" href="#">Status</a>
          </div>
          <div className="text-on-surface-variant text-label-sm font-label-sm">
            © 2024 Short.ly. Made by Saurash
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AuthLayout;
