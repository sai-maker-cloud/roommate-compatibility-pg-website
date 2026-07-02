import Booking from '../models/Booking.js';
import Pg from '../models/Pg.js';
import Notification from '../models/Notification.js';

// Store io reference
let io = null;
export const setBookingIO = (ioInstance) => { io = ioInstance; };

export const bookPG = async (req, res) => {
  try {
    const { pgId, moveInDate } = req.body;

    const pg = await Pg.findById(pgId);
    if (!pg) return res.status(404).json({ message: 'PG not found' });
    if (pg.available <= 0) return res.status(400).json({ message: 'No rooms available' });

    const booking = await Booking.create({
      student: req.user,
      pg: pgId,
      moveindate: moveInDate
    });

    pg.available--;
    await pg.save();

    // Notify PG owner
    const notification = await Notification.create({
      user: pg.owner,
      type: 'new_booking',
      title: 'New Booking Request',
      message: `New booking request for ${pg.name}`,
      data: { bookingId: booking._id, pgId: pg._id, userId: req.user }
    });

    if (io) {
      io.to(pg.owner.toString()).emit('newNotification', notification);
    }

    res.json({ message: 'Booking requested', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const acceptBooking = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingStatus = status || 'accepted';

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: bookingStatus },
      { new: true }
    ).populate('pg');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Notify the student
    const notifType = bookingStatus === 'accepted' ? 'booking_accepted' : 'booking_rejected';
    const notification = await Notification.create({
      user: booking.student,
      type: notifType,
      title: bookingStatus === 'accepted' ? 'Booking Accepted! 🎉' : 'Booking Rejected',
      message: bookingStatus === 'accepted'
        ? `Your booking for ${booking.pg?.name || 'PG'} has been accepted!`
        : `Your booking for ${booking.pg?.name || 'PG'} has been rejected.`,
      data: { bookingId: booking._id, pgId: booking.pg?._id }
    });

    if (io) {
      io.to(booking.student.toString()).emit('newNotification', notification);
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const ownerBookings = async (req, res) => {
  try {
    const pgs = await Pg.find({ owner: req.user }).select('_id');
    const pgIds = pgs.map(pg => pg._id);

    const bookings = await Booking.find({ pg: { $in: pgIds } })
      .populate('student', 'name email profilePic phone gender')
      .populate('pg', 'name address')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user })
      .populate({
        path: 'pg',
        populate: { path: 'owner', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};