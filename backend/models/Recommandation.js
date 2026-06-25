import mongoose from 'mongoose';

const recomm=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    recommendeduser:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    score:{
        type:Number,
        required:true
    },
    reason:[{
        type:String,
        required:true
    }],
    viewat:{
        type:Date,
        default:Date.now
    }
});
export default mongoose.model('Recommandation',recomm);