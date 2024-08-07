import ticketStore from '../database/TicketStore.js';
import userStore from '../database/UserStore.js';

export const claimTicket = {
  async claimTicket(interaction) {
    if (interaction.channel.name.toString().match('🔒')) {
      return interaction.reply({
        content: 'This ticket has already been claimed!',
        ephemeral: true,
      });
    } else {
      const userData = await userStore.getUser(interaction.member.id);
      const ticketData = await ticketStore.getTicketByChannel(interaction.channel.id.toString(), { create: false });

      if (ticketData) {
        ticketData.claimedBy = interaction.member.id;
        ticketData.save();
      } else {
        const embed = new EmbedBuilder()
          .setDescription('<:Error:1078317593867325500> This feature can only be used inside a ticket.').setColor('#cc2900');
        
        return interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      }

      if (userData) {
        const updatedData = Number(userData.ticketsHandled) + 1;
        userData.ticketsHandled = updatedData;

        let guildTicketProfileVal = userData.guildTicketProfile[interaction.channel.guild.id];
        if (guildTicketProfileVal) {
          console.log('guild ticket profile - claim ticket cmd')
          const updatedData2 = Number(guildTicketProfileVal.ticketsHandled) + 1;
          guildTicketProfileVal.ticketsHandled = updatedData2;

          userData.markModified('guildTicketProfile');
          userData.save();
        } else {
            const newData = {
              ticketsHandled: '1',
              starRating: '0',
              totalStarRatings: {
                  allTimeFive: 0,
                  allTimeFour: 0,
                  allTimeThree: 0,
                  allTimeTwo: 0,
                  allTimeOne: 0
              },
              allTimeTotalStarRatings: 0,
            };
            userData.guildTicketProfile[interaction.channel.guild.id] = newData;
      
            userData.markModified('guildTicketProfile');
            userData.save();
        }
      }

      interaction.channel.setName(`🔒-${interaction.channel.name}`);

      return interaction.reply({
        content: `This ticket has been claimed by <@${interaction.member.id}>.`,
      });
    }
  },

  start(client, embedBuilder) {
    client.on('interactionCreate', async (interaction) => {
      if (interaction.isButton()) {
        if (interaction.customId !== 'ClaimTicket') return;

        const ticketSupportRole = await interaction.guild.roles.cache.find((Role) => Role.name.toLowerCase() === 'ticket support');
        if (!ticketSupportRole) {
          return console.log('Unable to find ticket support role.');
        }

        if (interaction.member.roles.cache.has(ticketSupportRole.id)) {
          this.claimTicket(interaction, embedBuilder);
        } else {
          return interaction.reply({
            content: 'You do not have permission to claim this ticket!',
            ephemeral: true,
          });
        }
      } else {
        return;
      }
    });
  },
};