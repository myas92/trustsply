const express = require("express");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const cors = require('cors')
const bodyParser = require("body-parser");
const userRouter = require("./routes/users-routes");
const staticVariables = require("./const/static-variables");

// const personRouter = require("./services/person/index");
const HttpError = require("./models/http-error");
const app = express();
let init = require("./initializer");

init.runInitializer();
console.log("Envirement: " + process.env.NODE_ENV);

app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));
//گرفتن زبان برای نمایش خطاها
app.use((req, res, next) => {
  req.ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  req.language = req.query.language;
  if (!req.language)
    req.language = req.headers.language || staticVariables.DEFAULT_LANGUGE;
  next();
});
app.use(cors())
app.use("/api/users", userRouter);

app.use((req, res, next) => {
  const error = new HttpError("could not found this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.statusCode || 500);
  res.json({
    code: error.code || -1,
    message: error.message || "an unknown error occurred!",
  });
});


module.exports = app;
