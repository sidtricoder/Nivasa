/**
 * Cloudinary Upload Service
 * Upload images and videos to Cloudinary - completely FREE, no credit card required!
 * 
 * Free tier: 25GB storage, 25GB bandwidth/month
 * Sign up: https://cloudinary.com/users/register_free
 */

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
  transformation?: string;
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Get Cloudinary configuration from environment variables
 */
const getCloudinaryConfig = () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env.local file'
    );
  }

  return { cloudName, uploadPreset };
};

/**
 * Upload a single file to Cloudinary
 */
export const uploadToCloudinary = async (
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  const { folder, publicId, tags, onProgress } = options;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  if (folder) formData.append('folder', folder);
  if (publicId) formData.append('public_id', publicId);
  if (tags) formData.append('tags', tags.join(','));

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve({
          url: response.url,
          secureUrl: response.secure_url,
          publicId: response.public_id,
          format: response.format,
          width: response.width,
          height: response.height,
          bytes: response.bytes,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
};

/**
 * Upload multiple files to Cloudinary
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult[]> => {
  const { onProgress, ...fileOptions } = options;
  const results: CloudinaryUploadResult[] = [];
  let completedCount = 0;

  const uploadPromises = files.map(async (file, index) => {
    const result = await uploadToCloudinary(file, {
      ...fileOptions,
      onProgress: (fileProgress) => {
        if (onProgress) {
          // Calculate overall progress
          const overallProgress = Math.round(
            ((completedCount + fileProgress / 100) / files.length) * 100
          );
          onProgress(overallProgress);
        }
      },
    });

    completedCount++;
    if (onProgress) {
      const overallProgress = Math.round((completedCount / files.length) * 100);
      onProgress(overallProgress);
    }

    return result;
  });

  return Promise.all(uploadPromises);
};

/**
 * Upload property images with automatic folder organization
 */
export const uploadPropertyImages = async (
  files: File[],
  propertyId: string,
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  const results = await uploadMultipleToCloudinary(files, {
    folder: `properties/${propertyId}/images`,
    tags: ['property', propertyId],
    onProgress,
  });

  return results.map((result) => result.secureUrl);
};

/**
 * Upload property videos
 */
export const uploadPropertyVideos = async (
  files: File[],
  propertyId: string,
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  const results = await uploadMultipleToCloudinary(files, {
    folder: `properties/${propertyId}/videos`,
    tags: ['property', 'video', propertyId],
    onProgress,
  });

  return results.map((result) => result.secureUrl);
};

/**
 * Upload user profile picture
 */
export const uploadProfilePicture = async (
  file: File,
  userId: string
): Promise<string> => {
  const result = await uploadToCloudinary(file, {
    folder: `users/${userId}`,
    publicId: 'profile',
    tags: ['profile', userId],
  });

  return result.secureUrl;
};

/**
 * Compress image before upload (client-side)
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Image load failed'));
    };

    reader.onerror = () => reject(new Error('File read failed'));
  });
};

/**
 * Validate file before upload
 */
export const validateFile = (
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
): { valid: boolean; error?: string } => {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Get optimized Cloudinary URL with transformations
 * Examples:
 *   - getOptimizedUrl(url, { width: 400, height: 300, crop: 'fill' })
 *   - getOptimizedUrl(url, { quality: 'auto', format: 'auto' })
 */
export const getOptimizedUrl = (
  url: string,
  transformations: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string => {
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transforms: string[] = [];

  if (transformations.width) transforms.push(`w_${transformations.width}`);
  if (transformations.height) transforms.push(`h_${transformations.height}`);
  if (transformations.crop) transforms.push(`c_${transformations.crop}`);
  if (transformations.quality) transforms.push(`q_${transformations.quality}`);
  if (transformations.format) transforms.push(`f_${transformations.format}`);

  const transformString = transforms.join(',');
  return `${parts[0]}/upload/${transformString}/${parts[1]}`;
};

/**
 * Example usage:
 * 
 * // Upload property images
 * const files = Array.from(input.files);
 * const urls = await uploadPropertyImages(files, 'prop-001', (progress) => {
 *   console.log(`Upload progress: ${progress}%`);
 * });
 * 
 * // Compress and upload
 * const compressed = await compressImage(file, 1920, 0.8);
 * const result = await uploadToCloudinary(compressed, { folder: 'properties' });
 * 
 * // Get optimized thumbnail
 * const thumbnail = getOptimizedUrl(imageUrl, { width: 300, height: 200, crop: 'fill', quality: 'auto' });
 */
