import { useEffect, useState } from "react";
import axios from "axios";
import "./LeaderBoard.css";

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
        {
          withCredentials: true
        }
      );

      setUsers(res.data);
    } catch (err) {
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(sortBy);
  }, [sortBy]);

  return (
    <div className="leaderboard">
      <h2 className="leaderboard__title">Leaderboard</h2>

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
          By Problems Solved
        </button>
      </div>

      {loading && <p className="leaderboard__status">Loading...</p>}
      {error && <p className="leaderboard__status error">{error}</p>}

      {!loading && !error && (
        <table className="leaderboard__table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Rating</th>
              <th>Problems Solved</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.rating}</td>
                <td>{user.questions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}