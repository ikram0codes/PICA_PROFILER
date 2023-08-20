const Joi = require("joi");
const ErrorHandler = require("../middlewares/ErrorHandler.js");
const JWTToken = require("../utils/JWTToken.js");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel.js");
const Token = require("../models/tokens.js");
const userDTO = require("../Dto/userDto.js");
const ApiFeatures = require("../utils/apiFeatures");
const Profile = require("../models/profile.js");
const Post = require("../models/postModel.js");
const nodemailer = require("nodemailer");
const profileComments = require("../models/profileComments.js");
const postComments = require("../models/postComments.js");
const tokens = require("../models/tokens.js");
const postModel = require("../models/postModel.js");
const feedDTO = require("../Dto/feedDto.js");
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const fs = require("fs");
const authController = {
  //Register Controller

  async register(req, res, next) {
    try {
      const registerSchema = Joi.object({
        name: Joi.string().min(4).max(25).required(),
        username: Joi.string().min(4).max(25).required(),
        email: Joi.string().email().required(),
        password: Joi.string()
          .min(8)
          .max(25)
          .pattern(passwordPattern)
          .required(),
        confirmPassword: Joi.string().required(),
      });

      const { error } = registerSchema.validate(req.body);
      if (error) {
        return next(new ErrorHandler(error.message, 401));
      }

      const { name, username, email, password, confirmPassword } = req.body;
      let cusername = await User.findOne({ username });
      let cemail = await User.findOne({ email });

      if (cemail) {
        return next(new ErrorHandler("Email Already Registered", 409));
      }

      if (cusername) {
        return next(new ErrorHandler("Username Already Registered", 409));
      }

      if (password !== confirmPassword) {
        return next(new ErrorHandler("Password Don't Match", 401));
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name: name,
        username: username,
        email: email,
        password: hashedPassword,
      });
      // let mailOptions = {
      //   from: "pica_Profile, Verify You Email , <ikram0pakitan@gmail.com>",
      //   to: "teenxtimes@gmail.com",
      //   subject: "Verify Your Email to User pica_Profile",
      //   html: `<h2>THANKS FOR VERIFYING YOU ACCOUNT</h2>`,
      // };

      // let transport = nodemailer.createTransport({
      //   service: "gmail",
      //   auth: {
      //     type: "OAuth2",
      //     user: "ikram0pakitan@gmail.com",
      //     pass: "khanistan7",
      //     clientId:
      //       "409391744329-i5qj3qfrarl3h7rsfujghak7er6aq2h9.apps.googleusercontent.com",
      //     clientSecret: "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",
      //     refreshToken:
      //       "1//04JVAtyxbNwR0CgYIARAAGAQSNwF-L9IrSDf8yTJKqlyNZHUlSRstF0zKOEj8_2BIYFYS7MOnyTVBlA0ig4AyBhiRectxRosIty4",
      //   },
      //   tls: {
      //     rejectUnauthorized: false,
      //   },
      // });
      // transport.sendMail(mailOptions, function (error, info) {
      //   if (error) {
      //   } else {
      //   }
      // });
      await Profile.create({
        about: "",
        city: "",
        dob: "",
        favFootballer: "",
        favGame: "",
        favSports: "",
        favSinger: "",
        relationShipStatus: "",
        msfForStalkers: "",
        education: "",
        ziodicSign: "",
        user: user._id,
      });
      let accessToken = JWTToken.signAccessToken({ _id: user._id }, "200m");
      let refreshToken = JWTToken.signRefreshToken({ _id: user._id }, "200m");
      await JWTToken.storeRefreshToken(refreshToken, user._id);
      let userDto = new userDTO(user);
      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000 * 180,
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000 * 180,
        })
        .status(201)
        .json({
          user: userDto,
          auth: true,
        });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  },

  //Login Controller

  async login(req, res, next) {
    const loginSchema = Joi.object({
      username: Joi.string().max(25).required(),
      password: Joi.string().max(25).required(),
    });

    const { error } = loginSchema.validate(req.body);
    if (error) {
      return next(new ErrorHandler(error.message, 401));
    }
    const { username, password } = req.body;
    let user = await User.findOne({ username });
    if (!user) {
      return next(new ErrorHandler("Invalid Username or Password"), 400);
    }
    let isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new ErrorHandler("Invalid Username or Password", 400));
    }
    let accessToken = JWTToken.signAccessToken({ _id: user._id }, "200m");
    let refreshToken = JWTToken.signRefreshToken({ _id: user._id }, "200m");

    await Token.updateOne(
      {
        _id: user._id,
      },
      { token: refreshToken },
      { upsert: true }
    );
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000 * 180,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000 * 180,
      })
      .status(200)
      .json({
        user: { user, auth: true },
      });
  },

  //Logout Controller

  async logout(req, res, next) {
    try {
      let { refreshToken } = req.cookies;
      await Token.deleteOne({ token: refreshToken });
    } catch (error) {}
    res
      .clearCookie("accessToken")
      .clearCookie("refreshToken")
      .status(200)
      .json({
        auth: false,
      });
  },

  //Refresh Controller

  async refresh(req, res, next) {
    const originalRefreshToken = req.cookies.refreshToken;

    let id;

    try {
      id = JWTToken.verifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      return next(new ErrorHandler("Unauthorized", 401));
    }

    try {
      const match = Token.findOne({
        _id: id,
        token: originalRefreshToken,
      });

      if (!match) {
        return next(new ErrorHandler("Unauthorized", 401));
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
    try {
      const accessToken = JWTToken.signAccessToken({ _id: id }, "30m");
      const refreshToken = JWTToken.signRefreshToken({ _id: id }, "60m");

      await Token.updateOne({ _id: id }, { token: refreshToken });

      res.cookie("accessToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });

      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
    } catch (e) {
      return next(e);
    }

    const user = await User.findOne({ _id: id });

    return res.status(200).json({ user });
  },

  //Search Controller -- Needs Some Working With it

  async findUsersByName(req, res, next) {
    let users;
    try {
      const apiFeature = new ApiFeatures(User.find(), req.query).search();
      users = await apiFeature.query;
    } catch (error) {
      return next(new ErrorHandler(error.message, 404));
    }

    res.status(200).json({
      users,
    });
  },
  async getAllUsers(req, res, next) {
    let users;
    try {
      users = await User.find();
    } catch (error) {
      return next(new ErrorHandler(error.message, 404));
    }

    res.status(200).json({
      users,
    });
  },

  //Update User Controller

  async updateUser(req, res, next) {
    try {
      const updateUserSchema = Joi.object({
        username: Joi.string().min(4).max(25).required(),
        name: Joi.string().min(4).max(25).required(),
        photo: Joi.string(),
      });

      const { error } = updateUserSchema.validate(req.body);
      if (error) {
        return next(new ErrorHandler(error.message, 401));
      }
      const { username, name, photo } = req.body;
      const buffer = Buffer.from(
        photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );
      const imagePath = `${Date.now()}-${req.user.id}.png`;
      fs.writeFileSync(`storage/Profile/${imagePath}`, buffer);
      await User.updateOne(
        { _id: req.user._id },
        {
          $set: {
            username: username,
            name: name,
            photoPath: `${process.env.BACKEND_SERVER_PATH}/storage/Profile/${imagePath}`,
          },
        }
      );
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
    let user = await User.findOne({ _id: req.user._id });
    let userDto = new userDTO(user);
    res.status(200).json({
      user,
    });
  },

  //Delete User Controller

  async deleteUser(req, res, next) {
    try {
      let user = await User.findOne({ _id: req.user._id });
      if (user) {
        user.deleteOne();
        await tokens.deleteMany({ userId: req.user._id });
      }
      let profile = await Profile.findOne({ user: req.user._id });
      let ProfileComments = await profileComments.find({
        profileId: profile._id,
      });
      if (ProfileComments) {
        await profileComments.deleteMany({
          profileId: profile._id,
        });
      }
      await Profile.deleteOne({ user: req.user._id });
      let post = await Post.findOne({ user: req.user._id });
      let PostComments = await postComments.find({
        profileId: post._id,
      });
      if (PostComments) {
        await postComments.deleteMany({ postId: post._id });
      }
      await Post.deleteMany({ user: req.user._id });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
    res.status(200).json({
      message: "User Deleted",
    });
  },
  async followUser(req, res, next) {
    try {
      const followUserSchema = Joi.object({
        userId: Joi.string().pattern(mongodbIdPattern).required(),
      });

      const { error } = followUserSchema.validate(req.body);
      if (error) {
        return next(new ErrorHandler(error.message, 401));
      }
      const { userId } = req.body;
      let user = await User.findOne({ _id: userId });
      let followed = user.followers.find(
        (follo) => follo.userId.toString() === req.user.id
      );

      if (followed) {
        return next(
          new ErrorHandler(`You Have Already Followed ${user.username}`, 401)
        );
      }

      await User.updateOne(
        { _id: userId },
        {
          $push: {
            followers: { userId: req.user.id, username: req.user.username },
          },
        }
      );
      let userU = await User.findOne({ _id: userId });
      await User.updateOne(
        { _id: userId },
        {
          $set: { numOfFollowers: userU.followers.length },
          $push: {
            notifications: {
              message: `${req.user.username} Started Following You`,
            },
          },
        }
      );
      await User.updateOne(
        { _id: req.user.id },
        {
          $push: {
            following: {
              userId: userId,
              username: user.username,
            },
          },
        }
      );

      let userY = await User.findOne({ _id: req.user.id });
      await User.updateOne(
        { _id: req.user.id },
        { $set: { numOfFollowing: userY.following.length } }
      );
      res.status(200).json({
        message: `You Started Following ${user.username}`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },
  async unfollowUser(req, res, next) {
    try {
      const unfollowUserSchema = Joi.object({
        userId: Joi.string().pattern(mongodbIdPattern).required(),
      });
      const { error } = unfollowUserSchema.validate(req.body);
      if (error) {
        return next(new ErrorHandler(error.message, 401));
      }
      const { userId } = req.body;
      let user = await User.findById(userId);

      await User.updateOne(
        { _id: userId },
        {
          $pull: {
            followers: {
              userId: req.user.id,
              username: req.user.username,
            },
          },
        }
      );
      let userU = await User.findById(userId);
      await User.updateOne(
        { _id: userId },
        { $set: { numOfFollowers: userU.followers.length } }
      );

      const userY = await User.findById(req.user.id);
      await User.updateOne(
        { _id: req.user.id },
        {
          $pull: {
            following: {
              userId: userU._id,
              username: userU.username,
            },
          },
        }
      );
      await User.updateOne(
        { _id: req.user.id },
        { $set: { numOfFollowing: userY.following.length } }
      );
      res.status(200).json({
        message: `You Unfollowd ${user.username}`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },
  async userFeed(req, res, next) {
    //Get alll Users Feed Jin Ke account Private Nahi  Hain
    const feedDto = [];

    let post = await postModel.find();
    for (let i = 0; i < post.length; i++) {
      const dto = new feedDTO(post[i]);
      feedDto.push(dto);
    }
    res.status(200).json({
      feed: feedDto.reverse(),
    });
  },
};

//  Some Working With Search Controller
//  Notfications Controller
//  Saved Posts
// Explore

module.exports = authController;
