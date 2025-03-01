import * as jwt from "../utils/jwt.js";
import db from "../db/db.js";

export default function authTokenValidation(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log(authHeader);

    if (!token) {
      const error = new Error(
        "Error in authTokenValidation: Access token is missing or invalid"
      );
      error.statusCode = 401;
      throw error;
    }

    const { username, role } = jwt.verifyJWT(
      token,
      process.env.TOKEN_SECRET_KEY
    );

    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user) {
      const error = new Error("Error in authTokenValidation: Invalid username");
      error.statusCode = 401;
      throw error;
    }

    delete user.passwordHash;

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}
