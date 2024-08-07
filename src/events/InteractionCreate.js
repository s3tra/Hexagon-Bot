import { BaseEvent } from '../BaseEvent.js';
import guildStore from '../database/GuildStore.js';
import userStore from '../database/UserStore.js';
import { EmbedBuilder, PermissionsBitField, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import moment from 'moment';

async function checkPermission(interaction, commandPermissions) {
  const guildData = await guildStore.getGuild(interaction.guild.id);

  if (guildData.moderation.modUsers.find((id) => id === interaction.user.id)) return true;
  else {
    let authorised = false;
    guildData.moderation.modRoles.forEach((role) => {
      interaction.member.roles.cache.forEach((memberRole) => {
        if (memberRole.id === role) authorised = true;
        else return;
      });
    });

    if (authorised === true) return true;
    else {
      const permissionFlags = commandPermissions.map((permission) => PermissionsBitField.Flags[permission]);

      const permissionChecks = await Promise.all(
        permissionFlags.map(async (flag) => {
          const checkPerm = await interaction.member.permissions.has(flag);
          return checkPerm;
        })
      );

      const hasOne = permissionChecks.some((checkPerm) => checkPerm);
      return hasOne;
    }
  }
}

async function updateUserStats(interaction) {
  const guildData = await guildStore.getGuild(interaction.guild.id);

  const userData = await userStore.getUser(interaction.member.user.id);

  userData.commandsRan = parseInt(userData.commandsRan) + 1;
  userData.save();
}

export default class InteractionCreate extends BaseEvent {
  constructor() {
    super({ eventName: 'interactionCreate' });
  }

  async execute(client, [interaction]) {
    if (interaction.isCommand()) {
      if (!interaction.guild) { // If there is no guild then return, no guild suggests it's a dm
        return interaction.reply({
          content: "It's not possible to use commands in dms right now, come back later!",
          ephemeral: true
        })
      }
      
      await updateUserStats(interaction);
      
      const command = client.commands.get(interaction.commandName);
      if (command) {
        const commandPermissions = command.commandPermissions;
        if (commandPermissions) {
          const permission = await checkPermission(interaction, commandPermissions);
          if (permission === true) {
            return command.execute(interaction, client);
          } else {
            const embed = new EmbedBuilder()
              .setDescription('<:Error:1078317593867325500> You do not have permission to run this command.')
              .setColor('#F04A47');
            return interaction.reply({
              embeds: [embed],
              ephemeral: true,
            });
          }
        } else {
          return command.execute(interaction, client);
        }
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === '5StarReview' || interaction.customId === '4StarReview' || interaction.customId === '3StarReview' || interaction.customId === '2StarReview' || interaction.customId === '1StarReview') {
        const splitString = interaction.customId.split(/(?=[A-Z])/);

        if (splitString[1] === 'Star') {
            const data = interaction.message.embeds[0].data.fields;

            const guildName = interaction.message.embeds[0].author.name;
            const guild = await client.guilds.cache.find(guild => guild.name === guildName);

            console.log(guild.id);

            const claimedByObject = data.find(item => item.name === '🔒 Claimed By');

            if (claimedByObject) {
                const claimedByValue = claimedByObject.value.replace(/<@|>/g, '');

                const userData = await userStore.getUser(claimedByValue);
                if (!userData) {
                    const newData = new userStore({
                        userId: claimedByValue,
                        starRating: splitString[0],
                        allTimeTotalStarRatings: 1,
                        totalStarRatings: {
                            allTimeFive: splitString[0] === '5' ? 1 : 0,
                            allTimeFour: splitString[0] === '4' ? 1 : 0,
                            allTimeThree: splitString[0] === '3' ? 1 : 0,
                            allTimeTwo: splitString[0] === '2' ? 1 : 0,
                            allTimeOne: splitString[0] === '1' ? 1 : 0
                        }
                    })
                    newData.save();

                    console.log(splitString[0]);
                } else {
                    if (guild) {
                      const guildTicketProfile = userData.guildTicketProfile[guild.id];

                      if (!guildTicketProfile) {
                        console.log('Unable to find guildTicketProfile Data!');
                      }

                      const totalStarRatings = guildTicketProfile.totalStarRatings;
                      const newAllTimeTotalStarRatings = Number(guildTicketProfile.allTimeTotalStarRatings) + 1;
                      guildTicketProfile.allTimeTotalStarRatings = String(newAllTimeTotalStarRatings);
                      await userData.save();

                      const totalResponses2 = Number(guildTicketProfile.allTimeTotalStarRatings);

                      if (splitString[0] === '5') totalStarRatings.allTimeFive += 1;
                      if (splitString[0] === '4') totalStarRatings.allTimeFour += 1;
                      if (splitString[0] === '3') totalStarRatings.allTimeThree += 1;
                      if (splitString[0] === '2') totalStarRatings.allTimeTwo += 1;
                      if (splitString[0] === '1') totalStarRatings.allTimeOne += 1;

                      let totalRating2 = 0;
                      for (const starRating in totalStarRatings) {
                          if (totalStarRatings.hasOwnProperty(starRating)) {
                              if (starRating == 'allTimeFive') totalRating2 += totalStarRatings[starRating] * 5;
                              if (starRating == 'allTimeFour') totalRating2 += totalStarRatings[starRating] * 4;
                              if (starRating == 'allTimeThree') totalRating2 += totalStarRatings[starRating] * 3;
                              if (starRating == 'allTimeTwo') totalRating2 += totalStarRatings[starRating] * 2;
                              if (starRating == 'allTimeOne') totalRating2 += totalStarRatings[starRating] * 1;
                          }
                      };
                      const averageRating2 = totalRating2 / totalResponses2;

                      if (Number(guildTicketProfile.starRating) >= 5) {
                        const row = interaction.message.components[0];
                        const buttons = row.components;
                    
                        buttons.forEach(button => {
                            button.data.disabled = true;
                        });
                      } else {
                        guildTicketProfile.starRating = String(averageRating2);
                        userData.markModified('guildTicketProfile');
                        await userData.save();
                      }
                    }

                    const totalStarRatings = userData.totalStarRatings;
                    userData.allTimeTotalStarRatings += 1;
                    await userData.save();
                    
                    const totalResponses = userData.allTimeTotalStarRatings;

                    if (splitString[0] === '5') totalStarRatings.allTimeFive += 1;
                    if (splitString[0] === '4') totalStarRatings.allTimeFour += 1;
                    if (splitString[0] === '3') totalStarRatings.allTimeThree += 1;
                    if (splitString[0] === '2') totalStarRatings.allTimeTwo += 1;
                    if (splitString[0] === '1') totalStarRatings.allTimeOne += 1;

                    let totalRating = 0;
                    for (const starRating in totalStarRatings) {
                        if (totalStarRatings.hasOwnProperty(starRating)) {
                            if (starRating == 'allTimeFive') totalRating += totalStarRatings[starRating] * 5;
                            if (starRating == 'allTimeFour') totalRating += totalStarRatings[starRating] * 4;
                            if (starRating == 'allTimeThree') totalRating += totalStarRatings[starRating] * 3;
                            if (starRating == 'allTimeTwo') totalRating += totalStarRatings[starRating] * 2;
                            if (starRating == 'allTimeOne') totalRating += totalStarRatings[starRating] * 1;
                        }
                    };
                    const averageRating = totalRating / totalResponses;

                    if (userData.starRating >= 5) {
                      const row = interaction.message.components[0];
                      const buttons = row.components;
                  
                      buttons.forEach(button => {
                          button.data.disabled = true;
                      });
                  
                      await interaction.message.edit({
                          components: [row]
                      });

                      return interaction.reply({
                        content: 'Rating recorded.', // Not really. Hahaha!
                        ephemeral: true
                      });
                    } else {
                      userData.starRating = averageRating;
                      userData.save();
                    }
                }

                const row = interaction.message.components[0];
                const buttons = row.components;
            
                buttons.forEach(button => {
                    button.data.disabled = true;
                });
            
                await interaction.message.edit({
                    components: [row]
                });

                try {
                  return interaction.reply({
                    content: 'Rating recorded.',
                    ephemeral: true
                  });
                } catch(error) {
                  return;
                }
            }
        } else {
          return;
        }
      }
    } else if (interaction.isSelectMenu()) {
      const selectedValue = interaction.values[0];
      const userData = await userStore.getUser(interaction.member.id);

      async function getBadges(embed) {
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
      }
      
      let split = null;
      try {
        split = selectedValue.split(':');
      } catch(error) {
        return console.log(error);
      }

      if (split[0] === 'guildTicketProfileOption') {
        if (split[1] !== interaction.user.id) {
          return interaction.reply({
            content: "This interaction isn't for you.",
            ephemeral: true
          });
        }

        let guildTicketProfileVal = userData.guildTicketProfile[interaction.channel.guild.id];

        if (!guildTicketProfileVal) {
          const newData = {
            ticketsHandled: '0',
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
          guildTicketProfileVal = newData;
    
          userData.markModified('guildTicketProfile');
          userData.save();
        }

        let ratingValue = '<:Empty:1167042384484372500> <:Empty:1167042384484372500> <:Empty:1167042384484372500> <:Empty:1167042384484372500> <:Empty:1167042384484372500>';
        if (guildTicketProfileVal.starRating) {
          console.log(guildTicketProfileVal.starRating)
          const roundedRating = Math.round(Number(guildTicketProfileVal.starRating) * 2) / 2;
          const fullStars = Math.floor(roundedRating);
          const halfStar = (roundedRating % 1 === 0.5) ? 1 : 0;
          
          const fullStarEmoji = '<:Full:1167041545329987635>';
          const halfStarEmoji = '<:Half:1167047370484219914>';
          const emptyStarEmoji = '<:Empty:1167042384484372500>';
          
          ratingValue = (fullStarEmoji + ' ').repeat(fullStars) + (halfStar ? halfStarEmoji + ' ' : '') + (emptyStarEmoji + ' ').repeat(5 - fullStars - halfStar);
        }

        console.log(ratingValue);
        const embed = new EmbedBuilder()
          .setTitle('Profile Embed')
          .setFields([
            {name: 'Tickets Handled', value: '`' + String(guildTicketProfileVal.ticketsHandled) + '`', inline: true},
            {name: 'Ticket Rating', value: ratingValue, inline: true}
          ])
          .setThumbnail(interaction.member.user.displayAvatarURL())
          .setColor('#0099ff')
          .setTimestamp();

        await getBadges(embed);

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('profileSelectMenu')
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel('Primary')
              .setValue('primaryProfileOption:' + interaction.user.id)
              .setDescription('View Primary Profile')
              .setDefault(false),
            new StringSelectMenuOptionBuilder()
              .setLabel('Guild Tickets')
              .setValue('guildTicketProfileOption:' + interaction.user.id)
              .setDescription('View Your Ticket Profile')
              .setDefault(true),
            new StringSelectMenuOptionBuilder()
              .setLabel('Global Tickets')
              .setValue('globalTicketProfileOption:' + interaction.user.id)
              .setDescription('View Global Ticket Profile')
              .setDefault(false),
          );

        const row = new ActionRowBuilder()
          .addComponents(selectMenu)

        return await interaction.update({
          embeds: [embed],
          components: [row]
        });
      } else if (split[0] === 'globalTicketProfileOption') {
        if (split[1] !== interaction.user.id) {
          return interaction.reply({
            content: "This interaction isn't for you.",
            ephemeral: true
          });
        }

        let ratingValue = '<:Empty:1167042384484372500> <:Empty:1167042384484372500> <:Empty:1167042384484372500> <:Empty:1167042384484372500> <:Empty:1167042384484372500>';
        if (userData.starRating) {
          const roundedRating = Math.round(userData.starRating * 2) / 2;
          const fullStars = Math.floor(roundedRating);
          const halfStar = (roundedRating % 1 === 0.5) ? 1 : 0;
          
          const fullStarEmoji = '<:Full:1167041545329987635>';
          const halfStarEmoji = '<:Half:1167047370484219914>';
          const emptyStarEmoji = '<:Empty:1167042384484372500>';
          
          ratingValue = (fullStarEmoji + ' ').repeat(fullStars) + (halfStar ? halfStarEmoji + ' ' : '') + (emptyStarEmoji + ' ').repeat(5 - fullStars - halfStar);
        }

        const embed = new EmbedBuilder()
          .setTitle('Profile Embed')
          .setFields([
            {name: 'Global Handled', value: '`' + userData.ticketsHandled + '`', inline: true},
            {name: 'Global Rating', value: ratingValue, inline: true}
          ])
          .setThumbnail(interaction.member.user.displayAvatarURL())
          .setColor('#0099ff')
          .setTimestamp();

        await getBadges(embed);

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('profileSelectMenu')
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel('Primary')
              .setValue('primaryProfileOption:' + interaction.user.id)
              .setDescription('View Primary Profile')
              .setDefault(false),
            new StringSelectMenuOptionBuilder()
              .setLabel('Guild Tickets')
              .setValue('guildTicketProfileOption:' + interaction.user.id)
              .setDescription('View Your Ticket Profile')
              .setDefault(false),
            new StringSelectMenuOptionBuilder()
              .setLabel('Global Tickets')
              .setValue('globalTicketProfileOption:' + interaction.user.id)
              .setDescription('View Global Ticket Profile')
              .setDefault(true),
          );

        const row = new ActionRowBuilder()
          .addComponents(selectMenu)

        return await interaction.update({
          embeds: [embed],
          components: [row]
        });
      } else if (split[0] === 'primaryProfileOption') {
        if (split[1] !== interaction.user.id) {
          return interaction.reply({
            content: "This interaction isn't for you.",
            ephemeral: true
          });
        }

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

        await getBadges(embed);

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
              .setDescription('View Your Ticket Profile')
              .setDefault(false),
            new StringSelectMenuOptionBuilder()
              .setLabel('Global Tickets')
              .setValue('globalTicketProfileOption:' + interaction.user.id)
              .setDescription('View Global Ticket Profile')
              .setDefault(false),
          );

        const row = new ActionRowBuilder()
          .addComponents(selectMenu)

        return await interaction.update({
          embeds: [embed],
          components: [row]
        });
      }
    } else {
      return;
    }
  }
}