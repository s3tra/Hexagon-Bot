import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';

export default class Invite extends BaseCommand {
  constructor() {
    super({
      commandName: 'invite',
      displayName: 'Invite',
      commandDescription: 'Invite the bot to your server.',
      commandCategory: 'Moderation',
      commandPermissions: null,
      commandOptions: null,
    });
  }

  async execute(interaction) {
    try {
        const embed = new EmbedBuilder()
        .setTitle('🎉 Bot Invite')
        .setDescription(
          'Hello, I am Hexagon! A feature rich bot designed to manage and moderate your Community Server! You can invite me to your server by clicking the button below.'
        )
        .setColor('#0099ff')
        .setTimestamp();
      const components = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Invite Link').setURL('https://discord.com/api/oauth2/authorize?client_id=1078264877744930827&permissions=8&scope=bot').setStyle(ButtonStyle.Link)
      );
      return interaction.reply({
        embeds: [embed],
        components: [components],
      });
    } catch(error) {
        throw new Error(`An unexpected error occured while replying: ${error}`);
    }
  }
}