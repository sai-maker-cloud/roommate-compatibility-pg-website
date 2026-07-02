import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPG } from "../../api/pg.js";
import { Button } from "../../components/ui/Button.jsx";
import { Card } from "../../components/ui/Card.jsx";

const AMENITIES_LIST = ["WiFi", "AC", "Laundry", "Meals", "Power Backup", "Parking", "Security", "Cleaning"];

export const OwnerPgForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    rent: "",
    deposit: "",
    roomtype: "single",
    gender: "any",
    available: "1",
    description: "",
    amenities: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => {
      const current = prev.amenities;
      if (current.includes(amenity)) {
        return { ...prev, amenities: current.filter(a => a !== amenity) };
      }
      return { ...prev, amenities: [...current, amenity] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addPG(formData);
      navigate("/owner/pgs");
    } catch (err) {
      alert("Failed to add PG");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Add New Property</h1>
      <p className="text-slate-600 mb-8">Fill in the details to list your PG</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b border-slate-100 pb-2">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">PG Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="field" placeholder="e.g. Sunrise PG" />
              </div>
              <div>
                <label className="label">City</label>
                <input required name="city" value={formData.city} onChange={handleChange} className="field" placeholder="e.g. Bangalore" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Full Address</label>
                <input required name="address" value={formData.address} onChange={handleChange} className="field" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b border-slate-100 pb-2">Pricing & Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Monthly Rent (₹)</label>
                <input required type="number" name="rent" value={formData.rent} onChange={handleChange} className="field" />
              </div>
              <div>
                <label className="label">Security Deposit (₹)</label>
                <input required type="number" name="deposit" value={formData.deposit} onChange={handleChange} className="field" />
              </div>
              <div>
                <label className="label">Available Rooms</label>
                <input required type="number" min="1" name="available" value={formData.available} onChange={handleChange} className="field" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="label">Room Type</label>
                <select name="roomtype" value={formData.roomtype} onChange={handleChange} className="field">
                  <option value="single">Single Sharing</option>
                  <option value="double">Double Sharing</option>
                  <option value="triple">Triple Sharing</option>
                </select>
              </div>
              <div>
                <label className="label">Preferred Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="field">
                  <option value="any">Any</option>
                  <option value="male">Male Only</option>
                  <option value="female">Female Only</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold border-b border-slate-100 pb-2">Amenities & Details</h2>
            
            <div>
              <label className="label mb-3">Amenities Included</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map(amenity => (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                      formData.amenities.includes(amenity)
                        ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Description & Rules</label>
              <textarea 
                required 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="field min-h-[120px]" 
                placeholder="Describe your PG and any specific rules..."
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/owner/pgs")}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "List Property"}
          </Button>
        </div>
      </form>
    </div>
  );
};
