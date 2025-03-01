import { Router } from "express";
import crypto from "node:crypto";
import Auth from "../db/db.js";
import * as jwt from "../utils/jwt.js";

const router = Router();

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

router.post("/register", async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      const error = new Error("Username, password, and role are required");
      error.statusCode = 400;
      throw error;
    }

    if (role !== "user" && role !== "admin") {
      const error = new Error("Invalid role");
      error.statusCode = 400;
      throw error;
    }

    const userExists = await Auth.prepare(
      "SELECT * FROM users WHERE username = ?"
    ).get(username);

    if (userExists) {
      const error = new Error("Username already exists");
      error.statusCode = 400;
      throw error;
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
    next(error);
  }
});

router.post("/login", (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      const error = new Error("Username and password are required");
      error.statusCode = 400;
      throw error;
    }

    let q = Auth.prepare("SELECT * FROM users WHERE username = ?").get(
      username
    );

    if (!q) {
      const error = new Error("Invalid username or password");
      error.statusCode = 401;
      throw error;
    }

    if (q.passwordHash === hashPassword(password)) {
      let token = jwt.generateJWT(
        { username, role: q.role },
        process.env.TOKEN_SECRET_KEY
      );
      res
        .status(200)
        .json({ success: true, message: "Login successful", data: { token } });
    } else {
      const error = new Error("Invalid username or password");
      error.statusCode = 401;
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

router.get("/auth", (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      const error = new Error("Authorization token is required");
      error.statusCode = 401;
      throw error;
    }

    const { username, role } = jwt.verifyJWT(
      token,
      process.env.TOKEN_SECRET_KEY
    );

    let user = Auth.prepare("SELECT * FROM users WHERE username = ?").get(
      username
    );

    if (!user) {
      const error = new Error("Invalid username");
      error.statusCode = 401;
      throw error;
    }

    delete user.passwordHash;

    res
      .status(200)
      .json({ success: true, message: "User authenticated", data: { user } });
  } catch (error) {
    next(error);
  }
});

export default router;
