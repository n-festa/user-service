import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: 3018,
      },
    },
  );
  await app.listen();
  //Set timezone
  process.env.TZ = 'UTC';
  console.log(`The default timezone at ${process.env.TZ}`);
}
bootstrap();
