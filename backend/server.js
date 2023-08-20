const app = require("./app");
const dbConnect = require("./data/database");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT;

//Connection DataBase
dbConnect();

//Starting The Server
let server = app.listen(PORT, () => {
  console.log(`Server Is Running On Port:${PORT}`);
});

//Unhandeled Exception Error
process.on("uncaughtException", function (error) {
  console.log(`Error:${error.message}`);
  console.log("Shutting Server Due to Unhandeled Exception");

  server.close(() => {
    process.exit(1);
  });
});

//Handling Unhandeled Promise Rejection
process.on("unhandledRejection", function (error) {
  console.log(`ERROR:${error.message}`);
  console.log("Shutting Server due to unhandeled promise Rejection");

  server.close(() => {
    process.exit(1);
  });
});
