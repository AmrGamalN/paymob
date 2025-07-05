type UserRoleType = 'user' | 'admin' | 'manager';
export type UserToken = {
  userId: string;
  email: string;
  phoneNumber?: string;
  role: UserRoleType;
  profileImage?: {
    imageUrl: string;
    key: string;
  };
  userName?: string;
  dateToJoin?: string;
  sign_up_provider?: string;
  sign_in_provider?: string;
  isEmailVerified?: boolean;
  lastSeen: Date;
};
