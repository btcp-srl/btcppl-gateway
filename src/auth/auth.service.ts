import { Injectable } from '@nestjs/common';
const ScryptaCore = require('@scrypta/core')
let scrypta = new ScryptaCore
const Utilities = require('../libs/Utilities')
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { MongoRepository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: MongoRepository<User>
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await await this.userRepository.findOne({ email: email })
    let hashed = await scrypta.hash(pass)
    if (user && hashed === user.password && user.validated) {
      const { password, ...result } = user;
      return result;
    }else{
      return false;
    }
  }

}