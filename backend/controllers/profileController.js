const Joi = require("joi");
const Profile = require("../models/profile.js");
const commentOnProfile = require("../models/profileComments.js");
const ErrorHandler = require("../middlewares/ErrorHandler");
const fs = require("fs");
const User = require("../models/userModel.js");
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const profileController = {
  //Create A Profile
  async createProfile(req, res, next) {
    try {
      const createProfileSchema = Joi.object({
        photo: Joi.string(),
        about: Joi.string().min(10).max(300),
        city: Joi.string().max(25),
        dob: Joi.date(),
        favFootballer: Joi.string().max(25),
        relationShipStatus: Joi.string().max(25),
        favGame: Joi.string().max(25),
        favSports: Joi.string().max(25),
        favSinger: Joi.string().max(25),
        msfForStalkers: Joi.string().max(25),
        education: Joi.string().max(25),
        ziodicSign: Joi.string().max(25),
      });

      const { error } = createProfileSchema.validate(req.body);

      if (error) {
        return next(new ErrorHandler(error.message, 401));
      }

      const {
        photo,
        about,
        city,
        dob,
        favFootballer,
        favGame,
        favSports,
        favSinger,
        relationShipStatus,
        msfForStalkers,
        education,
        ziodicSign,
      } = req.body;

      let profile = await Profile.findOne({ user: req.user._id });
      if (profile) {
        return next(
          new ErrorHandler(
            "Profile Already Created, If You Want To Make The Changes To Your Profile Go To Update Page",
            409
          )
        );
      }

      profile = await Profile.create({
        about,
        city,
        dob,
        favFootballer,
        favGame,
        favSports,
        favSinger,
        relationShipStatus,
        msfForStalkers,
        education,
        ziodicSign,
        user: req.user._id,
      });
      res.status(200).json({ profile: profile });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },

  //Update Profile

  async updateProfile(req, res, next) {
    try {
      const updateProfileSchema = Joi.object({
        about: Joi.string().min(10).max(300).required(),
        city: Joi.string().max(25).required(),
        dob: Joi.date().required(),
        favFootballer: Joi.string().max(25),
        relationShipStatus: Joi.string().max(25),
        favGame: Joi.string().max(25),
        favSports: Joi.string().max(25),
        favSinger: Joi.string().max(25),
        msfForStalkers: Joi.string().max(25),
        education: Joi.string().max(25),
        ziodicSign: Joi.string().max(25),
      });
      const { error } = updateProfileSchema.validate(req.body);
      if (error) {
        return next(new ErrorHandler(error.message, 401));
      }
      let profile = await Profile.findOne({ user: req.user.id });
      if (!profile) {
        return next(
          new ErrorHandler(
            "Profile Does Not Exists, Create A Profile To Update It",
            409
          )
        );
      }
      const {
        about,
        city,
        dob,
        favFootballer,
        favGame,
        favSports,
        favSinger,
        relationShipStatus,
        msfForStalkers,
        education,
        ziodicSign,
      } = req.body;

      profile = await Profile.updateOne(
        { user: req.user.id },
        {
          $set: {
            about,
            city,
            dob,
            favFootballer,
            favGame,
            favSports,
            favSinger,
            relationShipStatus,
            msfForStalkers,
            education,
            ziodicSign,
          },
        }
      );
      res.status(200).json({
        message: "Profile Updated",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },
  //Like A Profile
  async likeProfile(req, res, next) {
    let profile;
    try {
      profile = await Profile.findOne({ _id: req.params.id }).populate("user");
      let liked = profile.likes.find(
        (like) => like.userId.toString() === req.user.id
      );
      if (liked) {
        await Profile.updateOne(
          { _id: req.params.id },
          {
            $pull: { likes: { userId: req.user.id } },
          }
        );

        let profileU = await Profile.findOne({ _id: req.params.id });
        await Profile.updateOne(
          { _id: req.params.id },
          { $set: { numOfLikes: profileU.likes.length } }
        ).populate("user");
        return res.status(200).json({
          message: `You Unliked ${profile.user.username}'s Profile`,
        });
      }

      await Profile.updateOne(
        { _id: req.params.id },
        {
          $push: { likes: { userId: req.user.id } },
        }
      );

      let profileU = await Profile.findOne({ _id: req.params.id });

      await Profile.updateOne(
        { _id: req.params.id },
        { $set: { numOfLikes: profileU.likes.length } }
      );
      await User.updateOne(
        { _id: profile.user },
        {
          $push: {
            notifications: {
              message: `${req.user.username} liked your profile`,
            },
          },
        }
      );
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
    res.status(200).json({
      message: `You Liked ${profile.user.username}'s Profile`,
    });
  },

  //View Profile
  async viewProfile(req, res, next) {
    try {
      await Profile.updateOne(
        { _id: req.params.id },
        {
          $push: { views: { userId: req.user.id } },
        }
      );
      let profile = await Profile.findOne({ _id: req.params.id });
      await Profile.updateOne(
        { _id: req.params.id },
        { $set: { numOfViews: profile.views.length } }
      );
      res.status(200).json({ success: true, profile });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },

  //Get Profiler Details

  async getProfileDetails(req, res, next) {
    try {
      let profile = await Profile.findOne({ user: req.user._id });
      if (profile.private === true) {
        let isFollowed = profile.followers.find(
          (fol) => fol.userId.toString() === req.user.id
        );
        if (!isFollowed) {
          return next(
            new ErrorHandler(
              `Follow ${profile.user.username} To See His Profile`
            )
          );
        }
      }
      res.status(200).json({
        profile: profile,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },

  //Get All Profiles

  async getAllProfiles(req, res, next) {
    try {
      let profiles = await Profile.find({ private: true });
      res.status(200).json({
        profiles,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },

  //Get All Friends

  async getAllFriends(req, res, next) {
    try {
      let friendprofiles = await Profile.find({
        "followers.userId": req.user.id,
      });
      res.status(200).json({ friendprofiles });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },

  //Making The Profile Private
  async privateProfie(req, res, next) {
    try {
      let profile = await Profile.findOne({ user: req.user.id });
      profile = await Profile.updateOne(
        { user: req.user.id },
        { $set: { private: !profile.private } }
      );
      res
        .status(200)
        .json({ profile: profile, message: "Your Profile Is Now Public" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },

  //Commment On Profile
  async commentOnProfile(req, res, next) {
    try {
      const commentOnProfileSchema = Joi.object({
        content: Joi.string().min(3).max(100),
      });

      const { error } = commentOnProfileSchema.validate(req.body);
      if (error) {
        return next(new ErrorHandler(error.message, 401));
      }
      let profile = await Profile.findOne({ _id: req.params.id });

      if (!profile) {
        return next(new ErrorHandler("Profile Not Found", 404));
      }
      const { content } = req.body;

      let comment = await commentOnProfile.create({
        profileId: req.params.id,
        userId: req.user.id,
        username: req.user.username,
        content: content,
      });

      await User.updateOne(
        { _id: profile.user },
        {
          $push: {
            notifications: {
              message: `${req.user.username} commented on your profile`,
            },
          },
        }
      );
      res.status(200).json({ comment: comment });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },

  //Get All Profile Comments

  async getAllProfileComments(req, res, next) {
    let comments = await commentOnProfile.find({
      profileId: req.body.profileId,
    });
    if (comments.length === 0) {
      return next(new ErrorHandler("No Comments, Be The First One To Comment"));
    }

    res.status(200).json({ comments: comments });
  },
  //Get Your Own Profile
  async getOwnProfile(req, res, next) {
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return next(new ErrorHandler("Profile Not Created", 401));
    }
    res.status(200).json({
      profile,
    });
  },

  //Delete Comment

  async deleteComment(req, res, next) {
    try {
      await commentOnProfile.deleteOne({
        _id: req.params.id,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
    res.status(200).json({
      message: "Comment Deleted",
    });
  },
};

module.exports = profileController;
