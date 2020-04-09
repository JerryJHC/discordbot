const { setMessage } = require('../util/message');

module.exports = {
	name: 'stop',
	description: 'Stop all songs in the queue!',
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send(setMessage('You have to be in a voice channel to stop the music!'));
		if (!serverQueue) return message.channel.send(setMessage("**There's no song in the queue!**"));
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end();
	},
};