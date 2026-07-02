import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const createToken=(id)=>{

return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"7d"});

};


export const register =
async(req,res)=>{

try{


const {
name,
email,
password,
role
}=req.body;



const exists =
await User.findOne({
email
});


if(exists)
{
return res.status(400)
.json({
message:"User already exists"
});
}



const hash =
await bcrypt.hash(
password,
10
);



const user =
await User.create({

name,

email,

password:hash,

role: role || 'student'

});



const token =
createToken(user._id);



res.status(201).json({

token,

user:{
id:user._id,
name:user.name,
email:user.email,
role:user.role
}

});



}
catch(error){

res.status(500)
.json({
message:error.message
});

}

};


export const login =
async(req,res)=>{


try{


const {
email,
password
}=req.body;



const user =
await User.findOne({
email
});



if(!user)
return res.status(404)
.json({
message:"User not found"
});



const match =
await bcrypt.compare(
password,
user.password
);



if(!match)
return res.status(401)
.json({
message:"Wrong password"
});




const token =
createToken(user._id);



res.json({

token,

user:{
id:user._id,
name:user.name,
role:user.role
}

});


}
catch(error){

res.status(500)
.json({
message:error.message
});

}

};
export const getMe =
async(req,res)=>{


const user =
await User.findById(req.user)
.select("-password");



res.json(user);


};