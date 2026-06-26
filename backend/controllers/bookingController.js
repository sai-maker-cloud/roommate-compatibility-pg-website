import Booking from "../models/Booking.js";

import Pg from "../models/Pg.js";

export const bookPG = async(req,res)=>{
    try {
        const { pgId, moveInDate } = req.body;

        const pg = await Pg.findById(pgId);
        if (!pg) {
            return res.status(404).json({ message: "PG not found" });
        }

        if (pg.available <= 0) {
            return res.status(400).json({ message: "No rooms available" });
        }

        const booking = await Booking.create({
            student: req.user,
            pg: pgId,
            moveindate: moveInDate
        });

        pg.available--;
        await pg.save();

        res.json({
            message: "Booking requested",
            booking
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const acceptBooking = async(req,res)=>{
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: "accepted" },
            { new: true }
        );
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const ownerBookings = async(req,res)=>{
    try {
        const pgs = await Pg.find({ owner: req.user });
        const pgIds = pgs.map(pg => pg._id);

        const bookings = await Booking.find({ pg: { $in: pgIds } })
            .populate("student")
            .populate("pg");

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};