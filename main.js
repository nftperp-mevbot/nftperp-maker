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

    const lt = new liveTrader(signer, 'bayc', leverage=1, testnet=true);
    await lt.initialize();
    await lt.cancelAllLimitOrders();
    

    while (true){
        try{
            const markPrice = parseFloat(await lt.getPrice());
            const shortPrices = Array.from({ length: 5 }, (_, i) => markPrice * (1 + (i + 1) / 100));
            const longPrices = Array.from({ length: 5 }, (_, i) => markPrice * (1 - (i + 1) / 100));
    
    
            const { buySum, sellSum } = await lt.sumBuyAndSellOrders();
            console.log(buySum, sellSum)
            if (buySum < 40 | sellSum < 40) {
                await lt.cancelAllLimitOrders();
    
                for (const price of longPrices) {
                    await lt.createLimitOrder('long', price.toFixed(1), 10);
                }
    
                for (const price of shortPrices) {
                    await lt.createLimitOrder('short', price.toFixed(1), 10);
                }
            }
    
            await new Promise(r => setTimeout(r, 60000));
        } catch (e) {

        }

    }
}

main()