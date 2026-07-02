import { Building2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiError } from "../../api/client.js";
import { getPGs } from "../../api/pg.js";
import { Button } from "../../components/ui/Button.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { Stat } from "../../components/ui/Stat.jsx";
import { PgCard } from "./PgCard.jsx";

export const PgListPage = () => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPgs(await getPGs());
    } catch (err) {
      setError(getApiError(err, "Could not load PGs"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = query.toLowerCase();
    return pgs.filter((pg) => [pg.name, pg.location, pg.address].join(" ").toLowerCase().includes(term));
  }, [pgs, query]);

  const availableRooms = pgs.reduce((sum, pg) => sum + Number(pg.available || 0), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <section>
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-ink">PG Listings</h1>
            <p className="mt-2 text-sm text-stone-600">Browse rooms, request bookings, and keep listings updated.</p>
          </div>
          <Button variant="secondary" onClick={load}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <Stat label="Listings" value={pgs.length} />
          <Stat label="Available Rooms" value={availableRooms} />
          <Stat label="Visible" value={filtered.length} />
        </div>

        <input className="field mb-5" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by PG, location, or address" />

        {error ? <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
        {loading ? <div className="rounded-lg bg-white p-8 text-center text-sm text-stone-600">Loading PGs...</div> : null}

        {!loading && filtered.length === 0 ? (
          <EmptyState icon={Building2} title="No PG listings found" body="Add a PG or adjust the current search." />
        ) : null}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pg) => (
            <PgCard key={pg.id} pg={pg} onBooked={load} />
          ))}
        </div>
      </section>
    </div>
  );
};
