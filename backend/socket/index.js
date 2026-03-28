import { findMatch } from "./findMatch.js";

export function initIO(io) {
    io.on("connection", socket => {
        console.log(`connected : ${socket.id}`)
        socket.on("find_match", (data) => {
            findMatch(io, socket, data)
        });
        // socket.emit("match_found",)
        socket.on("disconnect", () => {
            console.log("❌ Disconnected:", socket.id);
        });
    })
}