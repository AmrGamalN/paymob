import { kafka } from '../../configs/kafka.config';
const producer = kafka.producer();
const connectProducer = producer.connect();

type CarEventType = 'car.created' | 'car.updated' | 'car.deleted';
export const sendCarEvent = async (
  eventType: CarEventType,
  payload: any,
): Promise<void> => {
  const { ...rest } = payload;
  delete rest._id;
  delete rest.__v;
  await connectProducer;
  await producer.send({
    topic: 'car-events',
    messages: [
      {
        key: rest.id.toString(),
        value: JSON.stringify({
          data: rest,
          type: eventType,
        }),
      },
    ],
  });
};
