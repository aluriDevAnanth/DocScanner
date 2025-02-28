import express from "express";
import db from "../db/db.js";

const router = express.Router();

router.get("/profile", (req, res) => {
  let user = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(req.query.username);

  delete user.passwordHash;
  delete user.id;
  delete user.created_at;

  res.json({ sucess: true, data: { user } });
});

export default router;
