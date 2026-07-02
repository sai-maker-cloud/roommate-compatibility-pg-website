import mongoose from 'mongoose';


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profile:{
        sleepTime:Number,
    wakeTime:Number,
    cleanliness:Number,

    studyStyle:String,

    food:String,

    smoking:Boolean,

    drinking:Boolean,

    budget:Number,

    locality:String,

    latitude:Number,

    longitude:Number,

    personality:String
    },
    vector:[Number],
    role: {
        type: String,
        enum: ['student', 'owner'],
        default: 'student'
    }
},{    timestamps:true
});

export default mongoose.model('User',userSchema);