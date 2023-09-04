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

const configData = fs.readFileSync('config.json', 'utf8');
const config = JSON.parse(configData);

function generateDistribution(orderCount, skewness) {
    let distribution = [];

    for (let i = 0; i < orderCount; i++) {
        distribution.push(Math.pow(skewness, i));
    }

    const sum = distribution.reduce((acc, val) => acc + val, 0);
    distribution = distribution.map(val => (val / sum) * config.TARGET_ETH);
    return distribution;
}



async function main(){    
    const lt = new liveTrader(signer, 'bayc', leverage=1, testnet=true);
    await lt.initialize();
    await lt.cancelAllLimitOrders();

    const markPrice = parseFloat(await lt.getPrice());
    const spreadFactor = config.SPREAD;
    const orderCount = config.ORDER_COUNT;
    const targetExposure = config.TARGET_ETH;
    const skewness = config.SKEWNESS;
    
    const distribution = generateDistribution(orderCount, config.SKEWNESS);
    
    for (let i = 0; i < orderCount; i++) {
        const longPrice = markPrice * (1 - spreadFactor * (i + 1)); 
        const shortPrice = markPrice * (1 + spreadFactor * (i + 1)); 
        
        await lt.createLimitOrder('long', longPrice.toFixed(1), distribution[i]);
        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
        await lt.createLimitOrder('short', shortPrice.toFixed(1), distribution[i]);
        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
    }

    let orderPercentageThreshold = config.ORDER_PERCENTAGE_THRESHOLD;
    
    while (true) {
        try {
            let currentOrders = await lt.getOrders();
            const markPrice = parseFloat(await lt.getPrice());
            const lowerBound = markPrice * (1 - orderPercentageThreshold / 100);
            const upperBound = markPrice * (1 + orderPercentageThreshold / 100);
    
            const relevantBuyOrders = currentOrders.buyOrders.filter(order => order.price >= lowerBound);
            const relevantSellOrders = currentOrders.sellOrders.filter(order => order.price <= upperBound);
    
            const buyTotal = relevantBuyOrders.reduce((acc, order) => acc + order.size, 0);
            const sellTotal = relevantSellOrders.reduce((acc, order) => acc + order.size, 0);
    
            const diff = Math.abs(buyTotal - sellTotal);
    
            if (diff > orderPercentageThreshold / 100 * targetExposure) {

                for (let order of currentOrders.buyOrders) {
                    if (order.price < lowerBound) {
                        await lt.cancelLimitOrder('long', order.price);
                        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
                    }
                }
                
                for (let order of currentOrders.sellOrders) {
                    if (order.price > upperBound) {
                        await lt.cancelLimitOrder('short', order.price);
                        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
                    }
                }
    
                const ordersNeeded = Math.ceil(diff / config.TARGET_ETH);
    
                const buyDistribution = generateDistribution(ordersNeeded, skewness);
                const sellDistribution = generateDistribution(ordersNeeded, skewness).reverse();
    
                for (let i = 0; i < ordersNeeded; i++) {
                    const longPrice = markPrice * (1 - spreadFactor * (i + 1));
                    if (!relevantBuyOrders.some(order => order.price === longPrice)) {
                        await lt.createLimitOrder('long', longPrice.toFixed(1), buyDistribution[i]);
                        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
                    }
                }
    
                for (let i = 0; i < ordersNeeded; i++) {
                    const shortPrice = markPrice * (1 + spreadFactor * (i + 1));
                    if (!relevantSellOrders.some(order => order.price === shortPrice)) {
                        await lt.createLimitOrder('short', shortPrice.toFixed(1), sellDistribution[i]);
                        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
                    }
                }
                
                currentOrders = await lt.getOrders();
            }
    
            await new Promise(r => setTimeout(r, 10000));
        } catch (e) {
            console.error(e);
        }
    }
}

main()