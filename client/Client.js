const { Client, Collection } = require('discord.js');
const mysql = require('mysql');

module.exports = class extends Client {
	constructor(config) {
		super({
			disableEveryone: true,
			disabledEvents: ['TYPING_START'],
		});

		this.database = mysql.createConnection({
			host: config.host,
			user: config.user,
			password: config.password,
			database: config.dbaname
		});;

		this.commands = new Collection();

		this.queue = new Map();

		this.loop = { queue: false, single: false };

		this.playingMessages = true;
	}
};