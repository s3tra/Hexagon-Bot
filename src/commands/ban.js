import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';

export default class BanCommand extends BaseCommand {
  constructor() {
    super({
      commandName: 'ban',
      displayName: 'Ban',
      commandDescription: 'Ban someone from the server.',
      commandCategory: 'Moderation',
      commandPermissions: ['BanMembers', 'Administrator'],
      commandOptions: [{ name: 'member', description: 'Who would you like to ban?', type: 6, required: true }],
    });
  }

  async execute(interaction) {
    const options = interaction.options;
    const member = interaction.guild.members.cache.get(options.getUser('member').id);
    if (!member) {
      const embed0 = new EmbedBuilder()
        .setDescription('<:Error:1078317593867325500> Please provide a valid user.')
        .setColor('#cc2900');
      return interaction.reply({
        embeds: [embed0],
        ephemeral: true,
      });
    }
    const embed = new EmbedBuilder()
      .setTitle('Member Banned')
      .setDescription('The specified member has been successfully banned.')
      .addFields([
        { name: 'Moderator', value: `<@${interaction.member.user.id}>` },
        { name: 'Member', value: `<@${member.user.id}>` },
      ])
      .setColor('#0099ff')
      .setTimestamp();

    const embed2 = new EmbedBuilder()
      .setDescription('<:Error:1078317593867325500> I am unable to ban this user. Is my role higher than theirs?')
      .setColor('#cc2900');
    const embed3 = new EmbedBuilder()
      .setDescription('<:Error:1078317593867325500> You are unable to ban this user.')
      .setColor('#cc2900');

      console.log(interaction.member.user.id)
    if (interaction.member.user.id === member.user.id) {
      return interaction.reply({
        embeds: [embed3],
        ephemeral: true
      });
    };
    if(member.roles.cache.size > 0 && interaction.member.roles.cache.size > 0) {
      if(member.roles.highest.comparePositionTo(interaction.member.roles.highest) > 0) {
        return interaction.reply({
          embeds: [embed3],
          ephemeral: true
        });
      };
    };
    if (member.bannable) {
      try {
        member.ban();
      } catch (error) {
        return interaction.reply({
          embeds: [embed2],
        });
      }
      return interaction.reply({
        embeds: [embed],
      });
    } else {
      return interaction.reply({
        embeds: [embed2],
        ephemeral: true,
      });
    }
  }
}