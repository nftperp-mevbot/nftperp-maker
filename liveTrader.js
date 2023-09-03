const axios = require('axios');
const { ethers } = require('ethers');

const CH_ABI = require("./abi/ClearingHouse.json");
const ERC20_ABI = require("./abi/ERC20.json");

class liveTrader {

    constructor(signer, testnet = true) {
        this.signer = signer;
        this.PUBLIC_KEY = signer.address;
        this.DOMAIN_NAME = testnet ? 'https://api.nftperp.xyz' : 'https://live.nftperp.xyz';
    }

    //initialize the contracts
    async initialize(){
        let res = await axios.get(`${this.DOMAIN_NAME}/contracts`);        
        this.ADDRESSES = res.data.data;
        console.log(this.ADDRESSES.clearingHouse)
        this.clearingHouse = new ethers.Contract(this.ADDRESSES.clearingHouse, CH_ABI.abi, this.signer);
    }

    async getBalance() {
        const wethContract = new ethers.Contract(this.ADDRESSES.weth, ERC20_ABI.abi, this.signer);
        const wethBalanceWei = await wethContract.balanceOf(this.PUBLIC_KEY);
        const wethBalanceEth = ethers.utils.formatEther(wethBalanceWei);
        return wethBalanceEth;
    }

    async getETHBalance(){
        const balanceWei = await this.signer.getBalance();
        const balanceEth = ethers.utils.formatEther(balanceWei);
        return balanceEth;
    }

    async cancelAllLimitOrders() {
        const res = await axios.get(`${this.DOMAIN_NAME}/orders?amm=bayc&trader=${this.PUBLIC_KEY}`);
        const orders = res.data.data;

        for (const order of orders) {
            console.log(order)
            const tx = await this.clearingHouse.deleteLimitOrder(order.amm, order.id);
            await tx.wait();
        }
    }

    async sumBuyAndSellOrders() {
        const res = await axios.get(`${this.DOMAIN_NAME}/orders?amm=bayc&trader=${this.PUBLIC_KEY}`);
        const orders = res.data.data;

        let buySum = 0;
        let sellSum = 0;

        for (const order of orders) {
            if (order.side === 1) {
                buySum += order.size;
            } else {
                sellSum += order.size;
            }
        }

        return { buySum, sellSum };
    }
}

module.exports = liveTrader;