import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';
import { joinVoiceChannel } from '@discordjs/voice';
import userStore from '../database/UserStore.js';

export default class Join extends BaseCommand {
  constructor() {
    super({
      commandName: 'join',
      displayName: 'Join',
      commandDescription: 'Make the bot join a voice channel.',
      commandCategory: 'Music',
      commandPermissions: null,
      commandOptions: [{ name: 'channel', description: 'Which channel should the bot join?', type: 7, required: false }],
    });
  }

  async execute(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#cc2900');
    
    const userData = await userStore.getUser(interaction.member.id);
    if (!userData) return interaction.reply({ content: 'An error occured whilst getting the user data.', ephemeral: true });

    if (userData.isPremium === false) {
      embed.setDescription('<:Error:1078317593867325500> This command is a [Premium](https://www.hexagonbot.com/premium) feature.');
      return interaction.reply({
          embeds: [embed],
          ephemeral: true
      });
    }
    
    const options = interaction.options;
    let voiceChannel = options.getChannel('channel');
    
    if (!voiceChannel) voiceChannel = interaction.member.voice.channel;

    const embed2 = new EmbedBuilder()
        .setColor('#34eb80');
    
    if (!voiceChannel || voiceChannel.type !== 2) {
        embed.setDescription('<:Error:1078317593867325500> You must provide a voice channel.');

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
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guildId,
            adapterCreator: adapterCreator,
        });
    
        embed2.setDescription(`<:Success:1078317580420382720> The bot has joined <#${voiceChannel.id}>.`);
        return interaction.reply({
            embeds: [embed2],
            ephemeral: true
        });
    } catch(error) {
        return console.log(error);
    }
  }
}