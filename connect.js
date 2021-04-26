var web3; //undefined

async function connectWallet() {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable();

            window.web3.eth.getAccounts((error, result) => {
                if (error) {
                    alert(error);
                } else {

                    alert('connected');

                    $('.connect-button').html("Connected");
                    //initPayButton(result[0]); // shouldn't always pay with account 0....
                    //alert(result[0]);
                }
            });


            // 
        } catch (err) {
            $('#status').html('User denied account access', err)
            alert(err);
        }
    }
}


async function connectTorus() {
    const torus = new Torus();
    await torus.init();
    await torus.login(); // await torus.ethereum.enable()
    web3 = new Web3(torus.provider);

    
}