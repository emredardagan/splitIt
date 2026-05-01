# Ortak Hesap - Bill Splitting Mobile App

A React Native mobile application for splitting bills easily and fairly among friends. Inspired by BillSplit with enhanced features including multi-currency support and ad integration.

## Features

### Core Features
- 📱 **Modern Mobile UI** - Clean, intuitive interface optimized for mobile devices
- 📸 **Receipt Scanning** - Capture receipts with camera (placeholder for OCR integration)
- ✏️ **Manual Entry** - Add bill items manually with ease
- 👥 **People Management** - Add and manage people for bill splitting
- 💰 **Smart Splitting** - Even split or custom item assignment
- 🧾 **Tax & Tip Support** - Add tax and tip to calculations
- 📊 **Split Summary** - Clear breakdown of who owes what
- 📤 **Share Results** - Share split summary via native sharing

### New Features
- 🌍 **Multi-Currency Support** - Choose between USD ($), EUR (€), and Turkish Lira (₺)
- 📺 **Ad Screen** - Promotional screen before results with countdown timer
- 🎉 **Confetti Animation** - Celebration animation on split completion
- 💾 **Data Persistence** - Saves your progress using AsyncStorage

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for screen navigation
- **Expo Camera** for receipt scanning
- **AsyncStorage** for local data persistence
- **Decimal.js** for precise financial calculations
- **React Native Confetti Cannon** for celebrations
- **Expo Vector Icons** for consistent iconography

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url> ortakHesap
   cd ortakHesap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For Android
   npm run android
   
   # For iOS (macOS only)
   npm run ios
   
   # For web
   npm run web
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── constants/          # App constants (currencies, etc.)
├── navigation/         # Navigation configuration
├── screens/           # Screen components
│   ├── HomeScreen.tsx
│   ├── CameraScreen.tsx
│   ├── ManualScreen.tsx
│   ├── PeopleAndSplitScreen.tsx
│   ├── AdScreen.tsx
│   ├── SplitSummaryScreen.tsx
│   └── CurrencySelectorScreen.tsx
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Usage Flow

1. **Home Screen** - Choose to scan receipt or enter manually
2. **Currency Selection** - Select your preferred currency
3. **Camera/Manual Entry** - Add bill items
4. **People & Split** - Add people and configure split settings
5. **Ad Screen** - View promotional content (5-second timer)
6. **Split Summary** - See results with confetti celebration

## Currency Support

The app supports three currencies:
- **USD** - US Dollar ($)
- **EUR** - Euro (€)
- **TL** - Turkish Lira (₺)

Currency selection is persistent across app sessions.

## Key Components

### Bill Calculation
- Precise decimal arithmetic using Decimal.js
- Support for tax and tip calculations
- Even split or custom item assignment
- Handles rounding to ensure total accuracy

### Data Persistence
- Bill items, people, and settings saved locally
- Currency preference remembered
- Progress maintained across app sessions

### Ad Integration
- 5-second countdown timer
- Skip functionality after countdown
- Smooth animations and transitions
- Automatic navigation to results

## Development

### Adding New Currencies
1. Update the `CURRENCIES` array in `src/constants/currencies.ts`
2. Add the new currency type to `Currency` type in `src/types/index.ts`

### Customizing the Ad Screen
- Modify `src/screens/AdScreen.tsx`
- Adjust countdown duration, content, or styling
- Add real ad network integration if needed

### Extending Bill Calculations
- Update utility functions in `src/utils/billUtils.ts`
- Ensure decimal precision is maintained
- Add tests for new calculation logic

## Future Enhancements

- 🔍 **OCR Integration** - Real receipt text recognition
- 💳 **Payment Integration** - Direct payment processing
- 📱 **Push Notifications** - Payment reminders
- 🌐 **Cloud Sync** - Cross-device synchronization
- 📈 **Analytics** - Spending insights and reports
- 🎨 **Themes** - Dark mode and custom themes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by @Nutlope's BillSplit project
- Built with Expo and React Native
- Icons provided by Expo Vector Icons 