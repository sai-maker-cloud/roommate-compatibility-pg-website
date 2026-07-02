import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['booking_accepted', 'booking_rejected', 'new_booking', 'new_message'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pg' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
