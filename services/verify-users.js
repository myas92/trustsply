const db = require('./db');
const moment = require('moment');
const { v4: uuid } = require('uuid');
async function create(input) {
	try {
		let { name, email, password, verifyCode, expireDate } = input;
		let mysqlTimestamp = moment(expireDate).format('YYYY-MM-DD HH:mm:ss');
		let sql = `INSERT INTO verify_users (id,name, email, password, verifyCode, expireDate)
		            VALUES ('${uuid()}','${name}','${email}','${password}','${verifyCode}','${mysqlTimestamp}')`;
		const data = await db.query(sql);
		return {
			data
		};
	} catch (error) {
		throw error;
	}
}
async function get(email) {
	try {
		let sql = `SELECT * FROM verify_users WHERE email = '${email}' ORDER by createDate ASC LIMIT 1`;
		const data = await db.query(sql);
		return {
			data
		};
	} catch (error) {
		throw error;
	}
}

module.exports = {
	create,
	get
};
