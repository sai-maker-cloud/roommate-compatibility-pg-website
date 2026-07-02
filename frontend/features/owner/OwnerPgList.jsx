import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Edit, MapPin, Plus, Minus, Trash2 } from "lucide-react";
import { getPGsByOwner, deletePg, updateRooms } from "../../api/pg.js";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";
import { EmptyState } from "../../components/ui/EmptyState.jsx";
import { formatCurrency } from "../../utils/formatters.js";

export const OwnerPgList = () => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadPgs = async () => {
    try {
      const data = await getPGsByOwner(user.id || user._id);
      setPgs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadPgs();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this PG? This action cannot be undone.")) {
      try {
        await deletePg(id);
        setPgs(pgs.filter(pg => pg.id !== id && pg._id !== id));
      } catch (err) {
        alert("Failed to delete PG");
      }
    }
  };

  const handleUpdateRooms = async (id, newAvailable) => {
    try {
      await updateRooms(id, newAvailable);
      setPgs(pgs.map(pg => (pg.id === id || pg._id === id) ? { ...pg, available: newAvailable } : pg));
    } catch (err) {
      alert("Failed to update rooms");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Properties</h1>
          <p className="text-slate-600 mt-1">Manage your PG listings</p>
        </div>
        <Link to="/owner/pgs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New PG
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      ) : pgs.length === 0 ? (
        <EmptyState 
          icon={Building2} 
          title="No properties listed" 
          body="You haven't added any PG listings yet."
        />
      ) : (
        <div className="grid gap-6">
          {pgs.map((pg) => (
            <Card key={pg.id || pg._id} className="p-0 overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-64 h-48 md:h-auto bg-stone-100 shrink-0 relative flex items-center justify-center p-2">
                {pg.images?.[0] ? (
                  <img src={pg.images[0]} alt={pg.name} className="w-full h-full object-contain rounded-md" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <Building2 className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur p-1 rounded-md text-xs font-bold shadow-sm flex items-center gap-1.5 border border-stone-200">
                  <button 
                    onClick={() => handleUpdateRooms(pg.id || pg._id, Math.max(0, pg.available - 1))} 
                    className="p-1 hover:bg-stone-200 rounded text-stone-600 transition-colors disabled:opacity-50"
                    disabled={pg.available <= 0}
                    title="Remove room"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className={`min-w-[40px] text-center ${pg.available > 0 ? "text-teal-600" : "text-red-600"}`}>
                    {pg.available} Left
                  </span>
                  <button 
                    onClick={() => handleUpdateRooms(pg.id || pg._id, pg.available + 1)} 
                    className="p-1 hover:bg-stone-200 rounded text-stone-600 transition-colors"
                    title="Add room"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{pg.name}</h2>
                      <p className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        {pg.address || pg.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-teal-600">{formatCurrency(pg.rent)}</p>
                      <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">/ month</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {pg.amenities?.slice(0,5).map(am => (
                      <span key={am} className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium">
                        {am}
                      </span>
                    ))}
                    {pg.amenities?.length > 5 && (
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-medium">
                        +{pg.amenities.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-transparent" onClick={() => handleDelete(pg.id || pg._id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete PG
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
