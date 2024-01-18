import { Module } from '@nestjs/common';
import { NutiExpertService } from './nuti-expert.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [NutiExpertService],
  exports: [NutiExpertService],
})
export class NutiExpertModule {}
