import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './feature/customer/customer.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db-2all-free.c9s4w6ey6i0r.ap-southeast-1.rds.amazonaws.com',
      port: 3306,
      username: 'admin',
      password: 'Goodfood4goodlife',
      database: 'new-2all-dev',
      entities: [],
      synchronize: false,
      autoLoadEntities: true,
    }),
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
