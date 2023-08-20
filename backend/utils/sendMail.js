const { model } = require("mongoose");
const nodemailer = require("nodemailer");
const ErrorHandler = require("../middlewares/ErrorHandler");

module.exports = sendMail;
