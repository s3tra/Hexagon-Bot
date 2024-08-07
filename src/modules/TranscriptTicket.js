import ticketStore from '../database/TicketStore.js';
import { EmbedBuilder } from 'discord.js';
import { createTranscript } from 'discord-html-transcripts';

async function transcript(interaction, ticketData) {
  const embed = new EmbedBuilder()
    .setTitle('Ticket Transcript 🗒️')
    .addFields([
      { name: '<:Success:1078317580420382720> Opened By', value: `<@${ticketData.openedBy}>`, inline: true },
      { name: '🗒️ Transcripted By', value: `<@${interaction.member.user.id}>`, inline: true },
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

  if (ticketData.claimedBy) embed.addFields([{ name: '🔒 Claimed By', value: `<@${ticketData.claimedBy}>`, inline: true }]);
  else embed.addFields([{ name: '🔒 Claimed By', value: 'Unclaimed', inline: true }]);

  const messages = await interaction.channel.messages.fetch({ after: 1, limit: 1 });
  const firstMessage = messages.first();
  embed.addFields([{ name: '📋 Panel', value: firstMessage.embeds[0].data.title.toString().replace('🎉', ''), inline: true }]);
  const ticketChannel = await interaction.guild.channels.cache.find((channel) => channel.id === ticketData.channelId);
  const openedByMember = await interaction.guild.members.fetch(ticketData.openedBy);
  if (!openedByMember) {
    return interaction.reply({
      content: 'Unable to transcript ticket, invalid data.',
      ephemeral: true,
    });
  }
  let transcript;
  try {
    transcript = await createTranscript(ticketChannel, {
      limit: -1,
      returnBuffer: false,
      fileName: `ticket-${openedByMember.user.tag}.html`,
    });
  } catch (error) {
    console.log(error);
    return;
  }
  const transcriptChannel = await interaction.guild.channels.cache.find((channel) => channel.name.toLowerCase() === 'transcripts');
  transcriptChannel
    .send({
      embeds: [embed],
    })
    .then(
      transcriptChannel.send({
        files: [transcript],
      })
    );
  return interaction.reply({
    content: `Ticket transcripted by <@${interaction.member.user.id}>.`,
  });
}

export const transcriptTicket = {
  async transcriptTicket(interaction) {
    const ticketData = await ticketStore.getTicketByChannel(interaction.channel.id, { create: false });
    if (ticketData) {
      try {
        const member = await interaction.guild.members.fetch(ticketData.openedBy);
      } catch (error) {
        return interaction.reply({ content: 'Unable to transcript. The member has left the server.', ephemeral: true });
      }
      transcript(interaction, ticketData);
    } else {
      const messages = await interaction.channel.messages.fetch({ after: 1, limit: 1 });
      const firstMessage = messages.first();
      if (firstMessage.author.bot === true) {
        const firstMention = await firstMessage.mentions.users.first();
        const newData = await ticketStore.createTicket({
          channelId: interaction.channel.id.toString(),
          openedBy: firstMention.id.toString(),
        });
        transcript(interaction, newData);
      } else {
        return interaction.reply({
          content: 'Unable to locate ticket data, please report this to hexagon staff.',
          ephemeral: true,
        });
      }
    }
  },

  start(client, EmbedBuilder) {
    client.on('interactionCreate', async (interaction) => {
      if (interaction.isButton()) {
        if (interaction.customId !== 'TranscriptTicket') {
          return;
        }

        const ticketSupportRole = await interaction.guild.roles.cache.find((role) => role.name.toLowerCase() === 'ticket support');
        if (!ticketSupportRole) {
          console.log('Unable to find ticket support role.');
          return;
        }
        if (interaction.customId === 'TranscriptTicket') {
          if (interaction.member.roles.cache.has(ticketSupportRole.id)) {
            this.transcriptTicket(interaction, EmbedBuilder);
          } else {
            return interaction.reply({
              content: 'You do not have permission to transcript this ticket!',
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
