# Fitness Brain

Fitness Brain is a comprehensive health and fitness tracking application built with Flutter and Firebase. It allows users to monitor their daily activity, heart rate, sleep patterns, and overall well-being.

## Features

- **Real-time Health Tracking**: Monitors steps, heart rate, sleep duration, active time, calories burned, distance, SpO2, and stress levels.
- **Health Connect Integration**: Seamlessly syncs data from Google Fit and Samsung Health.
- **AI-Powered Insights**: Provides personalized health analysis and recommendations.
- **Gamification**: Earn badges and rewards for achieving fitness goals.
- **Cross-Platform**: Available on Android and iOS.

## Tech Stack

- **Frontend**: Flutter
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions)
- **Health Data**: Google Health Connect, Samsung Health
- **State Management**: Provider
- **Notifications**: Firebase Cloud Messaging

## Getting Started

### Prerequisites

- Flutter SDK (2.8.0 or higher)
- Android Studio or VS Code
- Firebase project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fitness-brain
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Configure Firebase:
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Add Android and iOS apps to your Firebase project
   - Download the `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) files
   - Place them in the appropriate directories:
     - Android: `android/app/`
     - iOS: `ios/Runner/`

4. Run the app:
   ```bash
   flutter run
   ```

## Project Structure

```
fitness-brain/
├── android/              # Android native code
├── ios/                  # iOS native code
├── lib/
│   ├── main.dart         # App entry point
│   ├── models/           # Data models
│   ├── services/         # API and Firebase services
│   ├── providers/        # State management
│   ├── screens/          # UI screens
│   ├── widgets/          # Reusable widgets
│   └── utils/            # Utility functions
├── test/                 # Unit and widget tests
└── pubspec.yaml          # Dependencies
```

## Development

### Adding New Features

1. Create a new branch:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Implement the feature in the `lib/` directory

3. Test your changes

4. Commit and push:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

### Running Tests

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage
```

## Deployment

### Android

```bash
# Generate release APK
flutter build apk --release

# Generate app bundle
flutter build appbundle --release
```

### iOS

```bash
# Archive for App Store
flutter build ipa --release
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For questions or support, please contact [Your Name/Team] at [Your Email Address].
