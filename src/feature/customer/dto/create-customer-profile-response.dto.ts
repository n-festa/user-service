import { GeneralResponse } from 'src/dto/general-response.dto';
import { Customer } from 'src/entity/customer.entity';

export class CreateCustomerProfileResponse extends GeneralResponse {
  data: Customer;
}
