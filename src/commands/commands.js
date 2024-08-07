import {
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';

export default class Commands extends BaseCommand {
  constructor() {
    super({
      commandName: 'commands',
      displayName: 'Commands',
      commandDescription: 'View the commands.',
      commandCategory: 'Moderation',
      commandPermissions: null,
      commandOptions: null,
    });
  }

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Command Embed')
      .setDescription('Here is a list of commands.')
      .setColor('#0099ff')
      .setTimestamp();
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('CommandEmbedSelectMenu')
      .setPlaceholder('Select Category')
      .addOptions(
        new StringSelectMenuOptionBuilder().setLabel('Moderation Commands').setDescription('View the moderation commands.').setValue('Moderation'),
        new StringSelectMenuOptionBuilder().setLabel('Ticket Commands').setDescription('View the ticket commands.').setValue('Tickets'),
        new StringSelectMenuOptionBuilder().setLabel('Music Commands').setDescription('View the music commands.').setValue('Music')
      );
    const componentButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('<').setCustomId('commandMenuLeft').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setLabel('>').setCustomId('commandMenuRight').setStyle(ButtonStyle.Primary)
    );
    const componentMenu = new ActionRowBuilder().addComponents(selectMenu);

    return interaction.reply({
      embeds: [embed],
      components: [componentMenu, componentButtons],
      ephemeral: true,
    });
  }
}
