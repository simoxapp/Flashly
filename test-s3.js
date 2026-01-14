require('dotenv').config();
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

async function testS3() {
    console.log('Testing S3 credentials...');
    console.log('Region:', process.env.AWS_REGION);
    console.log('Key ID:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) + '...');

    const s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    });

    try {
        const result = await s3.send(new ListBucketsCommand({}));
        console.log('Connection successful!');
        console.log('Buckets:', result.Buckets.map(b => b.Name));

        const targetBucket = process.env.AWS_S3_BUCKET_NAME;
        if (result.Buckets.find(b => b.Name === targetBucket)) {
            console.log(`Success: Target bucket "${targetBucket}" found.`);
        } else {
            console.log(`Error: Target bucket "${targetBucket}" NOT found.`);
        }
    } catch (error) {
        console.error('S3 Connection Failed:', error.message);
    }
}

testS3();
