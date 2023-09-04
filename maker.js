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



async function main() {
    const lt = new liveTrader(signer, 'bayc', leverage = 1, testnet = true);
    await lt.initialize();
    await lt.cancelAllLimitOrders();

    const markPrice = parseFloat(await lt.getPrice());
    const spreadFactor = config.SPREAD;
    const orderCount = config.ORDER_COUNT;
    const targetExposure = config.TARGET_ETH;
    const distribution = generateDistribution(orderCount, config.SKEWNESS);

    for (let i = 0; i < orderCount; i++) {
        const longPrice = markPrice * (1 - spreadFactor * (i + 1));
        const shortPrice = markPrice * (1 + spreadFactor * (i + 1));

        await lt.createLimitOrder('long', longPrice.toFixed(1), distribution[i]);
        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
        await lt.createLimitOrder('short', shortPrice.toFixed(1), distribution[i]);
        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
    }

    while (true) {
        try {
            let currentOrders = await lt.getOrders();
            let currentPosition = await lt.getPosition();
            const markPrice = parseFloat(await lt.getPrice());

            if (currentPosition < 0) {
                const buyDistribution = generateDistribution(orderCount, config.SKEWNESS);
                for (let i = 0; i < orderCount; i++) {
                    const longPrice = markPrice * (1 - spreadFactor * (i + 1));
                    if (!currentOrders.buyOrders.some(order => order.price === longPrice)) {
                        await lt.createLimitOrder('long', longPrice.toFixed(1), buyDistribution[i] * 1.5); // Boost the amount for the order
                        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
                    }
                }
            } else if (currentPosition > 0) {
                const sellDistribution = generateDistribution(orderCount, config.SKEWNESS).reverse();
                for (let i = 0; i < orderCount; i++) {
                    const shortPrice = markPrice * (1 + spreadFactor * (i + 1));
                    if (!currentOrders.sellOrders.some(order => order.price === shortPrice)) {
                        await lt.createLimitOrder('short', shortPrice.toFixed(1), sellDistribution[i] * 1.5); // Boost the amount for the order
                        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
                    }
                }
            }

            await new Promise(r => setTimeout(r, 10000));
        } catch (e) {
            console.error(e);
        }
    }
}

main().catch(console.error);