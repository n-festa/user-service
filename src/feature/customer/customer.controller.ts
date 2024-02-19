import { Controller, HttpException } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CustomerService } from 'src/feature/customer/customer.service';
import { CreateCustomerProfileRequest } from './dto/create-customer-profile-request.dto';
import { CreateCustomerProfileResponse } from './dto/create-customer-profile-response.dto';
import { Customer } from 'src/entity/customer.entity';
import { NutiExpertService } from 'src/dependency/nuti-expert/nuti-expert.service';
import { UpdateCustomerProfileRequest } from './dto/update-customer-profile-request.dto';
import { UpdateCustomerProfileResponse } from './dto/update-customer-profile-response.dto';

@Controller()
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly nutiExperService: NutiExpertService,
  ) {}

  @MessagePattern({ cmd: 'create_customer_profile' })
  async createProfile(
    data: CreateCustomerProfileRequest,
  ): Promise<CreateCustomerProfileResponse> {
    const response: CreateCustomerProfileResponse =
      new CreateCustomerProfileResponse(200, '');
    const {
      height_m,
      weight_kg,
      physical_activity_level,
      current_diet,
      allergic_food,
      chronic_disease,
      expected_diet,
      name,
      email,
      birthday,
      sex,
    } = data.requestData;
    const { userId } = data.userData;

    try {
      const { bmi, recommended_dietary_allowance_kcal } =
        await this.nutiExperService.findNutritionSuggestion(
          birthday,
          height_m,
          weight_kg,
          sex,
          physical_activity_level,
        );
      const customer: Customer = await this.customerService.createProfile(
        height_m,
        weight_kg,
        physical_activity_level,
        current_diet,
        allergic_food,
        chronic_disease,
        expected_diet,
        name,
        email,
        new Date(birthday),
        sex,
        userId,
        bmi,
        recommended_dietary_allowance_kcal,
      );
      response.statusCode = 200;
      response.message = 'Create customer profile successfully';
      response.data = customer;
    } catch (error) {
      if (error instanceof HttpException) {
        response.statusCode = error.getStatus();
        response.message = error.getResponse();
        response.data = null;
      } else {
        response.statusCode = 500;
        response.message = error.toString();
        response.data = null;
      }
    }
    return response;
  }
  get_customer_profile;
  @MessagePattern({ cmd: 'get_customer_profile' })
  async getCustomerProfile(id: number) {
    return await this.customerService.getCustomerProfile(id);
  }

  @MessagePattern({ cmd: 'update_customer_profile' })
  async updateProfile(
    data: UpdateCustomerProfileRequest,
  ): Promise<UpdateCustomerProfileResponse> {
    const response: UpdateCustomerProfileResponse =
      new CreateCustomerProfileResponse(200, '');
    const {
      name,
      email,
      birthday,
      sex,
      height_m,
      weight_kg,
      physical_activity_level,
      current_diet,
      allergic_food,
      chronic_disease,
      expected_diet,
    } = data.requestData;
    const { userId } = data.userData;

    try {
      const customer: Customer = await this.customerService.updateCustomerProfile(
        height_m,
        weight_kg,
        physical_activity_level,
        current_diet,
        allergic_food,
        chronic_disease,
        expected_diet,
        name,
        email,
        birthday,
        sex,
        userId,
      );
      response.statusCode = 200;
      response.message = 'Update customer profile successfully';
      response.data = customer;
    } catch (error) {
      if (error instanceof HttpException) {
        response.statusCode = error.getStatus();
        response.message = error.getResponse();
        response.data = null;
      } else {
        response.statusCode = 500;
        response.message = error.toString();
        response.data = null;
      }
    }
    return response;
  }
}
