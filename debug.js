const axios = require("axios").default;
const {generateDistribution, getLiveTrader, getPriceDistributions, getConfig, getBuySellTarget} = require('./makerUtils');
const CH_ABI = require("./abi/ClearingHouse.json");
const { ethers } = require("ethers");


require("dotenv").config();

let lts = {}
let provider = new ethers.providers.AlchemyProvider(
    'arbitrum',
    process.env.ALCHEMY_KEY
);


async function main() {
    let lt = await getLiveTrader('bayc');

    let {markPrice, indexPrice, longPrices, shortPrices} = await getPriceDistributions(lt);
    let config = getConfig()

    let { buy_target, sell_target } = await getBuySellTarget(lt);

    console.log(buy_target, sell_target)
    const buyDistribution = generateDistribution(config.ORDER_COUNT, config.SKEWNESS, buy_target);
    const sellDistribution = generateDistribution(config.ORDER_COUNT, config.SKEWNESS, sell_target);

    console.log(buyDistribution)
    console.log(sellDistribution)
}

main()