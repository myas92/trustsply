const staticVars = require("../const/static-variables");
const getVerifyCode = (
  min = staticVars.MIN_LENGTH_VERIFY_CODE,
  max = staticVars.MAX_LENGTH_VERIFY_CODE
) => {
  return Math.floor(Math.random() * (max - min) + min);
};


exports.getVerifyCode = getVerifyCode;
