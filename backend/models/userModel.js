const { ref, date } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  photoPath: { type: String, default: "" },
  name: { type: String, required: true },
  username: {
    type: String,
    required: true,
    unique: [true, "Username Already Registered"],
  },
  email: {
    type: String,
    required: true,
    unique: [true, "Email Already Registered"],
  },
  password: { type: String, required: true },
  confirmPassword: { type: String },
  notifications: [
    {
      message: { type: String, required: true },
      time: { type: Date, default: Date.now },
    },
  ],

  savedPosts: [
    {
      post: { type: Object },
    },
  ],

  followers: [
    {
      userId: { type: String, ref: "Users" },
      username: String,
    },
  ],
  following: [
    {
      userId: {
        type: String,
        ref: "Users",
      },
      username: String,
    },
  ],

  numOfFollowing: {
    type: Number,
    default: 0,
  },

  numOfFollowers: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Users", userSchema);
