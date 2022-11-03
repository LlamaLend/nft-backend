import { SlashCommandBuilder } from "discord.js";
import { execute } from "../../utils/sql";
import { Command } from "../Command";

export const Remove: Command = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove Registration to Address")
    .addStringOption((option) =>
      option
        .setName("address")
        .setDescription("Address to remove")
        .setRequired(true)
    ) as SlashCommandBuilder,
  run: async (interaction) => {
    const id = interaction.user.id;
    const address = interaction.options
      .get("address")
      ?.value?.toString()
      .toLowerCase();
    await execute("DELETE FROM `discord` WHERE ID = (?) AND ADDRESS = (?)", [
      id,
      address,
    ]);
    interaction.reply({ content: "Removed Address", ephemeral: true });
  },
};
