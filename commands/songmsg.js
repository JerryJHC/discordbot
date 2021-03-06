const { setMessage } = require('../util/message');

module.exports = {
    name: 'songmsg',
    description: 'Enable or disable message when a song starts playing',
    execute(message) {
        message.client.playingMessages = !message.client.playingMessages;
        message.client.database.query(`UPDATE Config SET playingMessages = ${message.client.playingMessages ? 1 : 0}`, (err, result) => {
            if (err) console.log("DataBase Config cannot be updated!");
            else console.log("DataBase Config - PlayingMessages updated!");
        });
        message.channel.send(setMessage(`**Song message ${message.client.playingMessages ? 'enabled' : 'disabled'}**`));
    },
};