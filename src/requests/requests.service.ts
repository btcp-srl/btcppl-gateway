import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Request } from '../entities/request.entity';
import { MongoRepository } from 'typeorm';
const Utilities = require('../libs/Utilities')
const formidable = require('formidable')
const fs = require('fs')
const crypto = require('crypto')
const ft = require('file-type')
require('dotenv').config()

@Injectable()
export class RequestsService {
  repo: any = {}
  entities: any = {}

  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    @InjectRepository(Request)
    private readonly requestRepository: MongoRepository<Request>
  ) {
    this.repo['request'] = this.requestRepository
    this.entities['request'] = Request
  }

  create(req): Promise<Object> {
    return new Promise(async response => {
      response(true)
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