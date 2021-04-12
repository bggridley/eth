const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

// Using WebSockets
const web3 = createAlchemyWeb3(
    "wss://eth-rinkeby.ws.alchemyapi.io/v2/22aTcXSFY0OxIppCnJGfk93-nE1rv5Y6",
);


const app = express();

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    res.setHeader('Connection', 'close');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

 // we also need to post the tokenID and shiz for the token that we are purchasing
 // likely need the contract address too
 // need a bunch of shit. this is for tomorrow.
 // pushing to git now
 // PCE 2:13 AM 4/12/2021
 
router.post('/transactionPending', (req, res) => {
    console.log('trns');
    var transactionId = req.body.transactionId;

    var subscription = web3.eth.subscribe('pendingTransactions', function (error, result) {
        if (!error) {
            if (result === transactionId) {
                console.log(result); { }

                waitForTransaction(transactionId);
                //web3.eth.getTransaction(transactionId , function(err, result) {
                // console.log(result);
                //})
            }
        }
    })
        .on("data", function (log) {
            if (log === transactionId)
                console.log("HEY" + log);
        })
        .on("changed", function (log) {
            if (log === transactionId) {
                console.log("ay+" + log);
            }
        });

});


function waitForTransaction(transactionId) {
    
    web3.eth.getTransactionReceipt(transactionId, function (err, result) {

        if (result == null) {
            setTimeout(function() {
                waitForTransaction(transactionId);
            }, 5000)
            console.log("reuslt is null, waiting 5 more seconds");
        } else {
            console.log('finished!');
            console.log(result);
            // sooo....
            // this means that it is finished.......
            // i'm actually proud of myself for doing this wowowowowow
            // okay
            // do some checks, and then send them their fkn NFT lol
            // figure out how to tell the contract to transfer ownership
        }
    })
}


app.listen('3001', () => {
    console.log('Server started on port 3001');
});
// while this is listening, we also need to send this nodeserver the mf payments

app.use('/', router);

