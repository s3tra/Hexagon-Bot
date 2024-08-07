import { EmbedBuilder } from 'discord.js';
import userStore from '../database/UserStore.js';
import { BaseCommand } from '../BaseCommand.js';
import moment from 'moment';
import { StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

export default class Profile extends BaseCommand {
  constructor() {
    super({
      commandName: 'profile',
      displayName: 'Profile',
      commandDescription: 'View your profile.',
      commandCategory: 'Moderation',
      commandPermissions: null,
      commandOptions: null,
    });
  }
  async execute(interaction, client) {
    const userData = await userStore.getUser(interaction.member.id);

    if (userData) {
      const embed = new EmbedBuilder()
        .setTitle('Profile Embed')
        .setFields([
          { name: 'Total Commands Ran', value: '`' + userData.commandsRan + '`', inline: true },
          { name: 'Joined Discord', value: '`' + moment(interaction.member.user.createdAt).format('MM/DD/YYYY') + '`', inline: true },
          { name: 'Joined Server', value: '`' + moment(interaction.member.joinedAt).format('MM/DD/YYYY') + '`', inline: true }
        ])
        .setThumbnail(interaction.member.user.displayAvatarURL())
        .setColor('#0099ff')
        .setTimestamp();

      const badgeEmojis = {
        ['Developers']: '<:DeveloperIcon:1224008088437260298>',
        ['Partners']: '<:PartnerIcon:1224008089607606322>',
        ['Booster']: '<:Booster:1148988691495264388>',
        ['Bugs']: '<:BugIcon:1224008087359197304>',
        ['Premium']: '<:PremiumIcon:1224008091385729115>',
      };
      const guild = await client.guilds.cache.get('1078263416667512862');

      let description = '';
      if (guild) {
        try {
          const member = await guild.members.fetch(interaction.member.id);

          if (member) {
            if (member.roles.cache.has('1130257057031934012') || member.roles.cache.has('1109897498383896687') || member.roles.cache.has('1109897499231146075')) {
              description = description + `${badgeEmojis['Developers']} `;
            }
            if (member.roles.cache.has('1135366136104505474')) {
              description = description + `${badgeEmojis['Partners']} `;
            }
            if (member.roles.cache.has('1135372168633524406')) {
              description = description + `${badgeEmojis['Booster']} `;
            }
            if (member.roles.cache.has('1135371349548867594')) {
              description = description + `${badgeEmojis['Bugs']} `;
            }
          } else {
            console.log('Member is not in guild.');
          }
        } catch(error) {
          console.log('Member is not in guild.');
        }
      }

      if (userData.isPremium === true) {
        description = description + `${badgeEmojis['Premium']} `;
      }

      if (description !== '') {
        embed.setDescription(description);
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('profileSelectMenu')
        .addOptions(
          new StringSelectMenuOptionBuilder()
          .setLabel('Primary')
          .setValue('primaryProfileOption:' + interaction.user.id)
          .setDescription('View Primary Profile')
          .setDefault(true),
          new StringSelectMenuOptionBuilder()
            .setLabel('Guild Tickets')
            .setValue('guildTicketProfileOption:' + interaction.user.id)
            .setDescription('View Ticket Profile')
            .setDefault(false),
          new StringSelectMenuOptionBuilder()
            .setLabel('Global Tickets')
            .setValue('globalTicketProfileOption:' + interaction.user.id)
            .setDescription('View Global Ticket Profile')
            .setDefault(false),
        );

      const row = new ActionRowBuilder()
        .addComponents(selectMenu)

      return interaction.reply({
        embeds: [embed],
        components: [row]
      });
    } else {
      return;
    }
  }
}