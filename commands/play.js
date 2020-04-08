const ytdl = require("ytdl-core");
const { setMessage } = require('../util/message');

module.exports = {
  name: "play",
  description: "Play a song in your channel!",
  async execute(message) {
    const args = message.content.trim().split(/ +/g);
    console.log(args);
    try {
      const queue = message.client.queue;
      const serverQueue = message.client.queue.get(message.guild.id);

      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel)
        return message.channel.send(setMessage("You need to be in a voice channel to play music!"));
      const permissions = voiceChannel.permissionsFor(message.client.user);
      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(setMessage("I need the permissions to join and speak in your voice channel!"));
      }

      if (ytdl.validateURL(args[1])) {
        const songInfo = await ytdl.getInfo(args[1]);
        if ((songInfo.length_seconds / 60) > 10) {
          console.log(`${songInfo.title} is longer than 10 minutes!`);
          return message.channel.send(setMessage(`**${songInfo.title}** is longer than 10 minutes!`));
        }
        const song = {
          title: songInfo.title,
          url: songInfo.video_url,
          length: songInfo.length_seconds,
          requester: message.member.user.username
        };
        console.log(song);

        if (!serverQueue) {
          const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
          };

          queue.set(message.guild.id, queueContruct);

          queueContruct.songs.push(song);

          try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            this.play(message, queueContruct.songs[0]);
          } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(setMessage(err));
          }
        } else {
          serverQueue.songs.push(song);
          return message.channel.send(setMessage(`${song.title} has been added to the queue!`));
        }
      } else {
        console.log("Search by name");
        message.channel.send(setMessage('Sorry, I can only play songs through youtube links! but someday I could do more (-.-)/'));
      }
    } catch (error) {
      console.log(error);
      message.channel.send(setMessage(error.message));
    }
  },

  play(message, song) {
    const queue = message.client.queue;
    const guild = message.guild;
    const serverQueue = queue.get(message.guild.id);

    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }

    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        this.play(message, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(setMessage(`Start playing: **${song.title}**\nRequested by: ${song.requester}`));
  }
};
