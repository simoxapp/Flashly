import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { S3Client } from "@aws-sdk/client-s3"

// Validate required AWS credentials
if (!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || !process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY) {
  console.warn("AWS credentials not configured. S3 operations may fail.")
}

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || "",
  },
})

const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME || ""

export class S3Error extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "S3Error"
  }
}

/**
 * Result of a download including the data and its version (ETag)
 */
export interface DownloadResult<T> {
  data: T | null;
  etag?: string;
}

export async function uploadJSON(key: string, data: any, etag?: string): Promise<void> {
  if (!BUCKET_NAME) {
    throw new S3Error("Bucket name not configured", "NO_BUCKET")
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
      IfMatch: etag, // Only write if the version matches
    })
    await s3Client.send(command)
  } catch (error: any) {
    if (error.name === "PreconditionFailed") {
      throw new S3Error(`Conflict detected for ${key} (version mismatch)`, "CONFLICT")
    }
    console.error("[S3] Upload error:", error)
    throw new S3Error(`Failed to upload ${key}: ${error.message || 'Unknown error'}`, "UPLOAD_FAILED")
  }
}

export async function uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string> {
  if (!BUCKET_NAME) {
    throw new S3Error("Bucket name not configured", "NO_BUCKET")
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
    await s3Client.send(command)
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
  } catch (error: any) {
    console.error("[S3] File upload error:", error)
    throw new S3Error(`Failed to upload file ${key}`, "UPLOAD_FAILED")
  }
}

export async function downloadJSON<T = any>(key: string): Promise<T | null> {
  const result = await downloadJSONWithVersion<T>(key);
  return result.data;
}

export async function downloadJSONWithVersion<T = any>(key: string): Promise<DownloadResult<T>> {
  if (!BUCKET_NAME) {
    throw new S3Error("Bucket name not configured", "NO_BUCKET")
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    const response = await s3Client.send(command)
    const dataString = await response.Body?.transformToString()
    return {
      data: dataString ? JSON.parse(dataString) : null,
      etag: response.ETag?.replace(/"/g, '') // Remove quotes from ETag
    }
  } catch (error: any) {
    if (error.name === "NoSuchKey") {
      return { data: null }
    }
    console.error("[S3] Download error:", error)
    throw new S3Error(`Failed to download ${key}`, "DOWNLOAD_FAILED")
  }
}

export async function deleteJSON(key: string): Promise<void> {
  if (!BUCKET_NAME) {
    throw new S3Error("Bucket name not configured", "NO_BUCKET")
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    await s3Client.send(command)
  } catch (error) {
    console.error("[S3] Delete error:", error)
    throw new S3Error(`Failed to delete ${key}`, "DELETE_FAILED")
  }
}

export async function listJSONFiles(prefix: string): Promise<string[]> {
  if (!BUCKET_NAME) {
    throw new S3Error("Bucket name not configured", "NO_BUCKET")
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    })
    const response = await s3Client.send(command)
    return response.Contents?.map((item) => item.Key || "").filter((key) => key.length > 0) || []
  } catch (error) {
    console.error("[S3] List error:", error)
    throw new S3Error(`Failed to list files with prefix ${prefix}`, "LIST_FAILED")
  }
}

export { s3Client }
