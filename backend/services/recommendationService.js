export const calculateCompatibility =
(
user,
candidate
)=>{


let score = 0;

let reasons = [];



if(
user.profile.sleepTime ===
candidate.profile.sleepTime
)
{

score += 25;

reasons.push(
"same sleep schedule"
);

}





if(
user.profile.food ===
candidate.profile.food
)
{

score += 20;

reasons.push(
"same food preference"
);

}





if(
user.profile.cleanliness ===
candidate.profile.cleanliness
)
{

score += 20;

reasons.push(
"same cleanliness level"
);

}





if(
user.profile.studyStyle ===
candidate.profile.studyStyle
)
{

score += 15;

reasons.push(
"same study style"
);

}




if(
user.profile.personality ===
candidate.profile.personality
)
{

score += 20;

reasons.push(
"similar personality"
);

}



return {

score,

reasons

};


};