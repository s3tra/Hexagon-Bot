import { EmbedBuilder, ApplicationCommandOptionType } from "discord.js";
import { BaseCommand } from "../BaseCommand.js";
import { guildQueues } from "./youtube.js";
import userStore from "../database/UserStore.js";

export default class Join extends BaseCommand {
  constructor() {
    super({
      commandName: "queue",
      displayName: "Queue",
      commandDescription: "Configure the music queue.",
      commandCategory: "Music",
      commandPermissions: null,
      commandOptions: [
        {
          name: "remove",
          description: "Remove a song from the queue.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "name",
              description: "What is the name of the song?",
              type: ApplicationCommandOptionType.String,
              required: true,
            },
          ],
        },
        {
          name: "list",
          description: "List the current queue.",
          type: ApplicationCommandOptionType.Subcommand,
          options: null,
        },
      ],
    });
  }

  async execute(interaction) {
    // Define an embed for replies
    const embed = new EmbedBuilder()
      .setColor("#cc2900");

    // Get the user data
    const userData = await userStore.getUser(interaction.member.id);
    if (!userData) return interaction.reply({ content: "An error occurred while getting the user data.", ephemeral: true });

    // Check to see if the user is premium
    if (userData.isPremium === false) {
      embed.setDescription("<:Error:1078317593867325500> This command is a [premium](https://www.hexagonbot.com/premium) feature.");
      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    // Check to see if the queue is empty
    const queue = guildQueues.get(interaction.channel.guild.id);
    if (!queue || queue.length == 0) {
      embed.setDescription("<:Error:1078317593867325500> The queue is empty.");
      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    // Function to find songs in the queue
    function findSongInQueue(songName) {
      let songFound = false;
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].title.toLowerCase() === songName.toLowerCase()) {
          songFound = true;
          queue.splice(i, 1);
        }
      };

      return songFound;
    }

    if (interaction.options.getSubcommand() === "remove") {
      // Get the song name
      const songName = interaction.options.getString("name");

      // Check if the song is in the queue
      if (findSongInQueue(songName)) {
        const successEmbed = new EmbedBuilder()
          .setColor("#34eb80")
          .setDescription("<:Success:1078317580420382720> The song has been removed from the queue.")
        return interaction.reply({
          embeds: [successEmbed],
        })
      } else {
        embed.setDescription("<:Error:1078317593867325500> This song is not in the queue.");
        return interaction.reply({
          embeds: [embed],
          ephemeral: true
        });
      }
    } else if (interaction.options.getSubcommand() === "list") {
      try {
        // Build the embed
        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setDescription("Here is a list of songs in the queue.")
          .setTimestamp();

        queue.forEach(queueItem => {
          embed.addFields(
            { name: queueItem.title, value: `\`${queueItem.user}\`` },
          );
        });

        // Send the reply
        return interaction.reply({
          embeds: [embed],
        });
      } catch (error) {
        return console.log(error);
      }
    }
  }
}