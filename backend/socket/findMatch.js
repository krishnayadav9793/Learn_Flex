import { queue, players } from "./storeSocket.js";
import { generateRoomId } from "../util/generateRoom.js";

export function findMatch(io, socket, userData) {
    // console.log(userData)
    players.set(socket.id, userData)
    const exam_id = userData.exam_id;
    if (!queue.has(exam_id)) {
        queue.set(exam_id, [{ socket, userData }])
    } else {
        queue.get(exam_id).push({ socket, userData });
    }
    const q = queue.get(exam_id);

    if (q && q.length >= 2) {
        const [p1, p2] = q.splice(0, 2);

        generateRoomId(io, p1, p2, exam_id, socket);
    }
}