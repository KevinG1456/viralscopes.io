import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type { AppConfig } from '../config';

// Provider-agnostic object storage abstraction. The same interface works
// against MinIO (local dev) and Cloudflare R2 (production) since both are
// S3-API-compatible -- see INFRASTRUCTURE_GROWTH_PLAN.md section 11.
export interface StorageService {
  putObject(key: string, body: Buffer | Uint8Array | string, contentType?: string): Promise<void>;
  getObject(key: string): Promise<Uint8Array | undefined>;
  deleteObject(key: string): Promise<void>;
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

export function createStorageService(config: AppConfig['s3']): StorageService {
  const client = new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return {
    async putObject(key, body, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
    },

    async getObject(key) {
      const result = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: key }));
      return result.Body?.transformToByteArray();
    },

    async deleteObject(key) {
      await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
    },

    async getSignedDownloadUrl(key, expiresInSeconds = 3600) {
      const command = new GetObjectCommand({ Bucket: config.bucket, Key: key });
      return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    },
  };
}
