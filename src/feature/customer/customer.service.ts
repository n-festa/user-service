import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entity/customer.entity';
import { HealthInfo } from 'src/entity/health-info.entity';
import { CreateCustomerProfileRequest } from './dto/create-customer-profile-request.dto';
import { Repository } from 'typeorm';
import { Media } from 'src/entity/media.entity';
import { GeneralResponse } from 'src/dto/general-response.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(HealthInfo)
    private healthInfoRepo: Repository<HealthInfo>,
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
  ) {}
  async createProfile(
    data: CreateCustomerProfileRequest,
  ): Promise<GeneralResponse> {
    let response: GeneralResponse = new GeneralResponse(200, '');
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
      const customer = await this.customerRepo.findOne({
        relations: {
          profile_image: true,
          health_info: true,
        },
        where: {
          customer_id: userId,
        },
      });
      //Check the profile does exist before
      if (customer.health_info) {
        delete customer.refresh_token;
        response.statusCode = 400;
        response.message = 'Profile already exist';
        response.data = customer;
        return response;
      }

      //create and save healthInfo
      const healhInfo = new HealthInfo();
      healhInfo.height_m = height_m;
      healhInfo.weight_kg = weight_kg;
      healhInfo.physical_activity_level = physical_activity_level;
      healhInfo.current_diet = current_diet;
      healhInfo.allergic_food = allergic_food;
      healhInfo.chronic_disease = chronic_disease;
      healhInfo.expected_diet = expected_diet;
      const createdHealInfo = await this.healthInfoRepo.save(healhInfo);

      //update Customer
      customer.name = name;
      customer.email = email;
      customer.birthday = birthday;
      customer.sex = sex;
      customer.profile_image = await this.mediaRepo.findOneBy({
        type: 'image',
        name: 'default_logo_image',
      });
      customer.is_active = 1;
      customer.health_info = createdHealInfo;
      const upatedCustomer = await this.customerRepo.save(customer);
      delete upatedCustomer.refresh_token;
      response.statusCode = 200;
      response.message = 'Customer profile has been created';
      response.data = upatedCustomer;
      return response;
    } catch (error) {
      response.statusCode = 500;
      response.message = error.toString();
      return response;
    }
  }
  async getCustomerProfile(id: number): Promise<GeneralResponse> {
    let response: GeneralResponse = new GeneralResponse(200, '');
    try {
      const customer = await this.customerRepo.findOne({
        relations: {
          profile_image: true,
          health_info: true,
        },
        where: {
          customer_id: id,
        },
      });
      delete customer.refresh_token;
      response.statusCode = 200;
      response.message = 'Get customer successfully';
      response.data = customer;
      return response;
    } catch (error) {
      response.statusCode = 500;
      response.message = error.toString();
      return response;
    }
  }
}
