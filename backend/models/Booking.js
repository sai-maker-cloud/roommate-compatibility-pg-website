import mongoose from 'mongoose';

const bookingSchema=new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    pg:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Pg',
        required:true
    },
    status:{
        type:String,
        enum:['pending','accepted','rejected','cancelled'],
        default:'pending'
    },
    moveindate:{
        type:Date
    },

    paymentstatus:{
        type:String,
        enum:['unpaid','paid'],
        default:'unpaid'
    }
})
export default mongoose.model('Booking',bookingSchema);