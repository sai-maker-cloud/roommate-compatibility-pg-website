import { Building2, CalendarPlus, MapPin, MessageCircle, RefreshCw, Sparkles, Star, UsersRound, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookPG } from "../../api/bookings.js";
import { getApiError } from "../../api/client.js";
import { getMatches } from "../../api/matches.js";
import { getPGsByOwner } from "../../api/pg.js";
import { getOrCreateConversation } from "../../api/conversations.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { formatCurrency } from "../../utils/formatters.js";

// ─── Mini PG booking card inside the modal ───────────────────────────────────
const MatchPgCard = ({ pg }) => {
  const [moveInDate, setMoveInDate] = useState("");
  const [booking, setBooking] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setMsg(""); setErr(""); setBooking(true);
    try {
      await bookPG({ pgId: pg.id, moveInDate });
      setMsg("Booking requested ✓");
    } catch (e) {
      setErr(getApiError(e, "Booking failed"));
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
      {pg.images?.[0] && (
        <div className="mb-3 h-32 w-full rounded-md bg-stone-100 flex items-center justify-center p-1">
          <img src={pg.images[0]} alt={pg.name} className="h-full w-full object-contain rounded-md" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-ink">{pg.name}</h3>
          <p className="text-xs text-stone-500">{pg.location || pg.address || "Location not listed"}</p>
        </div>
        <div className="flex items-center gap-1 rounded bg-mint px-2 py-1 text-xs font-bold text-moss">
          <Star className="h-3 w-3 fill-moss" />{pg.rating || 0}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded bg-white p-2 text-center shadow-sm">
          <div className="text-stone-400">Rent</div>
          <div className="font-bold text-ink">{formatCurrency(pg.rent)}</div>
        </div>
        <div className="rounded bg-white p-2 text-center shadow-sm">
          <div className="text-stone-400">Type</div>
          <div className="font-bold capitalize text-ink">{pg.roomType || pg.roomtype || "—"}</div>
        </div>
        <div className="rounded bg-white p-2 text-center shadow-sm">
          <div className="text-stone-400">Available</div>
          <div className={`font-bold ${pg.available > 0 ? "text-moss" : "text-red-500"}`}>{pg.available}</div>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs text-stone-500">{pg.description}</p>

      <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
        <input
          className="field text-sm"
          type="date"
          value={moveInDate}
          onChange={(e) => setMoveInDate(e.target.value)}
          aria-label="Move-in date"
        />
        <Button onClick={submit} disabled={!moveInDate || booking || pg.available <= 0}>
          <CalendarPlus className="h-4 w-4" />
          {booking ? "Booking..." : "Book"}
        </Button>
      </div>
      {msg && <p className="mt-2 text-xs font-medium text-green-700">{msg}</p>}
      {err && <p className="mt-2 text-xs font-medium text-red-600">{err}</p>}
    </div>
  );
};

// ─── PG drawer modal ──────────────────────────────────────────────────────────
const PgDrawer = ({ match, onClose }) => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPGsByOwner(match.userId)
      .then(setPgs)
      .catch((e) => setError(getApiError(e, "Could not load PGs")))
      .finally(() => setLoading(false));
  }, [match.userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-ink">PGs listed by {match.name}</h2>
            <p className="text-xs text-stone-500">Pick a room and set a move-in date to book</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-stone-500 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {loading && <p className="text-center text-sm text-stone-500">Loading PGs...</p>}
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          {!loading && pgs.length === 0 && !error && (
            <div className="flex flex-col items-center gap-2 py-8 text-stone-500">
              <Building2 className="h-10 w-10 opacity-30" />
              <p className="text-sm">{match.name} has no PGs listed yet.</p>
            </div>
          )}
          <div className="grid gap-4">
            {pgs.map((pg) => (
              <MatchPgCard key={pg.id} pg={pg} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pgDrawer, setPgDrawer] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setMatches(await getMatches());
    } catch (err) {
      setError(getApiError(err, "Could not load matches"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChat = async (userId) => {
    try {
      const conv = await getOrCreateConversation(userId);
      navigate('/chat', { state: { conversationId: conv._id } });
    } catch (err) {
      setError("Failed to start chat session");
    }
  };

  return (
    <div>
      {pgDrawer && <PgDrawer match={pgDrawer} onClose={() => setPgDrawer(null)} />}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">Roommate Matches</h1>
          <p className="mt-2 text-sm text-stone-600">Matches use your profile, distance, and preference overlap.</p>
        </div>
        <Button variant="secondary" onClick={load}>
          <RefreshCw className="h-4 w-4" />
          Recalculate
        </Button>
      </div>

      {error ? <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {loading ? <div className="rounded-lg bg-white p-8 text-center text-sm text-stone-600">Finding compatible roommates...</div> : null}

      {!loading && matches.length === 0 ? (
        <EmptyState icon={UsersRound} title="No matches yet" body="Save your profile with latitude and longitude, then recalculate matches." />
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {matches.map((match, index) => (
          <Card key={`${match.name}-${index}`} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-ink">{match.name}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-stone-600">
                  <MapPin className="h-4 w-4" />
                  {match.distance != null ? `${Number(match.distance).toFixed(1)} km away` : "Distance unknown"}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-coral text-lg font-black text-white">
                {match.compability ?? match.compatibility}
              </div>
            </div>

            <div className="mt-4 h-2 rounded-full bg-stone-100">
              <div
                className="h-2 rounded-full bg-moss transition-all"
                style={{ width: `${Math.min(match.compability ?? match.compatibility ?? 0, 100)}%` }}
              />
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                <Sparkles className="h-4 w-4 text-coral" />
                Reasons
              </div>
              <div className="flex flex-wrap gap-2">
                {(match.reason || []).map((reason) => (
                  <span key={reason} className="rounded-md bg-mint px-2 py-1 text-xs font-medium text-moss">
                    {reason}
                  </span>
                ))}
              </div>
            </div>

            {match.userId && (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleChat(match.userId)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
                <Button onClick={() => setPgDrawer(match)}>
                  <Building2 className="h-4 w-4" />
                  View PGs
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
