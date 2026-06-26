import axios from "axios";



export const clusterUser =
async(vector)=>{


try{


        const response = await axios.post(
            `${process.env.ML_SERVICE_URL || 'http://localhost:8000'}/cluster`,
            {
                vector
            }
        );



return response.data;



}
catch(error){

console.log(error);

return null;

}

};