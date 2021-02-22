import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { PoSRequest } from '../entities/posrequest.entity';
const Trezor = require('../libs/Trezor')
const Ledger = require('../libs/Ledger')
const Card = require('../libs/Card')
import { MongoRepository, UsingJoinColumnIsNotAllowedError } from 'typeorm';
require('dotenv').config()
const axios = require('axios')
const QRCode = require('qrcode')
global['isRequesting'] = false
const Explorer = require('../libs/Explorer')
const explorer = new Explorer.Wallet

@Injectable()
export class RequestsService {
  repo: any = {}
  entities: any = {}
  wallets: any = {}

  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    @InjectRepository(PoSRequest)
    private readonly requestRepository: MongoRepository<PoSRequest>
  ) {
    const app = this
    this.repo['request'] = this.requestRepository
    this.entities['request'] = PoSRequest
    this.wallets['trezor'] = new Trezor.Wallet
    this.wallets['ledger'] = new Ledger.Wallet
    this.wallets['card'] = new Card.Wallet

    app.checkRequests()
    setInterval(function () {
      if (global['isRequesting'] === false) {
        global['isRequesting'] = true
        app.checkRequests()
      } else {
        console.log('DAEMON IS BUSY')
      }
    }, 20000)
  }

  create(req): Promise<Object> {
    return new Promise(async response => {
      if (req.user.email) {
        let details = await this.userRepository.findOne({ email: req.user.email })
        if (details !== undefined) {
          let path = '0/'
          let paid = await this.requestRepository.find({ status: 'PAID' })
          let pending = await this.requestRepository.find({ status: 'PENDING' })
          let next = paid.length + pending.length
          path += next
          let wallet = this.wallets[details.wallet]
          let address = await wallet.getnewaddress(path, details.xpub)
          let price
          let change
          if (req.change === undefined) {
            let coingecko = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=EUR')
            change = coingecko.data.bitcoin.eur.toFixed(2)
          }
          let variac = parseFloat(change) / 100 * parseFloat(process.env.DEFAULT_MARKUP);
          price = parseFloat(change) + parseFloat(variac.toFixed(2));
          let newRequest = new PoSRequest();
          newRequest.status = 'PENDING'
          newRequest.fiat = req.body.amount
          newRequest.address = address.address
          newRequest.change = price
          newRequest.path = address.path
          newRequest.amount = (parseFloat(req.body.amount) / parseFloat(change)).toFixed(8)
          newRequest.timestamp = new Date().getTime().toString()
          newRequest.qrcode = await QRCode.toDataURL('bitcoin:' + address.address + '?amount=' + req.amount)
          let created = this.requestRepository.save(newRequest)
          response(created)
        } else {
          response({ message: 'Unauthorized', error: true })
        }
      } else {
        response({ message: 'Unauthorized', error: true })
      }
    })
  }

  check(req): Promise<Object> {
    return new Promise(async response => {
      response(true)
    })
  }

  get(req): Promise<Object> {
    return new Promise(async response => {
      response(true)
    })
  }

  async checkRequest(address: string): Promise<any> {
    try {
      let request = await this.requestRepository.findOne({ address: address });
      if (request !== undefined) {
        let balance = await explorer.getbalance(request.address, false)
        let amount = parseFloat(request.amount)
        if (request.status === 'PENDING' && balance.balance === amount) {
          request.status = 'PAID'
        }
        return request
      } else {
        return Promise.resolve({ success: false, message: 'Request not found.' })
      }
    } catch (e) {
      console.log(e)
      return Promise.resolve({ success: false, message: 'Error while checking.' })
    }
  }

  async checkRequests() {
    try {
      console.log('CHECKING REQUESTS')
      global['isRequesting'] = true
      let requests = await this.requestRepository.find({ status: 'PENDING' })

      for (let k in requests) {
        let request = requests[k]
        let amount = parseFloat(request.amount)
        if (amount > 0) {
          let balance = await explorer.getbalance(request.address)
          console.log('BALANCE IS ' + balance.balance + ' NEEDED ' + amount)

          if (balance.balance >= amount) {
            let now = new Date().getTime().toString()
            console.info('TRANSACTION PAID AT ' + now + '!')
            request.paidAt = now
            request.status = 'PAID'
            if (request.webHook !== undefined) {
              console.log('RUNNING WEBHOOK.')
              axios.post(request.webHook, request)
              request.hookResolved = now
            }
            console.log('SAVING IN DATABASE.')
            await this.requestRepository.save(request).catch(e => {
              console.log(e)
            })
          }

          let now = new Date().getTime()
          let elapsed = now - parseInt(request.timestamp)
          if (elapsed > 5400000 || parseInt(request.timestamp) === NaN || request.timestamp === '') {
            request.status = 'EXPIRED'
            this.requestRepository.save(request)
            console.log('REQUEST EXPIRED!')
          } else {
            console.log('NOT EXPIRED, CREATED AT ' + request.timestamp)
          }
        } else {
          request.status = 'EXPIRED'
          this.requestRepository.save(request)
        }
      }
      global['isRequesting'] = false
    } catch (e) {
      global['isRequesting'] = false
    }
  }
}