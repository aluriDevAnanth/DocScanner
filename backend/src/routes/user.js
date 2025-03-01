import express from "express";
import db from "../db/db.js";

const router = express.Router();

router.get("/profile", async (req, res) => {
  try {
    let user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(req.query.username);

    if (user) {
      delete user.passwordHash;
      delete user.id;
      delete user.created_at;

      res.json({ success: true, data: { user } });
    } else {
      const error = new Error("User not found");
      error.statusCode = 400;
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

export default router;
