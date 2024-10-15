import express from "express";
import bodyParser from 'body-parser'

export const app = express()
export const TICKER = 'TATA'

app.use( bodyParser.json())

interface Balances {
    [ key: string ]: number
};

interface Order {
    userId: string,
    price: number,
    quantity: number
}

interface User{
    id: string,
    balances: Balances
}
const users: User[] = [{
    id: "1",
    balances: {
      [TICKER]: 10,
      "INR": 50000
    }
  }, {
    id: "2",
    balances: {
      [TICKER]: 10,
      "INR": 50000
    }
  }];

interface OrderBookEntry{
    userId: string,
    price: number,
    quantity: number
}

let bids: OrderBookEntry[] = [];
let asks: OrderBookEntry[] = [];

app.post( '/order', ( req, res, next ) => {
    const { userId, side, price, quantity } = req.body;
    const remainingQuantity = fillOrder( userId, side, price, quantity );
    if( remainingQuantity === 0 )
        res.json( { 'filledQuantity': quantity } )
    else{
        let orderSide = side === "bid" ? bids : asks;
        orderSide.push( { userId, price, quantity: remainingQuantity } )
        orderSide.sort( ( a, b ) => {
            return side === "bid" ? b.price - a.price : a.price - b.price
        } )
        res.json( { 'filledQuantity': quantity - remainingQuantity } )

    }
} )

app.get( '/depth', ( req, res, next ) => {
    const depth: {
        [ key: string ]: {
            quantity: number,
            type: string
        }
    } = {};
   

    bids.reduce( (acc, bid) => {
        acc[ bid.price ] = {
            quantity: acc[ bid.price ] ? acc[ bid.price ].quantity + bid.quantity : bid.quantity,
            type: 'bid'
        }
        return acc;
    }, depth )

    asks.reduce( (acc, bid) => {
        acc[ bid.price ] = {
            quantity: acc[ bid.price ] ? acc[ bid.price ].quantity + bid.quantity : bid.quantity,
            type: 'ask'
        }
        return acc;
    }, depth )
    res.json( { depth } )
    
} )

app.get( '/bidsAndAsks', ( req, res, next ) => {
    res.json({ bids, asks }) 
} )

app.get( '/balance/:userId', ( req, res, next )=>{
    const userId = req.params.userId;
    const user = users.find( user => user.id === userId );
    if( !user ){
        return res.json( {
            [TICKER]: 0,
            'INR': 0
        } )
    }
    res.json( {
        balances: user.balances
    })
} )

app.get( '/users', ( req, res, next ) => {
    res.json( users );
} )

app.listen(3000)

function fillOrder( userId: string, orderType: string, price: number, quantity: number ){
    let orderSideToBeChecked = orderType === "bid" ? asks : bids;
    const orderTypeNumber: number= orderType === "bid" ? 1 : -1
    let remainingQuantity = quantity;
    for( let orderEntry of orderSideToBeChecked ){
        if( orderEntry.price * orderTypeNumber <= price * orderTypeNumber ){
            if( orderEntry.quantity >= remainingQuantity ){
                updateUserBalance( userId, { [TICKER]: orderTypeNumber * remainingQuantity, 'INR': orderTypeNumber * -1 * remainingQuantity * orderEntry.price} )
                updateUserBalance( orderEntry.userId, { [TICKER]: -1 * orderTypeNumber * remainingQuantity, 'INR': orderTypeNumber * orderEntry.price * remainingQuantity } )
                orderEntry.quantity -= remainingQuantity;
                remainingQuantity = 0;
                break;
            }else{
                remainingQuantity -= orderEntry.quantity;
                updateUserBalance( userId, { [TICKER]: orderTypeNumber * orderEntry.quantity, 'INR': orderTypeNumber * -1 * orderEntry.quantity * orderEntry.price} )
                updateUserBalance( orderEntry.userId, { [TICKER]: -1 * orderTypeNumber * orderEntry.quantity, 'INR': orderTypeNumber * orderEntry.price * quantity } )
                orderEntry.quantity = 0;
                //orderSideToBeChecked.shift()
            }
        }else{
            break;
        }
    }
    orderSideToBeChecked = orderSideToBeChecked.filter( order => order.quantity !== 0 )
    if( orderType === 'bid' )
        asks = orderSideToBeChecked;
    else
        bids = orderSideToBeChecked;
    return remainingQuantity;
}

function updateUserBalance( userId: string, balances: Balances ){
    const user = users.find( user => user.id === userId );
    if( user ){
        const newBalances = {
            [TICKER]: user.balances[TICKER] + balances[TICKER],
            'INR': user.balances.INR + balances.INR,
        }
        user.balances = newBalances;
    }
    
}




