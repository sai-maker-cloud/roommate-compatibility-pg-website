import { Server } from "socket.io";

import Message from "../models/Message.js";



const onlineUsers = new Map();



const initializeSocket = (server)=>{

const io = new Server(server,{
    cors:{
        origin:"*"
    }
});



io.on("connection",(socket)=>{

console.log(
"User Connected:",
socket.id
);






socket.on(
"register",
(userId)=>{

onlineUsers.set(
userId,
socket.id
);

console.log(
`${userId} online`
);

}
);






socket.on(
"sendMessage",
async(data)=>{

try{

const {
sender,
receiver,
text
}=data;



const message =
await Message.create({

sender,
receiver,
msg: text

});



const receiverSocket =
onlineUsers.get(receiver);



if(receiverSocket){

io.to(receiverSocket)
.emit(
"receiveMessage",
message
);

}



}
catch(error){

console.log(error);

}

}
);







socket.on(
"typing",
({receiver})=>{

const receiverSocket =
onlineUsers.get(receiver);

if(receiverSocket){

io.to(receiverSocket)
.emit(
"userTyping"
);

}

}
);








socket.on(
"disconnect",
()=>{

for(
const [userId,socketId]
of onlineUsers
){

if(socketId===socket.id){

onlineUsers.delete(
userId
);

break;

}

}

console.log(
"User disconnected"
);

});

});



return io;

};



export default initializeSocket;