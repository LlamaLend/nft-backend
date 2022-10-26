import { randomBytes } from "crypto";
import { execute } from "./utils/sql";

const handler = async (
    event: AWSLambda.APIGatewayEvent
): Promise<any> => {
    const { email, address } = JSON.parse(event.body!);
    const secret = randomBytes(40).toString('hex');
    await execute('INSERT INTO `emails` VALUES (?, ?, ?, ?)', [Date.now(), email, address.toLowerCase(), secret])
    return {
        statusCode: 200,
        body: "Email stored",
        headers: {
            "Access-Control-Allow-Origin": "*",
        }
    }
}

export default handler;