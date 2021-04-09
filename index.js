
var logged_user = {
    uuid: null,
    firstname: null,
    lastname: null,
    email: null
}; // this will be set either when the document loads (and remember me box is ticked)
//logged_user is the UUID
$(document).ready(function () {


    $.get("accountModal.html", function (data) {
        $("#modals").replaceWith(data);

        $("#signOut").click(function () {
            logged_user["uuid"] = null;
            logged_user["firstname"] = null;
            logged_user["lastname"] = null;
            logged_user["email"] = null;

            document.cookie = "key=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            document.cookie = "email=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            loadMain();
        }

        );
    });

    var key = getCookie("key");
    var email = getCookie("email");

    login(email, key, true, function (response) {

        if (response["status"] == "true") {

            logged_user["uuid"] = response["uuid"];
            logged_user["firstname"] = response["firstname"];
            logged_user["lastname"] = response["lastname"];
        } else {
            // alert('cookie fail');
        }

        loadMain();
    });
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

async function pay() {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable();
            initPayButton()
        } catch (err) {
            $('#status').html('User denied account access', err)
            alert(err);
        }
    } else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider)
        initPayButton()
    } else {
        $('#status').html('No Metamask (or other Web3 Provider) installed')
    }
}

const initPayButton = () => {
        // paymentAddress is where funds will be send to
        const paymentAddress = '0x80207077859f561B1b41Fc5a919b04f8e1AfC297'
        const amountEth = "0.1"

        web3.eth.sendTransaction({
            to: paymentAddress,
            value: web3.utils.toWei(amountEth, 'ether')
        }, (err, transactionId) => {
            if (err) {
                console.log('Payment failed', err)
                $('#status').html('Payment failed')
            } else {
                console.log('Payment successful', transactionId)
                $('#status').html('Payment successful')
            }
        })
}

function loadMain() {
    // should probably make a function to load the navbar so that it doesn't just load within main

   
    $.get("navbar.html", function (data) {
        $("#nav-placeholder").replaceWith(data);

        // we need to ensure that nobody can set their name to NULL 

        if (logged_user["firstname"] != null) {
            $('#nav-login').text("Hello, " + logged_user["firstname"]);

            $('#nav-login').off("click");
            $('#nav-login').click(function () {
                // open account MODAL.. MODAL's ARE SO AWESOME
                //alert('hello');

                $("#accountModal").modal();
            });
        } else {
            $('#nav-login').text("Login");
            $('#nav-login').off("click");
            $('#nav-login').click(function () {
                loadLogin();
            });
        }


        $("#nav-placeholder")
            .css('opacity', 0)
            .slideDown('fast')
            .animate(
                { opacity: 1 },
                { queue: false, duration: 'slow' }
            );


    });

    $.get("main.html", function (data) {
        $("#body-placeholder").replaceWith(data);
        $("#body-placeholder")
            .css('opacity', 0)
            .slideDown('fast')
            .animate(
                { opacity: 1 },
                { queue: false, duration: 'slow' }
            );

            $('.pay-button').click(pay);

    });
}

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


function loadLogin() {
    $.get("navbar.html", function (data) {
        $("#nav-placeholder").replaceWith(data);
    });


    $.get("login.html", function (data) {
        $("#body-placeholder").replaceWith(data);


        $("#loginForm").submit(function (e) {
            e.preventDefault();
        });


        $('#top-signup').click(function () {
            loadSignup();
        });

        $('#submitLogin').click(function () {
            login($('#email').val(), $('#password').val(), false, function (response) {

                if (response["status"] == "true") {
                    //loadAdmin();

                    if ($("#remember").is(':checked')) {
                        document.cookie = "key=" + response["message"] + "; expires=Fri, 31 Dec 2037 23:59:59 GMT; path=/";
                        document.cookie = "email=" + $('#email').val() + "; expires=Fri, 31 Dec 2037 23:59:59 GMT; path=/";
                    }

                    logged_user["uuid"] = response["uuid"];
                    logged_user["firstname"] = response["firstname"];
                    logged_user["lastname"] = response["lastname"];

                    loadMain();
                } else {
                    alert(response["message"]);
                }
            });
        });

        //video.autoplay = true;
    });
}

function loadSignup() {
    $.get("navbar.html", function (data) {
        $("#nav-placeholder").replaceWith(data);
    });


    $.get("signup.html", function (data) {
        $("#body-placeholder").replaceWith(data);

        $("#loginForm").submit(function (e) {
            e.preventDefault();
        });

        $('#top-login').click(function () {
            loadLogin();
        });

        $('#submitSignup').click(function () {
            createAccount($('#email').val(), $('#password').val(), $('#firstname').val(), $('#lastname').val(), function (response) {
                alert(response);
            });
        });
        //video.autoplay = true;
    });
}

function loadNano() {
}