import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
require('dotenv').config()

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) { }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(@Request() req) {
    let created = await this.requestsService.create(req);
    return created
  }

  @UseGuards(JwtAuthGuard)
  @Post('check')
  async check(@Request() req) {
    let check = await this.requestsService.check(req);
    return check
  }

  @UseGuards(JwtAuthGuard)
  @Get(':type')
  async returnRequests(@Request() req) {
    let history = await this.requestsService.get(req);
    return history
  }

}