# NFTPerp Market Maker

This repository is a script for market making in the NFTPerp Platform.


## Working Mechanism
This repository creates limit orders on both sides of all NFTPerp limit order book pairs. On first execution, orders summing to TARGET_ETH in the skew defined by SKEWNESS are created.

![Strategy Image](platform.png)



Then, orders are constantly monitored. Orders are updated when the bid price deviates above the mark/index price at a rate of BID_UPDATE_GAP, or the sum of open orders deviates at a size greater than DEVIATION_THRESHOLD. If there is an active long exposure, the new orders will be larger on the short side and vice versa.

- The DEVIATION_THRESHOLD check exists because actively creating transactions and changing orders would be expensive after every trade. 

- The exposure check exists to limit risk

**Configuration:**

The configuration defined in config.json defines the following parameters:

- TARGET_ETH: Determines the targeted max amount to make on each side of the book

- SKEWNESS: A parameter that determines how skewed the orders are towards the mark price

- ORDER_COUNT: Specifies the number of orders placed on each market side.

- SPREAD: Determines the distance between the market price and placed orders.

- SLEEP_TIME: Sets the delay between actions to avoid nonce errors.

- SIZE_MULTIPLIER: Determines the amount to reduce one side of the orders when there is an open position 

- DEVIATION_THRESHOLD: The deviation above, which we modify the open orders

- BID_UPDATE_GAP: The deviation between the mark/index and the order price, above which the orders are updated

