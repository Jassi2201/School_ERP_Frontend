import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import { Bell, UserCircle, LogOut } from 'lucide-react'; // add LogOut

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f3f3f3]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-12 bg-white border-b flex items-center justify-between px-6">
          <span className="text-sm text-gray-600">Welcome, {user?.full_name}</span>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-full border border-red-300 flex items-center justify-center">
              <Bell size={15} className="text-red-500" />
            </button>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-full border border-red-300 flex items-center justify-center"
            >
              <LogOut size={18} className="text-red-500" /> {/* Changed to LogOut */}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default Layout;