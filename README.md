
# Node JS Stock Broker Clone

This API clones that of a broker with limited functionality( limit orders, market depth and check balances ). Orders could be created, currently supports only one stock (TATA). Any order created would be against TATA, Each user is harcoded to begin with 10 quantities of TATA and Rs. 50000.
New Orders could be created as bids(to buy) or asks(to sell). Valid bids/asks are matched against each other with best available price assured.

## Installation
 
Use the package manager npm to install packages.

```bash
npm install
```

## Usage
Start the development Server
```python
npm start
```
Now, orders could be placed through postman.
3 endpoints available:

To create an order
```
POST /order  
     {
        type: "limit",
        side: "bid",
        price: 1400.1,
        quantity: 1,
        userId: "1"
     }
```

To check the market depth at any point of time:
```
GET /depth
```

To check the balances of a user at any point of time:
```
GET /balance/:userId
```
