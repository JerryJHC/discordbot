const { getTime } = require('../util/formatStr');
const { setMessage } = require('../util/message');

module.exports = {
    name: 'queue',
    description: 'List all songs in the queue!',
    execute(message) {
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!message.member.voice.channel) return message.channel.send(setMessage('**You have to be in a voice channel to list the music!**'));
        if (!serverQueue || serverQueue.songs.length == 0) return message.channel.send(setMessage('**The queue is empty!**'));
        let now = serverQueue.songs[0];
        let nowPlaying = `__**Now Playing**__\n${this.formatSongInfo(now)}`;
        if (serverQueue.songs.length > 1) {
            nowPlaying += `\n\n__**Queue**__`;
            // Paging
            let pages = [];
            let page = 1, maxElements = 10;
            let pageContent = nowPlaying;

            for (let i = 1; i < serverQueue.songs.length; i++) {
                pageContent += `\n${i}. ${this.formatSongInfo(serverQueue.songs[i])}`;
                if (i % maxElements == 0) {
                    pages.push(pageContent);
                    pageContent = nowPlaying;
                }
            }
            if (pageContent != nowPlaying) pages.push(pageContent);
            
            const embed = setMessage(pages[page - 1]).setFooter(`Page ${page} of ${pages.length}`);

            return message.channel.send(embed).then(msg => {
                msg.react('⏮').then(r => {
                    msg.react('⏭')

                    const backwardsFilter = (reaction, user) => reaction.emoji.name === '⏮' && user.id === message.author.id;
                    const forwardsFilter = (reaction, user) => reaction.emoji.name === '⏭' && user.id === message.author.id;

                    const backwards = msg.createReactionCollector(backwardsFilter, { time: 60000 });
                    const forwards = msg.createReactionCollector(forwardsFilter, { time: 60000 });

                    backwards.on('collect', r => {
                        if (page === 1) return;
                        page--;
                        embed.setDescription(pages[page - 1]);
                        embed.setFooter(`Page ${page} of ${pages.length}`);
                        msg.edit(embed);
                    });

                    forwards.on('collect', r => {
                        if (page === pages.length) return;
                        page++;
                        embed.setDescription(pages[page - 1]);
                        embed.setFooter(`Page ${page} of ${pages.length}`);
                        msg.edit(embed);
                    });
                });
            });
        } else {
            nowPlaying += `\n\n__**There's no song in the queue!**__`;
            return message.channel.send(setMessage(nowPlaying));
        }
    },
    formatSongInfo(song) {
        return `**${song.title}**\nRequested by: ${song.requester} [**${getTime(song.length)}**]`
    }
};