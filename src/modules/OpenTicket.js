import guildStore from '../database/GuildStore.js';
import ticketStore from '../database/TicketStore.js';
import userStore from '../database/UserStore.js';
import { PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const openTicket = {
  async openTicket(interaction, EmbedBuilder) {
    const guildData = await guildStore.getGuild(interaction.guild.id);
    const ticketCategory = await interaction.guild.channels.cache.find((channel) => channel.id === guildData.tickets.category);
    if (!ticketCategory) {
      console.log('No ticket category.');
      try {
        var ticketChannel = await interaction.guild.channels.create({
          name: `ticket-${interaction.member.user.username}`,
          type: ChannelType.GuildText,
          permissionOverwrites: [
            {
              id: interaction.member.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.AttachFiles,
              ],
            },
            {
              id: interaction.guild.roles.cache.find((Role) => Role.name.toLowerCase() === 'ticket support'),
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.UseApplicationCommands,
              ],
            },
            {
              id: interaction.guild.id,
              deny: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.SendMessages,
              ],
            },
          ],
        });
      } catch (error) {
        return;
      }
    } else {
      try {
        var ticketChannel = await interaction.guild.channels.create({
          name: `ticket-${interaction.member.user.username}`,
          type: ChannelType.GuildText,
          parent: ticketCategory.id,
          permissionOverwrites: [
            {
              id: interaction.member.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.AttachFiles,
              ],
            },
            {
              id: interaction.guild.roles.cache.find((Role) => Role.name.toLowerCase() === 'ticket support'),
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.UseApplicationCommands,
              ],
            },
            {
              id: interaction.guild.id,
              deny: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.SendMessages,
              ],
            },
          ],
        });
      } catch (error) {
        return;
      }
    }
    const components = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Claim Ticket').setEmoji('🔒').setCustomId('ClaimTicket').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setLabel('Close').setEmoji('🔨').setCustomId('CloseTicket').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setLabel('Transcript Ticket').setEmoji('🗒️').setCustomId('TranscriptTicket').setStyle(ButtonStyle.Danger)
    );

    let ticketResponse = "Thank you for opening a ticket.\nWe're here to help. We will do our best to respond to you within 24hrs.";

    if (guildData.ticketResponse && guildData.ticketResponse !== "") {
      ticketResponse = guildData.ticketResponse;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.message.embeds[0].title} 🎉`)
      .setDescription(ticketResponse)
      .setFooter({
        text: 'Hexagon Tickets',
      })
      .setColor('#34eb80')
      .setTimestamp();

    ticketStore.createTicket({
      openedBy: interaction.member.id.toString(),
      claimedBy: null,
      channelId: ticketChannel.id.toString(),
    });

    interaction.reply({
      content: `Ticket created! <#${ticketChannel.id}>`,
      ephemeral: true,
    });
    return ticketChannel.send({
      content: `<@${interaction.member.id}>`,
      embeds: [embed],
      components: [components],
    });
  },

  start(client, EmbedBuilder) {
    client.on('interactionCreate', async (interaction) => {
      if (interaction.isButton()) {
        if (interaction.customId === 'confirmOpenTicket') {
          const ticketChannels = await interaction.guild.channels.cache.filter((channel) => {
            return (
              channel.type === 0 &&
              (channel.name.startsWith('ticket-') || channel.name.startsWith('🔒-ticket'))
            );
          });

          const serverOwnerData = await userStore.getUser(interaction.guild.ownerId);
          if (!serverOwnerData) return interaction.reply({ content: 'An error occured whilst getting the user data.', ephemeral: true });

          const currentTicket = await interaction.guild.channels.cache.find(
            (channel) => channel.name.toLowerCase() === `ticket-${interaction.member.user.username}`
          );
          const currentTicket2 = await interaction.guild.channels.cache.find(
            (channel) => channel.name.toLowerCase() === `🔒-ticket-${interaction.member.user.username}`
          );

          const embed = new EmbedBuilder()
            .setColor('#cc2900');

          if (currentTicket) {
            embed.setDescription('<:Error:1078317593867325500> You already have an active ticket.');

            return interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          } else if (currentTicket2) {
            embed.setDescription('<:Error:1078317593867325500> You already have an active ticket.');

            return interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          } else if (ticketChannels.size >= 25 && serverOwnerData.isPremium === false) {
            embed.setDescription('<:Error:1078317593867325500> This server has reached the maximum number of tickets.');

            return interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          } else {
            this.openTicket(interaction, EmbedBuilder);
          }
        }
      } else {
        return;
      }
    });
  },
};