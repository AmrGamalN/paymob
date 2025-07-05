import { Schema, model } from 'mongoose';

export interface ICarBooking extends Document {
  _id: string;
  renterId: string;
  ownerId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  deliveryLocation: string;
  returnLocation: string;
  deliveryTime: string;
  returnTime: string;
  rentType:
    | 'with_driver'
    | 'without_driver'
    | 'airport_delivery'
    | 'wedding'
    | 'other';
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specifiedRentType: string;
  insuranceType: 'basic' | 'full';
  paymentMethod: 'cash' | 'card' | 'wallet' | 'paymob';
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<ICarBooking>(
  {
    renterId: { type: String, required: true },
    ownerId: { type: String, required: true },
    carId: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    deliveryLocation: { type: String, required: true },
    returnLocation: { type: String, required: true },
    deliveryTime: { type: String, required: true },
    returnTime: { type: String, required: true },
    rentType: {
      type: String,
      enum: [
        'with_driver',
        'without_driver',
        'airport_delivery',
        'wedding',
        'other',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    specifiedRentType: {
      type: String,
      validate: {
        validator: function (value: string): boolean {
          if (this.rentType === 'other') {
            return !!value && value.trim().length > 0;
          }
          return true;
        },
        message: "specifiedRentType is required when rentType is 'other'",
      },
    },
    insuranceType: {
      type: String,
      enum: ['basic', 'full'],
      default: 'basic',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'wallet', 'paymob'],
      default: 'cash',
    },
  },
  { timestamps: true },
);

export const Booking = model<ICarBooking>('car_booking', BookingSchema);
