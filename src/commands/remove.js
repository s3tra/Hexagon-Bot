import { EmbedBuilder } from 'discord.js';
import ticketStore from '../database/TicketStore.js';
import { BaseCommand } from '../BaseCommand.js';

export default class Remove extends BaseCommand {
  constructor() {
    super({
      commandName: 'remove',
      displayName: 'Remove',
      commandDescription: 'Remove a member from a ticket.',
      commandCategory: 'Tickets',
      commandPermissions: null,
      commandOptions: [{ name: 'member', description: 'Who would you like to remove?', type: 6, required: true }],
    });
  }
  async execute(interaction) {
    const role = await interaction.guild.roles.cache.find((role) => role.name.toLowerCase() === 'ticket support');
    if (!role) {
      console.log('Unable to find ticket support role.');
      return;
    }
    const ticketData = await ticketStore.getTicketByChannel(interaction.channel.id, { create: false });
    if (interaction.member.roles.cache.has(role.id)) {
      if (ticketData) {
        const member = interaction.options.getUser('member');
        interaction.channel.permissionOverwrites.edit(member.id, {
          ViewChannel: false,
          SendMessages: false,
          ReadMessageHistory: false,
          AttachFiles: false,
        });
        const embed = new EmbedBuilder()
          .setTitle('Member Removed')
          .setDescription('Successfully removed a member from the ticket.')
          .setFields([
            { name: 'Member', value: `<@${member.id}>`, inline: true },
            { name: 'Moderator', value: `<@${interaction.member.id}>`, inline: true },
          ])
          .setColor('#34eb80')
          .setTimestamp();
        return interaction.reply({
          embeds: [embed],
        });
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
