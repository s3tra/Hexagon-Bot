import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';
import guildStore from '../database/GuildStore.js';

export default class Punishments extends BaseCommand {
  constructor() {
    super({
      commandName: 'punishments',
      displayName: 'Punishments',
      commandDescription: 'View someones punishments.',
      commandCategory: 'Moderation',
      commandPermissions: ['Administrator'],
      commandOptions: [{ name: 'member', description: 'The person whos punishments to show.', type: 6, required: true }],
    });
  }

  async execute(interaction) {
    const options = interaction.options;
    const member = interaction.guild.members.cache.get(options.getUser('member').id);
    const userId = member.id;

    async function getDatabaseMember(user, guildId) {
        const guildData = await guildStore.getGuild(guildId);
      
        if (!guildData.members) guildData.members = [];
      
        let guildMemberData = await guildData.members.find((member) => member.id === user.id);
      
        if (!guildMemberData)
          guildData.members.push({
            id: user.id,
            warnings: [],
          });
        guildMemberData = await guildData.members.find((member) => member.id === user.id);
      
        return guildMemberData;
    }
    
    const databaseMember = await getDatabaseMember(member, interaction.guild.id);
    const userWarnings = databaseMember.warnings;
    
    const embed = new EmbedBuilder()
        .setTitle('Punishments')
        .setDescription(`Viewing Punishments for <@${userId}>.`)
        .setColor('#0099ff')
        .setTimestamp();
    
    if (userWarnings.length > 0) {
        userWarnings.forEach(warning => {
            try {
                embed.addFields(
                    { name: `Id: ${warning.id}`, value: `Warning: \`${warning.reason}\`` }
                )
            } catch(error) {
                return;
            }
        });
    
        return interaction.reply({
            embeds: [embed],
        });
    } else {
        const embed2 = new EmbedBuilder()
          .setDescription('<:Error:1078317593867325500> Unable to find warnings for the provided member.')
          .setColor('#cc2900');
    
        return interaction.reply({
          embeds: [embed2],
          ephemeral: true
        });
    }    
  }
}