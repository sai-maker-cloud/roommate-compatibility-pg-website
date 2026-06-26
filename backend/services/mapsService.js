import axios from "axios";



export const calculateDistance =
async(
lat1,
lng1,
lat2,
lng2
)=>{


try{


const response =
await axios.get(

"https://maps.googleapis.com/maps/api/distancematrix/json",

{

params:{

origins:
`${lat1},${lng1}`,

destinations:
`${lat2},${lng2}`,

key:
process.env.GOOGLE_MAP_KEY

}

}

);




const distance =

response.data
.rows[0]
.elements[0]
.distance
.value;





return distance / 1000;



}
catch(error){

console.log(error);

return 999;

}


};