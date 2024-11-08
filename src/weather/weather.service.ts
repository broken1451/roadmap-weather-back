import { Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Weather } from './interfaces/weather.interface';

@Injectable()
export class WeatherService {

  constructor(@InjectRedis() private readonly redis: Redis,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService) { }

  async getWeather(city: string) {
    const fullUrl = `${this.configService.get('urlWeather')}${city.trim().toLocaleUpperCase()}`;
    let data: Weather;

    try {
      const response = await firstValueFrom(this.httpService.get(fullUrl, {
        params: {
          unitGroup: this.configService.get('unitGroup'),
          key: this.configService.get('keyWeather'),
          contentType: 'json'
        }
      }));
      data = response.data;
      await this.redis.set(city.trim().toLocaleUpperCase(), JSON.stringify(data), 'EX', 350);
      const redisData =  await this.redis.get(city);
      return JSON.parse(redisData);
    } catch (error) {
      console.error('Error fetching weather data:', error.response || error.message);
      throw error;
    }
  }

  async verifyDataWeather(city: string) {
    const redisData = await this.redis.get(city.trim().toLocaleUpperCase());
    console.log('redisData:', redisData);
    if (!redisData) {
      throw new NotFoundException(`No weather data found for city: ${city}`);
    }
    return JSON.parse(redisData);
  }

  findOne(id: number) {
    return `This action returns a #${id} weather`;
  }
}
