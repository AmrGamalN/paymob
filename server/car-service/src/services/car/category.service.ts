import { Category } from '../../models/mongodb/car/category.model';
import {
  CreateCategoryDto,
  CreateCategoryDtoType,
  UpdateCategoryDto,
  UpdateCategoryDtoType,
} from '../../dtos/car/category.dto';
import {
  serviceResponse,
  ResponseOptions,
  HandleError,
  safeParser,
} from '@amrogamal/shared-code';
import { S3Service } from '../s3/s3.service';
const s3Service = S3Service.getInstance();
const { warpError } = HandleError.getInstance();

export class CategoryService {
  private static instance: CategoryService;
  public static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService();
    }
    return CategoryService.instance;
  }

  create = warpError(
    async (
      data: CreateCategoryDtoType,
      file: Express.Multer.File,
    ): Promise<ResponseOptions> => {
      const result = safeParser({
        data,
        userDto: CreateCategoryDto,
      });
      if (!result.success) throw result.error;

      const category = await Category.findOne({ name: data.name }).lean();
      if (category)
        return serviceResponse({
          statusText: 'Conflict',
          message: 'Category name already exists',
        });

      let image;
      if (file) {
        image = await s3Service.uploadSingleImage(file);
      }
      await Category.create({ ...data, categoryImage: image });
      return serviceResponse({
        statusText: 'Created',
        message: 'Category created successfully',
      });
    },
  );

  getAll = warpError(async (): Promise<ResponseOptions> => {
    return safeParser({
      data: await Category.find().lean(),
      userDto: CreateCategoryDto,
      actionType: 'getAll',
    });
  });

  getById = warpError(async (_id: string): Promise<ResponseOptions> => {
    return safeParser({
      data: await Category.findById({ _id }).lean(),
      userDto: CreateCategoryDto,
    });
  });

  update = warpError(
    async (
      _id: string,
      data: UpdateCategoryDtoType,
      file?: Express.Multer.File,
    ): Promise<ResponseOptions> => {
      const result = safeParser({
        data,
        userDto: UpdateCategoryDto,
      });
      if (!result.success) throw result.error;

      const category = await Category.findById(_id);
      if (!category) {
        return serviceResponse({
          statusText: 'Not Found',
          message: 'Category not found',
        });
      }

      if (category.name === data.name) {
        return serviceResponse({
          statusText: 'Conflict',
          message: 'Category name already exists',
        });
      }

      category.name = String(data.name);
      category.description = data.description;
      if (file) {
        await s3Service.uploadSingleImage(file, data.key);
      }
      await category.save();
      return serviceResponse({
        statusText: 'OK',
        message: 'Category updated successfully',
      });
    },
  );

  delete = warpError(async (id: string): Promise<ResponseOptions> => {
    const category = await Category.findByIdAndDelete(id);
    if (!category)
      return serviceResponse({
        statusText: 'NotFound',
        message: 'Category not found',
      });
    await s3Service.deleteSingleImages(String(category.categoryImage?.key));
    return serviceResponse({
      statusText: 'Ok',
      message: 'Category deleted successfully',
    });
  });
}
