function transactionPending(id, contract, tokenId, callback) {
    fetch('http://localhost:3001/transactionPending', {

        // Adding method type 
        method: "POST",

        // Adding body or contents to send 
        body: JSON.stringify({
            transactionId: id,
            contract: contract,
            tokenID: tokenId,
        }),

        // Adding headers to the request 
        headers: {
            "Content-type": "application/json"
        }
    }).then((response) => response.json())
        .then((responseJSON) => {
            // do stuff with responseJSON here...
            callback(responseJSON);
        });
}

function getETHValue(callback) {
    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD", {

        // Adding method type 
        method: "GET",
        // Adding headers to the request 
        headers: {
            "Content-type": "application/json",
        }
    }).then((response) => response.json())
        .then((responseJSON) => {
            callback(responseJSON);
        });
}

function getTokens(contract, callback) {
    fetch('http://localhost:3001/getTokens/' + contract).then(response =>
        response.json().then(data => ({
            data: data,
            status: response.status,
        })
        ).then(res => {

            callback(res);

        }));
}

var requests = {};
function getURL(url, callback) {
    //"http://localhost:8080/" +


    console.log(requests[url]);
    if (requests[url] != undefined) {

        (async () => {
            console.log("waiting for variable");
            while (requests[url] == "waiting") // define the condition as you like
                await new Promise(resolve => setTimeout(resolve, 200));
            callback(requests[url]);
        })();



    } else {
        requests[url] = "waiting";

        fetch("http://localhost:8080/" + url, {

            // Adding method type 
            method: "GET",
            // Adding headers to the request 
            headers: {
                "Content-type": "application/json",
            }
        }).then((response) => response.json())
            .then((responseJSON) => {
                // do stuff with responseJSON here..
                requests[url] = responseJSON;
                callback(responseJSON);
            });
    }
}

function getEth(callback) {
    fetch('https://eth-rinkeby.alchemyapi.io/v2/22aTcXSFY0OxIppCnJGfk93-nE1rv5Y6', {

        // Adding method type 
        method: "POST",

        // Adding body or contents to send 
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 0,
            method: "eth_getBalance",
            params: [
                "0x80207077859f561B1b41Fc5a919b04f8e1AfC297",
                "latest",
            ]
        }),

        // Adding headers to the request 
        headers: {
            "Content-type": "application/json"
        }
    }).then((response) => response.json())
        .then((responseJSON) => {
            // do stuff with responseJSON here..
            console.log(JSON.stringify(responseJSON));
            callback(responseJSON);
        });
}