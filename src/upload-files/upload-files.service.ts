import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';

import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: any): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const params = {
        timestamp,
        resource_type: 'auto' as const,
        invalidate: true,
        folder: 'uploads',
        use_filename: true,
        unique_filename: true,
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        params,
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('Upload failed: No result returned'));
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadFiles(files: any[]): Promise<CloudinaryResponse[]> {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }
}
