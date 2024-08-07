import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import userStore from '../database/UserStore.js';

const guildPlayers = new Map();
const guildQueues = new Map();

export default class Join extends BaseCommand {
  constructor() {
    super({
      commandName: 'youtube',
      displayName: 'Youtube',
      commandDescription: 'Make the bot play a song from youtube.',
      commandCategory: 'Music',
      commandPermissions: null,
      commandOptions: [{ name: 'link', description: 'The link to the video you want to play.', type: 3, required: true }],
    });
  }

  async execute(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#cc2900');
    
    const userData = await userStore.getUser(interaction.member.id);
    if (!userData) return interaction.reply({ content: 'An error occured whilst getting the user data.', ephemeral: true });

    if (userData.isPremium === false) {
      embed.setDescription('<:Error:1078317593867325500> This command is a [premium](https://www.hexagonbot.com/premium) feature.');
      return interaction.reply({
          embeds: [embed],
          ephemeral: true
      });
    }
    
    const youtubeLink = interaction.options.getString('link');
    const cmdRanChannel = interaction.channel;
    const voiceChannel = interaction.member.voice.channel;

    const embed2 = new EmbedBuilder()
        .setColor('#34eb80');
    
    if (!voiceChannel || voiceChannel.type !== 2) {
        embed.setDescription('<:Error:1078317593867325500> You must be in a voice channel.');

        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }

    const guildId = interaction.channel.guildId;
    const adapterCreator = interaction.channel.guild.voiceAdapterCreator;

    if (!guildId || !adapterCreator) {
        return interaction.reply({
            content: 'Unable to locate guildId/adapterCreator.',
            ephemeral: true
        });
    }

    try {
        const info = await ytdl.getInfo(youtubeLink);
        const songName = info.videoDetails.title;

        let player = guildPlayers.get(guildId);

        if (!player) {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guildId,
                adapterCreator: adapterCreator,
            });
    
            player = createAudioPlayer({
                behaviors: {
                  noSubscriber: NoSubscriberBehavior.Play,
                },
            });

            player.on('stateChange', async (oldState, newState) => {
                if (newState.status === 'idle' && oldState.status === 'playing') {
                    const queue = guildQueues.get(guildId);
                    if (queue && queue.length > 0) {
                        const nextSong = queue[0];
                        await playSong(guildId, nextSong.link, nextSong.title, adapterCreator, cmdRanChannel, false);
                        queue.shift();
                    }
                }
            });

            connection.subscribe(player);
            guildPlayers.set(guildId, player);
        } else {
            if (player.state.status === 'playing') {
                const queue = guildQueues.get(guildId) || [];
                queue.push({ link: youtubeLink, title: songName, user: interaction.member.user.tag });
                guildQueues.set(guildId, queue);

                embed2.setDescription(`<:Success:1078317580420382720> \`${songName}\` has been added to the queue.`);
                return interaction.reply({
                    embeds: [embed2],
                });
            }
        }

        await playSong(guildId, youtubeLink, songName, cmdRanChannel, true);
    } catch(error) {
        return console.log(error);
    }

    async function playSong(guildId, youtubeLink, songName, cmdRanChannel, isInteraction) {
        try {
            const player = guildPlayers.get(guildId);
            const audioStream = ytdl(youtubeLink, { filter: 'audioonly' });
            const audioResource = createAudioResource(audioStream);
    
            player.play(audioResource);
    
            const embed2 = new EmbedBuilder().setColor('#34eb80');
            embed2.setDescription(`<:Success:1078317580420382720> Now playing \`${songName}\`.`);

            if (isInteraction === true) {
                return interaction.reply({
                    embeds: [embed2],
                });
            } else {
                return cmdRanChannel.send({
                    embeds: [embed2],
                });
            }
        } catch(error) {
            console.error(error);
        }
    }
  }
}

export { guildQueues };