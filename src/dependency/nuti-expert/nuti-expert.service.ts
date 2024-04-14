import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';
import { PhysicalActivityLevel } from 'src/enum';

@Injectable()
export class NutiExpertService {
  constructor(private readonly httpService: HttpService) {}
  public async findNutritionSuggestion(
    birthday: string,
    height_m: number,
    weight_kg: number,
    sex: string,
    physical_activity_level: PhysicalActivityLevel,
  ) {
    let gioiTinh: number;
    let loaiLaoDong: number;
    switch (sex.toLocaleUpperCase()) {
      case 'M':
        gioiTinh = 1;
        break;
      case 'F':
        gioiTinh = 0;
        break;
      case 'O':
        gioiTinh = 1;
        break;

      default:
        gioiTinh = 1;
        break;
    }

    switch (physical_activity_level.toUpperCase()) {
      case PhysicalActivityLevel.Light.toUpperCase():
        loaiLaoDong = 1;
        break;
      case PhysicalActivityLevel.Moderate.toUpperCase():
        loaiLaoDong = 2;
        break;
      case PhysicalActivityLevel.Vigorous.toUpperCase():
        loaiLaoDong = 3;
        break;

      default:
        loaiLaoDong = 2;
        break;
    }

    try {
      const data: any = JSON.stringify({
        doiTuong: 1, //Normal people
        ngaySinh: birthday,
        chieuCao: height_m,
        canNang: weight_kg,
        gioiTinh: gioiTinh,
        isKinhNguyet: false,
        isMangThai: false,
        isChoConBu: false,
        isTienManKinh: false,
        loaiLaoDong: loaiLaoDong,
        cheDoAn: 8,
        heSoPA: '1.0',
        heSoAF: 1,
        trangThaiTrongLuong: 1,
        nhuCauDieuChinhCanNang: 2,
      });
      const config: AxiosRequestConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://app.thucdongiadinh.vn/api/services/app/TraCuuNhuCauDinhDuong/TraCuuNhuCauDinhDuong',
        headers: {
          'Content-Type': 'application/json',
        },
        data: data,
      };
      // console.log(config);
      const request = this.httpService.request(config);

      const result = await lastValueFrom(request);
      // console.log(result.data);
      return {
        bmi: result.data.result.chiSoBMI.result.bmi,
        recommended_dietary_allowance_kcal:
          result.data.result.nangLuongKhuyenNghi.giaTri_Min,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.getResponse(), error.getStatus());
      } else {
        throw new HttpException(error.toString(), 500);
      }
    }
  }
}
