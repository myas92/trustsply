const db = require('./db');
const { v4: uuid } = require('uuid');

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
		// let updateSql = `UPDATE poking SET isSeen = true WHERE toUserId = '${usedId}'`;
		// await db.query(updateSql);
		return {
			data
		};
	} catch (error) {
		throw error;
	}
}
async function updateById(usedId) {
	try {
		let updateSql = `UPDATE poking SET isSeen = true WHERE toUserId = '${usedId}'`;
		await db.query(updateSql);
		return {
			data : true
		};
	} catch (error) {
		throw error;
	}
}



module.exports = {
	insert,
	getById,
	updateById

};
