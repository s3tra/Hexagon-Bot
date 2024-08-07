import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';
import { leaveVoiceChannel } from '../voiceUtils.js';

export default class Leave extends BaseCommand {
  constructor() {
    super({
      commandName: 'leave',
      displayName: 'Leave',
      commandDescription: 'Make the bot leave the voice channel.',
      commandCategory: 'Music',
      commandPermissions: null,
      commandOptions: [],
    });
  }

  async execute(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#34eb80');
    
    const guildId = interaction.guildId;

    try {
        const success = await leaveVoiceChannel(guildId);
        if (success) {
            embed.setDescription(`<:Success:1078317580420382720> The bot has left the voice channel.`);
            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        } else {
            return interaction.reply({
                content: 'The bot is not in a voice channel.',
                ephemeral: true
            });
        }
    } catch(error) {
        console.error('Error occurred while executing leave command:', error);
        return interaction.reply({
            content: 'An error occurred while trying to leave the voice channel.',
            ephemeral: true
        });
    }
  }
}