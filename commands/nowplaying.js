const { setMessage } = require('../util/message');

module.exports = {
	name: 'nowplaying',
	description: 'Get the song that is playing.',
	execute(message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send(setMessage('There is nothing playing.'));
		return message.channel.send(setMessage(`Now playing: **[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})**\nRequested by: ${serverQueue.songs[0].requester}${message.client.loop.single ? "\nLoop single is enabled." : ''}`));
	},
};