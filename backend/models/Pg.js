import mongoose from 'mongoose';

const pgSchema=new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true

    },
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    address:{
        type:String
    },
    location:{
        type:String
    },
    latitude:{
        type:Number
    },
    longitude:{
        type:Number
    },
    rent:{
        type:Number,
        required:true
    },
    roomtype:{
        type:String,
        enum:['single','double','triple'],
        default:'double'
    },
    sharing:{
        type:Number,
        default:2
    },
    totalrooms:{
        type:Number,
    },
    available:{
        type:Number,
    },
    food:{
        type:String,
        enum:['veg','non-veg','both'],
        default:'both'
    },
    amenities:[{
        type:String
    }],
    images:[{
        type:String
    }],
    rules:[{
        type:String
    }],
    rating:{
        type:Number,
        default:0
    },
    ratings: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number, required: true, min: 1, max: 5 }
    }]

})
export default mongoose.model('Pg',pgSchema);