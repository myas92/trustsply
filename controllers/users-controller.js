const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usersQuery = require('../services/users');
const pokingQuery = require('../services/poking');
const verifyUsersQuery = require('../services/verify-users');
const { getVerifyCode } = require('../util/utility');
const stVars = require('../const/static-variables');
const Errors = require('../const/errors');
const config = require('../config');
const redisController = require('../util/redis-controller');
const { sendEmail } = require('../util/send-mail');
class usersControllers {
	constructor() {}
	getUserById = async (req, res, next) => {
		try {
			let { uid } = req.params;
			let { data } = await usersQuery.getUsersById(uid);
			res.status(200).json({ status: 'success', result: data });
		} catch (err) {
			console.log(err);
			const error = new HttpError(Errors.Something_Went_Wrong, req.language);
			return next(error);
		}
	};
	getUsers = async (req, res, next) => {
		try {
			let { data } = await usersQuery.getUsers();
			res.status(200).json({ status: 'success', result: data });
		} catch (err) {
			console.log(err);
			const error = new HttpError(Errors.Something_Went_Wrong, req.language);
			return next(error);
		}
	};

	signUp = async (req, res, next) => {
		let { name, email, password } = req.body;
		try {
			let existingUser = await usersQuery.getUserByEmail(email);
			if (existingUser.data.length > 0) {
				const error = new HttpError(Errors.Username_Is_Duplicate, req.language);
				return next(error);
			}
			// از آپسرت استفاده میکنیم تا اخرین وری فای کد فقط معتبر باشد
			let verifiyCode = getVerifyCode();
			let hashedPassword = await bcrypt.hash(password, 12);
			await verifyUsersQuery.create({
				name,
				email,
				password: hashedPassword,
				verifyCode: verifiyCode,
				expireDate: Date.now() + stVars.EXPIRE_TIME_TOKEN
			});

			// sendEmail(email, verifiyCode);
			res.status(201).json({
				status: 'success',
				result: [
					{
						email,
						verifyCode: verifiyCode
					}
				]
			});
		} catch (err) {
			console.log(err);
			const error = new HttpError(Errors.Signing_Up_Faild, req.language);
			return next(error);
		}
	};

	signUpConfirm = async (req, res, next) => {
		try {
			let { email, verifyCode } = req.body;
			let { data } = await verifyUsersQuery.get(email);
			// ایمیلی برای توکن نبود و توکن نامعتبر بود
			if (!data || data[0].verifyCode != verifyCode || data[0].isUsed == 1) {
				let error = new HttpError(Errors.Invalid_verify_Code, req.language);
				return next(error);
			}
			if (data[0].expireDate < new Date()) {
				let error = new HttpError(Errors.Expiration_verify_Code, req.language);
				return next(error);
			}
			let user = {
				verifyUserId: data[0].id,
				name: data[0].name,
				email: data[0].email,
				password: data[0].password
			};

			try {
				let { userId } = await usersQuery.ConfirmUser(user);
				let token = jwt.sign({ email, userId: userId }, config.JWT, {
					expiresIn: stVars.EXPIRE_TIME_JWT_TOKEN
				});
				await redisController.hset('userTokens', userId, token);
				res.status(201).json({
					status: 'success',
					result: [
						{
							userId: userId,
							token,
							expiresIn: stVars.EXPIRE_TIME_JWT_TOKEN
						}
					]
				});
			} catch (err) {
				let error = new HttpError(Errors.Something_Went_Wrong, req.language);
				return next(error);
			}
		} catch (err) {
			console.log(err);
			const error = new HttpError(Errors.Something_Went_Wrong, req.language);
			return next(error);
		}
	};

	login = async (req, res, next) => {
		try {
			const { email, password } = req.body;

			let { data } = await usersQuery.getUserByEmail(email);
			let existingUser = data[0];
			if (!existingUser) {
				const error = new HttpError(Errors.Invalid_Username, req.language);
				return next(error);
			}
			//دریافت تعداد دفعات پسورد اشتباه وارد شده
			let countIncorrectPassword = await redisController.get('password', existingUser.id);
			//چند بار پسورد اشتباه وارد شده است
			if (countIncorrectPassword > stVars.COUNT_BLOCKED_INCORRECT_PASSWORD) {
				const error = new HttpError(Errors.Account_Is_Disabled, req.language);
				return next(error);
			}

			let isValidPassword = false;
			try {
				isValidPassword = await bcrypt.compare(password, existingUser.password);
			} catch (err) {
				const error = new HttpError(Errors.Check_Credentials, req.language);
				return next(error);
			}
			if (!isValidPassword) {
				//افزودن تعداد دفعات پسورد اشتباه وارد شده
				await redisController.incr('password', existingUser.id);
				//وارد کردن اکسپایر تایم برای کلید
				redisController.setExpireTime('password', existingUser.id, stVars.TIME_BLOCKED_INCORRECT_PASSWORD);
				let error;
				if (countIncorrectPassword == stVars.COUNT_BLOCKED_INCORRECT_PASSWORD)
					error = new HttpError(Errors.Account_Is_Disabled, req.language);
				else error = new HttpError(Errors.Invalid_Credentials, req.language);
				return next(error);
			}

			await redisController.delete('password', existingUser.id);
			let token;
			try {
				token = jwt.sign(
					{
						userId: existingUser.id,
						email: existingUser.email
					},
					config.JWT,
					{ expiresIn: stVars.EXPIRE_TIME_JWT_TOKEN }
				);
			} catch (err) {
				const error = new HttpError(Errors.Loggin_Failed, req.language);
				return next(error);
			}

			try {
				await redisController.hset('userTokens', existingUser.id, token);
				//redisController.setExpireTime("verifyCodes", existingUser._id);
			} catch (err) {
				const error = new HttpError(Errors.Loggin_Failed, req.language);
				return next(error);
			}
			res.json({
				status: 'success',
				result: [
					{
						userId: existingUser.id,
						token: token,
						expiresIn: stVars.EXPIRE_TIME_JWT_TOKEN
					}
				]
			});
		} catch (err) {
			console.log(err);
			const error = new HttpError(Errors.Something_Went_Wrong, req.language);
			return next(error);
		}
	};
	updateUser = async (req, res, next) => {
		try {
			const { name } = req.body;
			const { uid } = req.params;
			const { userId } = req.userData;
			if (uid != userId) {
				const error = new HttpError(Errors.User_Undefinded, req.language);
				return next(error);
			}
			let { data } = await usersQuery.getUserById(userId);
			if (!data) {
				const error = new HttpError(Errors.Item_Is_Not_Founded, req.language);
				return next(error);
			}
			await usersQuery.updateUser({ userId, name });
			res.json({
				status: 'success',
				result: [ { name } ]
			});
		} catch (err) {
			console.log(err);
			const error = new HttpError(Errors.Something_Went_Wrong, req.language);
			return next(error);
		}
	};

	search = async (req, res, next) => {
		try {
			const { keyword } = req.query;
			let { data } = await usersQuery.search(keyword);
			if (!data) {
				const error = new HttpError(Errors.Item_Is_Not_Founded, req.language);
				return next(error);
			}
			res.json({
				status: 'success',
				result: data
			});
		} catch (err) {
			console.log(err);
			const error = new HttpError(Errors.Something_Went_Wrong, req.language);
			return next(error);
		}
	};
	createPoking = async (req, res, next) => {
		try {
			const { uid } = req.params;
			const { toUserId, info } = req.body;

			let { data } = await pokingQuery.insert({ fromUserId: uid, toUserId, info });
			res.json({
				status: 'success',
				result: [ data ]
			});
		} catch (err) {
			console.log(err);
			const error = new HttpError(Errors.Something_Went_Wrong, req.language);
			return next(error);
		}
	};
	getPoking = async (req, res, next) => {
		try {
			const { uid } = req.params;
			const { userId } = req.userData;
			if (uid != userId) {
				const error = new HttpError(Errors.User_Undefinded, req.language);
				return next(error);
			}
			let { data } = await pokingQuery.getById(userId);
			res.json({
				status: 'success',
				result: data
			});
		} catch (err) {
			console.log(err);
			const error = new HttpError(Errors.Something_Went_Wrong, req.language);
			return next(error);
		}
	};
	updateById = async (req, res, next) => {
		try {
			const { uid } = req.params;
			const { userId } = req.userData;
			if (uid != userId) {
				const error = new HttpError(Errors.User_Undefinded, req.language);
				return next(error);
			}
			let { data } = await pokingQuery.updateById(userId);
			res.json({
				status: 'success',
				result: data
			});
		} catch (err) {
			console.log(err);
			const error = new HttpError(Errors.Something_Went_Wrong, req.language);
			return next(error);
		}
	};
	logout = async (req, res, next) => {
		try {
			let { userId } = req.userData;
			await redisController.delete('userTokens', userId);
			res.status(201).json({ status: 'success', result: [] });
		} catch (err) {
			console.log(err);
			const error = new HttpError(Errors.Something_Went_Wrong, req.language);
			return next(error);
		}
	};
}

module.exports = new usersControllers();
