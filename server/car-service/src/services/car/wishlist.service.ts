import { Wishlist } from '../../models/mongodb/car/wishlist.model';
import {
  CreateWishlistDto,
  CreateWishlistDtoType,
  WishlistDto,
} from '../../dtos/car/wishlist.dto';
import {
  serviceResponse,
  ResponseOptions,
  HandleError,
  safeParser,
  CustomError,
} from '@amrogamal/shared-code';

const { warpError } = HandleError.getInstance();

export class WishlistService {
  private static instance: WishlistService;
  public static getInstance(): WishlistService {
    if (!WishlistService.instance) {
      WishlistService.instance = new WishlistService();
    }
    return WishlistService.instance;
  }

  create = warpError(
    async (
      data: CreateWishlistDtoType,
      userId: string,
    ): Promise<ResponseOptions> => {
      const result = safeParser({
        data,
        userDto: CreateWishlistDto,
      });
      if (!result.success) throw result.error;

      const exists = await Wishlist.findOne({
        userId,
        carId: data.carId,
      });
      if (exists) {
        throw new CustomError(
          'Conflict',
          409,
          'Car already in wishlist',
          false,
        );
      }

      await Wishlist.create({ ...data, userId });
      return serviceResponse({
        statusText: 'Created',
        message: 'Added to wishlist successfully',
      });
    },
  );

  get = warpError(
    async (_id: string, userId: string): Promise<ResponseOptions> => {
      return safeParser({
        data: await Wishlist.findById({ _id, userId }).lean(),
        userDto: WishlistDto,
      });
    },
  );

  getAll = warpError(
    async (
      userId: string,
      pageNum: number,
      limitNum: number,
    ): Promise<ResponseOptions> => {
      const page = Number(pageNum) || 1;
      const limit = Number(limitNum) || 10;
      const skip = (page - 1) * limit;
      return safeParser({
        data: await Wishlist.find({ userId }).lean().skip(skip).limit(limit),
        userDto: WishlistDto,
        actionType: 'getAll',
      });
    },
  );

  delete = warpError(
    async (_id: string, userId: string): Promise<ResponseOptions> => {
      return serviceResponse({
        statusText: 'OK',
        message: 'Removed from wishlist successfully',
        deletedCount: (await Wishlist.deleteOne({ _id, userId })).deletedCount,
      });
    },
  );
}
