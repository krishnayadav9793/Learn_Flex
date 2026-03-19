import { useEffect, useState } from "react";
import axios from "axios";
import "./LeaderBoard.css";

const MOCK_DATA = [
  { _id: "1", name: "Alex Rivera", rating: 2850, questions: 452 },
  { _id: "2", name: "Sarah Chen", rating: 2720, questions: 398 },
  { _id: "3", name: "Jordan Smith", rating: 2610, questions: 512 },
  { _id: "4", name: "Elena Rodriguez", rating: 2550, questions: 310 },
  { _id: "5", name: "Sam Wilson", rating: 2400, questions: 280 },
];

export default function LeaderBoard() {
  const [users, setUsers] = useState([]);
  const [sortBy, setSortBy] = useState("rating");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = async (sort) => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `http://localhost:3000/api/leaderboard?sort=${sort}`,
        { withCredentials: true }
      );
      setUsers(res.data);
    } catch (err) {
      console.warn("API not found, using mock data instead.");
      // Sort mock data based on the current selection
      const sortedMock = [...MOCK_DATA].sort((a, b) => b[sort] - a[sort]);
      setUsers(sortedMock);
      // Optional: Set a silent error or a toast if you want to notify the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(sortBy);
  }, [sortBy]);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <header className="leaderboard__header">
          <h2 className="leaderboard__title">Global Leaderboard</h2>
          <p className="leaderboard__subtitle">Top performers based on skill and consistency</p>
          
          <div className="leaderboard__controls">
            <button
              className={`leaderboard__btn ${sortBy === "rating" ? "active" : ""}`}
              onClick={() => setSortBy("rating")}
            >
              By Rating
            </button>
            <button
              className={`leaderboard__btn ${sortBy === "questions" ? "active" : ""}`}
              onClick={() => setSortBy("questions")}
            >
              By Problems
            </button>
          </div>
        </header>

        {loading ? (
          <div className="leaderboard__status">
            <div className="spinner"></div>
            <p>Fetching rankings...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="leaderboard__table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Rating</th>
                  <th>Solved</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id} className={`rank-${index + 1}`}>
                    <td>
                      <span className="rank-badge">{index + 1}</span>
                    </td>
                    <td className="user-name">{user.name}</td>
                    <td className="user-rating">{user.rating.toLocaleString()}</td>
                    <td className="user-questions">{user.questions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}