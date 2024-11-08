import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { UpdateWeatherDto } from './dto/update-weather.dto';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult
} from '@nestjs/terminus';
import { RedisHealthIndicator } from '@nestjs-modules/ioredis';
import { Throttle } from '@nestjs/throttler';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService,
              private health: HealthCheckService,
              private redis: RedisHealthIndicator,
  ) {}


  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @Get('/getWeather/:city')
  getWeather(@Param('city') city: string) {
    return this.weatherService.getWeather(city);
  }

  @Throttle({ default: { limit: 50, ttl: 60000 } })
  @Get('/:city')
  verifyDataWeather(@Param('city') city: string) {
    return this.weatherService.verifyDataWeather(city);
  }

  @Get('/health')
  @HealthCheck()
  /**
   * Checks the health of the weather service.
   *
   * This method performs a health check by verifying the status of various
   * dependencies, such as the Redis service.
   *
   * @returns {Promise<HealthCheckResult>} A promise that resolves to the result of the health check.
   */
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      async () => this.redis.isHealthy('redis'),
    ]);
  }

}
