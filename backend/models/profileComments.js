const mongoose = require("mongoose");

const profileComments = new mongoose.Schema({
  profileId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Profile",
    required: true,
  },
  userId: { type: mongoose.SchemaTypes.ObjectId, ref: "Users" },
  username: { type: String, required: true },
  content: { type: String, required: true },
  numOflikes: { type: Number, default: 0 },
  likes: [
    {
      userId: { type: String, required: true },
      username: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("profileComments", profileComments);
