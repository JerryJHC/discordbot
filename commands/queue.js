const { getTime } = require('../util/formatStr');

module.exports = {
    name: 'queue',
    description: 'List all songs in the queue!',
    execute(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
        if (!serverQueue || serverQueue.songs.length == 0) return message.channel.send('The queue is empty!');
        let now = serverQueue.songs[0];
        let list = `__**Now Playing**__\n${this.formatSongInfo(now)}`;
        if (serverQueue.songs.length > 1) list += `\n\n__**Queue**__`; else list += `\n\n__**There's no song in the queue!**__`;
        for (let i = 1; i < serverQueue.songs.length; i++) {
            list += `\n${i}. ${this.formatSongInfo(serverQueue.songs[i])}`;
        }
        console.log(list);
        return message.channel.send(list);
    },
    formatSongInfo(song) {
        return `**${song.title}** | Requested by: ${song.requester} [**${getTime(song.length)}**]`
    }
};