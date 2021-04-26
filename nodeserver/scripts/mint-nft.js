require('dotenv').config();
const { API_URL, PRIVATE_KEY, PUBLIC_KEY } = process.env;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(API_URL);
const contract = require("../artifacts/contracts/NFT.sol/NFT.json");

console.log(JSON.stringify(contract.abi));

const contractAddress = '0xeCa87C0585C805AbbED980DcC008616Ce7676941';
const nftContract = new web3.eth.Contract(contract.abi, contractAddress);

const a = 'https://gateway.pinata.cloud/ipfs/QmV5kW6REp4Ag6a42rsFsD6y6hgipW4uvMGtj6v1jqKDuB';

async function mintNFT(tokenURI) {
    const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, 'latest'); //get latest nonce
  
    //the transaction
    const tx = {
      'from': PUBLIC_KEY,
      'to': contractAddress,
      'nonce': nonce, // 1 ETH * 100
      'gas': 500000,
      'data': nftContract.methods.mintNFT(PUBLIC_KEY, tokenURI).encodeABI()
    };
  
  
    const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    signPromise.then((signedTx) => {
  
      web3.eth.sendSignedTransaction(signedTx.rawTransaction, function(err, hash) {
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
  
  mintNFT(a);