import express from "express";
import AuthRou from "./routes/auth.js";
import UserRou from "./routes/user.js";
import ScanRou from "./routes/scan.js";
import CreditsRou from "./routes/credits.js";
import errorHandler from "./middleware/errorHandler.js";
import cors from "cors";
import dotenv from "dotenv";
import "./db/migrations.js";
dotenv.config();

const app = express();
app.use(cors());

const port = 3000;

app.use(express.json());
app.use("/auth/", AuthRou);
app.use("/user/", UserRou);
app.use("/", ScanRou);
app.use("/credits/", CreditsRou);

app.get("/api/", (req, res) => {
  res.json({ success: true, msg: "Hello World!" });
});

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
