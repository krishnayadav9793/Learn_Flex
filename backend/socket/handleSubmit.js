import { rooms } from "./storeSocket.js";

export function handleSubmit(io, socket, data) {

    const roomID = data.roomId;
   
    if (!rooms[roomID]) return;

    
    if (!rooms[roomID].result) {
        rooms[roomID].result = {};
    }

    
    rooms[roomID].result[socket.id] = data.result;

    const players = rooms[roomID].players;

    const oppo =
        players[0].socketId === socket.id
            ? players[1].socketId
            : players[0].socketId;

    const opponentResult = rooms[roomID].result[oppo];

    
    if (!opponentResult || opponentResult.length === 0) {
        io.to(socket.id).emit("result", {
            msg: "Waiting for Opponent"
        });
    } else {
        io.to(roomID).emit("result", {
            msg: "success",
            result: rooms[roomID].result
        });
    }
}