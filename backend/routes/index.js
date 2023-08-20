const express = require("express");
const authController = require("../controllers/authController");
const isAuth = require("../middlewares/isAuth");

const userRouter = express.Router();

//User Routes ---

//Login
userRouter.post("/login", authController.login);

//Register
userRouter.post("/register", authController.register);

//Logout
userRouter.get("/logout", isAuth, authController.logout);

//Refresh
userRouter.get("/refresh", authController.refresh);

//Upadte User
userRouter.put("/update", isAuth, authController.updateUser);

//Follow a User
userRouter.put("/follow", isAuth, authController.followUser);

//UnFollow User

userRouter.put("/unfollow", isAuth, authController.unfollowUser);

// Delete User
userRouter.delete("/delete", isAuth, authController.deleteUser);

//Get All Use
userRouter.get("/all", isAuth, authController.getAllUsers);

//Search User
userRouter.get("/find", isAuth, authController.findUsersByName);

// Get User Feed
userRouter.get("/feed", isAuth, authController.userFeed);
module.exports = userRouter;
