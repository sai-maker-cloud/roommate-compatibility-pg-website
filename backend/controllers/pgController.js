import Message from "../models/Message.js";
import Pg from "../models/Pg.js";
import Booking from "../models/Booking.js";

export const addPG=async(req,res)=>{
    try{
        const images=req.files.map(file=>file.path);

        const pg=await Pg.create({
            owner:req.user,
            ...req.body,
            images
        });

        res.json(pg);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }


};

export const getPG=async(req,res)=>{
    try {
        const pg=await Pg.find().populate("owner", "name email");
        res.json(pg);
    } catch(err) {
        res.status(500).json({message:err.message});
    }
}
export const getPGsByOwner = async (req, res) => {
    try {
        const pgs = await Pg.find({ owner: req.params.userId }).populate("owner", "name email");
        res.json(pgs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateRooms=async(req,res)=>{
    try {
        const availableVal = req.body.available !== undefined ? req.body.available : req.body.availableRooms;
        const pg=await Pg.findByIdAndUpdate(req.params.id,{available:availableVal},{new:true});
        res.json(pg);
    } catch(err) {
        res.status(500).json({message:err.message});
    }
};

export const updatePg = async (req, res) => {
    try {
        const pg = await Pg.findById(req.params.id);
        if (!pg) return res.status(404).json({ message: 'PG not found' });
        
        if (pg.owner.toString() !== req.user.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updatedPg = await Pg.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPg);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePg = async (req, res) => {
    try {
        const pg = await Pg.findById(req.params.id);
        if (!pg) return res.status(404).json({ message: 'PG not found' });
        
        if (pg.owner.toString() !== req.user.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await Pg.findByIdAndDelete(req.params.id);
        res.json({ message: 'PG deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const pgs = await Pg.find({ owner: req.user });
        const pgIds = pgs.map(pg => pg._id);

        const bookings = await Booking.find({ pg: { $in: pgIds } });
        
        const pendingRequests = bookings.filter(b => b.status === 'pending').length;
        const activeBookings = bookings.filter(b => b.status === 'accepted').length;

        // Calculate some mock revenue based on accepted bookings and pg rent
        let totalRevenue = 0;
        for (const booking of bookings) {
            if (booking.status === 'accepted') {
                const pg = pgs.find(p => p._id.toString() === booking.pg.toString());
                if (pg && pg.rent) {
                    totalRevenue += pg.rent;
                }
            }
        }

        res.json({
            totalPgs: pgs.length,
            activeBookings,
            pendingRequests,
            totalRevenue
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const ratePg = async (req, res) => {
    try {
        const { score } = req.body;
        if (!score || score < 1 || score > 5) {
            return res.status(400).json({ message: 'Valid score (1-5) is required' });
        }

        const pg = await Pg.findById(req.params.id);
        if (!pg) return res.status(404).json({ message: 'PG not found' });

        // Check if user has already rated
        const existingRatingIndex = pg.ratings.findIndex(r => r.user.toString() === req.user.toString());
        if (existingRatingIndex >= 0) {
            pg.ratings[existingRatingIndex].score = score;
        } else {
            pg.ratings.push({ user: req.user, score });
        }

        // Calculate new average
        const totalScore = pg.ratings.reduce((sum, r) => sum + r.score, 0);
        pg.rating = (totalScore / pg.ratings.length).toFixed(1);

        await pg.save();

        res.json(pg);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};