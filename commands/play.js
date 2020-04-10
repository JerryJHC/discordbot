const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const { setMessage } = require('../util/message');

module.exports = {
  name: "play",
  description: "Play a song in your channel!",
  async execute(message) {
    const args = message.content.trim().split(/ +/g);
    if (args.length < 2) return message.channel.send(setMessage("A search string or youtube link is mandatory!"));
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

      let link = args[1];
      if (!ytdl.validateURL(link)) {
        let options = { limit: 1 };
        args.shift();
        let s = await ytsr(args.join(' '), options);
        if (s.items.length > 0) {
          link = s.items[0].link;
        }
      }
      let songInfo;
      try {
        songInfo = await ytdl.getInfo(link);
      } catch (error) {
        console.log(error);
        return message.channel.send(setMessage(`**Something went wrong while trying to get the song, Please try again!**`));
      }

      if ((songInfo.length_seconds / 60) > 10) {
        console.log(`${songInfo.title} is longer than 10 minutes!`);
        return message.channel.send(setMessage(`**${songInfo.title}** is longer than 10 minutes!`));
      }
      const song = {
        title: songInfo.title,
        url: songInfo.video_url,
        length: songInfo.length_seconds,
        requester: message.member.user.username,
        message: true
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
        return message.channel.send(setMessage(`**${song.title}** has been added to the queue!\nRequested by: ${song.requester}`));
      }
    } catch (error) {
      console.log(error);
      return message.channel.send(setMessage("**Something went wrong while trying to get the song, Please try again!**"));
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
        try {
          if (message.client.loop.queue) {
            let current = serverQueue.songs.shift();
            current.message = true;
            serverQueue.songs.push(current);
          }
          else if (message.client.loop.single) {
            serverQueue.songs[0].message = true;
          } else {
            serverQueue.songs.shift();
          }
        } catch (error) {
          console.log("play error");
          // If fails probably it'll be for a stop command execution
          console.error(error);
        }
        this.play(message, serverQueue.songs[0]);
      })
      .on("error", error => {
        console.error(`An error has occured while playing song: ${song.title}`);
        console.error(error);
        this.play(message, serverQueue.songs[0]);
      });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    if (song.message) {
      serverQueue.textChannel.send(setMessage(`Start playing: **${song.title}**\nRequested by: ${song.requester}${message.client.loop.single ? "\nLoop single is enabled." : ''}`));
      song.message = false;
    }
  }
};
