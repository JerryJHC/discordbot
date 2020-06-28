const fs = require('fs')
const Discord = require('discord.js');
const Client = require('./client/Client');
const {
	prefix,
	token,
	development,
	database
} = require('./config.json');
const { setMessage } = require('./util/message');

const client = new Client(database);

// MySQL

client.database.connect(err => {
	if (err) throw err;
	console.log("DataBase Connected!");
	client.database.query("select * from Config", (err, result) => {
		if (err) throw err;
		console.log("DataBase Config:", result[0]);
		client.loop.queue = result[0].loopQueue;
		client.loop.single = result[0].loopSingle;
		client.playingMessages = result[0].playingMessages;
	});
});

// MySQL

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

console.log(client.commands);

client.once('ready', () => {
	console.log('Ready!');
});

client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});

client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	const command = client.commands.get(commandName);

	if (!command) return message.reply(setMessage(`**${commandName} is not a valid command!**\n**${prefix}help**: List all available commands`));

	try {
		if (commandName == "ban" || commandName == "userinfo") {
			command.execute(message, client);
		} else {
			command.execute(message);
		}
	} catch (error) {
		console.error(error);
		message.reply(setMessage('There was an error trying to execute that command!'));
	}
});

if (development) {
	client.on('shardError', error => {
		console.error('A websocket connection encountered an error:', error);
	});

	client.on('unhandledRejection', error => {
		console.error('Unhandled promise rejection:', error);
	});

	client.on('debug', console.log);
}

client.login(token);