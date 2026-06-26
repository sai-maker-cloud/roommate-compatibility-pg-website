import User from '../models/User.js';

const createVector=(p)=>{
    const wakeVal = p.wakeTime !== undefined ? p.wakeTime : (p.wakeupTime !== undefined ? p.wakeupTime : 8);
    const studyVal = p.studyStyle !== undefined ? p.studyStyle : p.studyType;
    return[
        (p.sleepTime || 0)/24,
        wakeVal/24,
        (p.cleanliness || 0)/5,
        studyVal==='silent' || studyVal==='slient'?1:0,
        p.food==='veg'?1:0,
        p.smoking?1:0,
        p.drinking?1:0,
        p.personality==='introvert'?1:0

    ]
}

export const saveProfile=async(req,res)=>{
    try{
        const vector=createVector(req.body);

        const user = await User.findByIdAndUpdate(
            req.user,
            {
                profile:req.body,
                vector
            },
            {
                new:true
            }
        );

        res.json(user);

    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}