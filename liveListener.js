const { parentPort } = require('worker_threads');
const {getPriceDistributions, updateOrders} = require('./makerUtils');

async function make_market(lt){    

    while (true){
        try{
            
            let {markPrice, indexPrice, longPrices, shortPrices} = getPriceDistributions(lt)
            
            if (indexPrice > longPrices[0] * 1.02 || indexPrice < shortPrices[0] * 0.98) {
                await updateOrders(lt);
            }
    
            await new Promise(r => setTimeout(r, 60000));
        } catch (e) {
            console.log("Error", e)
        }

    }
}

parentPort.on('message', (lt) => {
    try {
        console.log(lt.amm);
        make_market(lt);
    } catch (e) {
        console.error(`Error processing ${lt.amm}`);
    }
});