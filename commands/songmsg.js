const { setMessage } = require('../util/message');

module.exports = {
    name: 'songmsg',
    description: 'Enable or disable message when a song starts playing',
    execute(message) {
        message.client.playingMessages = !message.client.playingMessages;
        message.channel.send(setMessage(`**Song message ${message.client.playingMessages ? 'enabled' : 'disabled'}**`));
    },
};