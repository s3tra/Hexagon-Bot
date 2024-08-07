import { EmbedBuilder } from 'discord.js';
import ticketStore from '../database/TicketStore.js';
import { BaseCommand } from '../BaseCommand.js';

export default class AddCommand extends BaseCommand {
  constructor() {
    super({
      commandName: 'add',
      displayName: 'Add',
      commandDescription: 'Add a member to a ticket.',
      commandCategory: 'Tickets',
      commandPermissions: null,
      commandOptions: [{ name: 'member', description: 'Who would you like to add?', type: 6, required: true }],
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
          ViewChannel: true,
          SendMessages: true,
          ReadMessageHistory: true,
          AttachFiles: true,
        });

        const embed = new EmbedBuilder()
          .setTitle('Member Added')
          .setDescription('Successfully added a member to the ticket.')
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
