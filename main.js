const { ethers } = require("ethers");
const axios = require("axios").default;
const fs = require("fs");
const liveTrader = require('./liveTrader');

require("dotenv").config();


let provider = new ethers.providers.AlchemyProvider(
    'arbitrum',
    process.env.ALCHEMY_KEY
);

let signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function main(){
    
    const configData = fs.readFileSync('config.json', 'utf8');
    const config = JSON.parse(configData);
    const exposure = config.EXPOSURE;

    const lt = new liveTrader(signer, 'bayc', testnet=true);
    await lt.initialize();

    console.log(await lt.getPosition())
    console.log(await lt.sumBuyAndSellOrders())

    console.log(await lt.getETHBalance())
    console.log(await lt.getBalance())


    await lt.cancelAllLimitOrders();
}

main()