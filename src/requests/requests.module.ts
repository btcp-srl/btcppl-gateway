import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from '../entities/request.entity';
import { User } from '../entities/user.entity';
import { RequestsController } from './requests.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, User]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '86400s' },
    })
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})

export class RequestsModule { }