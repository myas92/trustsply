const db = require('./db');
const { v4: uuid } = require('uuid');
async function getUsers() {
	const data = await db.query('SELECT id, name, email FROM users');
	const meta = { page: 1 };
	return {
		data,
		meta
	};
}
async function getUserByEmail(email) {
	try {
		let sql = `SELECT * FROM users WHERE email = '${email}' AND isDeleted = false`;
		const data = await db.query(sql);
		const meta = { page: 1 };
		return {
			data,
			meta
		};
	} catch (error) {
		throw error;
	}
}
async function ConfirmUser(input) {
	const connection = await db.connection();
	try {
		let userId = uuid()
		await connection.query('START TRANSACTION');
		let { verifyUserId, name, email, password } = input;
		let sqlUsers = `INSERT INTO users (id, name, email, password)
		            VALUES ('${userId}','${name}','${email}','${password}')`;
		await connection.query(sqlUsers);
		let sqlVerifyUser = `UPDATE verify_users SET isUsed = true WHERE id = '${verifyUserId}'`;
		await connection.query(sqlVerifyUser);
		await connection.query('COMMIT');
		return {userId};
	} catch (error) {
		await connection.query('ROLLBACK');
		console.log('ROLLBACK at querySignUp', error);
		throw error;
	} finally {
		await connection.close();
	}
}

module.exports = {
	getUsers,
	getUserByEmail,
	ConfirmUser
};
