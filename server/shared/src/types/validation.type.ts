import { ZodObject, ZodRawShape } from 'zod';
import { UserRole } from './role.type';
export type ActionType = 'getAll' | 'update' | 'getOne' | 'delete';

export type ValidateZodType = {
  data: any;
  userDto: ZodObject<ZodRawShape>;
  adminDto?: ZodObject<ZodRawShape>;
  managerDto?: ZodObject<ZodRawShape>;
  viewerRole?: UserRole;
  actionType?: ActionType;
};
