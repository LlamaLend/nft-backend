import { fetchIpfsUrl } from "./utils/ipfs";
import sharp from "sharp";
import { join } from "path";
import TextToSVG from "text-to-svg";
const overlayImage = require("./overlays/overlay.png");
const font = require("./fonts/Roboto-Medium.ttf");

const handler = async (event: AWSLambda.APIGatewayEvent): Promise<any> => {
  const imageUrl = event.pathParameters!.imageUrl!;
  const liqTimestamp = Number(event.pathParameters!.deadline!) * 1e3;
  const realUrl = new Buffer(imageUrl, "base64").toString();
  const imageData = await fetchIpfsUrl(realUrl).then((r) => r.arrayBuffer());
  const { data: overlay } = await sharp(join(__dirname, "..", overlayImage))
    .resize({
      fit: sharp.fit.contain,
      height: 2000,
      width: 2000,
    })
    .toBuffer({ resolveWithObject: true });
  const textToSVG = TextToSVG.loadSync(font);
  const content = `Expires: ${new Date(liqTimestamp).toLocaleString("en-CA", {
    timeZone: "UTC",
    dateStyle: "short",
  } as any)}`;
  const options: any = {
    x: 0,
    y: 0,
    fontSize: 48,
    anchor: "top",
    attributes: {
      fill: "white",
      stroke: "black",
    },
  };
  const svg = textToSVG.getSVG(content, options);
  const svgToImage = await sharp(Buffer.from(svg))
    .resize(2000, 2000, { fit: "inside" })
    .toBuffer();
  const overlayWithTimestamp = await sharp(overlay)
    .composite([{ input: svgToImage, blend: "overlay", gravity: "south" }])
    .resize(2000, 2000, {
      fit: "contain",
    })
    .toBuffer();
  const composed = await sharp(Buffer.from(imageData))
    .resize(2000, 2000)
    .composite([{ input: overlayWithTimestamp }])
    .resize(2000, 2000, {
      fit: "cover",
    })
    .toBuffer();
  return {
    statusCode: 200,
    body: composed.toString("base64"),
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": `max-age=${24 * 3600}`, // 24 h
    },
    isBase64Encoded: true,
  };
};
/*
handler({
    pathParameters: {
        imageUrl: "aXBmczovL1FtWEFZbTJwWjdvbkdtcENqa0NxS0ZMRDRkMXFhVGRKY0txQk1UckQ2M0V3MTEvNTQ5MS5wbmc="
    }
} as any)
*/

export default handler;
