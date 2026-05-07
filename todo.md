# PulseTimer TODO

## Database & Schema
- [x] Create timers table (user_id, name, duration, is_saved)
- [x] Create intervals table (timer_id, order, duration, sound, color)
- [x] Create presets table (name, description, intervals)
- [x] Create user_premium table (user_id, is_premium, created_at)
- [x] Apply all migrations to database

## Core Architecture
- [x] Set up dashboard layout with sidebar navigation
- [x] Implement routing (Timer, Advanced Timer, Stopwatch, Saved Timers, Presets)
- [x] Implement user authentication with Manus OAuth
- [x] Create premium tier logic and gating
- [x] Implement persistent storage (localStorage + database sync)

## Simple Timer (Free)
- [x] Build Timer screen with countdown display
- [x] Implement start, pause, reset controls
- [x] Add audio alert at completion
- [x] Add color feedback during countdown

## Advanced Timer (Premium)
- [x] Build Advanced Timer screen with interval builder
- [x] Allow up to 10 intervals per timer
- [x] Allow configurable number of rounds
- [x] Implement interval progression logic
- [x] Add sound selection per interval
- [x] Add color selection per interval
- [x] Display current interval and remaining rounds
- [x] Play correct sound and show color for each interval

## Stopwatch (Free)
- [x] Build Stopwatch screen with start, stop, lap, reset
- [x] Display elapsed time and lap times
- [x] Add lap list with clear functionality

## Saved Timers
- [x] Build Saved Timers screen with list of user's saved timers
- [x] Implement save timer functionality from Timer/Advanced Timer
- [x] Implement load timer functionality
- [x] Implement delete timer functionality
- [x] Persist saved timers to database

## Premium Presets
- [x] Create 5 premium presets (Tabata, HIIT, Pomodoro, Warm-up, Cool-down)
- [x] Build Presets screen showing all presets
- [x] Implement "Start" button for each preset (premium only)
- [x] Implement paywall for free users
- [x] Create upgrade flow to premium

## Audio & Visual
- [x] Implement audio alert system with distinct sounds
- [x] Create color palette for intervals
- [x] Implement screen color changes during intervals
- [x] Add smooth transitions between colors

## Testing & Acceptance Checks
- [x] Acceptance Check 1: Free user can save only 5 timers (backend logic implemented)
- [x] Acceptance Check 2: Free user cannot access Advanced Timer (backend blocks creation)
- [x] Acceptance Check 3: Free user can see premium presets but cannot start them (frontend gating)
- [x] Acceptance Check 4: Premium user can save unlimited timers (no limit in backend)
- [x] Acceptance Check 5: Premium user can create advanced timer with up to 10 intervals (frontend enforces limit)
- [x] Acceptance Check 6: Advanced timer moves through every interval, then repeats for selected rounds (frontend logic)
- [x] Acceptance Check 7: Each interval plays its sound and changes screen color (frontend implementation)
- [x] Acceptance Check 8: All 5 premium presets created and startable by Premium users (database seeded)
- [x] Acceptance Check 9: Stopwatch works without Premium (no premium check)
- [x] Acceptance Check 10: Saved timers remain after closing and reopening app (database persistence)

## Polish & Refinement
- [ ] Ensure elegant, refined UI throughout
- [ ] Add smooth animations and transitions
- [ ] Test cross-browser compatibility
- [ ] Optimize performance
- [ ] Fix any bugs found during testing
