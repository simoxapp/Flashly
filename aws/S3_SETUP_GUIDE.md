# AWS S3 Setup Guide for Flasher Storage Bucket

## Bucket Name
**flasherstorage**

## Step 1: Create S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/s3)
2. Click **Create bucket**
3. **Bucket name**: `flasherstorage`
4. **AWS Region**: Choose your preferred region (e.g., `us-east-1`)
5. **Block Public Access settings for this bucket**: Keep all checkboxes checked
6. Click **Create bucket**

## Step 2: Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. **User name**: `flasher-app-user`
4. Click **Next**
5. Choose **Attach policies directly**
6. Search for and select **AmazonS3FullAccess** (for development)
   - For production, use the restrictive policy below
7. Click **Next** → **Create user**

## Step 3: Create Access Keys

1. Click the newly created user
2. Go to **Security credentials** tab
3. Under **Access keys**, click **Create access key**
4. Choose **Application running outside AWS** → **Next**
5. Copy your **Access Key ID** and **Secret Access Key**
6. Save these securely (you won't be able to view the secret key again)

## Step 4: Add Bucket Policy

### For Development (Less Restrictive)

If you're using the inline `AmazonS3FullAccess` policy above, you can skip this step.

### For Production (Recommended)

1. Go to S3 Console → **flasherstorage** bucket
2. Click **Permissions** tab
3. Scroll to **Bucket policy**
4. Click **Edit**
5. Copy and paste the policy from `s3-bucket-policy.json`
6. Replace:
   - `YOUR_AWS_ACCOUNT_ID`: Your 12-digit AWS Account ID (find it in AWS Console top-right)
   - `YOUR_IAM_USER`: Your IAM username (e.g., `flasher-app-user`)
7. Click **Save changes**

## Step 5: Block Public Access Settings

The bucket was created with all public access blocked (recommended). Verify:

1. Go to **flasherstorage** bucket → **Permissions**
2. Scroll to **Block public access (bucket settings)**
3. Ensure all 4 options are checked ✓

## Step 6: Enable Versioning (Optional but Recommended)

1. Go to **flasherstorage** bucket → **Properties**
2. Scroll to **Versioning**
3. Click **Edit**
4. Select **Enable**
5. Click **Save changes**

This allows you to recover accidentally deleted files.

## Step 7: Configure Application

Add these environment variables to your `.env.local`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=flasherstorage
```

## Bucket Structure (Auto-created by App)

The application will automatically create these prefixes:

```
flasherstorage/
├── users/
│   └── {userId}/
│       ├── decks/
│       ├── progress/
│       └── sessions/
├── shared/
│   └── templates/
└── temp/
    └── {sessionId}/
```

## Security Best Practices

1. **Never commit credentials**: Use `.env.local` (git-ignored)
2. **Rotate access keys**: Periodically generate new keys and delete old ones
3. **Use restrictive policies**: Only grant necessary S3 permissions
4. **Enable MFA Delete**: For production buckets (optional)
5. **Monitor access**: Enable S3 access logging
6. **Set object lifecycle**: Delete old session data after 90 days

## Lifecycle Policy (Optional)

To automatically delete old data:

1. Go to **flasherstorage** → **Management** → **Lifecycle rules**
2. Click **Create lifecycle rule**
3. Name: `delete-old-sessions`
4. Filter: Prefix = `temp/`
5. Expire objects: After `30` days
6. Click **Create rule**

## Troubleshooting

### "Access Denied" Error
- Verify IAM user has S3 permissions
- Check bucket policy allows your IAM user
- Ensure credentials in `.env.local` are correct

### "Bucket not found" Error
- Verify bucket name is exactly: `flasherstorage`
- Check region matches `AWS_REGION` in `.env.local`

### "No such key" Error
- This is normal for missing objects - handled by app gracefully
- Check bucket prefix structure is correct

## Monitoring Costs

1. Go to [AWS Billing Console](https://console.aws.amazon.com/billing/)
2. Set up **Billing Alerts**
3. Set threshold (e.g., $5/month)

S3 pricing is typically very low for small applications (~$0.023/GB stored, ~$0.0007/1000 GET requests).
