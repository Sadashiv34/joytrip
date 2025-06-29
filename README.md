# JoyTrips - Discover Amazing Places

A web application that helps users discover tourist places near them using geolocation.

## Features

- Real-time location detection
- Find tourist attractions within a specified radius
- User authentication (sign up, sign in, password reset)
- Responsive design for all devices
- Interactive map with markers

## Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- [Leaflet.js](https://leafletjs.com/) for interactive maps
- [Firebase Authentication](https://firebase.google.com/docs/auth) for user management
- [Geoapify](https://www.geoapify.com/) for place search and geocoding
- [Vercel](https://vercel.com/) for deployment

## Deployment

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Vercel CLI (optional)

### Deploying to Vercel

1. Install Vercel CLI (if not installed):
   ```bash
   npm install -g vercel
   ```

2. Deploy the application:
   ```bash
   vercel
   ```
   
   Or connect your GitHub repository to Vercel for continuous deployment.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
GEOAPIFY_API_KEY=your_geoapify_api_key
```

## Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/joytrips.git
   cd joytrips
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
joytrips/
├── css/                  # CSS styles
├── js/                   # JavaScript modules
│   ├── auth.js           # Authentication logic
│   ├── firebase-config.js # Firebase configuration
│   └── ...
├── images/               # Image assets
├── index.html            # Main HTML file
├── login.html            # Login page
├── signup.html           # Signup page
├── map.html              # Map page
├── landing.html          # Landing page
├── package.json          # Project dependencies
├── vercel.json           # Vercel configuration
└── README.md             # Project documentation
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
