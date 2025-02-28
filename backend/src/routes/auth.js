import { Router } from "express";
import crypto from "node:crypto";
import Auth from "../db/db.js";
import * as jwt from "../utils/jwt.js";
import { log } from "node:console";

const router = Router();

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

router.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        sucess: true,
        message: "Username, password, and role are required",
      });
    }

    if (role !== "user" && role !== "admin") {
      return res.status(400).json({ sucess: false, message: "Invalid role" });
    }

    const userExists = await Auth.prepare(
      "SELECT * FROM users WHERE username = ?"
    ).get(username);

    if (userExists) {
      return res
        .status(400)
        .json({ sucess: false, message: "Username already exists" });
    }

    const passwordHash = hashPassword(password);

    Auth.prepare(
      "INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)"
    ).run(username, passwordHash, role);

    let user = Auth.prepare("SELECT * FROM users WHERE username = ?").get(
      username
    );

    let token = jwt.generateJWT(
      { username: user.username, role: user.role },
      process.env.TOKEN_SECRET_KEY
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { token },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ sucess: false, message: "Internal server error" });
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ sucess: false, message: "Username and password are required" });
  }

  let q = Auth.prepare("SELECT * FROM users WHERE username = ?").get(username);

  if (!q) {
    return res.status(401).json({ sucess: false, message: "Invalid username" });
  }

  if (q.passwordHash === hashPassword(password)) {
    let token = jwt.generateJWT(
      { username, role: q.role },
      process.env.TOKEN_SECRET_KEY
    );
    res
      .status(200)
      .json({ sucess: true, message: "Login successful", data: { token } });
  } else {
    res.status(401).json({ sucess: false, message: "Invalid password" });
  }
});

router.get("/auth", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  const { username, role } = jwt.verifyJWT(token, process.env.TOKEN_SECRET_KEY);

  let user = Auth.prepare("SELECT * FROM users WHERE username = ?").get(
    username
  );

  if (!user) {
    return res.status(401).json({ sucess: false, message: "Invalid username" });
  }

  delete user.passwordHash;

  res
    .status(200)
    .json({ sucess: true, message: "Login successful", data: { user } });
});

export default router;
