import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PROVIDER_COLORS = {
  google: 'from-red-500 to-orange-400',
  facebook: 'from-blue-600 to-blue-400',
  local: 'from-emerald-500 to-teal-400',
  firebase: 'from-yellow-500 to-amber-400',
};

const PROVIDER_LABELS = {
  google: 'Google',
  facebook: 'Facebook',
  local: 'Email & Password',
  firebase: 'Firebase',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const providerGradient = PROVIDER_COLORS[user?.provider] || PROVIDER_COLORS.local;
  const providerLabel = PROVIDER_LABELS[user?.provider] || 'Unknown';

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const lastLogin = user?.lastLogin
    ? new Date(user.lastLogin).toLocaleString()
    : 'Just now';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-gray-900 to-gray-950 flex flex-col">
      {/* Top bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6M17 19a1 1 0 100 2 1 1 0 000-2zM9 19a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FreshCart</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-400/40 text-white/70 hover:text-red-300 transition-all duration-200 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-6">

          {/* Welcome hero card */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
            {/* Gradient accent bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${providerGradient}`} />

            <div className="p-8 flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/10 shadow-xl"
                  />
                ) : (
                  <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${providerGradient} flex items-center justify-center text-white text-3xl font-bold shadow-xl`}>
                    {initials}
                  </div>
                )}
                <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br ${providerGradient} flex items-center justify-center shadow-lg`}>
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-1">
                  Welcome back 👋
                </p>
                <h1 className="text-white text-3xl font-bold mb-1">{user?.name || 'User'}</h1>
                <p className="text-gray-400 text-sm">{user?.email}</p>

                <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${providerGradient} text-white text-xs font-semibold`}>
                    via {providerLabel}
                  </span>
                  {user?.isVerified && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: 'Last Login',
                value: lastLogin,
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                gradient: 'from-blue-500 to-indigo-500'
              },
              {
                label: 'Auth Provider',
                value: providerLabel,
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                label: 'Account Status',
                value: user?.isVerified ? 'Verified' : 'Pending',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ),
                gradient: 'from-emerald-500 to-teal-400'
              }
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 flex flex-col gap-3 hover:bg-white/8 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">{stat.label}</p>
                  <p className="text-white font-semibold text-sm mt-0.5 truncate">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h2 className="text-white font-semibold text-base mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Shop Now', icon: '🛒', onClick: () => navigate('/') },
                { label: 'My Cart', icon: '🛍️', onClick: () => navigate('/cart') },
                { label: 'Track Order', icon: '📦', onClick: () => navigate('/delivery') },
                { label: 'Admin Panel', icon: '⚙️', onClick: () => navigate('/admin') },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-400/30 transition-all duration-200 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
                  <span className="text-gray-400 group-hover:text-emerald-300 text-xs font-medium transition-colors">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
