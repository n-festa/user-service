export interface GenericUser {
  userType: string;
  userId: number;
  userName: string;
  permissions: string;
}

export type FileType = 'image' | 'video';
