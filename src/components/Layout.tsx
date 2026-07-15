import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, PlusCircle } from 'lucide-react';

export const Layout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Shipments', path: '/shipments', icon: Package },
    { name: 'Create Shipment', path: '/shipments/new', icon: PlusCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl flex flex-col transition-all duration-300 z-10">
        <div className="p-6 flex items-center gap-3 border-b">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Package className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Logistics QR</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-[#f8fafc]">
        <main className="p-8 max-w-7xl mx-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
