import { EmbedBuilder } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';

export default class AddModCommand extends BaseCommand {
  constructor() {
    super({
      commandName: 'purge',
      displayName: 'Purge',
      commandDescription: 'Bulk delete messages.',
      commandCategory: 'Moderation',
      commandPermissions: ['Administrator', 'ManageServer'],
      commandOptions: [{ name: 'amount', description: 'The amount of messages to be deleted.', type: 4, required: true, minValue: 1, maxValue: 100}]
    });
  }

  async execute(interaction) {
    const embed = new EmbedBuilder();
    const currentChannel = interaction.channel;
    const input = interaction.options.getInteger('amount');

    if (!currentChannel) return console.error('Unable to find the channel.');
    try {
        await currentChannel.bulkDelete(input);
    } catch(error) {
        embed.setDescription('<:Error:1078317593867325500> An error occured whilst attempting to delete the messages.').setColor('#cc2900');
        console.error(error);
        return interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    };

    embed.setDescription('<:Success:1078317580420382720> Successfully deleted `' + input + '` messages.').setColor('#34eb80');
    try {
        return interaction.reply({
            embeds: [embed],
        });
    } catch(error) {
         return console.error(error);
    };
  };
};