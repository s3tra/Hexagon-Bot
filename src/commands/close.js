import { EmbedBuilder } from 'discord.js';
import ticketStore from '../database/TicketStore.js';
import { closeTicket } from '../modules/CloseTicket.js';
import { BaseCommand } from '../BaseCommand.js';

export default class CloseCommand extends BaseCommand {
  constructor() {
    super({
      commandName: 'close',
      displayName: 'Close',
      commandDescription: 'Close a ticket.',
      commandCategory: 'Tickets',
      commandPermissions: null,
      commandOptions: null,
    });
  }

  async execute(interaction) {
    const role = await interaction.guild.roles.cache.find((role) => role.name.toLowerCase() === 'ticket support');
    if (!role) {
      console.log('Unable to find ticket support role.');
      return;
    }
    if (interaction.member.roles.cache.has(role.id)) {
      const ticketData = await ticketStore.getTicketByChannel(interaction.channel.id, { create: false });
      if (ticketData) {
        closeTicket.confirmCloseTicket(interaction);
      } else if (interaction.channel.name.startsWith('ticket-') || interaction.channel.name.startsWith('🔒-ticket')) {
        const messages = await interaction.channel.messages.fetch({ after: 1, limit: 1 });
        const firstMessage = messages.first();
        if (firstMessage.author.bot === true) {
          const firstMention = await firstMessage.mentions.users.first();

          await ticketStore.createTicket({
            channelId: interaction.channel.id.toString(),
            openedBy: firstMention.id.toString(),
          });
          closeTicket.confirmCloseTicket(interaction);
        } else {
          return interaction.reply({
            content: 'Unable to locate ticket data.',
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
