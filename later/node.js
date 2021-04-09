const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const mysql = require('mysql');
const { uuid } = require('uuidv4');
const bcrypt = require('bcrypt');
const Alpaca = require('@alpacahq/alpaca-trade-api')
const saltRounds = 10;



var path = require('path');
var appDir = path.dirname(require.main.filename);

// Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'site'
});


const alpaca = new Alpaca({
    keyId: 'PK09U11XSGMFBWCLT6OA',
    secretKey: 'vLYvn7JhrrqJmNhaD3IzLQB1Acjgj3y3ZVbjar03',
    paper: true,
    usePolygon: false
});

const daysInPast = 200; // if nothing happens, then this exceeds the range specified
var dater = new Date();
var date = new Date(dater - (6 * 60 * 60000));//new Date(); 6 hours ago

async function asyncFunction() {
    
    let resp = alpaca.getBarsV2(
        "AAPL",
        {
            start: new Date(date - (daysInPast * 60000)),
            end: date.toISOString(),
            // IMAGINE THIS IS RIGHT NOW FOR NOW
            limit: daysInPast,
            timeframe: "1Min",
            adjustment: "raw"
        },
        alpaca.configuration
    );
    const bars = [];

    try {
        var index = 0;


        for await (let b of resp) {
            index++;
            console.log(b);
            bars.push(b);
            if (index == daysInPast) {
               
                var upTrends = 0;
               
                for (var j = 0; j < daysInPast; j++) {

                    if (j != daysInPast - 1) {
                        if(bars[j + 1].ClosePrice > bars[j].ClosePrice) {
                            upTrends++;
                        }
                    } else {


                        console.log('last');
                        var upTrendProb = upTrends / (daysInPast - 1);
                        console.log(upTrendProb);
                    }
                }

                
            

                // done 
            }

        }
    } catch (e) {
        console.error(e);
    }
}



alpaca.getAccount().then((account) => {
    console.log('Current Account:', account)
})

asyncFunction();

function createOrder() {
    alpaca.createOrder({
        symbol: "AAPL", // any valid ticker symbol
        qty: 100,
        side: "buy",
        type: "market",
        time_in_force: "gtc",
        limit_price: null,
        stop_price: null,
    }).then((order) => {
        console.log('order:', order);
    });
}
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




function generateUUID(callback) { // finds a uuid that has not been taken

    var ud = uuid();

    var query = "SELECT * FROM logins where uuid='" + ud + "'";

    db.query(query, (e, r) => {
        // should make test DB
        if (e) throw e;

        var stringified = JSON.stringify(r);
        if (stringified == "[]") {
            console.log("UNIQUE UUID GENERATED!");
            callback(ud);
        } else {

        }
    });
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
router.get('/generateDefaults', (req, res) => {
    let addLogins = "CREATE TABLE IF NOT EXISTS `logins` (`uuid` VARCHAR(255) NOT NULL, `email` VARCHAR(255) NOT NULL , `password` VARCHAR(255) NOT NULL, `firstname` VARCHAR(255) NOT NULL, `lastname` VARCHAR(255) NOT NULL ) ENGINE = InnoDB"
    //include games in here SOON too
    db.query(addLogins, (err6, result6) => {
        if (err6) throw err6;

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end("true");
    });
});


router.post('/login', (req, res) => {
    var email = req.body.email;
    var pass = req.body.password;
    var raw = req.body.raw;

    var query = "SELECT * FROM logins WHERE email='" + email + "'";
    // change this query for bcrypt

    if (!raw) {
        db.query(query, (e, r) => {
            // should make test DB
            if (e) throw e;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            var stringified = JSON.stringify(r);
            if (stringified == "[]") {

                res.end(JSON.stringify({ status: "false", message: "Nobody has registered an account with this email." }));
                // EMAIL DOES NOT EXIST
            } else {
                bcrypt.compare(pass, r[0]["password"], function (err, result) {

                    if (result == true) {
                        console.log('success');

                        var key = r[0]["password"];

                        bcrypt.genSalt(saltRounds, function (err, salt) {
                            // hash
                            bcrypt.hash(key, salt, function (err, hash) {
                                res.end(JSON.stringify({ status: "true", message: hash, uuid: r[0]["uuid"], firstname: r[0]["firstname"], lastname: r[0]["lastname"] }));
                                //save HASHED + SALTED HASH in cookie on client side
                            });
                        });


                    } else {
                        res.end(JSON.stringify({ status: "false", message: "Incorrect password." }));
                    }
                    // result == true
                });
            }
        });
    } else {
        db.query(query, (e, r) => {
            // should make test DB
            if (e) throw e;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            var stringified = JSON.stringify(r);
            if (stringified == "[]") {

                res.end(JSON.stringify({ status: "false", message: "Failed to authenticate with key." }));
                // EMAIL DOES NOT EXIST
            } else {
                // EMAIL EXISTS

                bcrypt.compare(r[0]["password"], pass, function (err, result) {

                    if (result == true) {
                        res.end(JSON.stringify({ status: "true", message: r[0]["password"], uuid: r[0]["uuid"], firstname: r[0]["firstname"], lastname: r[0]["lastname"] }));
                    }
                });
            }
        });
    }

});

router.post('/createAccount', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

    // make sure the email is not already in use too
    var query = "SELECT * FROM logins WHERE email='" + email + "'";

    db.query(query, (e, r) => {
        // should make test DB
        if (e) throw e;
        res.writeHead(200, { 'Content-Type': 'text/plain' });

        var stringified = JSON.stringify(r);
        if (stringified == "[]") {
            res.end("true");
            // need to send the error message back to them here...


            generateUUID(function (id) {
                console.log('this is what we want!' + id);
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(password, salt, function (err, hash) {
                        // Store hash in your password DB.
                        insertInto("logins", ["uuid", "email", "password", "firstname", "lastname"], [id, email, hash, firstname, lastname], ["email"], [email], function (result) {

                        });
                    });
                });

            });
        } else {

            res.end("false");
            console.log('send an error message back to the client now.');
        }
    });



});

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


app.use('/', router);


app.listen('3000', () => {
    console.log('Server started on port 3000');
});