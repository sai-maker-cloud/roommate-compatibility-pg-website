import mongoose from 'mongoose';

const matchSchema=new mongoose.Schema({
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'

    }],

    score:{
        type:Number,
        default:0
    },

    status:{
        type:String,
        enum:['pending','matched','rejected'],
        default:'pending'
    },

    reqby:{

        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    viewat:{
        type:Date,
        default:Date.now
    }
});
export default mongoose.model('Match',matchSchema);