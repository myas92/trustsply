const Joi = require("joi");
const {
  passwordPattern,
  verifyCodePattern
} = require("../const/regex-pattern");
const userSchema = {
  signup: Joi.object().keys({
    name: Joi.string().min(3).max(35).required(),
    email: Joi.string().email().required(),
    password: Joi.string().regex(passwordPattern).required(),
  }),
  signupConfirm: Joi.object().keys({
    email: Joi.string().email().required(),
    verifyCode: Joi.string().regex(verifyCodePattern).required(),
  }),
  login: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().regex(passwordPattern).required(),
  }),
};

module.exports = userSchema;
