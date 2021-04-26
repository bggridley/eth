var tokens = [];
$(document).ready(function () {

    $.get("menuModal.html", function (data) {
        $("#modals").replaceWith(data);

        $("#menu-connect").click(function () {
            loadConnect();
            $("#menuModal").dismiss();

        });
    });

    loadMain();
});

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

async function pay(token) {


    //awaitConnect(function(result) {
    //   alert(result);
    //});


    awaitConnect(function (address) {
        initPayButton(address, token);
    })


    /*
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable();

            window.web3.eth.getAccounts((error, result) => {
                if (error) {
                    alert(error);
                } else {

                    initPayButton(result[0], token); // shouldn't always pay with account 0....
                    //alert(result[0]);
                }
            });


            // 
        } catch (err) {
            $('#status').html('User denied account access', err)
            alert(err);
        }
    } else if (window.web3) {
        // window.web3 = new Web3(web3.currentProvider)
        // initPayButton()

        // do this later
    } else {
        $('#status').html('No Metamask (or other Web3 Provider) installed')
    }
*/

}

const initPayButton = (account, token) => {
    // paymentAddress is where funds will be send to
    const paymentAddress = '0x80207077859f561B1b41Fc5a919b04f8e1AfC297';//'0x80207077859f561B1b41Fc5a919b04f8e1AfC297'
    const amountEth = token.price;
    // alert('sending');



    window.web3.eth.sendTransaction({
        from: account,
        to: paymentAddress,
        value: web3.utils.toWei(amountEth.toString(), 'ether')
    }, function (err, transactionId) {

        console.log('callback');
        if (err) {
            console.log('Payment failed', err)
            $('#status').html('Payment failed')
        } else {
            console.log('Payment successful', transactionId)
            $('#status').html('Payment successful' + transactionId);

            transactionPending(transactionId, token.contract, token.tokenID, function () {

            });
        }
    })
}

class Token {

    constructor(name, desc, a, tokenID, contract, price) {
        this.name = name;
        this.desc = desc;
        this.source = a;
        this.tokenID = tokenID;
        this.price = price;
        this.contract = contract;

        //  alert(a);
    }

    add() {

        $('#mainGrid').append(

            '      <div class="gridItem"> \
<div class="content"> \
  <div class="top mt-2"> \
    <div class="w-50 float-left"> \
      <div class="px-3"> \
        <img src="peakmediablack.png" width=40px height=40px alt=""> \
      </div> \
    </div> \
    <div class="w-50 float-right"> \
      <div class="px-3"> \
        <button class="circleButton float-right"> \
          <i class="fa fa-ellipsis-h"></i> \
        </button> \
        <div class="box"><a onclick=loadProductPage(' + this.contract + ',' + this.tokenID + ')>View</a><br><a>Share</a><br><a target="_blank" style="text-decoration: none; color:black;" href="' + 'https://rinkeby.etherscan.io/token/' + this.contract + '?a=' + this.tokenID + '">Etherscan</a></div> \
      </div> \
    </div> \
  </div> \
  <div class="middle px-3"> \
    <img onclick=loadProductPage(' + this.contract + ',' + this.tokenID + ') src="' + this.source + '" style="vertical-align: middle; border:0; border-radius:7px; max-height:100%; max-width:100%; cursor:pointer;"> \
  </div> \
  <div class="bottom"> \
    <a style="cursor:pointer;font-family: Mukta; font-weight:400; font-size:14pt;color:rgb(80, 80, 80) !important;">' + this.name + '</a> \
    <br> \
    <span class="" style="font-size: 16pt; font-family: Arial; font-weight:700"> &Xi;</span> \
    <span class="nowrap pr-1" style="font-size: 16pt; font-family: BebasNeue; font-weight:400;">' + this.price + ' </span> \
    <span class="nowrap" style="font-family: Mukta; font-weight:700; color:grey">#' + this.tokenID + ' </span> \
  </div> \
</div> \
</div>')
    }
}



function myFunction() {

}
function loadNav() {
    $.get("navbar.html", function (data) {
        $("#nav-placeholder").replaceWith(data);

        navGivenSize();
        $(window).resize(navGivenSize);
        $('#connect-button').click(loadConnect);

        //awaitConnect();
        // loadTokens("A");




        //if()


        $("#nav-placeholder")
            .css('opacity', 0)
            .slideDown('fast')
            .animate(
                { opacity: 1 },
                { queue: false, duration: 'slow' }
            );


    });


}

function navGivenSize() {

    if ($(window).width() < 700) {
        $(".navReplaceable").html('<div>\
        <button id="miniSearch" class="circleButton mx-2" style="padding: 13px 13px;"><i class="fas fa-search"></i></button></div>\
      <div> <button id="menuButton" class="circleButton" style="padding: 13px 13px;"><i class="fas fa-bars"></i></button></div>');


        $('#searchBar').css('opacity', 0).css('display', 'none');

        $('#menuButton').click(function () {
            // open account MODAL.. MODAL's ARE SO AWESOME
            //alert('hello');

            $("#menuModal").modal();
        });
    } else {
        $(".navReplaceable").html(
            '<li class="nav-item">\
    <a class="nav-link" style="color:grey;" href="#">Collections</a></li>\
  <li class="nav-item">\
    <a id="contact-button" class="nav-link"  style="color:grey" href="#">Contact Us</a>\
  </li>\
  <li class="nav-item">\
    <a id="connect-button" class="nav-link"  style="color:grey" href="#">Connect</a>\
  </li>')


        $('#searchBar').css('opacity', 1).css('display', 'block');

    }


    //  $("body").prepend("<div>" + $(window).width() + "</div>");
    $('#connect-button').click(loadConnect);
    $('#contact-button').click(loadProductPage);
}

function loadProductPage(contract, tokenID) {
    var token;
    var name;
    var desc;
    var price;
    var source;

    for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].contract == contract && tokens[i].tokenID == tokenID) {
            name = tokens[i].name;
            desc = tokens[i].desc;
            source = tokens[i].source;
            price = tokens[i].price;


            token = tokens[i];

            $.get("productPage.html", function (data) {
                $("#body-placeholder").replaceWith(data);

                $("#body-placeholder").css('visibility', 'visible');

                $(function () {
                    var Accordion = function (el, multiple) {
                        this.el = el || {};
                        this.multiple = multiple || false;

                        var links = this.el.find('.link');

                        links.on('click', { el: this.el, multiple: this.multiple }, this.dropdown)
                    }

                    Accordion.prototype.dropdown = function (e) {
                        var $el = e.data.el;
                        $this = $(this),
                            $next = $this.next();

                        $next.slideToggle();
                        $this.parent().toggleClass('open');

                        if (!e.data.multiple) {
                            $el.find('.submenu').not($next).slideUp().parent().removeClass('open');
                        };
                    }

                    var accordion = new Accordion($('#accordion'), true);

                    $('.price').trigger("click");

                    $("#tokenimage").attr("src", source);
                    $("#tokenname").html(name);
                    $("#tokenprice").html(price);
                    $(".pay-button").on('click', function () {
                        pay(token);
                    })

                    $(".connect-button").on('click', function () {
                        connectTorus();
                    })
                    var usd = price * ETHtoUSD;

                    // Create our number formatter.
                    var formatter = new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',

                        // These options are needed to round to whole numbers if that's what you want.
                        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
                        //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
                    });



                    $("#usdprice").html("(" + formatter.format(usd) + ")");
                    // alert(price);
                });



                $("#body-placeholder")
                    .css('opacity', 0)
                    .slideDown('fast')
                    .animate(
                        { opacity: 1 },
                        { queue: false, duration: 'slow' }
                    );
                // add stiff


                //video.autoplay = true;
            });

        }
    }


}

var ETHtoUSD = 0;

function loadMain() {
    // should probably make a function to load the navbar so that it doesn't just load within main
    loadNav();

    getURL("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD", function (result) {
        ETHtoUSD = result.USD;
    });

    $.get("main.html", function (data) {
        $("#body-placeholder").replaceWith(data);


        loadTokens("0xeca87c0585c805abbed980dcc008616ce7676941", function () {
            // alert('done');

            for (var i = 0; i < tokens.length; i++) {
                tokens[i].add();
            }



            $(".circleButton").click(function (e) {
                e.preventDefault();

                var display = $(this).parent().find(".box").css('display');

                if (display == "block") {
                    $(this).parent().find(".box").css('opacity', 1).animate(
                        { opacity: 0 },
                        {
                            queue: false, duration: 'fast', complete: function () {
                                // alert('done');
                                $(this).parent().find(".box").css('display', 'none')
                            }
                        },
                    );


                } else {
                    $(this).parent().find(".box").css('opacity', 0).css('display', 'block').animate(
                        { opacity: 1 },
                        { queue: false, duration: 'fast' }
                    );
                }

            });


            let magicGrid = new MagicGrid({
                container: '.gridHolder',
                animate: true,
                gutter: 30,
                static: true,
                useMin: true
            });

            magicGrid.listen();

            $("#body-placeholder").css('visibility', 'visible');

            $("#body-placeholder")
                .css('opacity', 0)
                .slideDown('fast')
                .animate(
                    { opacity: 1 },
                    { queue: false, duration: 'slow' }
                );

            // $('.pay-button').click(pay); // needs some work obviously


        });


        //for (var i = 0; i < 20; i++) {
        //    new Token();
        //  }







    });
}


//TODO change 'contract' to CONTRACTS.....
function loadTokens(contract, callback) {
    // NEED SYSETM TO LOAD CONTRACTS ON THE SPOT 
    // alert(contract.methods.tokenURI(1));


    if (tokens.length != 0) {
        callback();
        return;
    }

    getTokens(contract, function (res) {

        var jsonData = res.data;


        var processed = 0;
        Object.keys(jsonData).forEach(function (key) {
            var value = jsonData[key];

            //  alert(value.tokenID);

            //  callback(value);



            getURL(value.data, function (json) {
                var imageURL = json.image;
                var name = json.name;
                var desc = json.description;

                // console.log(JSON.stringify(json));


                var img = new Image();

                img.onload = function () {
                    processed++;
                    tokens.push(new Token(name, desc, imageURL, value.tokenID, contract, value.price));

                    if (processed == jsonData.length) {

                        callback();
                    }
                };

                img.src = imageURL;





                //alert(JSON.stringify(json));
            });
            // ... callback for every single token.... EXACTLY what we need!!!!!!!!!
        });


    });
    //var maxSupply = 
}



async function awaitConnect(callback) {

    // Check if browser is running Metamask


    const provider = await detectEthereumProvider();

    if (provider) {
        if (provider.isConnected()) {
            if (provider.selectedAddress !== null) {
                alert('conncted: ' + provider.selectedAddress);
                callback(provider.selectedAddress);
                //  $('.connect-button').html("Connected");
            }
        }
    }
};

function loadGL() {
    // should probably make a function to load the navbar so that it doesn't just load within main

    $.get("navbar.html", function (data) {
        $("#nav-placeholder").replaceWith(data);

        // we need to ensure that nobody can set their name to NULL 


        $("#nav-placeholder")
            .css('opacity', 0)
            .slideDown('fast')
            .animate(
                { opacity: 1 },
                { queue: false, duration: 'slow' }
            );


    });

    $.get("3d.html", function (data) {
        $("#body-placeholder").replaceWith(data);
        loadWebGL();
        $("#body-placeholder")
            .css('opacity', 0)
            .slideDown('fast')
            .animate(
                { opacity: 1 },
                { queue: false, duration: 'slow' }
            );
    });
}


function eth() {
    getEth(function (response) {

    });
}

function loadSort() {
    // should probably make a function to load the navbar so that it doesn't just load within main

    $.get("navbar.html", function (data) {
        $("#nav-placeholder").replaceWith(data);

        // we need to ensure that nobody can set their name to NULL 


        $("#nav-placeholder")
            .css('opacity', 0)
            .slideDown('fast')
            .animate(
                { opacity: 1 },
                { queue: false, duration: 'slow' }
            );


    });

    $.get("sort.html", function (data) {
        $("#body-placeholder").replaceWith(data);
        build();
        loadCanvas();
        $("#body-placeholder")
            .css('opacity', 0)
            .slideDown('fast')
            .animate(
                { opacity: 1 },
                { queue: false, duration: 'slow' }
            );
    });
}


function loadConnect() {

    // alert('working');
    loadNav();


    $.get("connect.html", function (data) {
        $("#body-placeholder").replaceWith(data);



        $("#body-placeholder").css('visibility', 'visible');

        $("#body-placeholder")
            .css('opacity', 0)
            .slideDown('fast')
            .animate(
                { opacity: 1 },
                { queue: false, duration: 'slow' }
            );
        // add stiff


        //video.autoplay = true;
    });
}

function loadNano() {
}