import fetch from "node-fetch";
import { sendEmail } from "./utils/email";
import { execute } from "./utils/sql";

async function getLoansInDeadline(start:number, end:number){
  const loanData = await fetch("https://api.thegraph.com/subgraphs/name/0xngmi/llamalend-goerli", {
        method: "POST",
        body: JSON.stringify({
            query:
`query getloan($start: BigInt, $end: BigInt){
	loans(where: {
		deadline_gte: $start,
		deadline_lte: $end,
	}){
		id
		owner
		nftId
		deadline
		pool{
			name
		}
	}
}`,
            variables:{
                start,
                end,
            }
        })
    }).then(r=>r.json())
    return loanData.data.loans as {
      "id": string,
      "owner": string,
      "nftId": string,
      "deadline": string,
      "pool": {
        "name": string
      }
    }[]
}

async function notify(now:number, start:number, end:number, lastHour:boolean){
  const loans = await getLoansInDeadline(start, end)
  await Promise.all(loans.map(async loan=> {
    const emails = await execute(
      `SELECT
        address,
        email,
      FROM emails
      WHERE
        address=?;`, [loan.owner.toLowerCase()])
    console.log(emails)
    await Promise.all((emails[0] as any[]).map(email=>sendEmail(
      email.email,
      lastHour?"LlamaLend: 1hr till liquidation": "LlamaLend: 24 hours till liquidation",
`Your loan on LlamaLend in pool ${loan.pool.name} for NFT ${loan.nftId} will be liquidated in ${((Number(loan.deadline)-now)/60).toFixed(2)} minutes.

Go to https://llamalend.com/repay to repay the loan.`
    )))
  }))
}

const handler = async (): Promise<any> => {
    const now = Math.round(Date.now()/1e3)
    await Promise.all([
      notify(now, now, now + 3600*1.5, true),
      notify(now, now + 24*3600, now + 25*3600, false)
    ])
}

export default handler;
    