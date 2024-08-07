import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';

export default class Nick extends BaseCommand {
  constructor() {
    super({
      commandName: 'nick',
      displayName: 'Nick',
      commandDescription: 'Change the bots nickname.',
      commandCategory: 'Moderation',
      commandPermissions: ['ManageNicknames', 'Administrator'],
      commandOptions: [{ name: 'nickname', description: 'What would you like the nickname to be?', type: 3, required: true }],
    });
  }

  async execute(interaction, client) {
    const nickname = interaction.options.getString('nickname');
    if (nickname.length > 32) {
        const embed = new EmbedBuilder()
            .setDescription('<:Error:1078317593867325500> Nickname must be `32` characters or less.')
            .setColor('#cc2900');
        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    } else {
        const embed2 = new EmbedBuilder()
            .setDescription('<:Success:1078317580420382720> The bots nickname has been set to `' + nickname + '`.')
            .setColor('#34eb80');
        try {
            const bot = await interaction.guild.members.cache.get(client.user.id);
            bot.setNickname(nickname);
        } catch(error) {
            console.log(error);
            return;
        };
        interaction.reply({
            embeds: [embed2]
        });
    };
  };
};