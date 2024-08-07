import { EmbedBuilder, ChannelType, PermissionsBitField } from 'discord.js';
import guildStore from '../database/GuildStore.js';
import { BaseCommand } from '../BaseCommand.js';

export default class Setup extends BaseCommand {
  constructor() {
    super({
      commandName: 'setup',
      displayName: 'Setup',
      commandDescription: 'Set up the ticket feature.',
      commandCategory: 'Tickets',
      commandPermissions: ['ManageServer', 'Administrator'],
      commandOptions: null,
    });
  }
  async execute(interaction) {
    const guildData = await guildStore.getGuild(interaction.guild.id);
    if (guildData) {
      if (guildData.tickets.enabled === true) {
        const embed = new EmbedBuilder()
          .setDescription('<:Error:1078317593867325500> You have already completed the setup.')
          .setColor('#cc2900');
        return interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      } else {
        const role = await interaction.guild.roles.create({
          name: 'Ticket Support',
          reason: 'Hexagon Tickets Setup.',
        });
        const category = await interaction.guild.channels.create({
          name: 'Tickets',
          type: ChannelType.GuildCategory,
        });
        interaction.guild.channels.create({
          name: 'Create-Ticket',
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
              deny: [PermissionsBitField.Flags.SendMessages],
            },
          ],
        });
        const transcriptChannel = await interaction.guild.channels.create({
          name: 'Transcripts',
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites: [
            {
              id: role.id,
              allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
              deny: [PermissionsBitField.Flags.SendMessages],
            },
          ],
        });
        const embed2 = new EmbedBuilder()
          .setTitle('Setup')
          .setDescription(
            `<:Success:1078317580420382720> Created ` +
              '`Ticket Support`' +
              ` role.\n<:Success:1078317580420382720> Created <#${transcriptChannel.id}> channel.\n<:Success:1078317580420382720> Created tickets category.\n\nSetup complete! Add the <@&${role.id}> role to your staff members.`
          )
          .setColor('#34eb80')
          .setTimestamp();
        guildData.tickets.category = category.id.toString();
        guildData.tickets.enabled = true;
        guildData.save();

        console.log('replyaction');
        return interaction.reply({
          embeds: [embed2],
          ephemeral: true,
        });
      }
    } else {
      return;
    }
  }
}