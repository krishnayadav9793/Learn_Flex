import { findMatch } from "./findMatch.js";
import { rooms,queue } from "./storeSocket.js";
export function initIO(io) {
    io.on("connection", socket => {
        console.log(`connected : ${socket.id}`)
        socket.on("find_match", (data) => {
            const fullData = { ...data, socketId: socket.id }
            findMatch(io, socket, fullData)
        });
        socket.on("submit", (data) => {

        })
        // socket.emit("match_found",)
        socket.on("disconnect", () => {
            console.log("❌ Disconnected:", socket.id);
            for (const [examId, arr] of queue.entries()) {
                const filtered = arr.filter(p => p.socket.id !== socket.id);
                queue.set(examId, filtered);
            }
            for (const roomId in rooms) {
                const room = rooms[roomId];

                const playerIndex = room.players.findIndex(
                    p => p.socketId === socket.id
                );

                if (playerIndex !== -1) {
                    console.log(`⚠️ Player left room: ${roomId}`);
                    const opponent = room.players.find(
                        p => p.socketId !== socket.id
                    );

                    if (opponent) {
                        io.to(opponent.socketId).emit("opponent_left", {
                            message: "Opponent disconnected"
                        });
                    }
                    delete rooms[roomId];
                    break;
                }
            }
        });
    })
}