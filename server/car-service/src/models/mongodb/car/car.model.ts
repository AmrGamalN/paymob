import { Schema, model } from "mongoose";
import { ICar } from "../../../types/car.type";

const CarSchema: Schema = new Schema<ICar>(
  {
    userId: { type: String, required: true },
    phone: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    carModel: { type: String, required: true },
    brand: { type: String, required: true },
    year: { type: Number, required: true },
    color: { type: String, required: true },
    images: [
      {
        url: { type: String, required: true },
        key: { type: String, required: true },
      },
    ],
    pricePerDay: { type: Number, required: true },
    availableFrom: { type: Date, required: true },
    availableTo: { type: Date, required: true },
    location: {
      city: { type: String, required: true },
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    isAvailable: { type: Boolean, default: true },
    guarantees: {
      hasInsurance: { type: Boolean, default: false },
      insuranceDetails: { type: String },
      licenseValid: { type: Boolean, default: false },
      requiresDeposit: { type: Boolean, default: false },
      depositAmount: { type: Number, default: 0 },
      additionalNotes: { type: String },
    },
  },
  { timestamps: true }
);

export const Car = model<ICar>("car_car", CarSchema);
