const ErrorHandler = require("./ErrorHandler");
const JWTToken = require("../utils/JWTToken");
const User = require("../models/userModel");

const isAuth = async (req, res, next) => {
  try {
    const { refreshToken, accessToken } = req.cookies;
    if (refreshToken === "" || accessToken === "") {
      return next(new ErrorHandler("Login First", 401));
    }
    const decoded = JWTToken.verifyRefreshToken(refreshToken);

    req.user = await User.findOne({ _id: decoded._id });
    next();
  } catch (error) {
    return next(new ErrorHandler(error.message, 401));
  }
};
module.exports = isAuth;
