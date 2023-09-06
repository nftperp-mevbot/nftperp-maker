const fs = require("fs");
const { ethers } = require("ethers");
const liveTrader = require('./liveTrader');
require("dotenv").config();

async function getLiveTrader(amm){
    let provider = new ethers.providers.AlchemyProvider(
        'arbitrum',
        process.env.ALCHEMY_KEY
    );

    let signer = new ethers.Wallet(process.env.MAKER_KEY, provider);
    let lt = new liveTrader(signer, amm);
    await lt.initialize();
    return lt;
}

function getConfig(){
    const configData = fs.readFileSync('config.json', 'utf8');
    let config = JSON.parse(configData);
    return config
}

async function getBuySellTarget(lt){
    let config = getConfig()

    let buy_target = config.TARGET_ETH
    let sell_target = config.TARGET_ETH

    const positionSize = await lt.getPositionSize();

    if (positionSize > 0) {
        buy_target = buy_target - (Math.abs(positionSize) / config.SIZE_MULTIPLIER)
    } else if (positionSize < 0) {
        sell_target = sell_target - (Math.abs(positionSize) / config.SIZE_MULTIPLIER)
    }

    return { buy_target, sell_target }
}

async function getDifference(firstPrice, secondPrice){
    return (Math.abs(firstPrice - secondPrice) / firstPrice)
}

async function getPriceDistributions(lt){
    let config = getConfig()

    const markPrice = parseFloat(await lt.getPrice());
    const indexPrice = parseFloat(await lt.getIndexPrice());

    const longPrice = Math.min(markPrice, indexPrice)  * (1 - parseFloat(config.SPREAD))
    const shortPrice = Math.max(markPrice, indexPrice)  * (1 + parseFloat(config.SPREAD))

    if (getDifference(markPrice, indexPrice) > config.MAX_DIFFERENCE){
        longPrice = Math.min(markPrice, indexPrice)
        shortPrice = Math.max(markPrice, indexPrice)
    }

    const longPrices = Array.from({ length: config.ORDER_COUNT }, (_, i) => Math.min(longPrice * (1 - (i + 1) / 100), markPrice - 0.001));
    const shortPrices = Array.from({ length: config.ORDER_COUNT }, (_, i) => Math.max(shortPrice * (1 + (i + 1) / 100), markPrice + 0.001));

    return {markPrice, indexPrice, longPrices, shortPrices}
}

async function updateOrders(lt){
    let config = getConfig()

    let { buy_target, sell_target } = await getBuySellTarget(lt);


    let {markPrice, indexPrice, longPrices, shortPrices} = await getPriceDistributions(lt);
    const buyDistribution = generateDistribution(config.ORDER_COUNT, config.SKEWNESS, buy_target);
    const sellDistribution = generateDistribution(config.ORDER_COUNT, config.SKEWNESS, sell_target);

    

    console.log(`---------------------- Trading Information ----------------------`);
    console.log(`Index Price: ${indexPrice}`);
    console.log(`Mark Price: ${markPrice}`);
    console.log(`------------------------------------------------------------------`);
    console.log(`Buy Prices: \n${longPrices.join('\n')}`);
    console.log(`------------------------------------------------------------------`);
    console.log(`Sell Prices: \n${shortPrices.join('\n')}`);
    console.log(`------------------------------------------------------------------`);
    console.log(`Buy Distribution: \n${buyDistribution.join('\n')}`);
    console.log(`------------------------------------------------------------------`);
    console.log(`Sell Distribution: \n${sellDistribution.join('\n')}`);
    console.log(`------------------------------------------------------------------`);

    const { buyOrders,  sellOrders } = await lt.getMyOrders()
        
    if (buyOrders.length > config.ORDER_COUNT) {
        for (var i=config.ORDER_COUNT; i < buyOrders.length; i++ ) {
            await lt.cancelOrder(buyOrders[i].id);
            await new Promise(r => setTimeout(r, config.SLEEP_TIME));
        }
    }

    if (sellOrders.length > config.ORDER_COUNT) {
        for (var i=config.ORDER_COUNT; i < sellOrders.length; i++ ) {
            await lt.cancelOrder(sellOrders[i].id);
            await new Promise(r => setTimeout(r, config.SLEEP_TIME));
        }
    }

    for (var i=0; i < config.ORDER_COUNT; i++ ) {
        
        if (buyOrders[i] === undefined) {
            await lt.createLimitOrder('long', roundDown(longPrices[i], 2), roundDown(buyDistribution[i], 2));
        } else {
            await lt.updateLimitOrder(buyOrders[i].id, 'long', roundDown(longPrices[i], 2), roundDown(buyDistribution[i], 2));
        }
        
        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
    }


    for (var i=0; i < config.ORDER_COUNT; i++ ) {
        if (sellOrders[i] === undefined) {
            await lt.createLimitOrder('short', roundUp(shortPrices[i], 2), roundUp(sellDistribution[i], 2));
        } else {
            await lt.updateLimitOrder(sellOrders[i].id, 'short', roundUp(shortPrices[i], 2), roundUp(sellDistribution[i], 2));
        }

        await new Promise(r => setTimeout(r, config.SLEEP_TIME));
    }
}

function generateDistribution(orderCount, skewness, TARGET_ETH) {
    let distribution = [];

    for (let i = 0; i < orderCount; i++) {
        distribution.push(Math.pow(skewness, i));
    }

    const sum = distribution.reduce((acc, val) => acc + val, 0);
    distribution = distribution.map(val => (val / sum) * TARGET_ETH);
    return distribution;
}

function roundUp(num, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.ceil(num * factor) / factor;
}

function roundDown(num, decimalPlaces) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.floor(num * factor) / factor;
}

module.exports = {generateDistribution, updateOrders, getPriceDistributions, getLiveTrader, getConfig, getBuySellTarget, getDifference};