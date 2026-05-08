# Task: api-fav-notif - Favorites, Notifications & Admin Stats API Routes

## Summary
Successfully created all 5 API route files for the Plantão Help healthcare shift marketplace.

## Files Created

### 1. `src/app/api/favorites/route.ts`
- **GET**: Lists favorites for a user (`?userId=xxx`), includes shift details (seller, buyer, hospital) with seller avgRating calculation (same pattern as shifts API)
- **POST**: Adds a favorite (`{ userId, shiftId }`), validates user/shift existence, prevents duplicates (409 on conflict)

### 2. `src/app/api/favorites/[shiftId]/route.ts`
- **DELETE**: Removes a favorite using `?userId=xxx` query param + `shiftId` from URL, uses the `userId_shiftId` compound unique key

### 3. `src/app/api/notifications/route.ts`
- **GET**: Lists notifications for a user (`?userId=xxx`), ordered by `createdAt` desc
- **POST**: Creates a notification (`{ userId, title, message, type }`), validates type is one of INFO/SUCCESS/WARNING, validates user existence

### 4. `src/app/api/notifications/[id]/read/route.ts`
- **PUT**: Marks a notification as read, requires `{ userId }` in body, verifies notification belongs to user (403 if mismatch)

### 5. `src/app/api/admin/stats/route.ts`
- **GET**: Returns admin dashboard statistics (`?adminId=xxx`), verifies admin role (403 if not admin)
- Returns: totalUsers (by role breakdown), totalShifts (by status breakdown), totalContests (by status breakdown), totalHospitals, totalLocations, totalRatings, recentRegistrations (last 5 pending users), recentShifts (last 5 shifts with seller/buyer/hospital), averageShiftValue, revenue (sum of SOLD shift values)

## Patterns Used
- `import { db } from '@/lib/db'` for database access
- `import { NextRequest, NextResponse } from 'next/server'` for request/response
- Standard Next.js Route Handler pattern with `params: Promise<{ id: string }>`
- Seller avgRating calculation matches the shifts API pattern exactly
- Error responses with Portuguese messages matching existing codebase style
- Parallel queries with `Promise.all` in admin stats for performance

## Verification
- Lint passes cleanly (`bun run lint` - no errors)
- Dev server running without issues
- Worklog updated with task details
