var bitcoin = require('bitcoinjs-lib')
var bip32 = require('bip32')
var b58 = require('bs58check')
require('dotenv').config();
const axios = require('axios')

module Explorer {
    export class BlockCypher {
        public getbalance(address, unconfirmed = true) {
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
                }
                
                response({
                    balance: balance,
                    unconfirmed_txs: unconfirmed_txs
                })
            })
        }
    }

    export class BlockchainInfo {
        public getbalance(address, unconfirmed = true) {
            return new Promise(async response => {
                let balance = 0
                let unconfirmed_txs = 0
                // CHECK IN BLOCKCYPHER API
                try {
                    let blockchaininfo = await axios.get('https://blockchain.info/rawaddr/' + address)
                    console.log('CHECKING BALANCE FOR ' + address + ' IN BLOCKCHAIN.INFO')
                    if (blockchaininfo.data.address !== undefined) {
                        balance = blockchaininfo.data.address.total_received / 100000000
                    }
                } catch (e) {
                    console.log(e)
                }
                response({
                    balance: balance,
                    unconfirmed_txs: unconfirmed_txs
                })
            })
        }
    }

    export class BlockBook {
        public getbalance(address, unconfirmed = true) {
            return new Promise(async response => {
                response(true)
            })
        }
    }
}

export = Explorer;