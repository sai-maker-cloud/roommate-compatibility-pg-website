import { useEffect, useState } from "react";
import { Building2, DollarSign, Users, TicketCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../api/pg.js";
import { formatCurrency } from "../../utils/formatters.js";
import { Card } from "../../components/ui/Card.jsx";

export const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    totalPgs: 0,
    activeBookings: 0,
    pendingRequests: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getDashboardStats()
      .then(data => {
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const statCards = [
    { label: "Total Properties", value: stats.totalPgs, icon: Building2, color: "bg-blue-500" },
    { label: "Active Bookings", value: stats.activeBookings, icon: Users, color: "bg-teal-500" },
    { label: "Pending Requests", value: stats.pendingRequests, icon: TicketCheck, color: "bg-amber-500" },
    { label: "Est. Monthly Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "bg-emerald-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-6 flex items-center gap-4">
            <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              {loading ? (
                <div className="h-8 w-16 bg-slate-200 animate-pulse rounded mt-1"></div>
              ) : (
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid gap-3">
            <Link to="/owner/pgs/new" className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="bg-teal-50 text-teal-600 p-2 rounded-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-teal-700">Add New Property</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/owner/bookings" className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 text-amber-600 p-2 rounded-md">
                  <TicketCheck className="w-5 h-5" />
                </div>
                <span className="font-medium text-slate-700 group-hover:text-teal-700">Review Booking Requests</span>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-500 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <h2 className="text-lg font-bold mb-2">Welcome to your Owner Portal</h2>
          <p className="text-slate-300 mb-6 line-clamp-3">
            Manage your properties, review booking requests, and communicate directly with potential tenants all from one centralized dashboard.
          </p>
          <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Properties" className="w-full h-32 object-cover rounded-lg opacity-80" />
        </Card>
      </div>
    </div>
  );
};
