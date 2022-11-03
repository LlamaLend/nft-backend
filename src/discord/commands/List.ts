import { SlashCommandBuilder } from "discord.js";
import { execute } from "../../utils/sql";
import { Command } from "../Command";

export const List: Command = {
  data: new SlashCommandBuilder()
    .setName("list")
    .setDescription("List of addresses registered"),
  run: async (interaction) => {
    const id = interaction.user.id;
    const addresses = await execute(
      `SELECT ADDRESS FROM discord WHERE ID =?;`,
      [id]
    );
    let message = ``;
    (addresses[0] as any[]).map((address) => {
        message += `${address.ADDRESS}\n`
    })
    interaction.reply({ephemeral: true, content: message});
  },
};
