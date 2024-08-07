import { BaseCommand } from '../BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import ticketStore from '../database/TicketStore.js';

export default class Transfer extends BaseCommand {
  constructor() {
    super({
      commandName: 'transfer',
      displayName: 'Transfer',
      commandDescription: 'Transfer a ticket claim.',
      commandCategory: 'Tickets',
      commandPermissions: null,
      commandOptions: [{ name: 'member', description: 'Who would you like to transfer the ticket to?', type: 6, required: true }],
    });
  }

  async execute(interaction) {
    const embed = new EmbedBuilder().setColor('#cc2900');
    const embed2 = new EmbedBuilder().setColor('#34eb80');
    const ticketSupportRole = await interaction.guild.roles.cache.find((Role) => Role.name.toLowerCase() === 'ticket support');

    if (!ticketSupportRole) {
      embed.setDescription('<:Error:1078317593867325500> Unable to find the ticket support role.');
      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    const options = interaction.options;
    const member = await interaction.guild.members.cache.get(options.getUser('member').id);

    if (member.user.bot) {
      embed.setDescription('<:Error:1078317593867325500> Unable to transfer tickets to a bot.');
      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    if (member.roles.cache.has(ticketSupportRole.id)) {
      const ticketData = await ticketStore.getTicketByChannel(interaction.channel.id.toString(), { create: false });

      try {
        if (ticketData && ticketData.claimedBy === interaction.member.id.toString()) {
            ticketData.claimedBy = member.id;
            ticketData.save();

            embed2.setDescription('<:Success:1078317580420382720> Successfully transfered ticket to `' + member.user.tag + '`.');
            return interaction.reply({
              embeds: [embed2]
            });
          } else if (!ticketData) {
            embed.setDescription('<:Error:1078317593867325500> This feature can only be used inside a ticket.');
            return interaction.reply({
              embeds: [embed],
              ephemeral: true
            });
          } else if (ticketData.claimedBy !== interaction.member.id.toString()) {
            return interaction.reply({
              content: 'This is not your ticket to transfer.',
              ephemeral: true
            });
          } else {
            return interaction.reply({
                content: 'An unknown error occured - If Statement.',
                ephemeral: true
            });
          }
      } catch(error) {
        console.log(error);

        return interaction.reply({
            content: 'An unknown error occured - Try Catch.',
            ephemeral: true
        });
      }
    } else {
      embed.setDescription('<:Error:1078317593867325500> `' + member.user.tag + '` does not have permission to claim this ticket.');
      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }
  }
}