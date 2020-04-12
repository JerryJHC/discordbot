const ytdl = require("ytdl-core");
const ytsr = require("ytsr");
const ytpl = require("ytpl");
const { setMessage } = require('../util/message');

module.exports = {
  name: "play",
  description: "Play a song in your channel!",
  async execute(message) {
    const args = message.content.trim().split(/ +/g);
    if (args.length < 2) return message.channel.send(setMessage("A search string or youtube link is mandatory!"));
    try {
      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel)
        return message.channel.send(setMessage("You need to be in a voice channel to play music!"));
      const permissions = voiceChannel.permissionsFor(message.client.user);
      if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
        return message.channel.send(setMessage("I need the permissions to join and speak in your voice channel!"));
      }

      let link = args[1];
      if (ytpl.validateURL(link)) {
        ytpl(link).then(async r => {
          let msgs = [], deleted = 0;
          for (let i = 0; i < r.items.length; i++) {
            if (r.items[i].duration) {
              let res = await this.addSong('', voiceChannel, message, r.items[i]);
              if (res) msgs.push(res);
            }
            else deleted++;
          }
          let longItems = msgs.filter(v => v.endsWith("is longer than 10 minutes!"));
          return message.channel.send(setMessage(`Queued **${r.total_items - deleted - longItems.length}** items from playlist **[${r.title}](${link})**.${longItems.length > 0 ? `\n**${longItems.length}** items were removed due to a duration longer than 10 minutes.` : ''}${deleted > 0 ? `\n**${deleted}** items are no longer available on youtube` : ''}`));
        }).catch(err => {
          console.log(err);
          return message.channel.send(setMessage(`**Something went wrong trying to get songs from playlist. Please try again!**`));
        });
        return;
      }
      if (ytdl.validateURL(link)) {
        let msg = await this.addSong(link, voiceChannel, message);
        if (msg) message.channel.send(setMessage(msg));
        return;
      }
      let options = { limit: 1 };
      args.shift();
      let s = await ytsr(args.join(' '), options);
      if (s.items.length > 0) {
        let msg = await this.addSong("", voiceChannel, message, s.items[0]);
        if (msg) message.channel.send(setMessage(msg));
        return;
      }
      return message.channel.send(setMessage(`${s.query} : No results found`));

    } catch (error) {
      console.log(error);
      return message.channel.send(setMessage("**Something went wrong while trying to get the song, Please try again!**"));
    }
  },

  async addSong(link, voiceChannel, message, basicInfo) {
    const queue = message.client.queue;
    const serverQueue = message.client.queue.get(message.guild.id);
    let songInfo;
    if (basicInfo) {
      songInfo = {
        title: basicInfo.title,
        video_url: basicInfo.url_simple || basicInfo.link,
        length_seconds: basicInfo.duration || basicInfo.length
      };
      if (songInfo.length_seconds.length > 4) {
        console.log(`${songInfo.title} is longer than 10 minutes!`);
        return `**${songInfo.title}** is longer than 10 minutes!`;
      }
    } else {
      try {
        songInfo = await ytdl.getInfo(link);
      } catch (error) {
        console.log(error);
        return `**Something went wrong while trying to get the song, Please try again!**`;
      }
      if ((songInfo.length_seconds / 60) > 10) {
        console.log(`${songInfo.title} is longer than 10 minutes!`);
        return `**${songInfo.title}** is longer than 10 minutes!`;
      }
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
        return "**An error occurred while trying to join the channel!**";
      }
    } else {
      serverQueue.songs.push(song);
      return `**[${song.title}](${song.url})** has been added to the queue!\nRequested by: ${song.requester}`;
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
      serverQueue.textChannel.send(setMessage(`Start playing: **[${song.title}](${song.url})**\nRequested by: ${song.requester}${message.client.loop.single ? "\nLoop single is enabled." : ''}`));
      song.message = false;
    }
  }
};
