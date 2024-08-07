import { PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';
import guildStore from '../database/GuildStore.js';
import ticketStore from '../database/TicketStore.js';
import userStore from '../database/UserStore.js';

export default class Open extends BaseCommand {
  constructor() {
    super({
      commandName: 'open',
      displayName: 'Open',
      commandDescription: 'Open a ticket.',
      commandCategory: 'Tickets',
      commandPermissions: null,
      commandOptions: null,
    });
  }

  async execute(interaction, client) {
    const embed2 = new EmbedBuilder()
        .setColor('#cc2900');

    const ticketChannels = await interaction.guild.channels.cache.filter((channel) => {
        return (
          channel.type === 0 &&
          (channel.name.startsWith('ticket-') || channel.name.startsWith('🔒-ticket'))
        );
    });

    if (ticketChannels.size >= 25 && serverOwnerData.isPremium === false) {
        embed2.setDescription('<:Error:1078317593867325500> This server has reached the maximum number of tickets.');

        return interaction.reply({
          embeds: [embed2],
          ephemeral: true,
        });
    }

    const serverOwnerData = await userStore.getUser(interaction.guild.ownerId);
    if (!serverOwnerData) return interaction.reply({ content: 'An error occured whilst getting the user data.', ephemeral: true });

    const currentTicket = await interaction.guild.channels.cache.find(
        (channel) => channel.name.toLowerCase() === `ticket-${interaction.member.user.username}`
    );
    const currentTicket2 = await interaction.guild.channels.cache.find(
        (channel) => channel.name.toLowerCase() === `🔒-ticket-${interaction.member.user.username}`
    );

    if (currentTicket) {
        embed2.setDescription('<:Error:1078317593867325500> You already have an active ticket.');

        return interaction.reply({
          embeds: [embed2],
          ephemeral: true,
        });
    }
    if (currentTicket2) {
        embed2.setDescription('<:Error:1078317593867325500> You already have an active ticket.');

        return interaction.reply({
          embeds: [embed2],
          ephemeral: true,
        });
    }

    const guildData = await guildStore.getGuild(interaction.guild.id);

    if (!guildData) {
        embed2.setDescription('<:Error:1078317593867325500> An error occured whilst fetching the guild data.')
        return interaction.reply({
          embeds: [embed2],
          ephemeral: true
        });
    }

    if (!guildData.tickets.enabled) {
        embed2.setDescription('<:Error:1078317593867325500> This guild does not have tickets enabled.')
        return interaction.reply({
          embeds: [embed2],
          ephemeral: true
        });
    }

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
            return console.log(error);
        }
    }
    const components = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Claim Ticket').setEmoji('🔒').setCustomId('ClaimTicket').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setLabel('Close').setEmoji('🔨').setCustomId('CloseTicket').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setLabel('Transcript Ticket').setEmoji('🗒️').setCustomId('TranscriptTicket').setStyle(ButtonStyle.Danger)
    );
  
    const embed = new EmbedBuilder()
        .setTitle(`Open Command 🎉`)
        .setDescription("Thank you for opening a ticket.\nWe're here to help. We will do our best to respond to you within 24hrs.")
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
  };
};