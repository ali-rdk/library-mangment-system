import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import appRootPath from "app-root-path";
import cookieParser from "cookie-parser";
import { AuthRoutes } from "./routes/auth/index.mjs";
import { tokenValidate } from "./middleware/validate.mjs";

dotenv.config({ path: appRootPath.resolve("/.env") });

mongoose
  .connect(process.env.DB_URL, { dbName: "LibraryDB" })
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth/", AuthRoutes);

app.get("/test", tokenValidate, (req, res) => {
  res.json({ msg: req.user });
});

app.listen(process.env.PORT, () => {
  console.log(`app is running on port ${process.env.PORT}`);
});
