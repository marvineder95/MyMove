import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

export interface PresignedUrlResult {
  uploadUrl: string;
  s3Key: string;
  expiresAt: Date;
}

/**
 * Shared S3 service for generating pre-signed URLs and managing
 * video/document uploads to AWS S3.
 */
@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'eu-central-1'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });

    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME', 'mymove-videos');
  }

  /**
   * Generate a pre-signed PUT URL for direct client upload.
   * The client uploads directly to S3, then confirms to the backend.
   */
  async getPresignedPutUrl(
    key: string,
    contentType: string = 'video/mp4',
    expirySeconds: number = 900,
  ): Promise<PresignedUrlResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: expirySeconds,
    });

    const expiresAt = new Date(Date.now() + expirySeconds * 1000);

    return { uploadUrl, s3Key: key, expiresAt };
  }

  /**
   * Generate a unique S3 key for a video upload.
   */
  generateVideoKey(userId: number): string {
    const date = new Date().toISOString().split('T')[0];
    const uuid = uuidv4();
    return `videos/${date}/user-${userId}/${uuid}.mp4`;
  }

  /**
   * Delete an object from S3.
   */
  async deleteObject(key: string): Promise<void> {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.s3Client.send(command);
  }

  getPublicUrl(key: string): string {
    const region = this.configService.get<string>('AWS_REGION', 'eu-central-1');
    return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
  }
}
