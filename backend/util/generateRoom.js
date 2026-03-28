import { queue, rooms } from "../socket/storeSocket.js";
export function generateRoomId(io, p1, p2) {
    const roomId = "room_" + Date.now();
    p1.socket.join(roomId)
    p2.socket.join(roomId)
    console.log(roomId)
    rooms[roomId] = {
        players: [p1.userData, p2.userData],
        questionIndex: 0,
    };
    io.to(roomId).emit("match_found", {
        roomId,
        players: rooms[roomId].players,
    })
    console.log(queue)
}