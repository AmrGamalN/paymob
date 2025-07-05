import { ZodObject, ZodRawShape } from 'zod';
import { serviceResponse } from './response.util';
import { UserRole } from '../types/role.type';
import { ValidateZodType } from '../types/validation.type';

export const safeParser = <T>({
  data,
  userDto,
  adminDto,
  managerDto,
  viewerRole,
  actionType,
}: ValidateZodType) => {
  if (!data)
    return serviceResponse({
      statusText: 'NotFound',
    });

  if (Object.keys(data).length === 0)
    return serviceResponse({
      statusText: 'BadRequest',
      message: 'No data found',
      data: [],
    });

  const dto = getDataBasedOnRole(viewerRole!, userDto, adminDto, managerDto);
  if (actionType === 'getAll') {
    return safeParserMultiList(data, dto);
  }
  return safeParserSingleList(data, dto);
};

const safeParserSingleList = (data: any, dto: any) => {
  const parsed = dto.safeParse(data);
  if (!parsed.success)
    return serviceResponse({
      statusText: 'BadRequest',
      error: parsed.error,
    });
  return serviceResponse({
    statusText: 'OK',
    data: parsed.data,
  });
};

const safeParserMultiList = (data: any, dto: any) => {
  const parsed = data?.map((item: any) => {
    const parsedItem = dto.safeParse(item);
    if (!parsedItem.success)
      return serviceResponse({
        statusText: 'BadRequest',
        error: parsedItem.error,
      });
    return parsedItem.data;
  });
  return serviceResponse({
    statusText: 'OK',
    data: parsed,
  });
};

const getDataBasedOnRole = (
  viewerRole: UserRole,
  userDto: ZodObject<ZodRawShape>,
  adminDto?: ZodObject<ZodRawShape>,
  managerDto?: ZodObject<ZodRawShape>,
): ZodObject<ZodRawShape> => {
  if (viewerRole === 'manager' && managerDto) return managerDto;
  if (viewerRole === 'admin' && adminDto) return adminDto;
  return userDto;
};
