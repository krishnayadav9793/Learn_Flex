import User from "../models/user.js";

export const getUser = async (req, res) => {
  try {
    const sort = req.query.sort === "questions"
      ? { questions: -1 }
      : { rating: -1 };

    const users = await User.find({})
      .sort(sort)
      .limit(100);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};