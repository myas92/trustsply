const jwt = require("jsonwebtoken");
const config = require("../config");
const HttpError = require("../models/http-error");
const Errors = require("../const/errors");
const dbConfig = require("../initializer");
const redisController = require("../util/redis-controller");
module.exports = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      const error = new HttpError(Errors.Authentication_Failed, req.language);
      return next(error);
    }
    const decodedToken = jwt.verify(token, config.JWT);
    let identifiedToken = await redisController.hget(
      "verifyCodes",
      decodedToken.userId,
      token
    );
    if (!identifiedToken) {
      const error =new HttpError(Errors.Authentication_Failed, req.language);
      return next(error);
    }
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    const error = new HttpError(Errors.Authentication_Failed, req.language);
    return next(error);
  }
};
