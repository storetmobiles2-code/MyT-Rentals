import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Receipt, 
  BarChart3, 
  Menu, 
  X,
  PlusCircle,
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Properties', icon: Building2, path: '/properties' },
    { name: 'Tenants', icon: Users, path: '/tenants' },
    { name: 'Transactions', icon: Receipt, path: '/transactions' },
    { name: 'Reports', icon: BarChart3, path: '/reports' },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              mT
            </div>
            <span className="text-xl font-bold text-gray-900">myT Rentals</span>
          </div>
          <button 
            className="lg:hidden text-gray-500"
            onClick={closeSidebar}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-4 flex-shrink-0">
           <NavLink 
             to="/add-transaction"
             onClick={closeSidebar}
             className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-lg shadow-primary-600/30"
           >
             <PlusCircle size={20} />
             Record Payment
           </NavLink>

           {user && (
             <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                      <UserIcon size={16} />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
             </div>
           )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:hidden flex-shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-semibold text-gray-900">myT Rentals</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;