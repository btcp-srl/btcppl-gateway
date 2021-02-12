import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Request } from '../entities/request.entity';
import { MongoRepository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
const Utilities = require('../libs/Utilities')
const ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore
const logger = new Utilities.Logger
require('dotenv').config()

@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>,
    @InjectRepository(Request)
    private readonly requestRepository: MongoRepository<Request>) {
  }

  /**
   * User functions
   */

  create(req, origin): Promise<Object> {
    return new Promise(async response => {
      let checkExistEmail = await this.userRepository.findOne({ email: req.email })
      let checkExistCF = await this.userRepository.findOne({ cf: req.cf })
      if (checkExistEmail === undefined && checkExistCF === undefined) {
        try {
          let newUser = new User();
          newUser = req
          newUser.level = 'user'
          let pwd = req.password.toString()
          newUser.password = await scrypta.hash(pwd)
          newUser.hash = await scrypta.hash(req.email)
          newUser.role = req.role
          newUser.is_active = true
          newUser.validated = true
          newUser.timestamp_registration = new Date().getTime()
          newUser.token = await scrypta.hash(newUser.timestamp_registration.toString())

          await this.userRepository.save(newUser).catch(e => {
            response({ message: e._message, error: true, details: e })
          })

          logger.log('USER CREATED SUCCESSFULLY', 'users', newUser.hash, 'CREATED')
          response({ message: 'User successfully created', error: false })

        } catch (e) {
          console.log(e)
          response({ message: 'Error while creating user', error: true })
        }
      } else {
        response({ message: 'User exists', error: true })
      }
    })
  }

  async login(req): Promise<Object> {
    if (req.email !== undefined && req.password !== undefined) {
      let pwd = await scrypta.hash(req.password)
      let checkUser = await this.userRepository.findOne({ email: req.email, password: pwd })
      if (checkUser !== undefined) {
        const payload = { email: checkUser.email, level: checkUser.level };
        return {
          access_token: this.jwtService.sign(payload),
          user: checkUser,
          error: false
        };
      } else {
        return {
          message: 'Not authorized',
          error: true
        }
      }
    }
  }

  async validateToken(req): Promise<any> {
    let toEdit = await this.userRepository.findOne({ token: req.params.token })
    if (toEdit !== undefined) {
      toEdit.validated = true
      await this.userRepository.save(toEdit)
      return true
    } else {
      return false
    }
  }

  async askRestore(email): Promise<any> {
    let toRestore = await this.userRepository.findOne({ email: email })
    if (toRestore !== undefined && toRestore.hash !== undefined) {
      let token = await scrypta.hash(new Date().getTime().toString())
      toRestore.restore_token = token
      await this.userRepository.save(toRestore)
      return Promise.resolve({ success: true })
    } else {
      return Promise.resolve({ success: true })
    }
  }

  async restorePassword(req): Promise<any> {
    let toRestore = await this.userRepository.findOne({ restore_token: req.body.token })
    if (toRestore !== undefined && toRestore.hash !== undefined) {
      toRestore.restore_token = null
      toRestore.password = await scrypta.hash(req.body.password)
      await this.userRepository.save(toRestore)
      return Promise.resolve({ success: true })
    } else {
      return Promise.resolve({ success: false })
    }
  }

  async getUser(req): Promise<User | any> {
    if (req.user.email) {
      let details = await this.userRepository.findOne({ email: req.user.email })
      if (details !== undefined && details.role !== undefined) {
        return details
      } else {
        return { message: 'Unauthorized', error: true }
      }
    } else {
      return { message: 'Unauthorized', error: true }
    }
  }

  async update(req): Promise<User | any> {
    if (req.user.email) {
      let toEdit = await this.userRepository.findOne({ email: req.user.email })
      let readonly = ["password", "email", "hash", "level", "is_admin", "is_active", "role", "timestamp_registration", "_id"]
      for (let k in toEdit) {
        if (req.body[k] !== undefined && readonly.indexOf(k) === -1) {
          toEdit[k] = req.body[k]
        }
      }
      await this.userRepository.save(toEdit)
      logger.log('USER EDITED SUCCESSFULLY', 'users', toEdit.hash, 'EDIT')
      let updated = await this.userRepository.findOne({ email: req.user.email })
      return updated
    } else {
      return { message: 'Unauthorized', error: true }
    }
  }

  async changePassword(req): Promise<User | any> {
    if (req.user.email && req.body.old !== undefined && req.body.password !== undefined) {
      let toEdit = await this.userRepository.findOne({ email: req.user.email })
      let oldhash = await scrypta.hash(req.body.old)
      if (oldhash === toEdit.password) {
        toEdit.password = await scrypta.hash(req.body.password)
        await this.userRepository.save(toEdit)
        logger.log('PASSWORD CHANGED SUCCESSFULLY', 'users', toEdit.hash, 'CHANGEPASSWORD')
        return { message: 'Password changed correctly', error: false }
      } else {
        return { message: 'Password is invalid, retry', error: true }
      }
    } else {
      return { message: 'Unauthorized', error: true }
    }
  }

  async changeEmail(req): Promise<User | any> {
    if (req.user.email && req.body.email !== undefined && req.body.password !== undefined) {
      let toEdit = await this.userRepository.findOne({ email: req.user.email })
      if (toEdit !== undefined) {
        let hashPassword = await scrypta.hash(req.body.password)
        if (hashPassword === toEdit.password) {
          let checkNewEmail = await this.userRepository.findOne({ email: req.body.email })
          if (checkNewEmail === undefined) {
            toEdit.email = req.body.email
            const payload = { email: toEdit.email, level: toEdit.level };
            const access_token = this.jwtService.sign(payload)
            await this.userRepository.save(toEdit)
            logger.log('EMAIL CHANGED SUCCESSFULLY', 'users', toEdit.hash, 'CHANGEEMAIL')
            return { message: 'Email changed correctly', access_token: access_token, error: false }
          } else {
            return { message: 'Can\'t use this e-mail', error: true }
          }
        } else {
          return { message: 'Password is invalid, retry', error: true }
        }
      } else {
        return { message: 'Unauthorized', error: true }
      }
    } else {
      return { message: 'Unauthorized', error: true }
    }
  }

  async deleteUser(req): Promise<User | any> {
    if (req.user.email) {
      let todelete = await this.userRepository.findOne({ email: req.user.email })
      if (todelete !== undefined) {
        await this.userRepository.deleteOne({ email: req.user.email })
        logger.log('USER DELETED SUCCESSFULLY', 'users', todelete.hash, 'DELETED')
        return { message: 'Bye bye', error: false }
      } else {
        return { message: 'Can\'t find user', error: true }
      }
    } else {
      return { message: 'Unauthorized', error: true }
    }
  }

}