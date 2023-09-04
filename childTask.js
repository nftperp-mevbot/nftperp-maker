const { parentPort } = require('worker_threads');
const { ethers } = require("ethers");
const fs = require("fs");
const liveTrader = require('./liveTrader');
const {generateDistribution, roundUp, roundDown} = require('./utils');

require("dotenv").config();


let provider = new ethers.providers.AlchemyProvider(
    'arbitrum',
    process.env.ALCHEMY_KEY
);

let signer = new ethers.Wallet(process.env.MAKER_KEY, provider);

async function make_market(symbol){

    const lt = new liveTrader(signer, symbol, leverage=1, testnet=true);
    await lt.initialize();
    await lt.cancelAllLimitOrders();
    

    while (true){
        try{
            
            const configData = fs.readFileSync('config.json', 'utf8');
            let config = JSON.parse(configData);

            const markPrice = parseFloat(await lt.getPrice());
            const indexPrice = parseFloat(await lt.getIndexPrice());


            const longPrice = Math.min(markPrice, indexPrice)  * (1 - parseFloat(config.SPREAD))
            const shortPrice = Math.max(markPrice, indexPrice)  * (1 + parseFloat(config.SPREAD))
            
            const longPrices = Array.from({ length: config.ORDER_COUNT }, (_, i) => longPrice * (1 - (i + 1) / 100));
            const shortPrices = Array.from({ length: config.ORDER_COUNT }, (_, i) => shortPrice * (1 + (i + 1) / 100));
            
            const buyDistribution = generateDistribution(config.ORDER_COUNT, config.SKEWNESS, config.TARGET_ETH);
            const sellDistribution = generateDistribution(config.ORDER_COUNT, config.SKEWNESS, config.TARGET_ETH);
            
            const { buySum, sellSum } = await lt.sumBuyAndSellOrders();


            if (buySum < config.TARGET_ETH * 0.8 | sellSum < config.TARGET_ETH * 0.8) {
                await lt.cancelAllLimitOrders();
    
                for (var i=0; i < config.ORDER_COUNT; i++ ) {
                    console.log('long', roundDown(longPrices[i], 2), roundDown(buyDistribution[i], 2))
                    await lt.createLimitOrder('long', roundDown(longPrices[i], 2), roundDown(buyDistribution[i], 2));
                    await new Promise(r => setTimeout(r, 1000));
                }
    
                for (var i=0; i < config.ORDER_COUNT; i++ ) {
                    console.log('short', roundUp(shortPrices[i], 2), roundUp(sellDistribution[i], 2))
                    await lt.createLimitOrder('short', roundUp(shortPrices[i], 2), roundUp(sellDistribution[i], 2));
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
    
            await new Promise(r => setTimeout(r, 60000));
        } catch (e) {
            console.log("Error")
        }

    }
}

parentPort.on('message', (amm) => {
    try {
        console.log(amm);
        make_market(amm);
        parentPort.postMessage({ status: 'done', amm });
    } catch (e) {
        console.error(`Error processing ${amm}`);
        parentPort.postMessage({ status: 'error', amm });
    }
});