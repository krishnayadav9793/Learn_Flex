import React from 'react'
import socket from '../../socket.js'
import { useEffect } from 'react'
function CompitationPage() {
    useEffect(() => {
        const examId= localStorage.getItem("examId");
        socket.emit("find_match", { "exam_id": examId })
        socket.on("match_found", (data) => {
            console.log("Match Found:", data);
        });
        
        return () => {
            socket.off("match_found");
        };
    }, [])

    return (
        <div>

        </div>
    )
}

export default CompitationPage
