const { Worker } = require('worker_threads');
const axios = require("axios").default;
const {updateOrders} = require('./makerUtils');
const fs = require("fs");

require("dotenv").config();

let provider = new ethers.providers.AlchemyProvider(
    'arbitrum',
    process.env.ALCHEMY_KEY
);

let signer = new ethers.Wallet(process.env.MAKER_KEY, provider);
let lts = {}


async function main() {
    let res = await axios.get("https://api.nftperp.xyz/contracts");
    let amms = res.data.data.amms;

    for (let amm in amms) {
        lts[amm] = new liveTrader(signer, amm, leverage=1, testnet=true);
        await lts[amm].initialize();
        // await updateOrders(lts[amm]);

        const worker = new Worker('./liveListener.js');
        worker.postMessage(lt);

        await new Promise(r => setTimeout(r, 2000));
    }

    const reverseLookup = {};

    for (const [key, value] of Object.entries(amms)) {
        reverseLookup[value] = key;
    }

    let ch_contract = new ethers.Contract(res.data.data.clearingHouse, CH_ABI['abi'], signer);

    ch_contract.on('PositionChanged', async (amm, trader, openNotional, size, exchangedQuote, exchangedSize, realizedPnL, fundingPayment, markPrice, ifFee, ammFee, limitFee, keeperFee, event) => {
        const configData = fs.readFileSync('config.json', 'utf8');
        let config = JSON.parse(configData);
        let amm_name = reverseLookup[amm]
        let lt = lts[amm_name]

        const { live_orders, buySum, sellSum } = await lt.sumBuyAndSellOrders();
        let { buy_target, sell_target } = await getBuySellTarget(lt);


        if ((Math.abs(buySum - buy_target) > buy_target * config.DEVIATION_THRESHOLD) | (Math.abs(sellSum - sell_target) > sell_target * config.DEVIATION_THRESHOLD)) {
            await updateOrders(lt);
        }
        
    });
}

main()