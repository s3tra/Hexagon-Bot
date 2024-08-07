import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';
import guildStore from '../database/GuildStore.js';

export default class List extends BaseCommand {
  constructor() {
    super({
      commandName: 'list',
      displayName: 'List',
      commandDescription: 'List your server on the Hexagon Website.',
      commandCategory: 'Moderation',
      commandPermissions: ['Administrator'],
      commandOptions: [{ name: 'toggle', description: 'Should your server be listed?', type: 5, required: true }],
    });
  }

  async execute(interaction) {
    try {
      const guildData = await guildStore.getGuild(interaction.guild.id);
      const Boolean = interaction.options.getBoolean('toggle');
      const embed = new EmbedBuilder()
      .setTitle("Server Listing")
      .setColor("#0099ff")
      .setTimestamp();

      if (guildData.ServerPublic && Boolean == true) {
        embed.setDescription("Your server is already listed.");
        return interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
      }

      if (Boolean == true) {
        guildData.ServerPublic = true;
        guildData.save();

        embed.setDescription("Your server has been successfully listed on the Hexagon Website.");
        return interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
      } else {
        guildData.ServerPublic = false;
        guildData.save();

        embed.setDescription("Your server is no longer listed.");
        return interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
      }
    } catch(error) {
        throw new Error(`An unexpected error occured while replying: ${error}`);
    }
  }
}