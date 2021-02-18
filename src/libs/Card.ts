var bitcoin = require('bitcoinjs-lib')
var bip32 = require('bip32')
var b58 = require('bs58check')
require('dotenv').config();

module Card {
    export class Wallet {
        public getnewaddress(path) {
            return new Promise(response => {
                // console.log('DERIVING FROM ' + ypub + ' AT PATH ' + path)
                if (process.env.TESTNET === 'false') {
                    // GENERATING MAINNET ADDRESS
                    let xpub = process.env.COLD_XPUB
                    const root = bip32.fromBase58(xpub)
                    const child = root.derivePath(path)
                    const { address } = bitcoin.payments.p2sh({
                        redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: bitcoin.networks.bitcoin }),
                        network: bitcoin.networks.bitcoin
                    })
                    response({ address: address, path: path, xpub: xpub })
                } else {
                    // GENERATING TESTNET ADDRESS
                    let tpub = process.env.COLD_UPUB
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
    }
}

export = Card;