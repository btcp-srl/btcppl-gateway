import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RequestsModule } from './requests/requests.module';
import { TypeOrmModule } from '@nestjs/typeorm';
require('dotenv').config()
import { join } from 'path';

@Module({
  imports: [
    UsersModule,
    RequestsModule,
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.DB_CONNECTION,
      entities: [join(__dirname, '**/**.entity{.ts,.js}')],
      synchronize: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      logging: true,
      w: 1,
      j: true
    })
  ],
  controllers: [AppController],
  providers: [
    AppService
  ],
})
export class AppModule { }
