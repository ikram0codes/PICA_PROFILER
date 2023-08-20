//Exporting Packages
const express = require("express");
const userRouter = require("./routes");
const dotenv = require("dotenv").config();
const errorMiddleware = require("./utils/errorMiddleware.js");
const cookieParser = require("cookie-parser");
const profileRouter = require("./routes/profile");
const postRouter = require("./routes/post");
const cors = require("cors");
const app = express();

//Using Middlewares ---

//Setting Up Cors

app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());
const corsOptions = {
  credentials: true,
  origin: ["http://localhost:3000"],
  optionsSuccessStatus: 200,
  credentials: true,
};
//Using Rotuer Middleware
app.use(cors(corsOptions));

app.use("/user", userRouter);
app.use("/profile", profileRouter);
app.use("/post", postRouter);

app.use("/storage", express.static("storage"));

//Using ErrorMiddleWare
app.use(errorMiddleware);
module.exports = app;
