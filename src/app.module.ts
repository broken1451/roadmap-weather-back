import { Global, Module } from '@nestjs/common';
import { WeatherModule } from './weather/weather.module';
import { ConfigModule } from '@nestjs/config';
import conf from './conf/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [conf],
      isGlobal: true
    }),
    ThrottlerModule.forRoot([
      {
        limit: 5,
        ttl: 60,
      }
    ]),
    WeatherModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    })
  ],
  controllers: [],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule { }
