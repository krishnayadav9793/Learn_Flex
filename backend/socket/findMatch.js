import { queue } from "./storeSocket.js";
import { generateRoomId } from "../util/generateRoom.js";

export function findMatch(io, socket, userData){
    console.log(userData)
    if(!queue.has(userData.exam_id)){
        queue.set(userData.exam_id,[{socket,userData}])
    }else{
        queue.get(userData.exam_id).push({socket,userData});
    }
    console.log(queue)
    if(queue.get(userData.exam_id).length>=2){
        const p1=queue.get(userData.exam_id).shift();
        const p2=queue.get(userData.exam_id).shift();
        console.log(p1,p2);
        generateRoomId(io,p1,p2);
    }
}