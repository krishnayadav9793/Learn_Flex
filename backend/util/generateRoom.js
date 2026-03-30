import { queue, rooms ,players} from "../socket/storeSocket.js";
import { fetch1v1Questions } from "../socket/fetchQuestions.js";
export async function generateRoomId(io, p1, p2,exam_id,socket) {
    const roomId = "room_" + Date.now();
    p1.socket.join(roomId)
    p2.socket.join(roomId)
    const question=await fetch1v1Questions(exam_id)
    // console.log(question)
    rooms[roomId] = {
        players: [p1.userData, p2.userData],
        result:[]
    };
    // const opp=socket.id===p1.userData.socket?p2.userData:p1.userData
    io.to(roomId).emit("match_found", {
        roomId,
        player: p1.userData,
        opponent: p2.userData,
        questions:question
    })
    
}