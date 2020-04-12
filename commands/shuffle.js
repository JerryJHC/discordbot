const { setMessage } = require('../util/message');

module.exports = {
    name: 'shuffle',
    description: 'Randomize all songs in the queue.',
    execute(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!serverQueue) return message.channel.send(setMessage('There is nothing playing.'));
        let queue = serverQueue.songs.splice(1, serverQueue.songs.length);
        this.shuffleArray(queue);
        queue.forEach(v => serverQueue.songs.push(v));
        return message.channel.send(setMessage(`**${queue.length}** songs have been shuffled`));
    },
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
};