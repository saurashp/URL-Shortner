import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../services/api';
import { 
  X, Check
} from 'lucide-react';

const UserDashboard = () => {
  // Read trigger from MainLayout's shorten modal to automatically refresh listing
  const context = useOutletContext();
  const newUrlTrigger = context?.newUrlTrigger || 0;

  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, active, expired
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Copy toast state
  const [showToast, setShowToast] = useState(false);

  // Edit modal state
  const [editingUrl, setEditingUrl] = useState(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/urls');
      setUrls(response.data);
    } catch (err) {
      console.error('Failed to load dashboard URLs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [newUrlTrigger]);

  const handleDelete = async (code) => {
    if (!window.confirm(`Are you sure you want to delete short link ${code}? This will purge its redirection statistics.`)) {
      return;
    }
    try {
      await api.delete(`/urls/${code}`);
      setUrls(prev => prev.filter(item => item.shortCode !== code));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete URL.');
    }
  };

  const handleStartEdit = (url) => {
    setEditingUrl(url);
    setEditOriginalUrl(url.originalUrl);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editOriginalUrl) return;

    try {
      setEditLoading(true);
      await api.put(`/urls/${editingUrl.shortCode}`, { originalUrl: editOriginalUrl });
      setEditingUrl(null);
      fetchUrls();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update URL.');
    } finally {
      setEditLoading(false);
    }
  };

  const copyShortUrl = (code) => {
    const urlStr = `http://localhost:5001/${code}`;
    navigator.clipboard.writeText(urlStr);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Local calculations for Stats
  const now = new Date();
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, item) => sum + (item.clicks || 0), 0);
  
  const activeUrls = urls.filter(item => 
    item.isActive && new Date(item.expiresAt) > now
  ).length;

  const expiredUrls = urls.filter(item => 
    !item.isActive || new Date(item.expiresAt) <= now
  ).length;

  // Filter and Search URLs locally
  const filteredUrls = urls.filter(item => {
    // 1. Filter Type
    const isExpired = new Date(item.expiresAt) <= now || !item.isActive;
    if (filterType === 'active' && isExpired) return false;
    if (filterType === 'expired' && !isExpired) return false;

    // 2. Search query
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        item.shortCode.toLowerCase().includes(q) ||
        item.originalUrl.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Client-side pagination
  const totalPages = Math.ceil(filteredUrls.length / limit);
  const paginatedUrls = filteredUrls.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-700 relative">
      
      {/* Welcome Header */}
      <section className="mb-stack-lg">
        <h1 className="text-headline-lg font-headline-lg text-on-surface mb-unit">
          Welcome Back, {context?.user?.username || 'Developer'}
        </h1>
        <p className="text-body-md font-body-md text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-sm">trending_up</span>
          <span>Total Clicks: </span>
          <span className="text-on-surface font-bold">{totalClicks}</span>
          <span>across all campaigns</span>
        </p>
      </section>

      {/* Stats Bento Grid */}
      <section className="bento-grid mb-stack-lg">
        {/* Stat 1 */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-stack-md hover:border-primary/40 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-stack-sm">
            <span className="text-label-sm font-label-sm text-on-surface-variant">Total URLs</span>
            <span className="material-symbols-outlined text-primary opacity-50 group-hover:opacity-100">link</span>
          </div>
          <div className="text-headline-md font-headline-md text-on-surface">{totalUrls}</div>
        </div>

        {/* Stat 2 */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-stack-md hover:border-secondary/40 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-stack-sm">
            <span className="text-label-sm font-label-sm text-on-surface-variant">Total Clicks</span>
            <span className="material-symbols-outlined text-secondary opacity-50 group-hover:opacity-100">ads_click</span>
          </div>
          <div className="text-headline-md font-headline-md text-on-surface">{totalClicks}</div>
        </div>

        {/* Stat 3 */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-stack-md hover:border-secondary-container/40 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-stack-sm">
            <span className="text-label-sm font-label-sm text-on-surface-variant">Active URLs</span>
            <span className="material-symbols-outlined text-secondary-container opacity-50 group-hover:opacity-100">check_circle</span>
          </div>
          <div className="text-headline-md font-headline-md text-on-surface">{activeUrls}</div>
        </div>

        {/* Stat 4 */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-stack-md hover:border-error/40 transition-all duration-200 group">
          <div className="flex items-center justify-between mb-stack-sm">
            <span className="text-label-sm font-label-sm text-on-surface-variant">Expired</span>
            <span className="material-symbols-outlined text-error opacity-50 group-hover:opacity-100">timer_off</span>
          </div>
          <div className="text-headline-md font-headline-md text-on-surface">{expiredUrls}</div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="flex flex-col md:flex-row gap-stack-md items-center justify-between mb-stack-md">
        <div className="relative w-full md:w-96 group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">
            search
          </span>
          <input 
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search short URLs or destinations..."
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-body-md text-sm"
          />
        </div>

        <div className="flex items-center bg-surface-container-high p-1 rounded-lg border border-outline-variant w-full md:w-auto">
          <button 
            onClick={() => { setFilterType('all'); setPage(1); }}
            className={`flex-1 md:flex-none px-4 py-1.5 text-label-md font-label-md rounded-md transition ${
              filterType === 'all' 
                ? 'bg-secondary-container text-on-secondary-container shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All
          </button>
          <button 
            onClick={() => { setFilterType('active'); setPage(1); }}
            className={`flex-1 md:flex-none px-4 py-1.5 text-label-md font-label-md rounded-md transition ${
              filterType === 'active' 
                ? 'bg-secondary-container text-on-secondary-container shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Active
          </button>
          <button 
            onClick={() => { setFilterType('expired'); setPage(1); }}
            className={`flex-1 md:flex-none px-4 py-1.5 text-label-md font-label-md rounded-md transition ${
              filterType === 'expired' 
                ? 'bg-secondary-container text-on-secondary-container shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Expired
          </button>
        </div>
      </section>

      {/* URL List / Grid Table */}
      {loading ? (
        <div className="bg-surface-container rounded-xl border border-outline-variant p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-outline">Loading dashboard records...</p>
          </div>
        </div>
      ) : urls.length === 0 ? (
        <section className="flex flex-col items-center justify-center py-24 text-center bg-surface-container border border-outline-variant rounded-xl" id="empty-state">
          <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-stack-md border border-outline-variant">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant">link_off</span>
          </div>
          <h3 className="text-headline-md font-headline-md text-on-surface">No URLs Yet</h3>
          <p className="text-body-md font-body-md text-on-surface-variant mb-stack-lg max-w-sm">
            Start shortening your links and track their performance with high-precision analytics.
          </p>
        </section>
      ) : (
        <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
          
          {/* Table Header (Desktop Only) */}
          <div className="hidden md:grid grid-cols-12 gap-gutter px-6 py-4 border-b border-outline-variant bg-surface-container-high">
            <div className="col-span-5 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Original URL</div>
            <div className="col-span-3 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Short Link</div>
            <div className="col-span-1 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider text-center">Clicks</div>
            <div className="col-span-1 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider text-center">Status</div>
            <div className="col-span-2 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</div>
          </div>

          {/* List / Table Body */}
          <div className="divide-y divide-outline-variant">
            {paginatedUrls.map((url) => {
              const shortDomainUrl = `http://localhost:5001/${url.shortCode}`;
              const isExpired = new Date(url.expiresAt) <= now || !url.isActive;

              return (
                <div key={url._id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-gutter px-6 py-4 hover:bg-surface-bright/30 transition-colors group">
                  
                  {/* Original URL */}
                  <div className="col-span-1 md:col-span-5 flex flex-col justify-center min-w-0">
                    <span className="text-body-md font-body-md text-on-surface truncate" title={url.originalUrl}>
                      {url.originalUrl}
                    </span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant mt-1">
                      Created {new Date(url.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Short Link */}
                  <div className="col-span-1 md:col-span-3 flex items-center gap-2">
                    <span 
                      onClick={() => window.open(shortDomainUrl, '_blank')}
                      className="text-body-md font-label-md text-primary font-bold hover:underline cursor-pointer"
                    >
                      {`short.ly/${url.shortCode}`}
                    </span>
                    <button 
                      onClick={() => copyShortUrl(url.shortCode)}
                      className="material-symbols-outlined text-on-surface-variant hover:text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/5"
                    >
                      content_copy
                    </button>
                  </div>

                  {/* Clicks */}
                  <div className="col-span-1 md:col-span-1 flex md:justify-center items-center gap-2">
                    <span className="md:hidden text-label-sm font-label-sm text-on-surface-variant">Clicks:</span>
                    <span className="text-body-md font-label-md text-on-surface">{url.clicks || 0}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 md:col-span-1 flex md:justify-center items-center">
                    {isExpired ? (
                      <span className="px-2 py-0.5 rounded-full bg-error-container/10 text-error text-label-sm font-label-sm border border-error/20">
                        Expired
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container/10 text-secondary-container text-label-sm font-label-sm border border-secondary-container/20">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 md:col-span-2 flex justify-start md:justify-end items-center gap-stack-sm mt-2 md:mt-0">
                    <button 
                      onClick={() => handleStartEdit(url)}
                      className="p-2 hover:bg-surface-variant rounded-lg text-on-surface-variant hover:text-primary transition-all"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(url.shortCode)}
                      className="p-2 hover:bg-surface-variant rounded-lg text-on-surface-variant hover:text-error transition-all"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-surface-container-high border-t border-outline-variant flex items-center justify-between">
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                Showing {(page - 1) * limit + 1}-{Math.min(page * limit, filteredUrls.length)} of {filteredUrls.length} URLs
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  disabled={page <= 1}
                  className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-30 transition"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPage(index + 1)}
                    className={`w-8 h-8 rounded font-label-sm text-label-sm transition ${
                      page === index + 1
                        ? 'bg-primary text-on-primary font-bold'
                        : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button 
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-30 transition"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Edit Modal Overlay */}
      {editingUrl && (
        <div className="fixed inset-0 z-50 bg-[#060912]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-xl border border-white/10 relative space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-100 flex items-center space-x-2">
                <span className="material-symbols-outlined text-indigo-400">edit</span>
                <span>Edit Link ({editingUrl.shortCode})</span>
              </h3>
              <button 
                onClick={() => setEditingUrl(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider" htmlFor="edit-url-field">Destination URL</label>
                <input
                  id="edit-url-field"
                  type="url"
                  value={editOriginalUrl}
                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm input-focus-ring outline-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUrl(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Copy Toast Notification */}
      <div 
        className={`fixed top-6 right-6 z-[60] transform transition-transform duration-500 ${
          showToast ? 'translate-x-0' : 'translate-x-[calc(100%+24px)]'
        }`}
      >
        <div className="glass-panel border-l-4 border-primary rounded-lg shadow-2xl p-4 flex items-center gap-4 min-w-[300px]">
          <span className="material-symbols-outlined text-primary text-2xl">check_circle</span>
          <div>
            <p className="font-label-md text-label-md text-on-surface font-bold">Link Copied!</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">URL successfully copied to clipboard</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserDashboard;
