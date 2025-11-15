# Local Guide - React Native App

A React Native application built with Expo Router for managing and exploring saved places.

## Features

- **Home Screen**: View all saved places in a scrollable FlatList
- **Map Screen**: Interactive map view showing all saved places
- **Add Place Screen**: Form to add new places with photos and coordinates
- **Place Details Screen**: Detailed view with weather information and map
- **Favorites Screen**: View only your favorite places

## Tech Stack

- React Native with Expo
- Expo Router for navigation
- TypeScript
- React Hook Form for form management
- React Native Maps for map functionality
- AsyncStorage for local data persistence

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## Project Structure

```
frontend/
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with navigation
│   ├── index.tsx          # Home screen
│   ├── map/               # Map screen
│   ├── add/               # Add place screen
│   ├── places/[id].tsx    # Place details screen
│   └── favorites/         # Favorites screen
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── theme/                 # Design system (colors, typography, etc.)
└── utils/                 # Utility functions
```

## Usage

1. **Adding a Place**: 
   - Tap the "+" button on the home screen
   - Fill in the form with place details
   - Use "Use Current Location" to get your coordinates automatically
   - Add a photo from gallery or take a new one
   - Save the place

2. **Viewing Places**:
   - Browse all places on the home screen
   - Tap any place card to see details
   - Use the map view to see all places geographically

3. **Favorites**:
   - Tap the star icon on any place to favorite it
   - View all favorites on the Favorites screen

4. **Place Details**:
   - View place information, location on map, and weather data
   - Delete places you no longer need

## Permissions

The app requires the following permissions:
- Location (for getting current location and displaying maps)
- Camera (for taking photos)
- Photo Library (for selecting photos)

These permissions are requested when needed.

