import { Order } from '../../models/mongodb/car/order.model';
import {
  serviceResponse,
  ResponseOptions,
  HandleError,
  safeParser,
} from '@amrogamal/shared-code';
import {
  CreateOrderDto,
  CreateOrderStatusDtoType,
  UpdateOrderStatusDto,
  UpdateOrderStatusDtoType,
} from '../../dtos/car/order.dto';
import { Car } from '../../models/mongodb/car/car.model';
import { UserToken } from '../../types/request.type';

const { warpError } = HandleError.getInstance();

export class OrderService {
  private static instance: OrderService;
  public static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  create = warpError(
    async (
      data: CreateOrderStatusDtoType,
      user: UserToken,
    ): Promise<ResponseOptions> => {
      const result = safeParser({ data, userDto: CreateOrderDto });
      if (!result.success) throw result.error;

      const car = await Car.findById(data.carId);
      const existingOrder = await Order.findOne({
        userId: user.userId,
        carId: data.carId,
      });

      if (!car || car.isAvailable === false)
        return serviceResponse({
          statusText: 'NotFound',
          message: 'Car not found',
        });

      if (car.userId === user?.userId)
        return serviceResponse({
          statusText: 'Forbidden',
          message: "You can't order your own car",
        });

      if (existingOrder)
        return serviceResponse({
          statusText: 'Conflict',
          message: 'You already have an order for this car',
        });

      const discount = car.discount ?? 0;
      const totalPrice = car.price - (car.price * discount) / 100;

      await Order.create({
        userId: user.userId,
        carId: data.carId,
        discount,
        totalPrice,
        startDate: car.availableFrom,
        endDate: car.availableTo,
        isPaid: false,
        paymentStatus: 'pending',
        status: 'pending',
        customer: {
          name: user.name,
          phone: user.phoneNumber,
          email: user.email,
        },
      });

      return serviceResponse({
        statusText: 'Created',
        message: 'Order created successfully',
      });
    },
  );

  getAll = warpError(
    async (userId: string, page = 1, limit = 10): Promise<ResponseOptions> => {
      const result = safeParser({
        data: await Order.find({ userId })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        userDto: CreateOrderDto,
        actionType: 'getAll',
      });
      if (!result.success) throw result.error;

      const total = await Order.countDocuments({ userId });
      return serviceResponse({
        statusText: 'OK',
        data: {
          ...result.data,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      });
    },
  );

  getById = warpError(async (_id: string, userId: string) => {
    return safeParser({
      data: await Order.findById({ _id, userId }).lean(),
      userDto: CreateOrderDto,
    });
  });

  updateStatus = warpError(
    async (
      _id: string,
      data: UpdateOrderStatusDtoType,
      userId: string,
    ): Promise<ResponseOptions> => {
      const result = safeParser({
        data,
        userDto: UpdateOrderStatusDto,
      });
      if (!result.success) throw result.error;
      const order = await Order.updateOne(
        { _id, userId },
        { $set: result.data },
      );
      return serviceResponse({
        statusText: 'OK',
        message: 'Order status updated',
        updatedCount: order.modifiedCount,
      });
    },
  );

  count = warpError(async (userId: string) => {
    return serviceResponse({
      count: await Order.countDocuments({ userId }),
    });
  });

  delete = warpError(async (_id: string, userId: string) => {
    return serviceResponse({
      deletedCount: (await Order.deleteOne({ _id, userId })).deletedCount,
    });
  });
}
