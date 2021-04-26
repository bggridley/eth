require('dotenv').config();
const { API_URL, PRIVATE_KEY, PUBLIC_KEY } = process.env;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const mysql = require('mysql');

var host = process.env.HOST || '127.0.0.1';
var port = process.env.PORT || 8080;

var cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
}).listen(port, host, function () {
    console.log('Running CORS Anywhere on ' + host + ':' + port);
});


// Using WebSockets
const web3 = createAlchemyWeb3(
    "wss://eth-rinkeby.ws.alchemyapi.io/v2/22aTcXSFY0OxIppCnJGfk93-nE1rv5Y6",
);

var path = require('path');
var appDir = path.dirname(require.main.filename);

// Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'site'
});

// Connect
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySql Connected...');
    console.log("appDir: " + appDir);
});

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


router.get('/generateDefaults', (req, res) => {
    let addPrices = "CREATE TABLE IF NOT EXISTS `prices` (`contract` VARCHAR(255) NOT NULL, `tokenID` INT NOT NULL , `price` DECIMAL(7, 4) NOT NULL ) ENGINE = InnoDB"
    //include games in here SOON too
    db.query(addPrices, (err6, result6) => {
        if (err6) throw err6;

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end("true");
    });
});


router.post('/transactionPending', (req, res) => {
    console.log('trns');
    var transactionId = req.body.transactionId;
    var contract = req.body.contract;
    var tokenID = req.body.tokenID;

    console.log('waiting for contract' + contract + " ; ID: " + tokenID)
    waitForTransaction(transactionId, contract, tokenID);

    /*var subscription = web3.eth.subscribe('pendingTransactions', function (error, result) {
        if (!error) {
            console.log('finding: ' + result + "(" + transactionId);
            if (result === transactionId) {
                console.log(result); { }

                waitForTransaction(transactionId, contract, tokenID);
                web3.eth.clearSubscriptions();
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
        */

});

async function approve(to, contract, tokenID) {
    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); //get latest nonce
    const ctr = require("../artifacts/contracts/NFT.sol/NFT.json");
    const nftContract = new web3.eth.Contract(ctr.abi, contract);

    console.log(contract + ".... GOT HERE");

    //the transaction
    const tx = {
        'from': PUBLIC_KEY,
        'to': contract,
        'nonce': nonce, // 1 ETH * 100
        'gas': 500000,
        'data': nftContract.methods.approve(to, tokenID).encodeABI()
    };

    console.log(contract + ".... GOT HERE");

    signTransaction(tx);

}

router.get('/getTokens/:add', async function (req, res) {
    // make this load differently for each jaunt... i'll figure this out later
    const ctr = require("../artifacts/contracts/NFT.sol/NFT.json");
    const contractAddress = `${req.params.add}`;
    const nftContract = new web3.eth.Contract(ctr.abi, contractAddress);


    db.query("SELECT * FROM prices WHERE contract='" + contractAddress + "'", async function(err6, result6) {
        if (err6) throw err6;

        var tokens = [];
        var supply = await nftContract.methods.totalSupply().call();
        var completed = 0;


        // TODO later.... potentially store all data (including metadata location) in mySQL in order to increase loading times
        // this could be implemeneted using mint-nft.js... it would be really easy. just connect to mySQL and require that a price be specified upon minting.
        // the nft metadata would then be minted onto the nft and also into the database. would speed things up.
        Object.keys(result6).forEach(async function (key) {
            var value = result6[key];

            var data = await nftContract.methods.tokenURI(value.tokenID).call();

            var newData = {};
            newData.data = data;
            newData.tokenID = value.tokenID;
            newData.price = value.price;

            //console.log(newData);
            tokens.push(newData);
            completed++;


            
            if (completed == supply) {

                console.log('once');

                //


                //console.log(supply);


                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(tokens));


            }
        });


    });




});

async function transferFrom(to, contract, tokenID) {
    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); //get latest nonce
    const ctr = require("../artifacts/contracts/NFT.sol/NFT.json");
    const nftContract = new web3.eth.Contract(ctr.abi, contract);
    
    //the transaction
    const tx = {
        'from': PUBLIC_KEY,
        'contractAddress': contract,
        'to': contract,
        'nonce': nonce, // 1 ETH * 100
        'gas': 500000,
        'data': nftContract.methods.safeTransferFrom(PUBLIC_KEY, to, tokenID).encodeABI()
    };

    signTransaction(tx);
}

function signTransaction(tx) {
    const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    signPromise.then((signedTx) => {

        web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (err, hash) {
            if (!err) {
                console.log("The hash of your transaction is: ", hash, "\nCheck Alchemy's Mempool to view the status of your transaction!");
            } else {
                console.log("Something went wrong when submitting your transaction:", err)
            }
        });
    }).catch((err) => {
        console.log(" Promise failed:", err);
    });
}


// change this to have a callback so that we can wait for: the initial transaction
// we will call
function waitForTransaction(transactionId, contract, tokenID) {

    console.log('waiting: ' + contract);
    web3.eth.getTransactionReceipt(transactionId, function (err, result) {

        if (result == null) {
            setTimeout(function () {
                waitForTransaction(transactionId, contract, tokenID);
            }, 5000)
            console.log("reuslt is null, waiting 5 more seconds");
        } else {


            if (transactionId == result.transactionHash && result.status == true) { // should also check that the amount is correct
                web3.eth.getTransaction(transactionId, function (err, tresult) {
                    //console.log('tresult:' + JSON.stringify(tresult));

                    console.log('finished!');
                    console.log('sending payment... to' + tresult.from);

                    approve(tresult.from, contract, tokenID);

                    setTimeout(function () {
                        transferFrom(tresult.from, contract, tokenID);
                    }, 20000)


                    //nftContract.methods.approve("0x19e914D43bC36b9AD8ba65274623be6b23FCb8e3", 2);
                    // nftContract.methods.transferFrom(tresult.to, "0x19e914D43bC36b9AD8ba65274623be6b23FCb8e3", 2);
                    //tresult.to is us.
                    // contract: 0x57faaa4873e04a779b5db6075eae6e109bc131e7

                });


            }



            // sooo....
            // this means that it is finished.......
            // i'm actually proud of myself for doing this wowowowowow
            // okay
            // do some checks, and then send them their fkn NFT lol
            // figure out how to tell the contract to transfer ownership
        }
    })
}


// these all go
function insertInto(table, names, values, namesId, valuesId, callback) { // identifier is an INT
    deleteFrom(table, namesId, valuesId, function () {
        insert(table, names, values, function (result) {
            callback(result.insertId);
        });
    });
}

function insert(table, names, values, callback) {
    let sql = "INSERT INTO `" + table + "` (";

    for (var i = 0; i < names.length; i++) {
        sql += "`";
        sql += names[i];
        sql += "`";
        if (i != names.length - 1) sql += ", ";
        else sql += ")"
    }

    sql += " VALUES (";

    for (var i = 0; i < values.length; i++) {
        sql += "'";
        sql += values[i];
        sql += "'";
        if (i != values.length - 1) sql += ", ";
        else sql += ")"
    }

    db.query(sql, (e, r) => {
        if (e) {
            throw e;
        }

        callback(r);
    });
}

function deleteFrom(table, names, values, callback) {
    let add = "";

    if (names[0] == null || values[0] == null) {
        console.log("leaving early.");
        callback();
        return;
    }

    for (var i = 0; i < names.length; i++) {
        add += names[i] + "='" + values[i] + "'";

        if (!(typeof names[i + 1] === 'undefined')) {
            add += " AND "
        }
    }

    var deleteSql = "DELETE FROM " + table + " WHERE " + add;

    let dquery = db.query(deleteSql, (e, r) => {
        if (e) throw e;
        callback();
    });
}


app.listen('3001', () => {
    console.log('Server started on port 3001');
});
// while this is listening, we also need to send this nodeserver the mf payments

app.use('/', router);

