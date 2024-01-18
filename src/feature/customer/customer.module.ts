import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from 'src/entity/customer.entity';
import { HealthInfo } from 'src/entity/health-info.entity';
import { Media } from 'src/entity/media.entity';
import { NutiExpertModule } from 'src/dependency/nuti-expert/nuti-expert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, HealthInfo, Media]),
    NutiExpertModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
