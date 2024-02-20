import { PhysicalActivityLevel } from "src/enum";
import { GenericUser } from 'src/type';

export class UpdateCustomerProfileRequest {
  requestData: requestData;
  userData: GenericUser;
}
class requestData {
  customer_id: number;
  name: string;
  email: string;
  birthday: string;
  sex: string;
  height_m: number;
  weight_kg: number;
  physical_activity_level: PhysicalActivityLevel;
  current_diet: string;
  allergic_food: string;
  chronic_disease: string;
  expected_diet: string;
}
  