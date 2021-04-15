const asyncRedis = require('async-redis');
const config = require('./config');
class Initializer {
	static async runInitializer() {
		await Initializer.redisConfig();
	}
	static async redisConfig() {
		Initializer.redisClient = asyncRedis.createClient({
			host: config.REDIS_HOST,
			db: config.REDIS_DB
		});
	}
}

module.exports = Initializer;
