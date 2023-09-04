const { ethers } = require("ethers");
require("dotenv").config();
const axios = require("axios").default;
const ERC20_ABI = require("./abi/ERC20.json");

let provider = new ethers.providers.AlchemyProvider(
    process.env.NETWORK,
    process.env.ALCHEMY_KEY
);
  
let signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function main(){
    let res = await axios.get("https://api.nftperp.xyz/contracts");
    let contract = new ethers.Contract(res.data.data.weth, ERC20_ABI['abi'], signer);
    await contract.mint("0x8523b3bf8DBCa40cB0a26Caa748a9dBC47b4c9da", ethers.utils.parseEther("500"))
}

main()