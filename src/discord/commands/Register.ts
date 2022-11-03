import { SlashCommandBuilder } from "discord.js";
import { execute } from "../../utils/sql";
import { Command } from "../Command";

export const Register: Command = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Registers Discord Account to address")
    .addStringOption((option) =>
      option
        .setName("address")
        .setDescription("Address to notify")
        .setRequired(true)
    ) as SlashCommandBuilder,
  run: async (interaction) => {
    const id = interaction.user.id;
    const address = interaction.options
      .get("address")
      ?.value?.toString()
      .toLowerCase();
    await execute("INSERT INTO `discord` VALUES (?, ?, ?)", [
      Date.now() / 1e3,
      id,
      address,
    ]);
    interaction.reply({ content: "Added Address", ephemeral: true });
  },
};
