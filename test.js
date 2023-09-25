const axios = require("axios").default;
const {updateOrders, getLiveTrader, getPriceDistributions, getConfig, getBuySellTarget} = require('./makerUtils');
const CH_ABI = require("./abi/ClearingHouse.json");
const { ethers } = require("ethers");

require("dotenv").config();

let lts = {}
let provider = new ethers.providers.AlchemyProvider(
    'arbitrum',
    process.env.ALCHEMY_KEY
);

async function test(){
    let lt = await getLiveTrader('bayc');
    const { buyOrders,  sellOrders } = await lt.getMyOrders()
    let best_buy = buyOrders[buyOrders.length-1].price
    let best_sell = sellOrders[sellOrders.length-1].price

    let bid_gap = Math.abs((best_sell - best_buy)/best_buy * 100)
    console.log("Bid gap", bid_gap)

}

test()