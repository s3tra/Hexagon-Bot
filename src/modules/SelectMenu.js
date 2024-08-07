import { EmbedBuilder } from 'discord.js';

export const selectMenu = {
  async stringSelectMenu(client, interaction) {
    let currentIndex = 0;
    if (interaction.customId === 'CommandEmbedSelectMenu') {
      currentIndex = 0;
      const embed = this.generateEmbed(client, interaction, 0);
      try {
        await interaction.update({
          embeds: [embed],
          ephemeral: true,
        });
      } catch (error) {
        return;
      }
    } else if (interaction.isButton()) {
      if (interaction.customId === 'commandMenuRight') {
        currentIndex = currentIndex + 10;
        const embed = this.generateEmbed(client, interaction, currentIndex);
        try {
          await interaction.update({
            embeds: [embed],
            ephemeral: true,
          });
        } catch (error) {
          return;
        }
      } else if (interaction.customId === 'commandMenuLeft') {
        currentIndex = currentIndex - 10;
        const embed = this.generateEmbed(client, interaction, currentIndex);
        try {
          await interaction.update({
            embeds: [embed],
            ephemeral: true,
          });
        } catch (error) {
          return;
        }
      }
    }
  },

  generateEmbed(client, interaction, start) {
    let filteredCommands;
    if (interaction.isStringSelectMenu()) {
      filteredCommands = client.commands.filter((command) => command.commandCategory === interaction.values[0]);
    } else {
      const title = interaction.message.embeds[0].title;
      filteredCommands = client.commands.filter((command) => command.commandCategory === title.split(':')[0]);
    }

    const filteredArray = Array.from(filteredCommands);
    if (filteredArray.length <= 10 && interaction.isButton()) {
      return interaction.reply({
        content: 'This interaction only has one page.',
        ephemeral: true,
      });
    }

    if (start < 0) start = 0;
    const current = filteredArray.slice(start, start + 10);
    let currentFields = [];
    current.forEach((command) => {
      currentFields.push({ name: command[1].displayName, value: '`' + command[1].commandDescription + '`' });
    });

    console.log(start);
    let embedTitle;
    if (interaction.isStringSelectMenu()) {
      embedTitle = `${interaction.values[0]}: ${start + 1}-${start + current.length} of ${filteredCommands.size}`;
    } else {
      const title = interaction.message.embeds[0].title;
      embedTitle = `${title.split(':')[0]}: ${start + 1}-${start + current.length} of ${filteredCommands.size}`;
    }
    return new EmbedBuilder().setTitle(embedTitle).setFields(currentFields).setColor('#0099ff');
  },

  start(client) {
    client.on('interactionCreate', async (interaction) => {
      if (interaction.isStringSelectMenu()) {
        this.stringSelectMenu(client, interaction);
      } else if (interaction.isButton()) {
        this.stringSelectMenu(client, interaction);
      }
    });
  },
};