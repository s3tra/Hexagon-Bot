import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import guildStore from '../database/GuildStore.js';
import { BaseCommand } from '../BaseCommand.js';

export default class Panel extends BaseCommand {
  constructor() {
    super({
      commandName: 'panel',
      displayName: 'Panel',
      commandDescription: 'Create a ticket pannel.',
      commandCategory: 'Tickets',
      commandPermissions: ['ManageChannels', 'Administrator'],
      commandOptions: [
        { name: 'title', description: 'What should the title be?', type: 3, required: true },
        { name: 'description', description: 'What should the description be?', type: 3, required: true },
        { name: 'channel', description: 'What channel should the panel be in?', type: 7, required: true },
        { name: 'image', description: 'Would you like to add an image?', type: 11, required: false },
      ],
    });
  }

  async execute(interaction) {
    const guildData = await guildStore.getGuild(interaction.guildId);

    if (guildData) {
      if (guildData.tickets.enabled === true) {
        const panelData = {
          ['Title']: interaction.options.getString('title'),
          ['Description']: interaction.options.getString('description'),
          ['Channel']: interaction.options.getChannel('channel'),
          ['Image']: interaction.options.getAttachment('image'),
        };
        const embed = new EmbedBuilder()
          .setTitle(panelData['Title'])
          .setDescription(panelData['Description'])
          .setColor('#0099ff')
          .setTimestamp();
        const embed2 = new EmbedBuilder()
          .setDescription('<:Success:1078317580420382720> The panel has been created.')
          .setColor('#34eb80');
        const components = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('Create a ticket!')
            .setEmoji('📩')
            .setCustomId('confirmOpenTicket')
            .setStyle(ButtonStyle.Secondary)
        );
        console.log('action');
        if (panelData['Image']) {
          console.log(panelData['Image']);
          if (panelData['Image'].contentType === 'image/png' || panelData['Image'].contentType === 'image/jpeg') {
            embed.setImage(panelData['Image'].url);
          } else {
            const embed = new EmbedBuilder()
              .setDescription('<:Error:1078317593867325500> Attachment must be a `PNG/JPEG` file.')
              .setColor('#cc2900');
            return interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        }
        panelData['Channel'].send({
          embeds: [embed],
          components: [components],
        });
        return interaction.reply({
          embeds: [embed2],
          ephemeral: true,
        });
      } else {
        const embed = new EmbedBuilder()
          .setDescription('<:Error:1078317593867325500> You need to do `/setup` first.')
          .setColor('#cc2900');
        return interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }
    } else {
      return;
    }
  }
}
