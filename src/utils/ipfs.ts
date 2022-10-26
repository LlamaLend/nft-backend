import fetch from "node-fetch"

export function fetchIpfsUrl(url: string) {
    return fetch(url.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/"))
}