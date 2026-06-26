import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect=async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try{
            token=req.headers.authorization.split(" ")[1];

            const decode=jwt.verify(token,process.env.JWT_SECRET);

            const user=await User.findById(decode.id).select("-password");

            if(!user){
                return res.status(401).json({message:"user is not found"});
            }
            req.user=user._id;

            next();

        }
        catch(err){
          return  res.status(401).json({message:"invalid token"});
        }
    }
    else{
        return res.status(401).json({message:"token is not provided"});
    }
    
}
export default protect;