import { CalendarPlus, MapPin, Star, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookPG } from "../../api/bookings.js";
import { getOrCreateConversation } from "../../api/conversations.js";
import { getApiError } from "../../api/client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { formatCurrency } from "../../utils/formatters.js";
import { useAuth } from "../../auth/AuthProvider.jsx";

export const PgCard = ({ pg, onBooked }) => {
  const [moveInDate, setMoveInDate] = useState("");
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const image = pg.images?.[0];

  const isOwner = user && pg.owner && (
    user.id === pg.owner || 
    user._id === pg.owner || 
    user.id === pg.owner._id || 
    user._id === pg.owner._id
  );

  const submitBooking = async () => {
    setMessage("");
    setError("");
    setBooking(true);
    try {
      await bookPG({ pgId: pg.id, moveInDate });
      setMessage("Booking requested");
      onBooked?.();
    } catch (err) {
      setError(getApiError(err, "Booking failed"));
    } finally {
      setBooking(false);
    }
  };

  const handleMessageOwner = async () => {
    try {
      const ownerId = typeof pg.owner === 'object' ? pg.owner._id || pg.owner.id : pg.owner;
      if (!ownerId) {
        setError("Owner information not available");
        return;
      }
      const conv = await getOrCreateConversation(ownerId);
      navigate('/chat', { state: { conversationId: conv._id } });
    } catch (err) {
      setError(getApiError(err, "Failed to start conversation"));
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="aspect-[16/9] bg-stone-100 flex items-center justify-center p-2">
        {image ? (
          <img src={image} alt={pg.name} className="h-full w-full object-contain rounded-md" />
        ) : (
          <div className="flex h-full items-center justify-center bg-mint text-sm font-medium text-moss">No image</div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">{pg.name}</h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-stone-600">
              <MapPin className="h-4 w-4" />
              {pg.location || pg.address || "Location not listed"}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md bg-mint px-2 py-1 text-sm font-semibold text-ink">
            <Star className="h-4 w-4 fill-moss text-moss" />
            {pg.rating || 0}
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600 flex-1">{pg.description}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-md bg-stone-50 p-2">
            <div className="text-xs text-stone-500">Rent</div>
            <div className="font-bold text-ink">{formatCurrency(pg.rent)}</div>
          </div>
          <div className="rounded-md bg-stone-50 p-2">
            <div className="text-xs text-stone-500">Room</div>
            <div className="font-bold capitalize text-ink">{pg.roomType || pg.roomtype}</div>
          </div>
          <div className="rounded-md bg-stone-50 p-2">
            <div className="text-xs text-stone-500">Available</div>
            <div className="font-bold text-ink">{pg.available}</div>
          </div>
        </div>

        {pg.amenities?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {pg.amenities.slice(0, 4).map((amenity) => (
              <span key={amenity} className="rounded-md bg-mint px-2 py-1 text-xs font-medium text-moss">
                {amenity}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            className="field"
            type="date"
            value={moveInDate}
            onChange={(event) => setMoveInDate(event.target.value)}
            aria-label="Move in date"
          />
          <Button onClick={submitBooking} disabled={!moveInDate || booking || pg.available <= 0}>
            <CalendarPlus className="h-4 w-4" />
            Book
          </Button>
        </div>
        
        {user && (
          <div className="mt-2">
            <Button onClick={handleMessageOwner} variant="outline" className="w-full justify-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Owner
            </Button>
          </div>
        )}

        {message ? <p className="mt-3 text-sm font-medium text-green-700">{message}</p> : null}
        {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
      </div>
    </Card>
  );
};

