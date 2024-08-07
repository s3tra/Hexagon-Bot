import { BaseCommand } from '../BaseCommand.js';
import { claimTicket } from '../modules/ClaimTicket.js';

export default class Support extends BaseCommand {
  constructor() {
    super({
      commandName: 'claim',
      displayName: 'Claim',
      commandDescription: 'Claim a ticket.',
      commandCategory: 'Tickets',
      commandPermissions: null,
      commandOptions: null,
    });
  }

  async execute(interaction) {
    const ticketSupportRole = await interaction.guild.roles.cache.find((Role) => Role.name.toLowerCase() === 'ticket support');
    if (!ticketSupportRole) {
      return console.log('Unable to find ticket support role.');
    }
    
    if (interaction.member.roles.cache.has(ticketSupportRole.id)) {
        return claimTicket.claimTicket(interaction);
    } else {
        return interaction.reply({
            content: 'You do not have permission to claim this ticket!',
            ephemeral: true
        });
    }
  }
}