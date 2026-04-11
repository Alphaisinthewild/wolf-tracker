# Capacitor iPhone Setup

Wolf Tracker now includes a Capacitor iOS wrapper.

## What exists now
- Capacitor dependencies installed
- `capacitor.config.json` configured
- `ios/` native Xcode project created
- Web build syncs into the iOS app shell
- Native local notification plugin installed

## Useful commands
- `npm run build`
- `npm run cap:sync`
- `npm run cap:open:ios`

## Normal workflow
1. Make app changes in the React app
2. Run `npm run cap:sync`
3. Run `npm run cap:open:ios`
4. Build/run from Xcode on simulator or iPhone

## Phone testing checklist
- Open the app on iPhone or simulator
- Allow notifications when prompted
- Confirm reminder time saves correctly
- Confirm a local reminder is scheduled
- Confirm health entries still persist after app relaunch
- Confirm progress photos still render correctly

## Bundle ID
- `ai.openclaw.wolftracker`

## Notes
- Capacitor local notifications are now wired for the native app path
- Browser notification fallback still exists for web usage
- If you want App Store deployment later, this wrapper is the correct base
