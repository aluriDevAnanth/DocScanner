import { Router } from "express";
import db from "../db/db.js";
import authTokenValidation from "../middleware/authTokenValidation.js";

const router = Router();

router.post("/request", authTokenValidation, (req, res, next) => {
  try {
    const username = req.user.username;
    const reqCredits = req.body.requested_credits;

    if (!username || !reqCredits) {
      const error = new Error("Missing required fields");
      error.statusCode = 400;
      throw error;
    }

    db.prepare(
      "INSERT INTO credit_requests (username, requested_credits ) VALUES (?, ?)"
    ).run(username, reqCredits);

    const credit_requests = db
      .prepare(`select * from credit_requests where username = ?`)
      .all(username);

    res.json({
      success: true,
      message: "Request for credits sent successfully",
      data: { username, credit_requests },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/get_credit_requests", authTokenValidation, (req, res, next) => {
  try {
    const credit_requests = db
      .prepare(`select * from credit_requests where username = ?`)
      .all(req.user.username);

    return res.status(200).json({
      success: true,
      message: "These are your past requests",
      data: { username: req.user.username, credit_requests },
    });
  } catch (error) {
    next(error);
  }
});

router.put("/eval_credit_request", authTokenValidation, (req, res, next) => {
  try {
    const { evalCR, req_id } = req.body;

    const credit_requests = db
      .prepare(`update credit_requests where id = ? set status = ? `)
      .run(req_id, evalCR);

    const user = null;

    if (evalCR == "approved") {
      user = db
        .prepare(`update users where username = ? set status = status + ? `)
        .run(req.user.username, evalCR);
    }

    return res.status(200).json({
      success: true,
      message: "These are your past requests",
      data: { user, credit_requests },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
