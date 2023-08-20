const express = require("express");
const isAuth = require("../middlewares/isAuth");
const profileController = require("../controllers/profileController");

const profileRouter = express.Router();

//Crud Operations With Profile --- Profile Controller

//Create Profile
profileRouter.post("/create", isAuth, profileController.createProfile);

//Update Profile
profileRouter.put("/update", isAuth, profileController.updateProfile);

//Like Profile
profileRouter.put("/like/:id", isAuth, profileController.likeProfile);

//Add View To Profile
profileRouter.put("/view/:id", isAuth, profileController.viewProfile);

//Get All Profiles
profileRouter.get("/all", isAuth, profileController.getAllProfiles);
//Get All Friend
profileRouter.get("/friends", isAuth, profileController.getAllFriends);
//Private Profile
profileRouter.put("/private", isAuth, profileController.privateProfie);

//Get Profile Details
profileRouter.get("/:id", isAuth, profileController.getProfileDetails);

//Comment On Profile
profileRouter.post("/comment/:id", isAuth, profileController.commentOnProfile);

//Get Your Own Profile
profileRouter.get("/t/me", isAuth, profileController.getOwnProfile);

//Get All Profile Comments
profileRouter.get(
  "/comment/all",
  isAuth,
  profileController.getAllProfileComments
);
//Delete Commnents
profileRouter.delete("/comment/:id", isAuth, profileController.deleteComment);
module.exports = profileRouter;
