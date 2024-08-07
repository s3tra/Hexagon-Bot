import ticketStore from '../database/TicketStore.js';
import botStore from '../database/BotStore.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const closeTicket = {
  closeTicket(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Close Ticket')
      .setDescription('Are you sure you want to close this ticket?')
      .setColor('#0099ff');
    const component = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Close').setEmoji('🔨').setCustomId('ConfirmCloseTicket').setStyle(ButtonStyle.Danger)
    );
    return interaction.reply({
      embeds: [embed],
      components: [component],
    });
  },

  async confirmCloseTicket(interaction) {
    const botData = await botStore.getBot('1078264877744930827');

    const totalClosedNew = parseInt(botData.totalClosedTickets) + 1;

    botData.totalClosedTickets = totalClosedNew.toString();
    botData.save();

    const ticketData = await ticketStore.getTicketByChannel(interaction.channel.id, { create: false });
    if (ticketData) {
      // The below needs looking at, because it's not being used, but at the bottom of this file there's something that's commented out?

      // The commented out part sends the person that opened a ticket a dm to let them know its been closed. Although it randomly errors.
      try {
        const member = await interaction.guild.members.fetch(ticketData.openedBy);
      } catch (error) {
        if (interaction.channel) {
          return interaction.channel.delete();
        } else {
          return;
        }
      }

      const embed = new EmbedBuilder()
        .setTitle('Ticket Closed 🔨')
        .addFields([
          { name: '<:Success:1078317580420382720> Opened By', value: `<@${ticketData.openedBy}>`, inline: true },
          { name: '<:Error:1078317593867325500> Closed By', value: `<@${interaction.member.user.id}>`, inline: true },
        ])
        .setFooter({
          text: 'Hexagon Tickets',
        })
        .setAuthor({
          name: interaction.guild.name,
          iconURL: interaction.guild.iconURL(),
        })
        .setColor('#34eb80')
        .setTimestamp();
      if (ticketData.claimedBy) {
        embed.addFields([{ name: '🔒 Claimed By', value: `<@${ticketData.claimedBy}>`, inline: true }]);
      } else {
        embed.addFields([{ name: '🔒 Claimed By', value: 'Unclaimed', inline: true }]);
      }

      try {
        const member = await interaction.guild.members.cache.get(ticketData.openedBy);

        if (ticketData.claimedBy) {
          embed.setDescription('What was your encounter like? Feel free to rate your ticket handler with one to five stars!')
          const components = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('1').setEmoji('⭐').setCustomId('1StarReview').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setLabel('2').setEmoji('⭐').setCustomId('2StarReview').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setLabel('3').setEmoji('⭐').setCustomId('3StarReview').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setLabel('4').setEmoji('⭐').setCustomId('4StarReview').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setLabel('5').setEmoji('⭐').setCustomId('5StarReview').setStyle(ButtonStyle.Secondary),
          );

          member.send({
            embeds: [embed],
            components: [components]
          });
        } else { // This code is so scuffed
          embed.setDescription('We hope you had a good experience.')
          member.send({
            embeds: [embed],
          });
        }
      } catch(error) {
        console.log(error);
      }

      interaction.channel.delete();
    } else {
      return interaction.channel.delete();
    }
  },

  start(client) {
    client.on('interactionCreate', async (interaction) => {
      if (interaction.isButton()) {
        if (interaction.customId !== 'ConfirmCloseRequest' && interaction.customId !== 'DenyCloseRequest' && interaction.customId !== 'ConfirmCloseTicket' && interaction.customId !== 'CloseTicket') {
          return;
        }

        const ticketSupportRole = await interaction.guild.roles.cache.find((Role) => Role.name.toLowerCase() === 'ticket support');
        if (!ticketSupportRole) {
          console.log('Unable to find ticket support role.');
          return;
        }
        if (interaction.customId === 'CloseTicket') {
          const ticketData = await ticketStore.getTicketByChannel(interaction.channel.id, { create: false });
          if (!ticketData) {
            console.log('Unable to find ticket data. Line 82, CloseTicket.js - Deleting Ticket');
            return interaction.channel.delete();
          }
          if (interaction.member.roles.cache.has(ticketSupportRole.id) || interaction.member.id.toString() === ticketData.openedBy) {
            this.closeTicket(interaction);
          } else {
            return interaction.reply({
              content: 'You do not have permission to close this ticket!',
              ephemeral: true,
            });
          }
        } else if (interaction.customId === 'ConfirmCloseTicket') {
          const ticketData = await ticketStore.getTicketByChannel(interaction.channel.id, { create: false });

          if (interaction.member.roles.cache.has(ticketSupportRole.id) || interaction.member.id.toString() === ticketData.openedBy) {
            this.confirmCloseTicket(interaction);
          } else {
            return interaction.reply({
              content: 'You do not have permission to close this ticket!',
              ephemeral: true,
            });
          }
        } else if (interaction.customId === 'DenyCloseRequest') {
          const ticketData = await ticketStore.getTicketByChannel(interaction.channel.id, { create: false });

          if (interaction.member.id.toString() === ticketData.openedBy) {
            const embed = new EmbedBuilder()
              .setTitle('Close Request')
              .setDescription('<:Error:1078317593867325500> The user declined to close the ticket.')
              .setColor('#F04A47');
            interaction.message.delete();
            return interaction.channel.send({
              embeds: [embed],
            });
          } else {
            const embed = new EmbedBuilder()
              .setDescription("<:Error:1078317593867325500> This interaction isn't for you.")
              .setColor('#F04A47');
            return interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        } else if (interaction.customId === 'ConfirmCloseRequest') {
          const ticketData = await ticketStore.getTicketByChannel(interaction.channel.id, { create: false });

          if (interaction.member.id.toString() === ticketData.openedBy) {
            this.confirmCloseTicket(interaction);
          } else {
            const embed = new EmbedBuilder()
              .setDescription("<:Error:1078317593867325500> This interaction isn't for you.")
              .setColor('#F04A47');
            return interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        }
      } else {
        return;
      }
    });
  },
};