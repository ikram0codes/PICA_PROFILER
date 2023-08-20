const Joi = require("joi");
const ErrorHandler = require("../middlewares/ErrorHandler.js");
const fs = require("fs");
const User = require("../models/userModel.js");
const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;
const postComments = require("../models/postComments.js");
const Post = require("../models/postModel.js");
const profile = require("../models/profile.js");
const postController = {
  //Create Post Controller

  async createPost(req, res, next) {
    try {
      const createPostSchema = Joi.object({
        photo: Joi.string().required(),
        caption: Joi.string().min(3).max(200).required(),
      });
      const { error } = createPostSchema.validate(req.body);
      if (error) {
        return next(new ErrorHandler(error.message, 401));
      }
      const { photo, caption } = req.body;
      let buffer = Buffer.from(
        photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );
      const imagePath = `${Date.now()}-${req.user.id}.png`;
      fs.writeFileSync(`storage/posts/${imagePath}`, buffer);
      let post = await Post.create({
        photoPath: `${process.env.BACKEND_SERVER_PATH}/storage/posts/${imagePath}`,
        caption: caption,
        username: req.user.username,
        userPhoto: req.user.photoPath,
        user: req.user.id,
      });

      res.status(200).json({
        message: "Post Created",
        post: post,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },

  // Delete Post

  async deletePost(req, res, next) {
    console.log(req.params.id);
    let post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return next(new ErrorHandler("No Post Found", 401));
    }
    res.status(200).json({ message: "Post Deleted" });
  },

  //Like Post

  async likePost(req, res, next) {
    try {
      let post = await Post.findById(req.body.id).populate("user");
      if (!post) {
        return next(new ErrorHandler("Post Not Found", 401));
      }

      let liked = post.likes.find(
        (lik) => lik.userId.toString() === req.user.id
      );

      if (liked) {
        await Post.updateOne(
          { _id: req.body.id },
          {
            $pull: {
              likes: { userId: req.user.id, username: req.user.username },
            },
          }
        );
        let postU = await Post.findOne({ _id: req.body.id });
        await Post.updateOne(
          { _id: req.body.id },
          { $set: { numOfLikes: postU.likes.length } }
        );
        return res
          .status(200)
          .json({ message: `You unliked ${post.username}'s Post` });
      } else {
        await Post.updateOne(
          { _id: req.body.id },
          {
            $push: {
              likes: { userId: req.user.id, username: req.user.username },
            },
          }
        );

        let postU = await Post.findOne({ _id: req.body.id });
        await Post.updateOne(
          { _id: req.body.id },
          { $set: { numOfLikes: postU.likes.length } }
        );
        await User.updateOne(
          { _id: post.user },
          {
            $push: {
              notifications: {
                message: `${req.user.username} likes your post`,
              },
            },
          }
        );
        res.status(200).json({ message: `You liked ${post.username}'s Post` });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },

  //Comment On Post

  async commentOnPost(req, res, next) {
    try {
      const postCommentSchema = Joi.object({
        content: Joi.string().min(3).max(40),
      });
      const { error } = postCommentSchema.validate(req.body);
      if (error) {
        return next(new ErrorHandler(error.message, 401));
      }
      const post = await Post.findOne({ _id: req.params.id });
      const { content } = req.body;
      let comment = await postComments.create({
        postId: post._id,
        user: req.user.id,
        username: req.user.username,
        content: content,
      });

      await User.updateOne(
        { _id: post.user },
        {
          $push: {
            notifications: {
              message: `${req.user.username} commented on your post`,
            },
          },
        }
      );
      res.status(200).json({ comment: comment });
    } catch (error) {
      return next(new ErrorHandler(error.message, 401));
    }
  },

  //Get Comments By Id

  async getCommentsByPostId(req, res, next) {
    let postcomments = await postComments.find({ postId: req.params.id });
    if (postComments.length === 0) {
      return next(new ErrorHandler("No Comments, Be The Firt To Comment", 200));
    }
    res.status(200).json({ comments: postcomments });
  },

  //Get All Posts

  async getAllPosts(req, res, next) {
    let posts = await Post.find({ username: req.params.username });
    if (posts.length === 0) {
      return next(new ErrorHandler("No Posts Found", 401));
    }
    res.status(200).json({ posts: posts.reverse() });
  },

  //Get post By Id

  async getPostById(req, res, next) {
    let post = await Post.findOne({ _id: req.params.id });
    if (!post) {
      return next(new ErrorHandler("No Post Found", 401));
    }

    res.status(200).json({
      post: post,
    });
  },

  //Delete Comment Controller

  async deleteComment(req, res, next) {
    await postComments.deleteOne({ _id: req.params.id });
    res.status(200).json({
      message: "Comment Deleted",
    });
  },
};

module.exports = postController;
