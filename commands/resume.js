const { setMessage } = require('../util/message');

module.exports = {
	name: 'resume',
	description: 'Resume current song!',
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!message.member.voice.channel) return message.channel.send(setMessage('**You have to be in a voice channel to stop the music!**'));
		if (!serverQueue) return message.channel.send(setMessage("**There's no song playing**"));
        if(!serverQueue.connection.dispatcher.paused) return message.channel.send(setMessage("**The song isn't paused!**"));
        serverQueue.connection.dispatcher.resume();
        return message.channel.send(setMessage(`**Successfully resumed ${serverQueue.songs[0].title}!**`));
	},
};