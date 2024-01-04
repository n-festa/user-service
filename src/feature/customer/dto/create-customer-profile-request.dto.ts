import { PhysicalActivityLevel } from 'src/enum';
import { GenericUser } from 'src/type';

export class CreateCustomerProfileRequest {
  requestData: requestData;
  userData: GenericUser;
}
class requestData {
  name: string;
  email: string;
  birthday: Date;
  sex: string;
  height_m: number;
  weight_kg: number;
  physical_activity_level: PhysicalActivityLevel;
  current_diet: string;
  allergic_food: string;
  chronic_disease: string;
  expected_diet: string;
}
