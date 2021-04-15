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
async function insert({ fromUserId, toUserId, info }) {
	try {
		let id = uuid();
		let sql = `INSERT INTO poking (id, fromUserId, toUserId, info)
		            VALUES ('${uuid()}','${fromUserId}','${toUserId}','${info}')`;
		const data = await db.query(sql);
		return {
			data: { id }
		};
	} catch (error) {
		throw error;
	}
}
async function getById(usedId) {
	try {
		let getSql = `SELECT id, info FROM poking WHERE toUserId = '${usedId}' AND isSeen = false`;
		const data = await db.query(getSql);
		let updateSql = `UPDATE poking SET isSeen = true WHERE toUserId = '${usedId}'`;
		await db.query(updateSql);
		return {
			data
		};
	} catch (error) {
		throw error;
	}
}


async function ConfirmUser(input) {
	const connection = await db.connection();
	try {
		let userId = uuid();
		await connection.query('START TRANSACTION');
		let { verifyUserId, name, email, password } = input;
		let sqlUsers = `INSERT INTO users (id, name, email, password)
		            VALUES ('${userId}','${name}','${email}','${password}')`;
		await connection.query(sqlUsers);
		let sqlVerifyUser = `UPDATE verify_users SET isUsed = true WHERE id = '${verifyUserId}'`;
		await connection.query(sqlVerifyUser);
		await connection.query('COMMIT');
		return { userId };
	} catch (error) {
		await connection.query('ROLLBACK');
		console.log('ROLLBACK at querySignUp', error);
		throw error;
	} finally {
		await connection.close();
	}
}

module.exports = {
	insert,
	getById,

};
