import Message from "../models/Message.js";
import Pg from "../models/Pg.js";

export const addPG=async(req,res)=>{
    try{
        const images=req.files.map(file=>file.path);

        const pg=await Pg.create({
            owner:req.user,
            ...req.body,
            images
        });

        res.json(pg);
    }
    catch(err){
        res.status(500).json({message:err.message});
    }


};

export const getPG=async(req,res)=>{
    try {
        const pg=await Pg.find().populate("owner", "name email");
        res.json(pg);
    } catch(err) {
        res.status(500).json({message:err.message});
    }
}
export const updateRooms=async(req,res)=>{
    try {
        const availableVal = req.body.available !== undefined ? req.body.available : req.body.availableRooms;
        const pg=await Pg.findByIdAndUpdate(req.params.id,{available:availableVal},{new:true});
        res.json(pg);
    } catch(err) {
        res.status(500).json({message:err.message});
    }
};