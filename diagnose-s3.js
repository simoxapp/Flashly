const fs = require('fs');
const path = require('path');
const { S3Client, ListBucketsCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Simple .env parser
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '.env');
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // cleanup quotes
                if (key && !key.startsWith('#')) {
                    env[key] = value;
                }
            }
        });
        return env;
    } catch (e) {
        console.error("Could not read .env file:", e.message);
        return {};
    }
}

async function diagnose() {
    const env = loadEnv();
    console.log("Loaded Environment Variables:");
    console.log("AWS_REGION:", env.AWS_REGION);
    console.log("AWS_S3_BUCKET_NAME:", env.AWS_S3_BUCKET_NAME);
    console.log("AWS_ACCESS_KEY_ID:", env.AWS_ACCESS_KEY_ID ? (env.AWS_ACCESS_KEY_ID.substring(0, 5) + '...') : 'MISSING');

    if (!env.AWS_REGION || !env.AWS_S3_BUCKET_NAME || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
        console.error("Missing required AWS credentials in .env");
        return;
    }

    const s3 = new S3Client({
        region: env.AWS_REGION,
        credentials: {
            accessKeyId: env.AWS_ACCESS_KEY_ID,
            secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
    });

    try {
        console.log("\nAttempting to list buckets...");
        const result = await s3.send(new ListBucketsCommand({}));
        console.log("Success! Buckets found:", result.Buckets.map(b => b.Name));

        const targetBucket = env.AWS_S3_BUCKET_NAME;
        const bucketExists = result.Buckets.find(b => b.Name === targetBucket);

        if (!bucketExists) {
            console.error(`\nCRITICAL: Bucket '${targetBucket}' was NOT found in the account.`);
            return;
        }
        console.log(`\nBucket '${targetBucket}' exists.`);

        console.log("Attempting write permission test...");
        const testKey = "diagnostic-test-file.json";
        await s3.send(new PutObjectCommand({
            Bucket: targetBucket,
            Key: testKey,
            Body: JSON.stringify({ status: "ok", timestamp: Date.now() }),
            ContentType: "application/json"
        }));
        console.log("Write successful.");

        console.log("Attempting cleanup (delete)...");
        await s3.send(new DeleteObjectCommand({
            Bucket: targetBucket,
            Key: testKey
        }));
        console.log("Cleanup successful.");
        console.log("\nS3 CONFIGURATION LOOKS CORRECT.");

    } catch (error) {
        console.error("\nS3 DIAGNOSTIC FAILED:");
        console.error(error);
        if (error.name === 'InvalidAccessKeyId') {
            console.error("Hint: The Access Key ID is invalid.");
        } else if (error.name === 'SignatureDoesNotMatch') {
            console.error("Hint: The Secret Access Key is invalid.");
        } else if (error.name === 'AccessDenied') {
            console.error("Hint: The user does not have permission to list buckets or access the specific bucket.");
        }
    }
}

diagnose();
