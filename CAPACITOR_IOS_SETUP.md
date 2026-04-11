# Capacitor iPhone Setup

Wolf Tracker now includes a Capacitor iOS wrapper.

## What exists now
- Capacitor dependencies installed
- `capacitor.config.json` configured
- `ios/` native Xcode project created
- Web build syncs into the iOS app shell

## Useful commands
- `npm run build`
- `npm run cap:sync`
- `npm run cap:open:ios`

## Normal workflow
1. Make app changes in the React app
2. Run `npm run cap:sync`
3. Run `npm run cap:open:ios`
4. Build/run from Xcode on simulator or iPhone

## Bundle ID
- `ai.openclaw.wolftracker`

## Notes
- Current notifications are still browser-level logic inside the web app
- For true native iPhone local notifications, the next step is adding Capacitor local notifications plugin support
- If you want App Store deployment later, this wrapper is the correct base
