import { body, query, param, check, ValidationChain } from 'express-validator';
import {
  emailPattern,
  LocationType,
  phonePattern,
  MainValidationType,
  ValidationArrayType,
  ValidationNumberType,
  ValidationStringType,
} from '../types/validation.type';
import { CustomError } from '@amrogamal/shared-code';

export const validateString = ({
  field,
  isOptional,
  options,
}: ValidationStringType): ValidationChain => {
  let validator = buildValidator(field, isOptional, options?.location);
  validator = validator
    .trim()
    .isString()
    .withMessage(`${field} must be string`)
    .bail();

  if (options?.min !== undefined || options?.max !== undefined) {
    validator = validator
      .isLength({
        min: options?.min,
        max: options?.max,
      })
      .withMessage(
        `${field} must be between ${options.min ?? 0} and ${
          options.max ?? '∞'
        } characters`,
      )
      .bail();
  }

  if (options?.pattern) {
    validator = validator
      .matches(options.pattern)
      .withMessage(options.customMessage || `${field} must be lowercase`)
      .bail();
  }

  if (options?.isIn && options?.isIn?.length >= 0) {
    validator = validator
      .isIn(options?.isIn)
      .withMessage(
        `${field} must be one of the following: ${options?.isIn.join(', ')}`,
      )
      .bail();
  }

  if (options?.isUrl) {
    validator = validator.isURL().withMessage('Invalid URL').bail();
  }

  if (options?.isEmail) {
    validator = validator
      .matches(emailPattern)
      .withMessage('Email provider not supported')
      .bail();
  }

  if (options?.isPhone) {
    validator = validator
      .customSanitizer((val) => val.replace(/[\s\-()]/g, ''))
      .matches(phonePattern)
      .withMessage('Invalid format')
      .bail();
  }

  if (options?.isPassword) {
    validator = validator
      .isStrongPassword({
        minLength: 10,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        'Password must be contains at least 1 lowercase, 1 uppercase, 1 number, 1 symbol and at least 10 characters',
      )
      .bail();
  }
  return validator;
};

export const validateBoolean = ({
  field,
  isOptional,
  location,
}: MainValidationType): ValidationChain => {
  let validator = buildValidator(field, isOptional, location);
  validator = validator
    .trim()
    .isBoolean()
    .withMessage(`${field} must be string`)
    .bail()
    .toBoolean();
  return validator;
};

export const validateNumber = ({
  field,
  isOptional,
  options,
}: ValidationNumberType): ValidationChain => {
  let validator = buildValidator(field, isOptional, options?.location);
  validator = validator
    .trim()
    .isNumeric()
    .withMessage(`${field} must be number`)
    .bail()
    .toInt();

  if (options?.isIn && options?.isIn?.length >= 0) {
    validator = validator
      .isIn(options?.isIn)
      .withMessage(
        `${field} must be one of the following: ${options?.isIn.join(', ')}`,
      )
      .bail();
  }

  if (options?.isYear) {
    validator = validator
      .custom((value) => {
        const currentYear = new Date().getFullYear();
        if (value < 1900 || value > currentYear) {
          throw new CustomError('BadRequest', 400, 'Invalid year', false);
        }
        return true;
      })
      .isInt()
      .withMessage('Invalid year')
      .bail();
  }

  return validator;
};

export const validateArray = ({
  field,
  isOptional,
  options,
}: ValidationArrayType): ValidationChain[] => {
  const chains: ValidationChain[] = [];
  let main = buildValidator(field, isOptional, options?.location);
  main = main.isArray().withMessage(`${field} must be an array`).bail();

  if (options?.minLength !== undefined || options?.maxLength !== undefined) {
    main = main
      .isLength({
        min: options.minLength,
        max: options.maxLength,
      })
      .withMessage(
        `${field} must have between ${options.minLength ?? 0} and ${
          options.maxLength ?? '∞'
        } items`,
      )
      .bail();
  }

  chains.push(main);

  if (options?.elementType) {
    const element = body(`${field}.*`)
      [options.elementType === 'string' ? 'isString' : 'isNumeric']()
      .withMessage(
        options.elementMessage || `${field}.* must be ${options.elementType}`,
      );
    chains.push(element);
  }

  if (options?.isIn && options?.isIn.length > 0) {
    const inValidator = body(`${field}`)
      .custom((arr: string[]) => {
        if (!Array.isArray(arr)) return false;
        return arr.every((val: string) => options.isIn!.includes(val));
      })
      .withMessage(
        `${field} contains invalid values. Allowed: ${options.isIn.join(', ')}`,
      );
    chains.push(inValidator);
  }

  return chains;
};

export const validateObject = ({
  field,
  isOptional,
}: MainValidationType): ValidationChain => {
  const validator = body(field)
    .isObject()
    .withMessage(`${field} must be an object`);
  return !isOptional
    ? validator.notEmpty().withMessage(`${field} is required`)
    : validator.optional({ checkFalsy: true });
};

export const validateDate = ({
  field,
  isOptional,
  location,
}: MainValidationType): ValidationChain => {
  let validator = buildValidator(field, isOptional, location);
  validator = validator
    .isISO8601()
    .withMessage(`${field} must be a valid format YYYY-MM-DD`)
    .custom((value, { req }) => {
      const start = req.body?.startDate || req.body?.availableFrom;
      const end = req.body?.endDate || req.body?.availableTo;

      if (field === 'startDate' || field === 'availableFrom') {
        if (value && !end) {
          throw new CustomError(
            'BadRequest',
            400,
            'If start is provided, end must also be provided',
            false,
          );
        }

        if (start && end && new Date(start) > new Date(end)) {
          throw new CustomError(
            'BadRequest',
            400,
            'Start date must be before or equal to end date',
            false,
          );
        }
      }

      if (field === 'endDate' || field === 'availableTo') {
        if (value && !start) {
          throw new CustomError(
            'BadRequest',
            400,
            'If end is provided, start must also be provided',
            false,
          );
        }
      }
      return true;
    })
    .toDate();
  return validator;
};

const buildValidator = (
  field?: string,
  isOptional?: boolean,
  location?: LocationType,
): ValidationChain => {
  let validator =
    location === 'query'
      ? query(field)
      : location === 'param'
        ? param(field)
        : location === 'check'
          ? check(field)
          : body(field);

  if (!isOptional) {
    validator = validator.notEmpty().withMessage(`${field} is required`).bail();
  } else {
    validator = validator.optional({ checkFalsy: true });
  }

  return validator;
};
