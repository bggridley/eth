var web3; //undefined
var walletProvider;
var addresses;


async function connectWallet() {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable();

            window.web3.eth.getAccounts((error, result) => {
                if (error) {
                    alert(error);
                } else {

                    walletProvider = "METAMASK";
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
    await torus.init({
        network: {
            host: "rinkeby", // default: mainnet
            chainId: 1, // default: 1
            networkName: "Rinkeby Test Network" // default: Main Ethereum Network
          }
    });
    addresses = await torus.login(); // await torus.ethereum.enable()
    web3 = new Web3(torus.provider);
    walletProvider = "TORUS";
}


async function connectFortmatic() {

    let fm = new Fortmatic('pk_test_73472DC2B1BB9136');
    web3 = new Web3(fm.getProvider());
    web3.currentProvider.enable();

    alert('what');

    walletProvider = "FORTMATIC";
}