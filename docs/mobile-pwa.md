# Mobile PWA Setup

Forge is intended to be installed to a phone home screen and used like an app.

## iPhone

1. Deploy Forge to an HTTPS URL.
2. Open the HTTPS URL in Safari.
3. Tap Share.
4. Tap Add to Home Screen.
5. Open Forge from the Home Screen icon.
6. Turn on Meal-time push notifications inside the installed app.

Web push on iPhone requires iOS 16.4 or later and the installed Home Screen web app. It will not behave the same from a normal Safari tab.

## Android

1. Deploy Forge to an HTTPS URL.
2. Open the URL in Chrome.
3. Tap the browser menu.
4. Tap Install app or Add to Home screen.
5. Open Forge from the installed app icon.
6. Turn on Meal-time push notifications.

## Local Development

`http://localhost:3000` is useful for desktop development, but a phone cannot treat your Mac's localhost as its own secure app origin. For mobile push testing, use a real HTTPS deployment such as Vercel.
