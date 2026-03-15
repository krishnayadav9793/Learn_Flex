import User from "../models/user.js";
import { hasMongoConfig } from "../util/envFlags.js";
import { demoUsers, getPublicUser } from "../util/demoStore.js";

export const getUser = async (req, res) => {
  try {
    const sort = req.query.sort === "questions"
      ? { questions: -1 }
      : { rating: -1 };

    if (!hasMongoConfig()) {
      const key = req.query.sort === "questions" ? "questions" : "rating";
      const users = [...demoUsers]
        .map(getPublicUser)
        .sort((a, b) => (b[key] || 0) - (a[key] || 0))
        .slice(0, 100);
      return res.json(users);
    }

    const users = await User.find({})
      .sort(sort)
      .limit(100);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
