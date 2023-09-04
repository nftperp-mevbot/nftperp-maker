# NFTPerp Market Maker

This repository provides a few demo market making strategies to market make on the NFTPerp Platform

## 1. Simple Strategy
simple.js is a simple trading strategy for getting started on market making at NFTPerp. This strategy creates 5 limit orders at the both side of the orderbook and recreates them when enough order has been taken.


## 2. Platform Strategy
platform.js is designed to optimize liquidity provision on NFTPerp  by placing limit orders on both the buy and sell side of the order book, biased towards the less popular direction. The approach ensures a balance in liquidity provision while maximizing trading rewards. This strategy is ideal for the exchange but it might not be the best strategy for market makers who want to maximize rewards.

### Working Mechanism
This algorithm uses a pre-defined distribution based on hyperparameters to create N limit orders, whose distribution can skewed more towards the mark price. 

![Strategy Image](platform.png)

As market prices fluctuate, this strategy assesses the balance of active positions, taking into account both buying and selling orders. If an imbalance is detected between the buy and sell orders, the strategy takes corrective measures by canceling orders that lie outside the current market price bounds and replaces them with new ones, reflecting the updated market conditions. 

**Configuration:**

Several parameters in the config file allow users to customize the strategy:

- SPREAD: Determines the distance between the market price and placed orders.

- ORDER_COUNT: Specifies the number of orders placed on each side of the market.

- TARGET_ETH: Defines the sum of total limit orders in both side

- ORDER_PERCENTAGE_THRESHOLD: Sets the percentage that dictates when the difference between buy and sell order totals is significant enough to trigger adjustments.

- SLEEP_TIME: Sets the delay between actions to avoid nonce errors.


## 3. Maker Strategy
positionAdaptiveStrategy.js will first place limit orders on both sides. It will then adjusts its market-making approach based on the trader's current position. If the trader has a net short position, the algorithm will place more aggressive buy limit orders, attempting to buy at more favorable prices. Conversely, if the trader has a net long position, the algorithm will place more aggressive sell limit orders, aiming to sell at higher prices. This strategy aims to maximize the trader's returns by considering their current market position and adjusting their market-making behavior accordingly.

### Working Mechanism

The algorithm inspects the current position of the trader. If the position is net short, it places more buy limit orders to buy assets at lower prices. If the position is net long, it places more sell limit orders to sell assets at higher prices. By dynamically adjusting based on the current position, the algorithm can attempt to buy low and sell high, potentially maximizing profits for the trader.


# LiveTrader
liveTrader.js is a library that streamlines the process of trading on the NFTPerp Platform. It is to be instanciated using the following constructor:

    constructor(signer, amm, leverage=1, testnet = true)

**Parameters:**

    signer: An Ethereum signer.
    amm: Denotes the chosen market.
    leverage: The leverage trader is willing to use, with a default of 1.
    testnet: A boolean flag indicating if the system operates in testnet mode (default is true).

It contains the following method:

**1. initialize()**

Sets up contract addresses and initializes the ClearingHouse contract.

    Parameters: None.
    Return: void.

**2. getPrice()**

Fetches the current mark price for the chosen market.

    Parameters: None.
    Return: float, markPrice

**3. getPosition()**

Retrieves the trader's position in the given market

    Parameters: None.
    Return: Object representing the trader's position

**4. getBalance()**

Obtains the WETH balance associated with the trader's address

    Parameters: None.
    Return: float, indicating the balance in ETH format

**5. getETHBalance()**

Queries the Ethereum balance of the trader's address

    Parameters: None.
    Return: float, indicating the balance in ETH format

**6. cancelAllLimitOrders()**

Cancels all of the trader's limit orders in the chosen market

    Parameters: None.
    Return: void

**7. createLimitOrder(side, price, amount)**

Sets up a limit order based on the provided criteria.

    Parameters: 
        side: String ("LONG" or "SHORT") to indicate order direction.
        price: Numeric value for the desired order price.
        amount: Numeric value for the order amount.
    
    Return: Transaction object.

**8. cancelLimitOrder(side, price)**

Cancels a specified limit order based on its side and price.

    Parameters: 
        side: String indicating order side.
        price: Numeric value indicating order price.

    Return: Transaction object

**9. sumBuyAndSellOrders()**

Aggregates the value of all of the trader's buy and sell orders.

    Parameters: None.
    Return: Object with properties buySum and sellSum indicating the totals.

**10. getOrders()**

Retrieves the orderbook, segmented into buy and sell orders.

    Parameters: None.
    Return: Object containing arrays buyOrders and sellOrders, sorted by price.