const express = require('express');
const router = express.Router();
const usersControllers = require('../controllers/users-controller');
const userSchema = require("../schema/user-schema");
const { validator } = require("../middleware/joi-validator");
router.get('/', usersControllers.getUsers);
router.post('/signup', validator(userSchema.signup, "body"), usersControllers.signUp);
router.post('/signup/confirm', validator(userSchema.signupConfirm, "body"), usersControllers.signUpConfirm);
router.post('/login', validator(userSchema.login, "body"), usersControllers.login);
 
module.exports = router;
