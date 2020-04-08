const Discord = require("discord.js");

exports.setMessage = (text) => {
    return new Discord.MessageEmbed().setColor(0xffffff).setDescription(text);
}