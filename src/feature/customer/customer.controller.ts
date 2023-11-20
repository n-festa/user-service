import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CustomerService } from 'src/feature/customer/customer.service';
import { CreateCustomerProfileRequest } from './dto/create-customer-profile-request.dto';

@Controller()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @MessagePattern({ cmd: 'create_customer_profile' })
  async createProfile(data: CreateCustomerProfileRequest) {
    return await this.customerService.createProfile(data);
  }
}
