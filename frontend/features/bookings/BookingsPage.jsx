import { RefreshCw, MessageSquare, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserBookings } from "../../api/bookings.js";
import { getOrCreateConversation } from "../../api/conversations.js";
import { ratePg } from "../../api/pg.js";
import { getApiError } from "../../api/client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { formatDate, formatCurrency } from "../../utils/formatters.js";

export const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setBookings(await getUserBookings());
    } catch (err) {
      setError(getApiError(err, "Could not load your bookings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMessageOwner = async (owner) => {
    if (!owner) return;
    try {
      const conv = await getOrCreateConversation(owner._id || owner.id || owner);
      navigate('/chat', { state: { conversationId: conv._id } });
    } catch (err) {
      setError(getApiError(err, "Failed to start conversation"));
    }
  };

  const handleRate = async (pgId, score) => {
    try {
      await ratePg(pgId, score);
      load(); // Reload bookings to reflect any state changes
    } catch (err) {
      alert("Failed to submit rating");
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'accepted': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">My Bookings</h1>
          <p className="mt-2 text-sm text-stone-600">Track your PG booking requests.</p>
        </div>
        <Button variant="secondary" onClick={load}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error ? <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {loading ? <div className="rounded-lg bg-white p-8 text-center text-sm text-stone-600">Loading bookings...</div> : null}

      {!loading && bookings.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No bookings yet" body="Your PG booking requests will appear here." />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {bookings.map((booking) => (
          <Card key={booking.id || booking._id} className="p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-ink mb-1">{booking.pg?.name || "PG"}</h2>
                <p className="text-sm text-stone-600 line-clamp-1">{booking.pg?.address || booking.pg?.location}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 mb-6">
              <div className="bg-stone-50 p-3 rounded-lg">
                <p className="text-xs text-stone-500 mb-1">Move-in Date</p>
                <p className="font-semibold text-ink">{formatDate(booking.moveInDate || booking.moveindate)}</p>
              </div>
              <div className="bg-stone-50 p-3 rounded-lg">
                <p className="text-xs text-stone-500 mb-1">Rent</p>
                <p className="font-semibold text-ink">{booking.pg?.rent ? formatCurrency(booking.pg.rent) : 'N/A'}</p>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-4 mt-auto flex items-center justify-between">
              <div className="text-sm">
                <span className="text-stone-500">Owner: </span>
                <span className="font-medium text-ink">{booking.pg?.owner?.name || "Unknown"}</span>
              </div>
              <Button onClick={() => handleMessageOwner(booking.pg?.owner)} variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
            
            {booking.status?.toLowerCase() === 'accepted' && (
              <div className="border-t border-stone-200 pt-3 mt-4 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">Rate your PG:</span>
                <div className="flex items-center gap-1 group">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(booking.pg._id || booking.pg.id, star)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star className={`w-5 h-5 text-stone-300 hover:fill-yellow-400 hover:text-yellow-400`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
