const errorMiddleWare = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  //Duplicate Key Error

  if (err.statusCode == 11000) {
    err.message = "Dupilcate Key Error";
    err.statusCode = 400;
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = errorMiddleWare;
