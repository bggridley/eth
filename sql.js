function login(e, p, r, callback) {
    fetch('http://localhost:3000/login', {

        // Adding method type 
        method: "POST",

        // Adding body or contents to send 
        body: JSON.stringify({
            email: e,
            password: p,
            raw: r,
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

function createAccount(e, p, f, n, callback) {
    fetch('http://localhost:3000/createAccount', {

        // Adding method type 
        method: "POST",

        // Adding body or contents to send 
        body: JSON.stringify({
            email: e,
            password: p,
            firstname: f,
            lastname: n,
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