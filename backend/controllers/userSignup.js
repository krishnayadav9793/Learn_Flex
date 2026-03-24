import { sql } from '../util/neonConnect.js';
import bcrypt from 'bcrypt';
import { getToken } from "../util/generateToken.js";

const userSignUp = async (req, res) => {

  try {
    const { name, email, password } = req.body;

    console.log(name, email, password);

    const exists = await sql `
      SELECT * FROM "User"
      WHERE email = ${email}
    `;

    if (exists.length > 0) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await sql`
      INSERT INTO "User" ("email","password","name") 
      VALUES (${email}, ${hashedPassword}, ${name})
      RETURNING *
    `;

    const newUser = user[0];
    
    // Initialize the profile stats for the new user
    await sql`
      INSERT INTO "User_Profile" ("User_id", total_solved, rating)
      VALUES (${newUser.id}, 0, 0)
    `;

    console.log("Created user:", newUser.email);
    const token = getToken(newUser.email);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      name: newUser.name,
      email: newUser.email
    });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

}

export default userSignUp;