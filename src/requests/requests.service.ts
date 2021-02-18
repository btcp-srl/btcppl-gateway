import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { PoSRequest } from '../entities/posrequest.entity';
const Trezor = require('../libs/Trezor')
const Ledger = require('../libs/Ledger')
const Card = require('../libs/Card')
import { MongoRepository } from 'typeorm';
const Utilities = require('../libs/Utilities')
const formidable = require('formidable')
const fs = require('fs')
const crypto = require('crypto')
const ft = require('file-type')
require('dotenv').config()
const axios = require('axios')
const QRCode = require('qrcode')

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
    this.repo['request'] = this.requestRepository
    this.entities['request'] = PoSRequest
    this.wallets['trezor'] = new Trezor.Wallet
    this.wallets['ledger'] = new Ledger.Wallet
    this.wallets['card'] = new Card.Wallet
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
          let change
          if (req.change === undefined) {
            let coingecko = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=EUR')
            change = coingecko.data.bitcoin.eur.toFixed(2)
          }
          let newRequest = new PoSRequest();
          newRequest.status = 'PENDING'
          newRequest.fiat = req.body.amount
          newRequest.address = address.address
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
}