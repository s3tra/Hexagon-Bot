import { ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { BaseCommand } from '../BaseCommand.js';

export default class AddModCommand extends BaseCommand {
  constructor() {
    super({
      commandName: 'lockdown',
      displayName: 'Lockdown',
      commandDescription: 'Lock a channel, prevents users from talking.',
      commandCategory: 'Moderation',
      commandPermissions: ['Administrator', 'ManageServer'],
      commandOptions: [
        {
            name: 'set',
            description: 'Lockdown the current channel.',
            type: ApplicationCommandOptionType.Subcommand,
            options: []
        },
        {
          name: 'remove',
          description: 'Remove a channel lockdown.',
          type: ApplicationCommandOptionType.Subcommand,
          options: []
        },
      ],
    });
  }

  async execute(interaction) {
    const embed = new EmbedBuilder();
    const currentChannel = interaction.channel;
    const role = interaction.guild.roles.everyone;

    if (!currentChannel) return console.error('Unable to find the channel.');
    if (!role) return console.error('Unable to find the everyone role.');

    if (interaction.options.getSubcommand() === 'set') {
        currentChannel.permissionOverwrites.edit(role.id, {
            SendMessages: false,
            AddReactions: false
        });

        embed.setDescription('<:Success:1078317580420382720> This channel is in lockdown mode.').setColor('#34eb80');
        try {
            return interaction.reply({
                embeds: [embed],
            });
        } catch(error) {
            return console.error('Error whilst replying to the interaction.');
        };
    } else if (interaction.options.getSubcommand() === 'remove') {
        const permissionOverwrites = currentChannel.permissionOverwrites.cache.get(role.id);
        if (permissionOverwrites && permissionOverwrites.allow.has(PermissionsBitField.Flags.SendMessages) === false && permissionOverwrites.allow.has(PermissionsBitField.Flags.AddReactions) === false) {
            currentChannel.permissionOverwrites.edit(role.id, {
                SendMessages: true,
                AddReactions: true
            });
            try {
                embed.setDescription('<:Success:1078317580420382720> The channel has been re-opened.').setColor('#34eb80');
                return interaction.reply({
                    embeds: [embed],
                });
            } catch(error) {
                console.error('An error occured whilst replying to the interaction.');
            };
        } else {
            try {
                embed.setDescription('<:Error:1078317593867325500> This channel is not in lockdown mode.').setColor('#cc2900');
                return interaction.reply({
                    embeds: [embed],
                    ephemeral: true
                });
            } catch(error) {
                console.error('An error occured whilst replying to the interaction.');
            };
        };
    };
  };
};