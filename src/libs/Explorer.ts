var bitcoin = require('bitcoinjs-lib')
var bip32 = require('bip32')
var b58 = require('bs58check')
require('dotenv').config();
const axios = require('axios')

module Explorer {

    export class Wallet {
        public getbalance(address, unconfirmed = true) {
            return new Promise(async response => {
                let balance = 0
                let unconfirmed_txs = 0
                let errored = false

                // Check Blockbook
                try {
                    let BlockBook = await this.blockbook(address)
                    if (BlockBook !== false && BlockBook.balance !== undefined && BlockBook.unconfirmed_txs !== undefined) {
                        balance = BlockBook.balance
                        unconfirmed_txs = BlockBook.unconfirmed_txs
                    } else {
                        errored = true
                    }
                } catch (e) {
                    errored = true
                }

                if (errored) {
                    // Check Blockcypher
                    errored = false
                    try {
                        let Blockcypher = await this.blockcypher(address)
                        if (Blockcypher !== false && Blockcypher.balance !== undefined && Blockcypher.unconfirmed_txs !== undefined) {
                            balance = Blockcypher.balance
                            unconfirmed_txs = Blockcypher.unconfirmed_txs
                        } else {
                            errored = true
                        }
                    } catch (e) {
                        errored = true
                    }
                }

                if (errored) {
                    // Check BlockchainInfo
                    errored = false
                    try {
                        let BlockchainInfo = await this.blockcypher(address)
                        if (BlockchainInfo !== false && BlockchainInfo.balance !== undefined && BlockchainInfo.unconfirmed_txs !== undefined) {
                            balance = BlockchainInfo.balance
                            unconfirmed_txs = BlockchainInfo.unconfirmed_txs
                        } else {
                            errored = true
                        }
                    } catch (e) {
                        errored = true
                    }
                }

                response({
                    balance: balance,
                    unconfirmed_txs: unconfirmed_txs
                })
            })
        }

        private blockcypher(address, unconfirmed = true): any {
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

        public blockchaininfo(address, unconfirmed = true): any {
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

        public blockbook(address, unconfirmed = true): any {
            return new Promise(async response => {
                let bbs = ["btc1", "btc2", "btc3", "btc4", "btc5"]
                let bb = bbs[Math.floor(Math.random() * bbs.length)];
                let url = 'https://' + bb + '.trezor.io/api/v2/address/' + address
                console.log('CHECKING BALANCE FOR ' + address + ' IN BLOCKBOOK (' + bb + ')')
                try {
                    let res = await axios.get(url)
                    response({
                        balance: parseFloat(res.data.balance) / 100000000,
                        unconfirmed_txs: res.data.unconfirmedTxs
                    })
                } catch (e) {
                    response(false)
                }
            })
        }
    }
}

export = Explorer;