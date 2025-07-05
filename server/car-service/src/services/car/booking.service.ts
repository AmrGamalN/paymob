import { Booking, ICarBooking } from '../../models/mongodb/car/booking.model';
import { Car } from '../../models/mongodb/car/car.model';
import {
  serviceResponse,
  HandleError,
  safeParser,
  ResponseOptions,
} from '@amrogamal/shared-code';
import {
  BookingDto,
  CreateBookingDto,
  CreateBookingDtoType,
  UpdateBookingByRenterDto,
  UpdateBookingByRenterDtoType,
  UpdateBookingByOwnerDto,
} from '../../dtos/car/booking.dto';
const { warpError } = HandleError.getInstance();

export class BookingService {
  private static instance: BookingService;

  public static getInstance(): BookingService {
    if (!BookingService.instance)
      BookingService.instance = new BookingService();
    return BookingService.instance;
  }

  create = warpError(
    async (
      data: CreateBookingDtoType,
      userId: string,
    ): Promise<ResponseOptions> => {
      const result = safeParser({ data, userDto: CreateBookingDto });
      if (!result.success) throw result.error;

      const car = await Car.findById(data.carId);
      if (!car || !car.isAvailable)
        return serviceResponse({
          statusText: 'NotFound',
          message: 'Car not available',
        });

      if (car.userId === userId)
        return serviceResponse({
          statusText: 'Forbidden',
          message: "You can't book your own car",
        });

      const isAlreadyBooked = await Booking.findOne({
        renterId: userId,
        carId: data.carId,
        status: { $in: ['pending', 'confirmed'] },
      });

      if (isAlreadyBooked)
        return serviceResponse({
          statusText: 'Conflict',
          message: 'You already have a booking for this car',
        });

      await Booking.create({
        ...result.data,
        renterId: userId,
        ownerId: car.userId,
        status: 'pending',
        insuranceType: data.insuranceType || 'basic',
      });

      return serviceResponse({
        statusText: 'Created',
        message: 'Booking created successfully',
      });
    },
  );

  getAll = warpError(
    async (
      userId: string,
      page: number = 1,
      limit: number = 10,
    ): Promise<ResponseOptions> => {
      const skip = (page - 1) * limit;
      return safeParser({
        data: await Booking.find({
          $or: [{ ownerId: userId }, { renterId: userId }],
        })
          .skip(skip)
          .limit(limit)
          .lean(),
        userDto: BookingDto,
        actionType: 'getAll',
      });
    },
  );

  get = warpError(
    async (_id: string, userId: string): Promise<ResponseOptions> => {
      return safeParser({
        data: await Booking.findOne({
          _id,
          $or: [{ ownerId: userId }, { renterId: userId }],
        }).lean(),
        userDto: BookingDto,
      });
    },
  );

  updateByRenter = warpError(
    async (
      _id: string,
      renterId: string,
      updateData: UpdateBookingByRenterDtoType,
    ): Promise<ResponseOptions> => {
      const result = safeParser({
        data: updateData,
        userDto: UpdateBookingByRenterDto,
      });
      if (!result.success) throw result.error;

      const booking = await Booking.findById({ _id, renterId });
      if (!booking)
        return serviceResponse({
          statusText: 'NotFound',
          message: 'Booking not found',
        });

      const policy = await this.policyBooking(booking);
      if (!policy.success) return policy;

      const allowedFields = Object.keys(UpdateBookingByRenterDto.shape);
      for (const key of allowedFields) {
        if (key in result.data && result.data[key] !== undefined) {
          booking.set(key, result.data[key]);
        }
      }

      await booking.save();
      return serviceResponse({
        statusText: 'OK',
        message: 'Booking updated successfully',
      });
    },
  );

  private policyBooking = warpError(
    async (booking: ICarBooking): Promise<ResponseOptions> => {
      const now = new Date();
      const createdAt = new Date(booking.createdAt);
      const startDate = new Date(booking.startDate);

      const hoursSinceCreated =
        (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      const hoursUntilStart =
        (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (
        booking.status !== 'pending' ||
        hoursSinceCreated > 6 ||
        hoursUntilStart < 24
      ) {
        return serviceResponse({
          statusText: 'Forbidden',
          message: "You can't modify this booking at this time",
        });
      }
      return { success: true };
    },
  );

  updateStatus = warpError(
    async (
      _id: string,
      ownerId: string,
      status: 'pending' | 'confirmed' | 'cancelled' | 'completed',
    ): Promise<ResponseOptions> => {
      const result = safeParser({
        data: { status },
        userDto: UpdateBookingByOwnerDto,
      });
      if (!result.success) throw result.error;

      const booking = await Booking.findOne({ _id, ownerId });
      if (!booking)
        return serviceResponse({
          statusText: 'NotFound',
          message: 'Booking not found',
        });

      if (booking.ownerId !== ownerId)
        return serviceResponse({
          statusText: 'Forbidden',
          message: 'You are not the car owner',
        });

      if (status === booking.status)
        return serviceResponse({
          statusText: 'Conflict',
          message: `Status already ${status}`,
        });

      booking.status = status;
      await booking.save();

      return serviceResponse({
        statusText: 'OK',
        message: 'Status updated',
      });
    },
  );

  delete = warpError(
    async (_id: string, userId: string): Promise<ResponseOptions> => {
      const booking = await Booking.findOne({
        _id,
        $or: [{ ownerId: userId }, { renterId: userId }],
      });
      if (!booking)
        return serviceResponse({
          statusText: 'NotFound',
          message: 'Booking not found',
        });

      if (booking.status !== 'pending')
        return serviceResponse({
          statusText: 'Forbidden',
          message: 'Only pending bookings can be deleted',
        });

      return serviceResponse({
        statusText: 'OK',
        deletedCount: (await Booking.deleteOne({ _id })).deletedCount,
      });
    },
  );
}
