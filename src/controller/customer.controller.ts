import { Controller } from '@nestjs/common';
import { CustomerService } from 'src/service/customer.service';

@Controller()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}
}
