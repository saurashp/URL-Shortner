import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Users, Link2, MousePointerClick, AlertCircle, 
  Search, ToggleLeft, ToggleRight, Trash2, ChevronLeft, ChevronRight,
  Filter, RotateCcw, ExternalLink, UserCheck, UserX, Info, CheckCircle2,
  ListFilter, X
} from 'lucide-react';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  
  // Tab control: 'users' or 'urls'
  const [activeTab, setActiveTab] = useState('users');

  // Shared statistics state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // --- Users Tab States ---
  const [usersData, setUsersData] = useState({ users: [], pagination: {} });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(10);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  // --- URLs Tab States ---
  const [urlsData, setUrlsData] = useState({ urls: [], pagination: {} });
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [urlSearch, setUrlSearch] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [filterDeleted, setFilterDeleted] = useState('false');
  const [filterExpired, setFilterExpired] = useState('');
  const [urlPage, setUrlPage] = useState(1);
  const [urlLimit, setUrlLimit] = useState(10);

  // Success toast state
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch users listing
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const params = {
        page: userPage,
        limit: userLimit,
        search: userSearch || undefined
      };
      const response = await api.get('/admin/users', { params });
      setUsersData(response.data);
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch URLs listing
  const fetchUrls = async () => {
    try {
      setLoadingUrls(true);
      const params = {
        page: urlPage,
        limit: urlLimit,
        search: urlSearch || undefined,
        isActive: filterActive || undefined,
        isDeleted: filterDeleted || undefined,
        isExpired: filterExpired || undefined
      };
      const response = await api.get('/admin/urls', { params });
      setUrlsData(response.data);
    } catch (err) {
      console.error('Failed to fetch admin URLs:', err);
    } finally {
      setLoadingUrls(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchUrls();
    }
  }, [activeTab, userPage, userLimit, userSearch, urlPage, urlLimit, urlSearch, filterActive, filterDeleted, filterExpired]);

  // --- Users Handlers ---
  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (userId === currentUser.id) {
      alert('You cannot disable your own administrator account.');
      return;
    }
    const actionText = currentStatus ? 'disable' : 'enable';
    if (!window.confirm(`Are you sure you want to ${actionText} this user's account?`)) {
      return;
    }

    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      triggerToast(`User account status updated successfully to ${!currentStatus ? 'active' : 'disabled'}.`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (userId === currentUser.id) {
      alert('You cannot delete your own administrator account.');
      return;
    }
    if (!window.confirm(`WARNING: Are you sure you want to delete user "${username}"? This will permanently delete their account, all shortened URLs created by them, and all click logs.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      triggerToast(`User account and all associated URLs purged successfully.`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  // --- URLs Handlers ---
  const handleToggleUrlStatus = async (code, currentStatus) => {
    try {
      await api.patch(`/admin/urls/${code}/status`, { isActive: !currentStatus });
      triggerToast(`URL redirection status updated successfully.`);
      fetchUrls();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update URL status.');
    }
  };

  const handleDeleteUrl = async (code) => {
    if (!window.confirm(`Are you sure you want to delete URL ${code}? This will purge its metrics.`)) {
      return;
    }
    try {
      await api.delete(`/admin/urls/${code}`);
      triggerToast(`URL deleted successfully.`);
      fetchUrls();
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete URL.');
    }
  };

  const handleResetUrlFilters = () => {
    setUrlSearch('');
    setFilterActive('');
    setFilterDeleted('false');
    setFilterExpired('');
    setUrlPage(1);
  };

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500 relative">
      
      {/* Title & Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Console</h1>
            <p className="text-gray-400 text-sm mt-1">Platform-wide control of registered users, link allocations, and redirection metrics</p>
          </div>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex items-center bg-surface-container-high p-1 rounded-lg border border-outline-variant w-fit">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-1.5 rounded-md font-label-md text-label-md transition flex items-center gap-2 ${
              activeTab === 'users' 
                ? 'bg-secondary-container text-on-secondary-container shadow' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </button>
          <button 
            onClick={() => setActiveTab('urls')}
            className={`px-4 py-1.5 rounded-md font-label-md text-label-md transition flex items-center gap-2 ${
              activeTab === 'urls' 
                ? 'bg-secondary-container text-on-secondary-container shadow' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Global URL Register</span>
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      {loadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface-container-low border border-outline-variant p-5 rounded-xl animate-pulse h-20"></div>
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
            <div className="bg-surface-container-low border border-outline-variant p-5 rounded-xl">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Total Users</p>
              <div className="flex items-end justify-between mt-2">
                <span className="text-headline-md font-headline-md text-on-surface">{stats.totalUsers}</span>
                <span className="text-secondary text-label-sm flex items-center gap-0.5"><span className="material-symbols-outlined text-[16px]">trending_up</span> 8.4%</span>
              </div>
            </div>
            
            <div className="bg-surface-container-low border border-outline-variant p-5 rounded-xl">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Active Links</p>
              <div className="flex items-end justify-between mt-2">
                <span className="text-headline-md font-headline-md text-on-surface">{stats.activeLinks}</span>
                <span className="text-secondary text-label-sm flex items-center gap-0.5"><span className="material-symbols-outlined text-[16px]">trending_up</span> 12.1%</span>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-5 rounded-xl">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Avg Click/User</p>
              <div className="flex items-end justify-between mt-2">
                <span className="text-headline-md font-headline-md text-on-surface">
                  {(stats.totalClicks / stats.totalUsers || 0).toFixed(1)}
                </span>
                <span className="text-on-surface-variant text-label-sm flex items-center gap-0.5"><span className="material-symbols-outlined text-[16px]">remove</span> 0.0%</span>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-5 rounded-xl">
              <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">Growth Rate</p>
              <div className="flex items-end justify-between mt-2">
                <span className="text-headline-md font-headline-md text-on-surface">1.2%</span>
                <span className="text-tertiary text-label-sm flex items-center gap-0.5"><span className="material-symbols-outlined text-[16px]">trending_down</span> 0.3%</span>
              </div>
            </div>
          </div>
        )
      )}

      {/* Dynamic Tab Views */}
      {activeTab === 'users' ? (
        
        /* USER MANAGEMENT TAB */
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Controls */}
          <div className="p-4 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low/50">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/70 text-[18px]">search</span>
                <input 
                  type="text"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                  placeholder="Search users by name or email..."
                  className="w-full bg-surface-container-highest/30 border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-md focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="text-label-sm font-label-sm">Show:</span>
              <select 
                value={userLimit}
                onChange={(e) => { setUserLimit(parseInt(e.target.value, 10)); setUserPage(1); }}
                className="bg-transparent border-none focus:ring-0 text-label-md font-label-md text-on-surface cursor-pointer text-xs"
              >
                <option value="5">5 Rows</option>
                <option value="10">10 Rows</option>
                <option value="25">25 Rows</option>
                <option value="50">50 Rows</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400">Loading user database...</p>
            </div>
          ) : usersData.users.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-3xl m-4">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-300 text-base">No users match criteria</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mt-1">Try expanding the search parameters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/30 border-b border-outline-variant">
                    <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">User</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Total URLs</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Total Clicks</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Account Status</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Joined Date</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {usersData.users.map((item) => {
                    const isSelf = item._id === currentUser.id;
                    return (
                      <tr key={item._id} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full border border-outline-variant bg-surface-container overflow-hidden shrink-0 flex items-center justify-center">
                              <span className="material-symbols-outlined text-outline">person</span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-on-surface font-semibold truncate flex items-center gap-1.5">
                                <span>{item.username}</span>
                                {isSelf && (
                                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[9px] uppercase tracking-wider">Self</span>
                                )}
                              </span>
                              <span className="text-on-surface-variant text-label-sm truncate">{item.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-label-md text-label-md text-on-surface">
                          {item.totalUrls}
                        </td>
                        <td className="px-6 py-4 font-label-md text-label-md text-on-surface">
                          {item.totalClicks}
                        </td>
                        <td className="px-6 py-4">
                          {item.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-label-sm font-bold border border-secondary/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container/20 text-error text-label-sm font-bold border border-error/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant text-label-md font-label-md">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                          <button 
                            onClick={() => setSelectedUserDetail(item)}
                            className="p-2 text-on-surface-variant hover:text-primary transition-all rounded-lg"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </button>
                          
                          <button 
                            onClick={() => handleToggleUserStatus(item._id, item.isActive)}
                            disabled={isSelf}
                            className={`p-2 transition-all rounded-lg ${
                              isSelf 
                                ? 'opacity-30 cursor-not-allowed text-gray-600'
                                : item.isActive 
                                  ? 'text-on-surface-variant hover:text-tertiary' 
                                  : 'text-primary hover:text-primary-container'
                            }`}
                            title={item.isActive ? "Disable User" : "Enable User"}
                          >
                            {item.isActive ? (
                              <span className="material-symbols-outlined text-[20px]">block</span>
                            ) : (
                              <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            )}
                          </button>

                          <button 
                            onClick={() => handleDeleteUser(item._id, item.username)}
                            disabled={isSelf}
                            className={`p-2 transition-all rounded-lg ${
                              isSelf 
                                ? 'opacity-30 cursor-not-allowed text-gray-600' 
                                : 'text-on-surface-variant hover:text-error'
                            }`}
                            title="Delete User"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {usersData.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-label-sm font-label-sm text-on-surface-variant">
                Showing <span className="text-on-surface font-bold">{(userPage - 1) * userLimit + 1}-{Math.min(userPage * userLimit, usersData.pagination.totalCount)}</span> of <span className="text-on-surface font-bold">{usersData.pagination.totalCount}</span> users
              </p>
              <div className="flex items-center gap-1">
                <button 
                  disabled={userPage <= 1}
                  onClick={() => setUserPage(p => Math.max(p - 1, 1))}
                  className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: usersData.pagination.totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setUserPage(idx + 1)}
                    className={`px-3.5 py-1.5 rounded-lg text-label-md ${
                      userPage === idx + 1 
                        ? 'bg-primary text-on-primary font-bold shadow' 
                        : 'text-on-surface-variant hover:bg-surface-container-highest transition-colors'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button 
                  disabled={userPage >= usersData.pagination.totalPages}
                  onClick={() => setUserPage(p => Math.min(p + 1, usersData.pagination.totalPages))}
                  className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        
        /* GLOBAL URL REGISTER TAB */
        <div className="bg-surface-container rounded-xl border border-outline-variant p-6 sm:p-8 relative animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-indigo-400" />
                <span>Global URL Registry</span>
              </h2>
              
              <button 
                onClick={handleResetUrlFilters}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 animate-spin-hover" />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* URL Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              <div className="relative lg:col-span-4">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={urlSearch}
                  onChange={(e) => { setUrlSearch(e.target.value); setUrlPage(1); }}
                  placeholder="Search by code, destination link..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input"
                />
              </div>

              <div className="lg:col-span-2">
                <select
                  value={filterActive}
                  onChange={(e) => { setFilterActive(e.target.value); setUrlPage(1); }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs glass-input font-medium"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active Only</option>
                  <option value="false">Disabled Only</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={filterDeleted}
                  onChange={(e) => { setFilterDeleted(e.target.value); setUrlPage(1); }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs glass-input font-medium"
                >
                  <option value="">All Soft-Deletes</option>
                  <option value="false">Active Registry</option>
                  <option value="true">Deleted Trash</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={filterExpired}
                  onChange={(e) => { setFilterExpired(e.target.value); setUrlPage(1); }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs glass-input font-medium"
                >
                  <option value="">All Lifetimes</option>
                  <option value="false">Non-Expired</option>
                  <option value="true">Expired</option>
                </select>
              </div>
            </div>

            {/* URLs list Table */}
            {loadingUrls ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400">Loading registry...</p>
              </div>
            ) : urlsData.urls.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-3xl">
                <Link2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="font-bold text-gray-300 text-base">No records match criteria</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mt-1">Try expanding search query or removing filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-4">Code</th>
                      <th className="py-4 px-4">Destination Link</th>
                      <th className="py-4 px-4">Creator</th>
                      <th className="py-4 px-4 text-center">Clicks</th>
                      <th className="py-4 px-4">Expires</th>
                      <th className="py-4 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300 font-medium">
                    {urlsData.urls.map((url) => {
                      const shortDomainUrl = `http://localhost:5001/${url.shortCode}`;
                      return (
                        <tr key={url._id} className="hover:bg-white/2 transition duration-200">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-indigo-400 text-sm break-all">{url.shortCode}</span>
                              <a href={shortDomainUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                          <td className="py-4 px-4 max-w-[240px] truncate" title={url.originalUrl}>
                            {url.originalUrl}
                          </td>
                          <td className="py-4 px-4">
                            {url.userId ? (
                              <div>
                                <p className="text-gray-200 font-semibold">{url.userId.username}</p>
                                <p className="text-[10px] text-gray-500">{url.userId.email}</p>
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">Unknown</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center text-sm font-bold text-gray-200">
                            {url.clicks || 0}
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {new Date(url.expiresAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleToggleUrlStatus(url.shortCode, url.isActive)}
                                className={`p-1.5 rounded-lg border transition ${
                                  url.isActive 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                                    : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                }`}
                                title={url.isActive ? 'Disable link redirection' : 'Enable link redirection'}
                              >
                                {url.isActive ? (
                                  <ToggleRight className="w-5 h-5" />
                                ) : (
                                  <ToggleLeft className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteUrl(url.shortCode)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition"
                                title="Delete URL override"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* URLs Pagination */}
            {urlsData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-5">
                <span className="text-gray-500 text-xs font-semibold">
                  Page {urlsData.pagination.currentPage} of {urlsData.pagination.totalPages}
                </span>
                
                <div className="flex items-center space-x-2">
                  <button
                    disabled={urlPage <= 1}
                    onClick={() => setUrlPage(p => p - 1)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={urlPage >= urlsData.pagination.totalPages}
                    onClick={() => setUrlPage(p => p + 1)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Details Modal Overlay */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-[#060912]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-xl border border-white/10 relative space-y-6 animate-scaleIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-100 flex items-center space-x-2">
                <Info className="w-5 h-5 text-indigo-400" />
                <span>User Record Information</span>
              </h3>
              <button 
                onClick={() => setSelectedUserDetail(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 font-medium">Username:</span>
                <span className="font-bold text-white">{selectedUserDetail.username}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 font-medium">Email Address:</span>
                <span className="font-bold text-indigo-400">{selectedUserDetail.email}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 font-medium">System Role:</span>
                <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded border border-violet-500/20 text-xs font-bold uppercase">
                  {selectedUserDetail.role}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 font-medium">Link Count:</span>
                <span className="font-bold text-white">{selectedUserDetail.totalUrls} URLs</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 font-medium">Accumulated Clicks:</span>
                <span className="font-bold text-white">{selectedUserDetail.totalClicks} clicks</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500 font-medium">Activation Status:</span>
                <span className={`font-bold ${selectedUserDetail.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedUserDetail.isActive ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Joined Timestamp:</span>
                <span className="text-gray-400">{new Date(selectedUserDetail.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white text-xs font-medium transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Success Toast notification */}
      <div 
        className={`fixed top-6 right-6 z-[100] transform transition-transform duration-300 ${
          toastMessage ? 'translate-x-0' : 'translate-x-[calc(100%+24px)]'
        }`}
      >
        <div className="glass-panel bg-surface-container-high border-l-4 border-primary rounded-lg shadow-2xl p-4 flex items-center gap-4 min-w-[320px]">
          <div className="bg-primary/20 p-2 rounded-full text-primary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-grow">
            <p className="font-bold text-on-surface text-sm">Operation Successful</p>
            <p className="text-label-sm text-on-surface-variant">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage('')} className="text-on-surface-variant hover:text-on-surface">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
