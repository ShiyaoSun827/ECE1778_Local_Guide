# Local Guide - Final Project Report

> **ECE 1778 - Mobile Application Development**  
> A modern travel companion application for discovering, saving, and managing local places of interest.

## Team Information

| Team Member | Student Number | GitHub Username |
|------------|----------------|-----------------|
| Wenxuan Wang | 1004975967 | WenxuanWangut |
| Shiyao Sun | 1006769793 | ShiyaoSun827 |
| Zhiyuan Yaoyuan | 1006262205 | Neonyao |
| Ming Yang | 1006262223 | mingy6237 |

---

## Motivation

In today's digital age, discovering authentic local places has become increasingly challenging. Mainstream applications like Google Maps and Yelp prioritize sponsored content and highly-rated commercial venues, making it difficult for users to find genuine local gems such as cozy cafés, quiet parks, or hidden studios. Additionally, users seeking to document and revisit personal discoveries lack a simple, private tool to store meaningful locations with notes or photos.

**Local Guide** addresses this gap by providing a **personal, ad-free, and offline-capable mobile application** where users can record, organize, and rediscover their favorite points of interest (POIs). The app empowers users to build a personalized map of meaningful spots, combining simplicity, autonomy, and privacy.

### Why This Project Matters

This project aligns perfectly with the learning objectives of **ECE 1778**, integrating multiple technical aspects of modern mobile app development—React Navigation, Context API, Async Storage, Expo Notifications, and external API integration—into a cohesive and achievable product.

Beyond technical skills, the app has strong social value. It encourages exploration, community engagement, and appreciation for local culture. By focusing on an offline-first design and full client-side data control, it offers users independence from large commercial platforms and promotes ethical, privacy-conscious app design.

### Target Users

- **Urban explorers and students** seeking new cafés, study areas, or scenic parks
- **Local residents** who want to bookmark favorite or nostalgic places
- **Travelers** who prefer saving discovered spots offline
- **Community advocates or small business owners** wishing to highlight local gems

---

## Objectives

The primary objective of this project was to build a **React Native and Expo (TypeScript) mobile application** that helps users discover, save, and revisit local points of interest. The project aimed to emphasize clean navigation, reliable local persistence, lightweight integrations, and a predictable developer workflow.

### Core Objectives

1. **Simple, Familiar Navigation**
   - Implement a multi-screen flow using Expo Router with Stack navigation
   - Create intuitive navigation between Home, Map, Add Place, Place Details, and Favorites screens
   - Ensure type-safe navigation with TypeScript

2. **On-Device Persistence and Offline Readability**
   - Use Context API and useReducer for deterministic state transitions
   - Implement AsyncStorage for durable, offline data storage
   - Enable users to browse saved POIs without network access
   - Implement opportunistic cache refresh when online

3. **Contextual Exploration Reminders**
   - Schedule gentle exploration reminders via Expo Notifications
   - Enable location-based sorting and filtering
   - Provide clear alternatives when permissions are denied

4. **Media Capture and Comments**
   - Allow users to attach photos to locations via expo-camera and expo-image-picker
   - Persist URI references and generate list thumbnails
   - Support lightweight location commenting and noting functionality
   - Ensure reliable image display after app restart

5. **External Service Integration**
   - Retrieve location classifications from Google Places API
   - Display weather information for outdoor points of interest
   - Implement caching strategies to ensure network failures never block core functionality

### Advanced Objectives

- **User Authentication and Role Management**: Secure sign-up, login, and role control using Better Auth
- **Real-Time Data Synchronization**: Sync places and favorites across devices via backend API
- **Interactive Map Integration**: Provide a bird's-eye view of all saved places with interactive markers
- **Smart Discovery**: Curated Google Places recommendations with intelligent caching

---

## Technical Stack

### Frontend

- **Framework**: React Native 0.81.5 with Expo SDK 54
- **Language**: TypeScript 5.9.2
- **Navigation**: Expo Router 6.0.14 (file-based routing with Stack navigation)
- **State Management**: 
  - React Context API with `useReducer` pattern
  - AsyncStorage for local persistence
- **UI Libraries**:
  - React Native Maps 1.20.1 for map functionality
  - React Hook Form 7.49.0 for form management
  - Expo Image Picker for photo capture
- **Authentication**: Better Auth with Expo client integration
- **Notifications**: Expo Notifications 0.32.12
- **Location Services**: Expo Location 19.0.7
- **Storage**: AsyncStorage 2.2.0

### Backend

- **Framework**: Next.js 16.0.7
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16 with Prisma ORM 6.19.0
- **Authentication**: Better Auth 1.3.34
- **Email Service**: Nodemailer 7.0.10 (Gmail integration)
- **File Storage**: DigitalOcean Spaces (AWS S3-compatible)
- **Deployment**: Fly.io (configured via `fly.toml`)

### External APIs

- **Google Places API**: For location discovery, search, and place details
- **Open-Meteo API**: For weather information (free, no API key required)

### Development Tools

- **Package Manager**: npm
- **Build System**: 
  - EAS Build for Android APK generation
  - Gradle for Android native builds
- **Code Quality**: ESLint with Next.js config
- **Version Control**: Git with GitHub

### Architecture Pattern

The application follows a **client-server architecture** with:
- **Frontend**: React Native app running on mobile devices
- **Backend**: Next.js API routes serving as RESTful endpoints
- **Database**: PostgreSQL for persistent data storage
- **CDN**: DigitalOcean Spaces for image hosting

---

## Features

### 1. User Authentication and Profiles

**Implementation**: Better Auth with email/password authentication and email verification.

- **Sign Up**: Users can create accounts with email, password, and display name
- **Email Verification**: Verification links sent via Gmail SMTP
- **Sign In/Sign Out**: Secure session management with expo-secure-store
- **User Profiles**: Display user statistics (places count, favorites count, cities visited)
- **Guest Mode**: App remains functional for browsing without authentication

**Course Requirement Fulfillment**: Demonstrates secure authentication patterns and session management.

### 2. Place Management (CRUD Operations)

**Implementation**: Full CRUD operations with both local (AsyncStorage) and remote (PostgreSQL) persistence.

- **Add Places**: Users can add custom places with name, description, coordinates, address, category, and photos
- **View Places**: Home screen displays all saved places in a scrollable FlatList
- **Edit Places**: Update place information (favorites, visit count)
- **Delete Places**: Remove custom places with confirmation dialog
- **Place Details**: Comprehensive view with map, weather, and contact information

**Course Requirement Fulfillment**: 
- Add and view points of interest in FlatList
- Persist places using React Native AsyncStorage and Context API

### 3. Navigation System

**Implementation**: Expo Router with file-based routing and Stack navigation.

- **Home Screen**: Discover feed with custom places and Google Places recommendations
- **Map Screen**: Interactive map view showing all places with markers
- **Add Place Screen**: Form-based place creation with location picker
- **Place Details Screen**: Detailed view with map, weather, and actions
- **Favorites Screen**: Curated list of starred places
- **Profile Screen**: User statistics and account settings

**Course Requirement Fulfillment**: 
- Navigate between screens using Expo Router (TypeScript-safe navigation)

### 4. Google Places Integration

**Implementation**: Google Places API (New) with intelligent caching and error handling.

- **Nearby Discovery**: Find places within configurable radius based on user location
- **Text Search**: Search places by name, keyword, or category
- **Place Details**: Fetch comprehensive information including ratings, hours, photos
- **Category Filtering**: Filter by trending, food, shopping, nature, nightlife, arts, wellness
- **Smart Caching**: 5-minute cache for nearby searches, 2-minute cache for text searches
- **Quota Management**: Graceful fallbacks when API quota is exceeded

**Course Requirement Fulfillment**: 
- Fetch place categories from public API (Google Places)
- Handle API responses and errors gracefully

### 5. Interactive Map

**Implementation**: React Native Maps with custom markers and interactive features.

- **Map View**: Display all saved places and Google Places on an interactive map
- **Markers**: Color-coded markers (custom places vs. Google Places)
- **Tap to Pin**: Tap anywhere on map to drop a pin and resolve address
- **Nearby Search**: Search for places around a pinned location
- **Location Services**: "Locate Me" button to center map on user location
- **Zoom Controls**: Manual zoom in/out controls

**Course Requirement Fulfillment**: Demonstrates advanced map integration and location services.

### 6. Favorites System

**Implementation**: Dual storage (local context + backend API) with real-time synchronization.

- **Toggle Favorites**: Star/unstar places from any screen
- **Favorites Screen**: Dedicated view showing all favorited places
- **Real-Time Sync**: Favorites sync across devices via backend API
- **Offline Support**: Favorites persist locally for offline access

**Course Requirement Fulfillment**: Demonstrates state management and data synchronization.

### 7. Weather Integration

**Implementation**: Open-Meteo API for weather data.

- **Weather Widget**: Display current temperature, condition, and description
- **Location-Based**: Weather shown for each place's coordinates
- **Caching**: Weather data cached to reduce API calls
- **Error Handling**: Graceful fallback when weather data unavailable

**Course Requirement Fulfillment**: Demonstrates external API integration with error handling.

### 8. Photo Management

**Implementation**: Expo Image Picker with DigitalOcean Spaces storage.

- **Photo Capture**: Take photos using device camera
- **Gallery Selection**: Pick photos from device gallery
- **Image Upload**: Upload images to DigitalOcean Spaces CDN
- **Image Display**: Show images in place cards and detail views
- **Image Persistence**: Images persist across app restarts

**Course Requirement Fulfillment**: Demonstrates media capture and storage.

### 9. Notifications

**Implementation**: Expo Notifications with scheduled reminders.

- **Daily Reminders**: Scheduled exploration reminders at 10 AM
- **Place-Specific Reminders**: Reminders for specific places
- **Permission Handling**: Request notification permissions on first launch
- **Background Scheduling**: Notifications work when app is closed

**Course Requirement Fulfillment**: 
- Send exploration reminders with Expo Notifications

### 10. Offline Support

**Implementation**: AsyncStorage for local persistence with Context API state management.

- **Offline Browsing**: View saved places without network connection
- **Local Caching**: Categories and place data cached locally
- **Sync on Connect**: Data syncs with backend when network available
- **Graceful Degradation**: App remains functional with limited features offline

**Course Requirement Fulfillment**: 
- Persist places using React Native AsyncStorage and Context API
- Offline-first design ensures core functionality without network

### 11. Search and Filtering

**Implementation**: Real-time search with debouncing and category filtering.

- **Text Search**: Search places by name, keyword, or description
- **Category Filters**: Filter by trending, food, shopping, nature, etc.
- **Debounced Search**: 400ms debounce to reduce API calls
- **Search Results**: Display search results with distance and ratings

### 12. Location Services

**Implementation**: Expo Location with permission handling.

- **Current Location**: Get user's current location
- **Location Permissions**: Request and handle location permissions
- **Geocoding**: Convert addresses to coordinates
- **Reverse Geocoding**: Convert coordinates to addresses
- **Distance Calculation**: Calculate distance between user and places

---

## User Guide

### Getting Started

1. **Launch the App**: Open Local Guide on your Android device
2. **Sign Up or Sign In**: 
   - Tap "Sign Up" to create a new account
   - Enter email, password (min 8 characters), and display name
   - Check your email for verification link
   - After verification, sign in with your credentials
   **Tip:** During testing, you can use the following demo account instead of creating a new one:
   **Email:** myang1296237@gmail.com
   **Password:** 12345678
3. **Grant Permissions**: Allow location and notification permissions when prompted

### Main Features

#### Home Screen

The home screen is your discovery hub, showing both your custom places and Google Places recommendations.

**Features**:
- **Hero Section**: Quick actions to open map or view favorites
- **Search Bar**: Search for places by name, keyword, or description
- **Category Pills**: Filter by Trending, Eats, Shops, Outdoors, Nightlife, Arts & Culture, Wellness
- **Custom Locations**: Your saved places displayed in cards
- **Featured Locations**: Google Places recommendations based on your location

**How to Use**:
1. Scroll to browse places
2. Tap a place card to view details
3. Tap the star icon to favorite/unfavorite
4. Use search bar to find specific places
5. Tap category pills to filter by type
6. Tap "+" button (bottom right) to add a new place

#### Map Screen

The map screen provides a bird's-eye view of all places.

**Features**:
- **Interactive Map**: Pan and zoom to explore
- **Markers**: Color-coded markers for custom places (purple) and Google Places (blue)
- **Tap to Pin**: Tap anywhere to drop a pin
- **Locate Me**: Button to center map on your location
- **Zoom Controls**: Manual zoom in/out buttons

**How to Use**:
1. Tap "Locate Me" button (top right) to locate yourself
2. Tap any marker to view place information
3. Tap anywhere on map to drop a pin
4. In the modal:
   - Tap "Add to My Places" to create a new place
   - Tap "Search Nearby" to find recommendations
5. Use zoom controls to adjust map view

#### Add Place Screen

Create custom places with photos and location information.

**How to Use**:
1. Tap "+" button from home or map screen
2. Enter place name (required)
3. Add description (optional)
4. Set location:
   - Tap "Use Current Location" to use your GPS coordinates
   - Or enter an address and tap "Search Address"
   - Or manually enter latitude/longitude
5. Add photo:
   - Tap "Pick from Gallery" to select existing photo
   - Tap "Take Photo" to capture new photo
6. Tap "Add Place" to save

#### Place Details Screen

View comprehensive information about any place.

**Features**:
- **Place Information**: Name, address, description, category
- **Map View**: Non-interactive map showing place location
- **Weather Widget**: Current weather at place location
- **Contact Information**: Phone, website, Google Maps link
- **Actions**: Favorite, open in Google Maps, visit website, call

**How to Use**:
1. Tap any place card to view details
2. Scroll to see all information
3. Tap star icon to favorite/unfavorite
4. Tap "Open in Google Maps" to navigate
5. Tap "Visit Website" to open website
6. Tap phone number to call
7. For custom places: Tap "Delete Place" to remove

#### Favorites Screen

View all your favorited places in one place.

**How to Use**:
1. Navigate to Favorites tab
2. Browse your favorited places
3. Tap any place to view details
4. Tap star icon to unfavorite
5. Tap "+" to add new places

#### Profile Screen

View your profile and account information.

**Features**:
- **User Information**: Name, email, location, bio
- **Statistics**: Number of likes (favorites)
- **Account Settings**: Preferences, notifications, privacy
- **Sign Out**: Log out of your account

**How to Use**:
1. Navigate to Profile tab
2. View your statistics
3. Tap settings options (coming soon)
4. Tap "Sign Out" to log out

### Tips and Tricks

- **Offline Mode**: Your custom places are saved locally and available offline
- **Search Tips**: Use specific keywords for better results (e.g., "coffee shop downtown")
- **Category Filtering**: Combine category filters with search for precise results
- **Map Navigation**: Long-press on map to quickly add a place at that location
- **Photo Tips**: Take photos in good lighting for better place cards
- **Notifications**: Enable notifications to receive daily exploration reminders

---

## Development Guide

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **PostgreSQL**: Version 16 (local or remote)
- **Expo CLI**: Install globally with `npm install -g expo-cli` or use `npx expo`
- **Google Cloud Account**: For Google Places API key
- **Java 17**: Required for Android builds (for APK generation)

### Environment Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/ShiyaoSun827/ECE1778_Local_Guide
cd ECE1778_Local_Guide-main
```

#### 2. Backend Setup (`/src`)

```bash
cd src
npm install
```

**Configure Environment Variables** (`src/.env`):

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/local_guide?schema=public"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"

#If you plan to run only the frontend and host the backend on Fly.io, then enable these two URLs.(We have already deployed our backend on Fly.io, so if you just want to try the app without setting up your own backend, simply activate these.)
#BETTER_AUTH_URL="https://local-guide-backend.fly.dev"
#NEXT_PUBLIC_API_BASE_URL="https://local-guide-backend.fly.dev"

#Otherwize, keep these
BETTER_AUTH_URL="http://your-ip:3000"
NEXT_PUBLIC_API_BASE_URL="http://your-ip:3000"




# Email (Gmail)
GMAIL_USER="localxiaoyang@gmail.com"
GMAIL_APP_PASSWORD="qomdywkvbpacxjzh"

# DigitalOcean Spaces (for image storage)
USE_CDN=true
DO_SPACES_KEY="DO801NQ7TPZ2MN8DK46L"
DO_SPACES_SECRET="VXYs+VmHMCkl6p47WFNExhagrOqLiaXjlMfaODGNnEk"
DO_SPACES_BUCKET="movies-images"
DO_SPACES_REGION="tor1"
DO_SPACES_ENDPOINT="https://tor1.digitaloceanspaces.com"
CDN_URL="https://movies-images.tor1.cdn.digitaloceanspaces.com"
```

**Initialize Database**:

```bash
npx prisma migrate dev
npx prisma generate
```

**Start Development Server**:

```bash
npm run dev
```

The backend will run on `http://localhost:3000` (or your configured port).

#### 3. Frontend Setup (`/frontend`)

```bash
cd frontend
npm install
```

**Configure Environment Variables** (`frontend/.env`):

```env
EXPO_PUBLIC_API_BASE_URL=https://local-guide-backend.fly.dev

# Local development backend URL, No need for the cloud deployment URL during development
#EXPO_PUBLIC_API_BASE_URL="http://192.168.0.10:3000"
# Google Places API Key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyAygeIYYtdDUOEHRM0R2bO67qsnfugUAvQ
# DigitalOcean Spaces Config
USE_CDN=true
DO_SPACES_KEY=DO801NQ7TPZ2MN8DK46L
DO_SPACES_SECRET=VXYs+VmHMCkl6p47WFNExhagrOqLiaXjlMfaODGNnEk
DO_SPACES_BUCKET=movies-images
DO_SPACES_REGION=tor1
DO_SPACES_ENDPOINT=https://tor1.digitaloceanspaces.com
CDN_URL=https://movies-images.tor1.cdn.digitaloceanspaces.com

# OpenWeather API Key (optional, Open-Meteo is used by default)
EXPO_PUBLIC_OPENWEATHER_API_KEY="your_openweather_key"
```

**Start Expo Development Server**:

```bash
npx expo start
```

Options:
- Press `a` to open Android emulator
- Press `i` to open iOS simulator
- Scan QR code with Expo Go app on physical device

### Running the Full Stack

1. **Start PostgreSQL** (if running locally):
   - Windows: `net start postgresql-x64-16`
   - macOS: `brew services start postgresql@16`
   - Linux: `sudo systemctl start postgresql`

2. **Start Backend**:
   ```bash
   cd src
   npm run dev
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npx expo start
   ```

4. **Test Authentication**:
   - Sign up with a new account
   - Check email for verification link
   - Sign in after verification

### Building Android APK

#### Prerequisites for APK Build

1. **Install Java 17**:
   ```bash
   # Using Conda (recommended)
   conda install -c conda-forge openjdk=17
   
   # Or macOS with Homebrew
   brew install openjdk@17
   ```

2. **Get Java Path**:
   ```bash
   # macOS/Linux
   /usr/libexec/java_home -v 17
   ```

3. **Configure Java Path** (`frontend/android/gradle.properties`):
   ```properties
   # Add the Java path obtained from step 2
   org.gradle.java.home=/path/to/java17
   ```

#### Build APK with EAS

```bash
cd frontend

# Install EAS CLI (if not installed)
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Clean Gradle cache (recommended before build)
cd android && ./gradlew --stop && cd ..
rm -rf android/.gradle

# Build APK (preview profile for internal testing)
eas build -p android --profile preview --local

# Or build on EAS servers (requires Expo account)
eas build -p android --profile preview
```

The APK will be generated in `frontend/build-*.apk` (local build) or downloadable from EAS dashboard (cloud build).

**Note**: Ensure `frontend/eas.json` is properly configured with your API base URL and Google Places API key before building.

### Development Workflow

1. **Make Changes**: Edit code in `frontend/` or `src/`
2. **Hot Reload**: Changes automatically reload in Expo
3. **Test**: Use Expo Go app or emulator
4. **Debug**: Use React Native Debugger or Chrome DevTools
5. **Commit**: Follow Git workflow with meaningful commit messages

### Useful Commands

**Backend**:
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Lint code
npx prisma studio    # Open Prisma Studio (database GUI)
```

**Frontend**:
```bash
npx expo start       # Start Expo dev server
npx expo start --clear  # Clear cache and start
npx expo run:android # Run on Android
npx expo run:ios     # Run on iOS
```

### Troubleshooting

**Common Issues**:

1. **"Invalid origin" from Better Auth**:
   - Ensure `EXPO_PUBLIC_API_BASE_URL` matches backend URL
   - Use LAN IP (not localhost) for physical devices
   - Check `BETTER_AUTH_URL` in backend `.env`

2. **Database Connection Error**:
   - Verify PostgreSQL is running
   - Check `DATABASE_URL` format
   - Run `npx prisma migrate dev` to apply migrations

3. **Google Places API Errors**:
   - Verify API key is set in `frontend/.env`
   - Check API quota in Google Cloud Console
   - Ensure Places API is enabled in Google Cloud project

4. **Image Upload Fails**:
   - Verify DigitalOcean Spaces credentials
   - Check bucket permissions
   - Ensure `USE_CDN=true` in backend `.env`

5. **Build Errors**:
   - Clear Gradle cache: `cd android && ./gradlew clean && cd ..`
   - Clear Expo cache: `npx expo start --clear`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

---

## Deployment Information

### Android APK Build

**Build Method**: EAS Build (Expo Application Services)

**Build Profile**: Preview (for internal testing)

**APK Location**: 
- **Local Build**: `frontend/build-*.apk`
- **EAS Build Link**: [Available in EAS dashboard after cloud build]

**Build Configuration** (`frontend/eas.json`):
```json
{
  "cli": {
    "version": ">= 16.28.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EAS_BUILD_NPM_INSTALL_ARGS": "--legacy-peer-deps",
        "EXPO_PUBLIC_API_BASE_URL": "https://local-guide-backend.fly.dev",
        "EXPO_PUBLIC_API_URL": "https://local-guide-backend.fly.dev",
        "EXPO_PUBLIC_GOOGLE_PLACES_API_KEY": "AIzaSyAygeIYYtdDUOEHRM0R2bO67qsnfugUAvQ"
      }
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Note**: Replace `"http://your-ip:3000"` with your actual backend IP address or Fly.io URL in the `preview` profile environment variables.

**Build Command**:
```bash
cd frontend

# Clean Gradle cache (recommended)
cd android && ./gradlew --stop && cd ..
rm -rf android/.gradle

# Build APK
eas build -p android --profile preview --local
```

**APK Details**:
- **Package Name**: `com.localguide.app`
- **Version**: 1.0.0
- **Min SDK**: 23 (Android 6.0)
- **Target SDK**: 34 (Android 14)

**Installation Instructions**:
1. Download APK file to Android device
2. Enable "Install from Unknown Sources" in device settings
3. Tap APK file to install
4. Launch "Local Guide" app

### Backend Deployment

**Platform**: Fly.io

**Configuration** (`src/fly.toml`):
- **App Name**: `local-guide-backend`
- **Primary Region**: `yyz` (Toronto)
- **Port**: 3000
- **Health Check**: `/api/health`

**Deployment Command**:
```bash
cd src
fly deploy
```

**Backend URL**: `https://local-guide-backend.fly.dev`

**Database**: PostgreSQL hosted on Fly.io 

### Environment Variables for Production

**Backend** (set via `fly secrets` or in `src/.env`):
```env
DATABASE_URL="postgresql://local-guide-db.flycast"
BETTER_AUTH_SECRET=KWbps5LBO9ZSihHVSR+RUTOjQMmDFC3s+4G0imT4JzE=
BETTER_AUTH_URL="https://local-guide-backend.fly.dev"
NEXT_PUBLIC_API_BASE_URL="https://local-guide-backend.fly.dev"
GMAIL_USER="localxiaoyang@gmail.com"
GMAIL_APP_PASSWORD="qomdywkvbpacxjzh"
USE_CDN=true
DO_SPACES_KEY="DO801NQ7TPZ2MN8DK46L"
DO_SPACES_SECRET="VXYs+VmHMCkl6p47WFNExhagrOqLiaXjlMfaODGNnEk"
DO_SPACES_BUCKET="movies-images"
DO_SPACES_REGION="tor1"
DO_SPACES_ENDPOINT="https://tor1.digitaloceanspaces.com"
CDN_URL="https://movies-images.tor1.cdn.digitaloceanspaces.com"
```

**Frontend** (set in `frontend/eas.json` build profile or `frontend/.env`):
- `EXPO_PUBLIC_API_BASE_URL` - `https://local-guide-backend.fly.dev`
- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` - `AIzaSyAygeIYYtdDUOEHRM0R2bO67qsnfugUAvQ`
- `EAS_BUILD_NPM_INSTALL_ARGS` - `--legacy-peer-deps`

### Video Demo

A video demonstration of the Local Guide application is available at:
- **Location**: [Link to video file or YouTube/Vimeo URL]
- **Duration**: [X] minutes
- **Content**: 
  - App overview and navigation
  - User authentication flow
  - Adding and managing places
  - Map interaction and discovery
  - Favorites and profile features

---

## Individual Contributions

### Wenxuan Wang (1004975967)

**Primary Responsibilities**:
- Frontend development and implementation
- Final project report writing and documentation

**Key Contributions**:
- Developed frontend components and screens using React Native and Expo
- Implemented user interface and navigation flows
- Created frontend features including place management, map integration, and user interactions
- Wrote comprehensive final project report (FINAL_REPORT.md)
- Documented project features, technical stack, and development guide
- Ensured all course requirements are clearly documented and fulfilled


### Shiyao Sun (1006769793)

**Primary Responsibilities**:
- Backend development and API implementation
- Android APK build configuration 

**Key Contributions**:
- Designed and implemented backend API routes using Next.js
- Set up Prisma schema and database migrations for PostgreSQL
- Implemented Better Auth authentication system
- Created RESTful API endpoints for places, favorites, and user management
- Configured backend environment for Android APK builds
- Integrated DigitalOcean Spaces for image storage
- Set up email verification system using Nodemailer


### Zhiyuan Yaoyuan (1006262205)

**Primary Responsibilities**:
- Backend development and server-side logic
- Video demo creation and production

**Key Contributions**:
- Developed backend services and business logic
- Implemented database operations and data models
- Created API endpoints for data synchronization
- Produced comprehensive video demonstration of the application
- Showcased all major features including authentication, place management, map interaction, and favorites
- Documented user workflows and application functionality through video


### Ming Yang (1006262223)

**Primary Responsibilities**:
- Frontend development and UI implementation
- Deployment configuration and setup
- Android APK build 

**Key Contributions**:
- Developed frontend features and user interface components
- Implemented frontend functionality and user interactions
- Configured EAS Build for Android APK generation
- Set up deployment pipelines and build profiles
- Managed environment variables and build configurations
- Created APK build scripts and deployment documentation
- Ensured frontend is properly configured for production builds


### Collaborative Efforts

All team members contributed to:
- Code reviews and quality assurance
- Bug fixes and troubleshooting
- Documentation and README updates
- Testing across different devices and scenarios
- Feature planning and requirement analysis

---

## Lessons Learned and Concluding Remarks

### Technical Insights

#### 1. State Management Complexity

One of the most significant challenges was managing state across local storage (AsyncStorage), Context API, and remote backend synchronization. We learned that:

- **Context API + useReducer** provides excellent scalability for complex state logic without external dependencies
- **AsyncStorage** requires careful handling of async operations and error cases
- **Synchronization** between local and remote state needs robust error handling and rollback mechanisms
- **Caching strategies** are crucial for performance and user experience, especially with external APIs

#### 2. Authentication in Mobile Apps

Implementing Better Auth with Expo presented unique challenges:

- **Origin validation** requires careful configuration of trusted origins for mobile apps
- **Cookie handling** in React Native differs from web browsers, requiring expo-secure-store
- **Email verification** flow needs clear user guidance and error messages
- **Session persistence** across app restarts requires secure storage mechanisms

#### 3. External API Integration

Working with Google Places API taught us:

- **API quotas** are real constraints that require intelligent caching and fallback strategies
- **Error handling** must be graceful and user-friendly, especially for network failures
- **Response normalization** is essential when working with different API response formats
- **Rate limiting** and request throttling prevent quota exhaustion

#### 4. Map Integration Challenges

React Native Maps integration revealed:

- **Performance** is critical when rendering many markers; we implemented marker clustering considerations
- **Permission handling** must be user-friendly with clear explanations
- **Coordinate systems** require careful validation and conversion
- **Map interactions** (tap, long-press) need intuitive UI feedback

#### 5. Build and Deployment

EAS Build and deployment taught us:

- **Environment variables** must be carefully configured for different build profiles
- **Java version compatibility** is crucial for Android builds
- **Gradle configuration** requires understanding of Android build system
- **Local vs. cloud builds** have different trade-offs in development time vs. resource usage

### Project Management Insights

#### 1. Team Collaboration

- **Clear responsibilities** helped avoid merge conflicts and duplicate work
- **Regular communication** was essential for coordinating features that span frontend and backend
- **Code reviews** improved code quality and knowledge sharing
- **Git workflow** with feature branches enabled parallel development

#### 2. Scope Management

- **Feature prioritization** was crucial given time constraints
- **MVP approach** allowed us to deliver core functionality first, then add enhancements
- **Technical debt** must be balanced with feature delivery
- **Documentation** is as important as code, especially for handoffs

#### 3. Testing and Quality Assurance

- **Testing on physical devices** revealed issues not apparent in emulators
- **Different Android versions** required compatibility testing
- **Network conditions** (offline, slow connection) needed explicit testing
- **User flows** should be tested end-to-end, not just individual features

### Challenges Overcome

1. **Better Auth Integration**: Initial challenges with origin validation and cookie handling were resolved through careful configuration and expo-secure-store integration.

2. **State Synchronization**: Complex synchronization between AsyncStorage, Context API, and backend was achieved through careful state management patterns and error handling.

3. **Google Places API Quota**: Implemented intelligent caching (5-minute TTL for nearby, 2-minute for search) and graceful fallbacks to prevent quota exhaustion.

4. **Image Upload**: DigitalOcean Spaces integration required understanding of S3-compatible APIs and FormData handling in React Native.

5. **Build Configuration**: Android APK generation required Java 17 configuration and Gradle property adjustments, which were resolved through systematic troubleshooting.

### Future Enhancements

If we were to continue this project, we would consider:

1. **Social Features**: User-to-user place sharing, comments, and ratings
2. **Advanced Search**: Filters for price range, ratings, distance, and opening hours
3. **Offline Maps**: Cached map tiles for offline map viewing
4. **Push Notifications**: Real-time notifications for place updates
5. **Analytics**: User behavior tracking and place popularity metrics
6. **Accessibility**: Enhanced screen reader support and accessibility features
7. **Internationalization**: Multi-language support for global users
8. **Dark Mode**: Theme switching for better user experience

### Concluding Remarks

The Local Guide project has been an invaluable learning experience, combining theoretical knowledge from ECE 1778 with practical implementation challenges. We successfully delivered a fully functional mobile application that demonstrates:

- **Modern mobile development** practices with React Native and Expo
- **Full-stack architecture** with Next.js backend and PostgreSQL database
- **External API integration** with intelligent caching and error handling
- **Offline-first design** with local persistence and synchronization
- **User authentication** with secure session management
- **Rich user experience** with maps, photos, weather, and notifications

The project not only fulfilled all course requirements but also provided opportunities to explore advanced features like real-time synchronization, intelligent caching, and comprehensive error handling. The collaborative development process strengthened our understanding of software engineering practices, version control, and team coordination.

We are proud of the final product and believe it demonstrates the skills and knowledge gained throughout the course. The application is ready for real-world use and provides a solid foundation for future enhancements.

---

## Acknowledgments

- **ECE 1778 Instructors and TAs** for guidance and support throughout the project
- **Expo Team** for excellent documentation and tooling
- **Better Auth** for comprehensive authentication solution
- **Google Places API** for location data and discovery features
- **Open-Meteo** for free weather API service

---

## License

MIT License © Local Guide Team

Feel free to fork, extend, or integrate into your own projects. Pull requests and bug reports are always welcome!

---

**Repository**: [GitHub Repository URL]  
**Last Updated**: December 2024  
**Version**: 1.0.0

