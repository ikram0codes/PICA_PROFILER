const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  photoPath: { type: String, required: true },
  caption: { type: String, required: true },
  username: {
    type: String,
    required: true,
  },
  likes: [
    {
      userId: { type: mongoose.SchemaTypes.ObjectId, ref: "Users" },
      username: { type: String },
    },
  ],
  userPhoto: { type: String },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "Users", required: true },
  creteadAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Posts", postSchema);
