import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from 'src/entity/customer.entity';
import { HealthInfo } from 'src/entity/health-info.entity';
// import { CreateCustomerProfileRequest } from './dto/create-customer-profile-request.dto';
import { Repository } from 'typeorm';
import { Media } from 'src/entity/media.entity';
import { GeneralResponse } from 'src/dto/general-response.dto';
import { PhysicalActivityLevel } from 'src/enum';
import { NutiExpertService } from 'src/dependency/nuti-expert/nuti-expert.service';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(HealthInfo)
    private healthInfoRepo: Repository<HealthInfo>,
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
    private readonly nutiExperService: NutiExpertService,
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
  async updateCustomerProfile(
    height_m: number,
    weight_kg: number,
    physical_activity_level: PhysicalActivityLevel,
    current_diet: string = '',
    allergic_food: string = '',
    chronic_disease: string = '',
    expected_diet: string = '',
    name: string,
    email: string,
    birthday: string,
    sex: string,
    customer_id: number,
  ): Promise<Customer> {
    /*
    //Check whether this profile existed
    */
    const customer = await this.customerRepo.findOne({
      relations: {
        profile_image: true,
        health_info: true,
      },
      where: {
        customer_id: customer_id,
      },
    });
    if (!customer) {
      throw new HttpException(`Profile doesn't exist`, 400);
    }
    /*
    //Check whether health info existed
    */
    if (!customer.health_info) {
      throw new HttpException(`Health info doesn't exist`, 500);
    }
    /*
    //Convertion due to diff of findNutritionSuggestion func & inputed birthday 
    */
    const new_birthday: Date = new Date(birthday);
    const old_birthday: Date = new Date(customer.birthday);

    let isBirthdayChangedFlg: boolean = false;
    if (new_birthday.getTime() !== old_birthday.getTime()) {
      isBirthdayChangedFlg = true;
    }
    /*
    //Update only if there is an change in customer info
    */
    if (
      name === customer.name &&
      email === customer.email &&
      !isBirthdayChangedFlg &&
      sex === customer.sex &&
      height_m === customer.health_info.height_m &&
      weight_kg === customer.health_info.weight_kg &&
      physical_activity_level ===
        customer.health_info.physical_activity_level &&
      current_diet === customer.health_info.current_diet &&
      allergic_food === customer.health_info.allergic_food &&
      chronic_disease === customer.health_info.chronic_disease &&
      expected_diet === customer.health_info.expected_diet
    ) {
      throw new HttpException(`Need changes!`, 400);
    }
    /*
    //Update health info if there is a change related to health info
    */
    let isHealthInfoChangedFlg: boolean = false;
    if (
      isBirthdayChangedFlg ||
      sex !== customer.sex ||
      height_m !== customer.health_info.height_m ||
      weight_kg !== customer.health_info.weight_kg ||
      physical_activity_level !==
        customer.health_info.physical_activity_level ||
      current_diet !== customer.health_info.current_diet ||
      allergic_food !== customer.health_info.allergic_food ||
      chronic_disease !== customer.health_info.chronic_disease ||
      expected_diet !== customer.health_info.expected_diet
    ) {
      isHealthInfoChangedFlg = true;
      const healthInfo = await this.healthInfoRepo.findOneBy({
        health_info_id: customer.health_info.health_info_id,
      });
      healthInfo.height_m = height_m;
      healthInfo.weight_kg = weight_kg;
      healthInfo.physical_activity_level = physical_activity_level;
      healthInfo.current_diet = current_diet;
      healthInfo.allergic_food = allergic_food;
      healthInfo.chronic_disease = chronic_disease;
      healthInfo.expected_diet = expected_diet;
      /*
      //Recalculate BMI & Recommended dietary allowance kcal
      //Only if there is an update in: 
      //birthday, height, weight, sex, physical_activity_level   
      */
      if (
        isBirthdayChangedFlg ||
        sex !== customer.sex ||
        height_m !== healthInfo.height_m ||
        weight_kg !== healthInfo.weight_kg ||
        physical_activity_level !== healthInfo.physical_activity_level
      ) {
        const { bmi, recommended_dietary_allowance_kcal } =
          await this.nutiExperService.findNutritionSuggestion(
            birthday,
            height_m,
            weight_kg,
            sex,
            physical_activity_level,
          );
        healthInfo.bmi = bmi;
        healthInfo.recommended_dietary_allowance_kcal =
          recommended_dietary_allowance_kcal;
      }
      const newHealthInfo = await this.healthInfoRepo.save(healthInfo);
      customer.health_info = newHealthInfo;
    }
    /*
    //Update Customer
    */
    if (
      name !== customer.name ||
      email !== customer.email ||
      isBirthdayChangedFlg ||
      sex !== customer.sex ||
      isHealthInfoChangedFlg
    ) {
      customer.name = name;
      customer.email = email;
      customer.birthday = new_birthday;
      customer.sex = sex;
      // customer.is_active = 1;
      const updatedCustomer = await this.customerRepo.save(customer);
      delete updatedCustomer.refresh_token;
      return updatedCustomer;
    }
  }
  async uploadImage(fileName: string, file: Buffer) {
    const _file = Buffer.from(file);

    const upload = new Upload({
      client: new S3Client({
        region: 'ap-southeast-2',
        credentials: {
          accessKeyId: 'AKIA364JHVJSD5CDQ6PW',
          secretAccessKey: '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',
        },
      }),
      params: {
        Bucket: '2all-content',
        Key: 'customer/' + fileName,
        Body: _file,
      },
    });

    upload.on('httpUploadProgress', (p) => {
      console.log(p);
    });

    const data = await upload.done();
    if (data) {
      return data;
    } else {
      throw new HttpException(`Can not upload image`, 500);
    }
  }
  async updateProfileImage(
    customer_id: number,
    type: string,
    name: string,
    description: string,
    url: string,
  ): Promise<Customer> {
    /*
    Check whether this profile existed
    */
    const customer = await this.customerRepo.findOne({
      relations: {
        profile_image: true,
        health_info: true,
      },
      where: {
        customer_id: customer_id,
      },
    });
    if (!customer) {
      throw new HttpException(`Profile doesn't exist`, 400);
    }
    /*
    //Update or create profile image
    */
    customer.profile_image = customer.profile_image
      ? await this.mediaRepo.save({
          media_id: customer.profile_image.media_id,
          type: type,
          name: name,
          description: description,
          url: url,
        })
      : await this.mediaRepo.save({
          type: type,
          name: name,
          description: description,
          url: url,
        });
    const updatedCustomer = await this.customerRepo.save(customer);
    return updatedCustomer;
  }
}
