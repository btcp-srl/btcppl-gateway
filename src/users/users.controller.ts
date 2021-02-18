import { Response, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
const Utilities = require('../libs/Utilities')
require('dotenv').config()

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) { }


  /**
   * User functions
   */
  @Post()
  async create(@Request() req) {
    if (req.body.xpub !== undefined && req.body.email !== undefined && req.body.password !== undefined && req.body.wallet !== undefined) {
      let created = await this.usersService.create(req.body);
      return created
    } else {
      return { message: "Malformed request.", error: true }
    }
  }

  @Post('login')
  async login(@Request() req) {
    return this.usersService.login(req.body);
  }

  @Get('validate/:token')
  async validateMail(@Request() req, @Response() res) {
    try {
      await this.usersService.validateToken(req)
      if (req.params.staging !== process.env.WEBSITE) {
        res.redirect("https://" + req.params.staging + "." + process.env.WEBSITE + "/login")
      } else {
        res.redirect("https://" + process.env.WEBSITE + "/login")
      }
    } catch (e) {
      if (req.params.staging !== process.env.WEBSITE) {
        res.redirect("https://" + req.params.staging + "." + process.env.WEBSITE + "/login")
      } else {
        res.redirect("https://" + process.env.WEBSITE + "/login")
      }
    }
  }

  @Get('restore/:email')
  async askRestore(@Request() req) {
    let created = await this.usersService.askRestore(req.params.email);
    return created
  }

  @Post('restore')
  async restorePassword(@Request() req) {
    let created = await this.usersService.restorePassword(req);
    return created
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  async update(@Request() req): Promise<User[]> {
    let updated = await this.usersService.update(req);
    return updated
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req): Promise<User[]> {
    let updated = await this.usersService.changePassword(req);
    return updated
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-email')
  async changeEmail(@Request() req): Promise<User[]> {
    let updated = await this.usersService.changeEmail(req);
    return updated
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete')
  async deleteUser(@Request() req): Promise<User[]> {
    let updated = await this.usersService.deleteUser(req);
    return updated
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUser(@Request() req): Promise<User[]> {
    let user = await this.usersService.getUser(req);
    return user
  }

}