const { boolean, number } = require("joi");
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  private: { type: Boolean, default: false },
  about: { type: String },
  petName: String,
  city: { type: String },
  dob: { type: Date },
  favFootballer: String,
  favGamer: String,
  favSports: String,
  favSinger: String,
  education: String,
  msForStalker: String,
  ziodicSign: String,
  relationShipStatus: String,

  likes: [{ userId: { type: String, ref: "Users" } }],
  views: [{ userId: { type: String, ref: "Users" } }],

  beautyRatings: {
    type: Number,
    default: 0,
  },
  numOfViews: {
    type: Number,
    default: 0,
  },
  numOfLikes: {
    type: Number,
    default: 0,
  },
  numOfComments: {
    type: Number,
    default: 0,
  },
  user: {
    type: String,
    ref: "Users",
    required: true,
  },
});

module.exports = mongoose.model("Profile", profileSchema);
