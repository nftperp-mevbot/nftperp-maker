const { Worker } = require('worker_threads');
const axios = require("axios").default;


async function main() {
    let res = await axios.get("https://api.nftperp.xyz/contracts");
    let amms = res.data.data.amms;

    for (let amm in amms) {
        const worker = new Worker('./childTask.js');

        worker.on('message', (result) => {
            if (result.status === 'done') {
                console.log(`Processed ${result.amm} successfully`);
            } else {
                console.log(`Error processing ${result.amm}`);
            }
        });

        worker.on('error', (error) => {
            console.error(`Worker error: ${error}`);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });

        worker.postMessage(amm);

        await new Promise(r => setTimeout(r, 2000));
    }
}

main()