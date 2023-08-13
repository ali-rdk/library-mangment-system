import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import appRootPath from "app-root-path";

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

app.listen(process.env.PORT, () => {
  console.log(`app is running on port ${process.env.PORT}`);
});
