import { Client } from "discord.js";
import { getLoansInDeadline } from "../notifyEmails";
import { execute } from "../utils/sql";

export const NotifyUsers = async (client: Client, lastHour: boolean) => {
  const now = Math.round(Date.now() / 1e3);
  const start = lastHour ? now : now + 24 * 3600;
  const end = lastHour ? now + 3600 * 1.5 : now + 25 * 3600;
  const loans = await getLoansInDeadline(start, end);

  await Promise.all(
    loans.map(async (loan) => {
      const ids = await execute(
        `SELECT ADDRESS, ID FROM discord WHERE address =?;`,
        [loan.owner.toLowerCase()]
      );
      await Promise.all(
        (ids[0] as any[]).map((id) => {
          const message = `\n${
            lastHour
              ? "LlamaLend: 1hr till liquidation"
              : "LlamaLend: 24 hours till liquidation"
          }\nYour loan on LlamaLend in pool ${loan.pool.name} for NFT ${
            loan.nftId
          } will be liquidated in ${(
            (Number(loan.deadline) - now) /
            60
          ).toFixed(
            2
          )} minutes \nGo to https://llamalend.com/repay to repay the loan.`;
          client.users.fetch(id.ID).then((user) => user.send(message));
        })
      );
    })
  );
};
