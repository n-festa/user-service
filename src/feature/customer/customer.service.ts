import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entity/customer.entity';
import { HealthInfo } from 'src/entity/health-info.entity';
// import { CreateCustomerProfileRequest } from './dto/create-customer-profile-request.dto';
import { Repository } from 'typeorm';
import { Media } from 'src/entity/media.entity';
import { GeneralResponse } from 'src/dto/general-response.dto';
import { PhysicalActivityLevel } from 'src/enum';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(HealthInfo)
    private healthInfoRepo: Repository<HealthInfo>,
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
  ) {}
  async createProfile(
    height_m: number,
    weight_kg: number,
    physical_activity_level: PhysicalActivityLevel,
    current_diet: string = '',
    allergic_food: string = '',
    chronic_disease: string = '',
    expected_diet: string = '',
    name: string,
    email: string,
    birthday: Date,
    sex: string,
    customer_id: number,
    bmi: number,
    recommended_dietary_allowance_kcal: number,
  ): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      relations: {
        profile_image: true,
        health_info: true,
      },
      where: {
        customer_id: customer_id,
      },
    });
    //Check the profile does exist before
    if (customer.health_info) {
      throw new HttpException('Profile already exist', 400);
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
    healhInfo.bmi = bmi;
    healhInfo.recommended_dietary_allowance_kcal =
      recommended_dietary_allowance_kcal;
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
    return upatedCustomer;
  }
  async getCustomerProfile(id: number): Promise<GeneralResponse> {
    const response: GeneralResponse = new GeneralResponse(200, '');
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
