const { setMessage } = require('../util/message');

module.exports = {
    name: 'remove',
    description: 'Remove a song from the queue, use: remove 1',
    execute(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!message.member.voice.channel) return message.channel.send(setMessage('You have to be in a voice channel to stop the music!'));
        if (!serverQueue) return message.channel.send(setMessage('There is no song in the queue!'));
        const args = message.content.trim().split(/ +/g);
        if (args.length < 2) return message.channel.send(setMessage(`**A position [1-${serverQueue.songs.length}] is required!**`));
        try {
            let pos = parseInt(args[1]);
            if (pos) {
                if (pos == 0 || pos > serverQueue.songs.length) return message.channel.send(setMessage(`**A position between 1 and ${serverQueue.songs.length} is required!**`));
                let removedSong = serverQueue.songs.splice(pos, 1);
                if (pos < serverQueue.endQueue) serverQueue.endQueue--;
                console.log(removedSong);
                return message.channel.send(setMessage(`**${removedSong[0].title} was successfully removed!**`));
            }
            return message.channel.send(setMessage(`${args[1]} is not a number!`));
        } catch (error) {
            return message.channel.send(setMessage('An error has occurred while trying to remove song, Please try again!'));
        }
    },
};