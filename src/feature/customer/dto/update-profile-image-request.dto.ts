export class UpdateProfileImageRequest {
  requestData: RequestData;
}

interface RequestData {
  customer_id: number;
  // type: string;
  // name: string;
  // description: string;
  url: string;
}
