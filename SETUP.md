# Flashcard AI - Setup Guide

A comprehensive guide to set up and deploy the AI-powered flashcard application.

## Prerequisites

- Node.js 18+ and npm
- AWS Account with S3 bucket
- Clerk Account for authentication
- Google AI Studio account (for Gemini API)

## Step 1: Clone and Install

```bash
npm install
# or
yarn install
# or
pnpm install
```

## Step 2: Set Up Environment Variables

### 2.1 AWS S3 Configuration

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Create an S3 bucket for storing flashcard data
3. Create an IAM user with S3 permissions:
   - Go to IAM > Users > Create User
   - Attach policy: `AmazonS3FullAccess` (for development)
   - Copy the Access Key ID and Secret Access Key

4. Update your `.env.local`:
   ```
   NEXT_PUBLIC_AWS_REGION=us-east-1
   NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_access_key_here
   NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_key_here
   NEXT_PUBLIC_AWS_S3_BUCKET_NAME=your_bucket_name_here
   ```

### 2.2 Clerk Authentication

1. Go to [Clerk Dashboard](https://clerk.com)
2. Create a new application
3. Copy your keys from Settings > API Keys
4. Update your `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### 2.3 Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Click "Get API Key" and create a new key
3. Update your `.env.local`:
   ```
   GEMINI_API_KEY=AIzaSy...
   ```

## Step 3: Configure Clerk Middleware

Clerk automatically protects your dashboard routes. Make sure your middleware is configured:

```bash
# The middleware.ts file is already set up
# It protects /dashboard and related routes
```

## Step 4: Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Test the Application

1. **Sign Up**: Click "Get Started" on the landing page
2. **Create a Deck**: Go to Dashboard > Flashcard Library > New Deck
3. **Add Flashcards**: Add questions and answers manually
4. **Study**: Go to Study Sessions and select a study mode
5. **Check Analytics**: View your progress on the Analytics page

## Deployment to Vercel

### Option 1: Using GitHub (Recommended)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project" and select your GitHub repository
4. Add environment variables in "Settings > Environment Variables"
5. Deploy automatically on push

### Option 2: Deploy with CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add environment variables when prompted.

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `NEXT_PUBLIC_AWS_REGION` | Yes | AWS region (default: us-east-1) |
| `NEXT_PUBLIC_AWS_ACCESS_KEY_ID` | Yes | AWS IAM access key |
| `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY` | Yes | AWS IAM secret key |
| `NEXT_PUBLIC_AWS_S3_BUCKET_NAME` | Yes | S3 bucket name |

## API Routes

### Decks
- `GET /api/decks` - Get all user decks
- `POST /api/decks` - Create a new deck
- `GET /api/decks/[deckId]` - Get specific deck
- `PUT /api/decks/[deckId]` - Update deck
- `DELETE /api/decks/[deckId]` - Delete deck

### Flashcards
- `GET /api/cards?deckId=[deckId]` - Get cards in deck
- `POST /api/cards` - Create a flashcard
- `PUT /api/cards/[cardId]` - Update flashcard
- `DELETE /api/cards/[cardId]` - Delete flashcard

### AI Features
- `POST /api/ai/generate-cards` - Generate flashcards from text
- `POST /api/ai/generate-questions` - Generate multiple choice questions
- `POST /api/ai/insights` - Get personalized study insights

### Progress
- `GET /api/progress` - Get user progress
- `POST /api/progress` - Record study session

## Troubleshooting

### "Bucket name not configured"
- Check that `NEXT_PUBLIC_AWS_S3_BUCKET_NAME` is set in `.env.local`
- Bucket name should not include spaces or special characters

### "Gemini API key not configured"
- Verify `GEMINI_API_KEY` is set correctly in `.env.local`
- Generate a new API key if the current one is invalid

### "Unauthorized" error
- Make sure Clerk keys are correct
- Clear browser cookies and try signing in again
- Check that your Clerk application is active

### S3 Access Denied
- Verify IAM credentials are correct
- Check that IAM user has S3 permissions
- Ensure the bucket exists in the specified region

## Performance Optimization

1. **Caching**: Consider adding caching headers to S3 objects
2. **Images**: Optimize flashcard images before uploading
3. **Batch Operations**: Group multiple card operations when possible
4. **Progress Tracking**: Archive old study sessions to improve performance

## Security Best Practices

1. **Never commit .env.local** - Add to .gitignore
2. **Use Environment Variables** - Never hardcode secrets
3. **AWS IAM**: Use minimal permissions (principle of least privilege)
4. **SSL/TLS**: Enforce HTTPS in production
5. **Clerk**: Enable email verification in production

## Support

- Documentation: [Next.js Docs](https://nextjs.org/docs)
- Clerk Support: [Clerk Docs](https://clerk.com/docs)
- AWS Support: [AWS Documentation](https://docs.aws.amazon.com)
- Gemini API: [Google AI Docs](https://ai.google.dev)

## License

MIT
