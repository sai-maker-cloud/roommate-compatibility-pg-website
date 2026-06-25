import User from '../models/User.js';

import {calculateDistance} from '../services/mapsService.js';

import {clusterUser} from '../services/mlService.js';

import Recommandation from '../models/Recommandation.js';


export const findMatches=async(req,res)=>{
    const user=await User.findById(req.user);

    await clusterUser(user.vector);

    const users=await User.find({
        _id:{
            $ne:user._id
        }
    });

    let result=[];

    for(const candidate of users){

        let distance=await calculateDistance(
            user.profile.latitude,
            user.profile.longitude,

            candidate.profile.latitude,
            candidate.profile.longitude
        );
        if(distance>15)
            continue;

        let score=0;
        let reason=[];

        if(user.profile.sleepTime===candidate.profile.sleepTime){
            score+=25;
            reason.push("same sleep schedule");
        }
        if(user.profile.food===candidate.profile.food){
            score+=20;
            reason.push("same food preference");
        }
        if(user.profile.cleanliness===candidate.profile.cleanliness){
            score+=20;
            reason.push("same cleanliness");
        }
        score+=35;

        await Recommandation.create({
            user:user._id,
            recommendeduser:candidate._id,
            score,
            reason
        });
        result.push({
            name:candidate.name,
            distance,
            compability:score,
            reason
        });
    }
    res.json(result);
};