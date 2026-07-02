import { Building2, LayoutDashboard, LogOut, Menu, MessageSquare, TicketCheck, X, Home } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { disconnectSocket } from "../../api/socket.js";
import NotificationBell from "../ui/NotificationBell.jsx";

const navItems = [
  { to: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/owner/pgs", label: "My PGs", icon: Building2 },
  { to: "/owner/bookings", label: "Booking Requests", icon: TicketCheck },
  { to: "/chat", label: "Messages", icon: MessageSquare },
];

export const OwnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const logout = () => {
    signOut();
    disconnectSocket();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40">
        <div className="font-bold text-lg flex items-center gap-2">
          <span className="bg-mint text-moss w-8 h-8 rounded flex items-center justify-center font-black">R</span>
          Owner Panel
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out flex flex-col
        md:translate-x-0 md:static md:h-screen md:sticky md:top-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:flex items-center gap-3">
          <span className="bg-mint text-moss w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl">R</span>
          <div>
            <div className="font-bold text-white text-lg leading-tight">RoomMateAI</div>
            <div className="text-xs text-slate-400">Owner Portal</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? "bg-teal-500/10 text-teal-400" 
                    : "hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
          
          <div className="pt-6 mt-6 border-t border-slate-800">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to Main App
            </NavLink>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase() || "O"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="mt-2 flex w-full items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="hidden md:flex bg-white h-16 border-b border-stone-200 items-center justify-end px-8 sticky top-0 z-30">
          <NotificationBell />
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
