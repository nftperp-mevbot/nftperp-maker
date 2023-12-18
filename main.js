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

async function make_market(lts){    

    while (true){
        try{
            for (let amm in lts) {
                let lt = lts[amm]
                let config = getConfig()

                let {markPrice, indexPrice, longPrices, shortPrices} = await getPriceDistributions(lt)


                if (longPrices[0] > indexPrice  | shortPrices[0] < indexPrice | longPrices[0] < (Math.min(markPrice, indexPrice) * (1-config.BID_UPDATE_GAP)) | shortPrices[0] > (Math.max(markPrice, indexPrice) * (1+config.BID_UPDATE_GAP))){
                    console.log(`Conditional update for ${lt.amm} ${indexPrice} ${longPrices[0]} ${shortPrices[0]}`)
                    await updateOrders(lt);
                }

                await new Promise(r => setTimeout(r, 1000));
            }
            
            await new Promise(r => setTimeout(r, 7000));
        } catch (e) {
            console.log("Error in make market", e)
        }

    }
}

async function regularUpdates(){
    while (true){
        try{
            //sleep for config.REGULAR_UPDATES hours
            let config = getConfig()

            await new Promise(r => setTimeout(r, 1000 * config.REGULAR_UPDATES * 60 * 60));

            for (let amm in lts) {
                let lt = lts[amm]
                await updateOrders(lt);
            }
            
        } catch (e) {
            console.log("Error in regular updates", e)
        }

    }
}

async function main() {
    let isFirstRun = process.argv.includes('--first');
    let res = await axios.get("http://api.nftperp.xyz/contracts");
    let amms = res.data.data.amms;

    for (let amm in amms) {
        lts[amm] = await getLiveTrader(amm);
        await lts[amm].checkApproval();
        await updateOrders(lts[amm], isFirstRun);        

        await new Promise(r => setTimeout(r, 2000));
    }

    try{
        make_market(lts)
        // regularUpdates(lts)
    } catch (e) {
        console.log("Error", e)
    }

    const reverseLookup = {};

    for (const [key, value] of Object.entries(amms)) {
        reverseLookup[value] = key;
    }

    let ch_contract = new ethers.Contract(res.data.data.clearingHouse, CH_ABI['abi'], provider);
    //check approval and approve first time

    ch_contract.on('PositionChanged', async (amm, trader, openNotional, size, exchangedQuote, exchangedSize, realizedPnL, fundingPayment, markPrice, ifFee, ammFee, limitFee, keeperFee, event) => {
        
        try{
            let config = getConfig()
            let amm_name = reverseLookup[amm]
            let lt = lts[amm_name]
    
            const { live_orders, buySum, sellSum } = await lt.sumBuyAndSellOrders();
            let { buy_target, sell_target } = await getBuySellTarget(lt);
            const { buyOrders,  sellOrders } = await lt.getMyOrders()

            if (buyOrders.length > 0 & sellOrders.length > 0){
            
                let best_buy = buyOrders[buyOrders.length-1].price
                let best_sell = sellOrders[sellOrders.length-1].price

                let bid_gap = Math.abs((best_sell - best_buy)/best_buy * 100)


                let indexPrice = await lt.getIndexPrice()

                let mark_index_gap = Math.abs((ethers.utils.formatEther(markPrice) - indexPrice)/indexPrice * 100)

                console.log("Bid gap", bid_gap, "Mark index gap", mark_index_gap, "Multiplied", mark_index_gap * config.GAP_MULTIPLE)

                
                console.log(amm, trader, openNotional, size, exchangedQuote, exchangedSize, realizedPnL, fundingPayment, markPrice, ifFee, ammFee, limitFee, keeperFee, event)
        
                if (bid_gap > (mark_index_gap * config.GAP_MULTIPLE) | (Math.abs(buySum - buy_target) > buy_target * config.DEVIATION_THRESHOLD) | (Math.abs(sellSum - sell_target) > sell_target * config.DEVIATION_THRESHOLD)) {
                    await updateOrders(lt);
                }
            } else{
                await updateOrders(lt);
            }
        } catch (e) {
            console.log("Error", e)
        }

    });
}

main()