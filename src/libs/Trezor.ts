var bitcoin = require('bitcoinjs-lib')
var bip32 = require('bip32')
var b58 = require('bs58check')
require('dotenv').config();

module Trezor {
    export class Wallet {
        private ypubToXpub(ypub) {
            var data = b58.decode(ypub)
            data = data.slice(4)
            data = Buffer.concat([Buffer.from('0488b21e', 'hex'), data])
            return b58.encode(data)
        }

        private upubToTpub(upub) {
            var data = b58.decode(upub)
            data = data.slice(4)
            data = Buffer.concat([Buffer.from('043587cf', 'hex'), data])
            return b58.encode(data)
        }

        public getnewaddress(path, ypub) {
            return new Promise(response => {
                // console.log('DERIVING FROM ' + ypub + ' AT PATH ' + path)
                if (process.env.TESTNET === 'false') {
                    // GENERATING MAINNET ADDRESS
                    let xpub = this.ypubToXpub(ypub)
                    const root = bip32.fromBase58(xpub)
                    const child = root.derivePath(path)
                    const { address } = bitcoin.payments.p2sh({
                        redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: bitcoin.networks.bitcoin }),
                        network: bitcoin.networks.bitcoin
                    })
                    response({ address: address, path: path, ypub: ypub })
                } else {
                    // GENERATING TESTNET ADDRESS
                    let upub = ypub
                    var tpub = this.upubToTpub(upub)
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

export = Trezor;