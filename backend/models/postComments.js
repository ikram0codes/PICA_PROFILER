const mongoose = require("mongoose");

const postComment = new mongoose.Schema({
  postId: { type: String, ref: "Posts", required: true },
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

module.exports = mongoose.model("postComments", postComment);
