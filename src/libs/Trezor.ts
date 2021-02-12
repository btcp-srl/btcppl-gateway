var bitcoin = require('bitcoinjs-lib')
var bip32 = require('bip32')
var b58 = require('bs58check')
require('dotenv').config();
const axios = require('axios')

function ypubToXpub(ypub) {
    var data = b58.decode(ypub)
    data = data.slice(4)
    data = Buffer.concat([Buffer.from('0488b21e', 'hex'), data])
    return b58.encode(data)
}

function upubToTpub(upub) {
    var data = b58.decode(upub)
    data = data.slice(4)
    data = Buffer.concat([Buffer.from('043587cf', 'hex'), data])
    return b58.encode(data)
}

function getnewaddress(path) {
    return new Promise(response => {
        // console.log('DERIVING FROM ' + ypub + ' AT PATH ' + path)
        if (process.env.TESTNET === 'false') {
            // GENERATING MAINNET ADDRESS
            let ypub = process.env.COLD_YPUB
            let xpub = ypubToXpub(ypub)
            const root = bip32.fromBase58(xpub)
            const child = root.derivePath(path)
            const { address } = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: bitcoin.networks.bitcoin }),
                network: bitcoin.networks.bitcoin
            })
            response({ address: address, path: path, ypub: ypub })
        } else {
            // GENERATING TESTNET ADDRESS
            let upub = process.env.COLD_UPUB
            var tpub = upubToTpub(upub)
            const root = bip32.fromBase58(tpub, bitcoin.networks.testnet)
            const child = root.derivePath(path)
            const { address } = bitcoin.payments.p2sh({
                redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: bitcoin.networks.testnet }),
                network: bitcoin.networks.testnet
            })
            response({ address: address, path: path, tpub: tpub })
        }
    })
}

function getbalance(address, unconfirmed = true) {
    return new Promise(async response => {
        let balance = 0
        let unconfirmed_txs = 0
        // CHECK IN BLOCKCYPHER API
        try {
            let network = 'main'
            if (process.env.TESTNET === 'true') {
                network = 'test3'
            }
            let blockcypher = await axios.get('https://api.blockcypher.com/v1/btc/' + network + '/addrs/' + address + '/balance')
            console.log('CHECKING BALANCE FOR ' + address + ' IN BLOCKCYPHER')
            if (blockcypher.data.address !== undefined) {
                if (unconfirmed) {
                    balance = blockcypher.data.final_balance / 100000000
                } else {
                    balance = blockcypher.data.balance / 100000000
                }
                unconfirmed_txs = blockcypher.data.unconfirmed_n_tx
            }
        } catch (e) {
            console.log(e)
            if(process.env.TESTNET === 'false'){
                // CHECK IN BLOCKCHAIN.INFO API
                let blockchaininfo = await axios.get('https://blockchain.info/rawaddr/' + address)
                console.log('CHECKING BALANCE FOR ' + address + ' IN BLOCKCHAIN.INFO')
                if (blockchaininfo.data.address !== undefined) {
                    balance = blockchaininfo.data.address.total_received / 100000000
                }
            }
        }
        response({
            balance: balance,
            unconfirmed_txs: unconfirmed_txs
        })
    })
}

module.exports.getnewaddress = getnewaddress
module.exports.getbalance = getbalance