import mongoose from 'mongoose';

const msgSchema=new mongoose.Schema({
    match:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Match'
    },

    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    msg:{
        type:String,
        required:true
    },
    viewat:{
        type:Date,
        default:Date.now
    }

});
export default mongoose.model('Message',msgSchema);