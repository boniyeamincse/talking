import { useAuthStore } from '@core/store/authStore';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark">
      <nav className="bg-surface border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-white">BaniTalk</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-300">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Messages</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Matches</h3>
            <p className="text-3xl font-bold text-secondary">0</p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2">Friends</h3>
            <p className="text-3xl font-bold text-green-500">0</p>
          </div>
        </div>

        <div className="mt-8 bg-surface p-6 rounded-xl border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to BaniTalk!</h2>
          <p className="text-gray-400">
            Start connecting with people around the world and learn new languages together.
          </p>
        </div>
      </main>
    </div>
  );
};
