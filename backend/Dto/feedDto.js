class feedDTO {
  constructor(post) {
    this._id = post._id;
    this.username = post.username;
    this.caption = post.caption;
    this.createdAt = post.creteadAt;
    this.photoPath = post.photoPath;
    this.numOfLikes = post.numOfLikes;
    this.likes = post.likes;
  }
}

module.exports = feedDTO;
