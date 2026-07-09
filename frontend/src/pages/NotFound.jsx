import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#F3F4F6] relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 text-center space-y-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-indigo-100 to-violet-200">
            LinkSnap
          </h1>
        </div>

        {/* 404 Main Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl relative space-y-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 rounded-3xl pointer-events-none"></div>
          
          <div className="space-y-2">
            <h2 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">404</h2>
            <h3 className="text-xl font-bold text-gray-200">Page Not Found</h3>
            <p className="text-gray-400 text-sm">The page you are looking for doesn't exist or has been moved.</p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-200 font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
