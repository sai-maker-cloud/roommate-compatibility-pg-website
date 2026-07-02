import { useEffect, useState } from "react";
import { Check, X, RefreshCw, TicketCheck, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getOwnerBookings, acceptBooking } from "../../api/bookings.js";
import { getOrCreateConversation } from "../../api/conversations.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { formatDate } from "../../utils/formatters.js";

export const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      setBookings(await getOwnerBookings());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (id, status) => {
    setProcessing(id);
    try {
      await acceptBooking(id, status);
      await load();
    } catch (err) {
      alert(`Failed to ${status} booking`);
    } finally {
      setProcessing(null);
    }
  };

  const handleMessageUser = async (studentId) => {
    try {
      const conv = await getOrCreateConversation(studentId);
      navigate('/chat', { state: { conversationId: conv._id } });
    } catch (err) {
      alert("Failed to start conversation");
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'accepted': return 'bg-teal-100 text-teal-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Booking Requests</h1>
          <p className="text-slate-600 mt-1">Manage requests across all your properties</p>
        </div>
        <Button variant="secondary" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState 
          icon={TicketCheck} 
          title="No booking requests yet" 
          body="When students request to book your properties, they will appear here."
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id || booking._id} className="p-0 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                <div className="p-5 lg:w-1/3 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-slate-900">{booking.pg?.name || "Unknown PG"}</h3>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Move-in Date:</span>
                      <span className="font-medium text-slate-900">{formatDate(booking.moveInDate || booking.moveindate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Requested On:</span>
                      <span className="font-medium text-slate-900">{formatDate(booking.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-lg">
                      {booking.student?.name?.charAt(0).toUpperCase() || "S"}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{booking.student?.name || "Student"}</h4>
                      <p className="text-sm text-slate-500">{booking.student?.email || "No email"}</p>
                      <p className="text-sm text-slate-500">{booking.student?.phone || "No phone"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      onClick={() => handleMessageUser(booking.student?._id || booking.student?.id)}
                      className="w-full sm:w-auto"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    
                    {booking.status === "pending" && (
                      <>
                        <Button 
                          variant="outline"
                          className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          disabled={processing === (booking.id || booking._id)}
                          onClick={() => handleStatusChange(booking.id || booking._id, "rejected")}
                        >
                          <X className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button 
                          className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-white"
                          disabled={processing === (booking.id || booking._id)}
                          onClick={() => handleStatusChange(booking.id || booking._id, "accepted")}
                        >
                          <Check className="w-4 h-4 mr-1" /> Accept
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
