const jwt = require("jsonwebtoken");

const Token = require("../models/tokens.js");

class JWTToken {
  // sign access token
  static signAccessToken(payload, expiryTime) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: expiryTime,
    });
  }

  // sign refresh token
  static signRefreshToken(payload, expiryTime) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: expiryTime,
    });
  }

  // verify access token
  static verifyAccessToken(token) {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  }

  // verify refresh token
  static verifyRefreshToken(token) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  }

  // store refresh token
  static async storeRefreshToken(token, userId) {
    try {
      const newToken = new Token({
        token: token,
        userId: userId,
      });

      // store in db
      await newToken.save();
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = JWTToken;
