import { CustomError } from '@amrogamal/shared-code';
import {
  DeleteObjectsCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { s3Client } from '../../configs/s3Bucket.config';

export class S3Service {
  private static instance: S3Service;
  private constructor() {}

  public static getInstance(): S3Service {
    if (!S3Service.instance) {
      this.instance = new S3Service();
    }
    return this.instance;
  }

  deleteMultiImages = async (keys: string[]): Promise<void> => {
    if (keys.length === 0) return;
    const deleteParams = {
      Bucket: String(process.env.AWS_BUCKET_NAME),
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: false,
      },
    };
    await s3Client.send(new DeleteObjectsCommand(deleteParams));
  };

  deleteSingleImages = async (key: string): Promise<void> => {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: String(process.env.AWS_BUCKET_NAME),
        Key: key,
      }),
    );
  };

  checkImagesLimit = async (
    prefix: string,
    deleteCount: number,
    uploadCount: number,
  ): Promise<void> => {
    const currentCount = await this.countImages(prefix);
    const newTotal = currentCount - deleteCount + uploadCount;
    if (newTotal > 5) {
      throw new CustomError(
        'Conflict',
        409,
        'You can not upload more than 5 images',
        false,
      );
    }
  };

  private countImages = async (prefix: string): Promise<number> => {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: String(process.env.AWS_BUCKET_NAME),
        Prefix: `cars/${prefix}/`,
      }),
    );
    return response.Contents ? response.Contents.length : 0;
  };

  uploadMultiImages = async (
    files: { [fieldname: string]: Express.Multer.File[] },
    prefix: string,
    keys?: string[],
  ): Promise<{ url: string; key: string }[]> => {
    const uploadPromises = files['carImages'].map(
      async (file: Express.Multer.File, index: number) => {
        const key = keys
          ? keys[index]
          : `cars/${prefix}/${uuidv4()}-${file.originalname}`;
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

        await s3Client.send(
          new PutObjectCommand({
            Bucket: String(process.env.AWS_BUCKET_NAME),
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );
        return { url, key };
      },
    );
    return await Promise.all(uploadPromises);
  };

  uploadSingleImage = async (
    file: Express.Multer.File,
    name?: string,
  ): Promise<{ url: string; key: string }> => {
    const key = name ? name : `categories/${uuidv4()}-${file.originalname}`;
    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: String(process.env.AWS_BUCKET_NAME),
        Key: String(key),
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return { url, key };
  };
}
