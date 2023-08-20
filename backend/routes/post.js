const express = require("express");
const postController = require("../controllers/postController");
const isAuth = require("../middlewares/isAuth");

const postRouter = express.Router();

//      Post Router ---

// Create Post
postRouter.post("/create", isAuth, postController.createPost);

//Delete Post
postRouter.delete("/delete/:id", postController.deletePost);

//Like Post
postRouter.put("/like", isAuth, postController.likePost);

//Commment On Post
postRouter.post("/comment/:id", isAuth, postController.commentOnPost);

//Get Comments By Post Id
postRouter.get("/comment/:id", isAuth, postController.getCommentsByPostId);

//Delete Comment

postRouter.delete("/comment/:id", isAuth, postController.deleteComment);

//get All Post
postRouter.get("/:username", isAuth, postController.getAllPosts);

//Get Post By Id
postRouter.get("/:id", isAuth, postController.getPostById);
module.exports = postRouter;
