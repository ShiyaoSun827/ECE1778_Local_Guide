# Project Proposal — Local Guide

# 1. Team Members

| **Team Member** | **Student Number** | **GitHub Account** |
| --- | --- | --- |
| Wenxuan Wang | 1004975967 | WenxuanWangut |
| Shiyao Sun  | 1006769793 | ShiyaoSun827 |
| Zhiyuan Yaoyuan | 1006262205 | Neonyao |
| Ming Yang | 1006262223 | mingy6237 |

# 2. Motivation

Finding genuine local places, such as cozy cafés, quiet parks, or hidden studios has become increasingly difficult with mainstream apps like Google Maps or Yelp, which prioritize sponsored or highly rated venues. Users seeking to document and revisit personal discoveries lack a simple and private tool to store meaningful locations with notes or photos.

**Local Guide** addresses this gap by providing a **personal, ad-free, and offline-capable mobile app** where users can record, organize, and rediscover their favorite points of interest (POIs). The app allows users to build a personalized map of meaningful spots, combining simplicity, autonomy, and privacy.

## Why the Project Is Worth Pursuing

This project aligns perfectly with the learning goals of **ECE1778**, integrating multiple technical aspects of modern mobile app development—React Navigation, Context API, Async Storage, Expo Notifications, and external API integration—into a cohesive and achievable product.

Beyond technical skills, the app has strong social value. It encourages exploration, community engagement, and appreciation for local culture. By focusing on an offline-first design and full client-side data control, it offers users independence from large commercial platforms and promotes ethical, privacy-conscious app design. The scope is well-defined and feasible within the semester timeline.

## Target Users

- **Urban explorers and students** seeking new cafés, study areas, or scenic parks
- **Local residents** who want to bookmark favorite or nostalgic places
- **Travelers** who prefer saving discovered spots offline
- **Community advocates or small business owners** wishing to highlight local gems

**Local Guide** differs by enabling users to fully own their data while enjoying personalized, ad-free, and offline exploration, also offering both simplicity and control.

# 3. Objective

Build a React Native and Expo (TypeScript) mobile app that helps users discover, save, and revisit local points of interest such as cafes and parks. The app will emphasize clean navigation, reliable local persistence, lightweight integrations, and a predictable developer workflow.

Our platform was designed to fulfill the following core goals:

- **Simple, Familiar Navigation:**
    
    Implement a four screens flow, which are Home Page, Add Place Page, Place Details, and Favorites OR Recommendations with React Navigation (Stack). 
    
- **On Device Persistence and Offline Readability:**
    
    Use Context and useReducer for deterministic state transitions and Async Storage for durable, offline data like places, and  cached categories. Users can browse saved POIs without network access, and  caches are refreshed opportunistically when online.
    
- **Contextual Exploration Reminders:**
    
    Schedule gentle exploration reminders via Expo notifications. Enable location based sorting or filtering to prioritize “nearby” locations after obtaining user permission. Clear alternatives are provided for all features when permissions are denied.
    
- **Support media capture and comments:**
    
    Allow users to attach photos to locations via expo-camera and expo-image-picker, optionally include expo-image-manipulator for resizing and compression. Persist URI references and generate list thumbnails to ensure reliable image display after restart. Introduces lightweight location commenting and noting functionality, supporting device-side storage of timestamped edits/deletions. Works offline and syncs with location records. All media and comments can be downgraded when permissions are denied like gallery selection or plain text notes.
    
- **Supports relevant external services:**
    
    Retrieves location classifications from public APIs (Google Places) and optionally displays weather for outdoor points of interest. Responses employ caching strategies to ensure network failures never block core navigation functionality.
    

# **4. Key Features**

### 4.1 Navigation Structure

- Built with **React Navigation (Stack Navigator)** using TypeScript type definitions.
- Core screens:
    1. **Home Screen** – Displays all saved places using `FlatList` which renders a scrollable list of saved places. It's optimized for long lists by only rendering items that are currently on-screen (lazy loading).
    2. **Map Screen** - Provides a "bird's-eye view" of all saved places on a single, interactive map. Component: MapView from react-native-maps and fetches the complete list of saved places and renders a Marker for each one.
    3. **Add Place Screen** – Form for entering place details, images, and coordinates. Uses react-hook-form for efficient, re-render-optimized state management and validation.
    4. **Place Details Screen** – Shows photo, description, location, and weather info. Displays the image saved for the location. Renders a non-interactive MapView from react-native-maps, centered on the place's saved coordinates with a single Marker.
    5. **Favorites Screen** – Displays only starred or frequently visited locations. This screen re-uses the same FlatList component as the Home Screen.
- Typed navigation handled through `RootStackParamList` for safe route transitions.

### 4.2 State Management and Persistence

The app's global state is managed using a combination of **React's Context API and the `*useReducer*` hook**. This pattern provides a scalable solution for handling complex state logic without relying on third-party libraries like Redux.

- **Context API + useReducer** for global state handling
- **Async Storage** for local persistence across sessions
- Full CRUD functionality (add/edit/delete/favorite POIs)
- Ensures data remains available offline without requiring a backend

### 4.3 Notification Setup

- Integrated **Expo Notifications API** (expo-notifications) to handle all aspects of notification management.
- Sends scheduled daily notifications
- Uses background scheduling and permissions configured in `app.json` for Android and iOS.
- Demonstrates engagement-focused design aligned with the course’s user interaction goals.
- **Permissions**: The app requests notification permissions from the user on first load. This is a critical step, as iOS and modern Android versions require explicit user consent.

### 4.4 Backend Integration Details

### 4.4.1 REST API

The application integrates with two external **REST APIs** to enrich the user experience and fulfill all backend requirements, using **Axios** as the HTTP client. This ensures the app relies on **live data** and updates the UI dynamically.

**API Services Used:**

| **API Service** | **Purpose & Endpoint** | **Dynamic UI Element** |
| --- | --- | --- |
| **Open-Meteo API** | Fetches the current weather conditions using a POI's saved geographical coordinates. | Displays the real-time temperature and weather description on the **Place Details Screen**. |
| **Google Places API** | Provides dynamic location suggestions via autocomplete for the "Add Place" form. | Populates location title, full address, and accurate coordinates in the **Add Place Screen**. |

### 4.4.2 Fulfillment of Requirements

The chosen integration strategy directly addresses mandatory project requirements for backend support:

- **Integrate with a Backend Service/API:** We use external, public **REST APIs** (Open-Meteo and Google Places) accessed via the **Axios** HTTP client library.
- **Fetch and Display Live Data:**
    - The **Open-Meteo** data is fetched asynchronously when the **Place Details Screen** loads, showing the current, dynamic weather data.
    - The **Google Places** suggestions are fetched live as the user types in the search field, dynamically updating the list of possible locations.
- **Handle Responses and Errors Gracefully:**
    - **Loading States:** A dedicated `&lt;ActivityIndicator&gt;` or loading message is displayed while API data is being fetched (e.g., waiting for weather data).
    - **Error Messages:** `try...catch` blocks are used with **Axios** to handle network failures or bad responses. If the weather data fetch fails, a user-friendly message (e.g., "Weather data unavailable") is displayed instead of a blank or broken section.
    - **Retry Logic:** Simple retry logic could be implemented using `setTimeout` within the error handler for non-critical services like weather.
- **Support API-Driven Navigation:** The **Google Places API** is instrumental here. Once a user selects a suggestion, the full POI data (name, address, coordinates) is captured, enabling the subsequent saving of the new place, which is an API-driven action that then fuels the rest of the application's navigation (e.g., viewing that new place's details).

### 4.5 Data Caching Strategy

To improve performance, reduce network traffic, and maintain an **offline-first** design, a local caching mechanism is employed:

- **Cache Implementation:** **AsyncStorage** is used to cache API responses.
- **Mechanism:** When weather data is successfully fetched from **Open-Meteo**, the response is stored in **AsyncStorage** along with a timestamp.
- **Dependency Reduction:** When the **Place Details Screen** loads, the app first checks the cache. If a valid (e.g., less than 30 minutes old) weather entry exists for those coordinates, the cached data is displayed immediately, eliminating the need for a network call and ensuring a seamless, **offline-available** experience.

### 4.6 Deployment Plan with Expo EAS Build

- Developed and tested via **Expo Go** during iteration
- Built using **EAS Build** for production-ready `.apk` (Android) and `.ipa` (iOS) binaries
- Final demo prepared for device testing and presentation on November 19–26

# **5. Advanced Features**

### **5.1 User Authentication and Role Management**

- Uses **Better Auth** with a **Next.js backend** and **Expo app** for secure sign-up, login, and role control.
- Users choose **User** or **Admin** when registering; their role decides what screens they see after login.
- Email/password sign-up with verification via **Nodemailer**; unverified users can’t log in.
- Sessions are stored safely in **expo-secure-store** and used to access protected APIs.
- Login and logout automatically update session state and navigation.


### **5.2 Location and Photo Features**

- Shows nearby places within **2 km**, using **expo-location** with “Nearby” and “Sort by Distance” options.
- If location access is denied, users can still browse manually.
- Allows users to **add photos** for each place with **expo-camera/image-picker**.
- Stores only **image URIs** to keep the app lightweight.


### **5.3 Offline Access**

- Saves location data and categories in **Async Storage** for offline viewing.
- Uses **NetInfo** to detect network changes and show “Offline” alerts.
- Keeps saved lists available in airplane mode while pausing online actions.


### **5.4 Real-Time Updates**

- **Places and comments** update instantly across all devices using **Socket.IO**.
- The server sends update messages after any create, edit, or delete.
- Each connection is verified through **Better Auth**; clients ignore duplicates and never share sensitive data.


## How These Features Fulfill Course Project Requirements

| Requirement | Implementation |
| --- | --- |
| **Navigation & UI** | Implemented via React Navigation (Stack), multiple screens, and TypeScript-safe routes. |
| **State Management & Persistence** | Context API + Async Storage ensure persistent offline data. |
| **Notifications** | Expo Notifications used to schedule local reminders. |
| **Backend/API Integration** | Uses Open-Meteo and Google Places APIs for dynamic content. |
| **Deployment** | Packaged and deployed via Expo EAS Build for both platforms. |
| **Advanced Features** | Includes camera, location, and offline support for technical depth. |


## Project Scope and Feasibility

The project scope is realistic for the 6–7 week timeline.

- Core features (CRUD operations“, navigation, persistence) will be completed first.
- Advanced modules (camera, location, weather) will follow as incremental additions.
- All required SDKs (Notifications, Storage, Location, Camera) are natively supported by Expo.
- The app will be fully testable through Expo Go and deliverable via EAS Build before the December 7 deadline.


# 4. Tentative Plan

To achieve the project objectives efficiently, the team will follow an **iterative and collaborative workflow** using GitHub for version control, code reviews, and issue tracking.

While exact roles may evolve during development, each member will take responsibility for a specific focus area to ensure balanced contributions and smooth coordination.

## Development Approach

- **Architecture & Navigation:** Build the core structure and navigation flow using React Navigation with TypeScript for strongly typed routes.
- **Frontend Interface:** Design intuitive UI layouts for Home, Add Place, and Details screens, ensuring consistency and usability.
- **State & Persistence:** Use Context API and Async Storage for managing local data and enabling offline access.
- **Notifications & APIs:** Configure Expo Notifications for exploration reminders and integrate simple APIs (e.g., Google Places or Open-Meteo).
- **Testing & Deployment:** Conduct iterative testing on Android and iOS through Expo Go, followed by deployment via **Expo EAS Build**.

## Collaboration and Responsibilities

- **Wenxuan Wang:** Leads app architecture and navigation setup, ensuring proper TypeScript structure.
- **Shiyao Sun:** Focuses on frontend UI and styling consistency.
- **Zhiyuan Yaoyuan:** Implements state management, Async Storage, and offline logic.
- **Ming Yang:** Handles notifications, API integration, and final deployment.

All members will participate in code reviews, debugging, and feature testing to maintain high code quality.

Regular team syncs will ensure alignment, with progress tracked through GitHub milestones and issues.

This plan ensures clear responsibilities, efficient collaboration, and a realistic scope for delivering a polished and functional mobile app within the 6–8 week timeline.