import { ethers } from "ethers"
import { fetchIpfsUrl } from "./utils/ipfs";
import fetch from "node-fetch";

const provider = new ethers.providers.CloudflareProvider()

const handler = async (
    event: AWSLambda.APIGatewayEvent
): Promise<any> => {
    let { nftContract, nftId, chainId } = event.pathParameters!;
    if(Number(chainId) !== 1){
        return {
            statusCode: 404,
            body: "Only mainnet accepted"
        }
    }
    const hexId = ethers.BigNumber.from(nftId).toHexString().replace("0x0", "0x") // subgraph removes leading zeroes
    const loanData = await fetch("https://api.thegraph.com/subgraphs/name/0xngmi/llamalend", {
        method: "POST",
        body: JSON.stringify({
            query:
`query getloan($loan: ID){
	loans(where: {
		id: $loan
	}){
		id
		originalOwner
		owner
		nftId
        deadline
	}
}`,
            variables:{
                loan: hexId
            }
        })
    }).then(r=>r.json())

    const nftUsed = loanData.data.loans[0].nftId
    const deadline = loanData.data.loans[0].deadline;
    const nft = new ethers.Contract(
        nftContract!,
        ['function tokenURI(uint256 id) public view returns (string memory)'],
        provider
    )
    const nftUrl = await nft.tokenURI(nftUsed)
    const metadata = await fetchIpfsUrl(nftUrl).then(r => r.json())
    return {
        statusCode: 200,
        body: JSON.stringify({
            "name": `LlamaLend Collateral: ${metadata.name}`,
            "description": "NFT used for collateral in LlamaLend. Be careful when buying cause the loan for this NFT might have already expired!",
            "image": `https://nft.llamalend.com/image/${Buffer.from(metadata.image).toString('base64')}`,
            "deadline": deadline,
            "attributes": metadata.attributes
        }),
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        }
    }
}

/*
handler({
    pathParameters: {
        nftContract:"0xca7ca7bcc765f77339be2d648ba53ce9c8a262bd",
        nftId: "726338828353479263797447667261028799525270172770471244411392985021395495697",
        chainId: "1"
    }
} as any).then(console.log)
*/

export default handler