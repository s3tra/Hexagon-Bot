import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';

export default class Support extends BaseCommand {
  constructor() {
    super({
      commandName: 'support',
      displayName: 'Support',
      commandDescription: "Join Hexagon's support server.",
      commandCategory: 'Moderation',
      commandPermissions: null,
      commandOptions: null,
    });
  }

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Support')
      .setDescription(
        "No matter how small your problem is, we're here to help. We have several Community Support members who will be able to assist you in our Discord Server."
      )
      .setColor('#0099ff')
      .setTimestamp();
    const components = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Support').setURL('https://discord.gg/UWA8ujD7Th').setStyle(ButtonStyle.Link)
    );
    return interaction.reply({
      embeds: [embed],
      components: [components],
      ephemeral: true,
    });
  }
}
