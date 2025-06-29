# JoyTrip - Tourist Place Discovery App

JoyTrip helps users discover amazing tourist places near their current location. The app provides information about nearby attractions, including details like distance, category, and address.

## Features

- Real-time location detection
- Find tourist places within a specified radius
- Detailed information about each place
- Responsive design for all devices
- User authentication (signup/login)
- Feedback system

## Prerequisites

Before deploying, make sure you have:

1. A Vercel account (https://vercel.com)
2. Firebase project with Authentication and Firestore enabled
3. Geoapify API key for location services

## Deployment Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/joytrip.git
cd joytrip
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory and add your configuration:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual API keys and configuration.

### 4. Deploy to Vercel

1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Login to your Vercel account:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```

   Follow the prompts to complete the deployment.

4. For production deployment:
   ```bash
   vercel --prod
   ```

### 5. Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add all the environment variables from your `.env` file

### 6. Configure Custom Domain (Optional)

1. In your Vercel dashboard, go to the project settings
2. Navigate to the "Domains" section
3. Add your custom domain and follow the verification steps

## Environment Variables

- `FIREBASE_API_KEY`: Your Firebase API key
- `FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Your Firebase messaging sender ID
- `FIREBASE_APP_ID`: Your Firebase app ID
- `FIREBASE_MEASUREMENT_ID`: Your Firebase measurement ID (optional)
- `GEOAPIFY_API_KEY`: Your Geoapify API key
- `NODE_ENV`: Set to 'production' for production
- `PORT`: Port to run the server on (default: 3000)

## Development

To run the application locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# The app will be available at http://localhost:3000
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
