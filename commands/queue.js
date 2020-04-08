module.exports = {
    name: 'queue',
    description: 'List all songs in the queue!',
    execute(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!message.member.voice.channel) return message.channel.send('You have to be in a voice channel to stop the music!');
        if (!serverQueue || serverQueue.songs.length == 0) return message.channel.send('The queue is empty!');
        let now = serverQueue.songs[0];
        let list = `__**Now Playing**__\n**${now.title}**`;
        console.log(serverQueue.songs.length);
        if (serverQueue.songs.length > 1) list += `\n\n__**Queue**__\n`;
        for (let i = 1; i < serverQueue.songs.length; i++) {
            list += `${i}. **${serverQueue.songs[i].title}** \n`;
        }
        console.log(list);
        return message.channel.send(list);
    },
};