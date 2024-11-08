import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { RedisModule } from '@nestjs-modules/ioredis';
import { TerminusModule } from '@nestjs/terminus';
import { RedisHealthModule, } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [WeatherController],
  providers: [WeatherService],
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: String(`${configService.get('redisUlr')}:${configService.get('portRedis')}`),
      }),
    }),
    HttpModule,
    TerminusModule, RedisHealthModule
  ]
})
export class WeatherModule { }
