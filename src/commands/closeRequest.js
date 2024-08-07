import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import ticketStore from '../database/TicketStore.js';
import { BaseCommand } from '../BaseCommand.js';

export default class CloseRequest extends BaseCommand {
  constructor() {
    super({
      commandName: 'closerequest',
      displayName: 'Closerequest',
      commandDescription: 'Ask the user who opened the ticket to close it.',
      commandCategory: 'Tickets',
      commandPermissions: null,
      commandOptions: null,
    });
  }

  async execute(interaction) {
    function closeRequestFunction(interaction, ticketData) {
      const embed = new EmbedBuilder()
        .setTitle('Close Request')
        .setDescription('Would you like to close this ticket?')
        .setColor('#0099ff');
      const components = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Close').setEmoji('🔨').setStyle(ButtonStyle.Danger).setCustomId('ConfirmCloseRequest'),
        new ButtonBuilder()
          .setLabel('Decline')
          .setEmoji('<:Error:1078317593867325500>')
          .setStyle(ButtonStyle.Danger)
          .setCustomId('DenyCloseRequest')
      );
      return interaction.reply({
        content: `<@${ticketData.openedBy}>`,
        embeds: [embed],
        components: [components],
      });
    }

    const role = await interaction.guild.roles.cache.find((role) => role.name.toLowerCase() === 'ticket support');
    if (interaction.member.roles.cache.has(role.id)) {
      const ticketData = await ticketStore.getTicketByChannel(interaction.channel.id, { create: false });

      if (ticketData) {
        closeRequestFunction(interaction, ticketData);
      } else if (interaction.channel.name.startsWith('ticket-') || interaction.channel.name.startsWith('🔒-ticket')) {
        const messages = await interaction.channel.messages.fetch({ after: 1, limit: 1 });
        const firstMessage = messages.first();
        if (firstMessage.author.bot === true) {
          const firstMention = await firstMessage.mentions.users.first();

          const newData = await ticketStore.createTicket({
            channelId: interaction.channel.id.toString(),
            openedBy: firstMention.id.toString(),
          });
          closeRequestFunction(interaction, newData);
        } else {
          return interaction.reply({
            content: 'Unable to locate ticket data, please report this to hexagon staff.',
            ephemeral: true,
          });
        }
      } else {
        const embed = new EmbedBuilder()
          .setDescription('<:Error:1078317593867325500> This command can only be used inside a ticket.')
          .setColor('#cc2900');
        return interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }
    } else {
      const embed = new EmbedBuilder()
        .setDescription('<:Error:1078317593867325500> You do not have permission to run this command.')
        .setColor('#F04A47');
      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  }
}
