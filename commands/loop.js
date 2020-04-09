const { setMessage } = require('../util/message');

module.exports = {
    name: 'loop',
    description: 'Play queue or current song in a loop, options: [queue, single]',
    execute(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!message.member.voice.channel) return message.channel.send(setMessage('You have to be in a voice channel to stop the music!'));
        if (!serverQueue) return message.channel.send(setMessage("**There's no song in the queue!**"));
        const args = message.content.trim().split(/ +/g);
        if (args.length < 2) return message.channel.send(setMessage("**An option [queue, single] is required!**"));
        let msg = "";
        if (args[1] === "queue") {
            message.client.loop.queue = !message.client.loop.queue;
            message.client.loop.single = false;
            msg = `Loop queue has been ${message.client.loop.queue ? "enabled" : "disabled"}`;
        } else if (args[1] === "single") {
            message.client.loop.single = !message.client.loop.single;
            message.client.loop.queue = false;
            msg = `Loop single has been ${message.client.loop.single ? "enabled" : "disabled"}`;
        } else {
            msg = `${args[1]} is not a valid option!`;
        }
        console.log(message.client.loop);
        message.channel.send(setMessage(`**${msg}**`));
    },
};