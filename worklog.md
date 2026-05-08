# Plantão Help - Worklog

## Project Status
**Status**: Fully functional MVP
**Last Updated**: Initial release

## Current State
- Complete marketplace for healthcare shifts (plantões) with all core features working
- Database seeded with sample data (10 hospitals, 10 locations, 14 shifts, 7 contests, 8 users)
- All API endpoints functional
- Frontend fully responsive with mobile-first design
- Admin panel operational

## Architecture
- **Frontend**: Single-page application (Next.js 16) with tab-based navigation and bottom nav bar
- **Backend**: Next.js API routes with Prisma ORM (SQLite)
- **State**: Zustand with persist middleware for auth state
- **Theme**: Emerald/green healthcare theme
- **UI**: shadcn/ui components + Lucide icons + Framer Motion transitions

## Key Features Implemented
1. **User Registration/Login** - With role selection (Médico, Enfermeiro, Téc. Enfermagem, Empresa)
2. **Shift Marketplace** - Browse, search, filter by city/state/type, create, buy, cancel shifts
3. **Rating System** - Star ratings (1-5) with comments on completed transactions
4. **Contests Section** - Filtered by user's professional type and region
5. **Profile Page** - Shows user info, registration status, ratings received
6. **Admin Panel** - User approval, hospital CRUD, contest CRUD, location management, fee management
7. **Location-based Filtering** - Shifts and contests filtered by city/state
8. **Registration Fees** - Different fees per professional type
9. **Bottom Navigation** - Mobile-app style navigation with admin tab for admins
10. **Pending Approval Workflow** - Users need admin approval before they can fully use the system

## Test Credentials
- **Admin**: admin@plantaohelp.com / admin123
- **Doctor**: dr.silva@medico.com / 123456
- **Nurse**: maria@enfermeiro.com / 123456
- **Technician**: lucas@tecnico.com / 123456

## Files Structure
- `src/app/page.tsx` - Main single-page app with tab content
- `src/components/top-header.tsx` - Fixed top header with logo and user info
- `src/components/bottom-nav.tsx` - Fixed bottom navigation (5 tabs + admin)
- `src/components/auth-modal.tsx` - Login/register dialog
- `src/components/home-tab.tsx` - Dashboard with stats, featured shifts, quick actions
- `src/components/plantoes-tab.tsx` - Shift marketplace with search and filters
- `src/components/shift-detail.tsx` - Full shift detail with buy/cancel/rate
- `src/components/concursos-tab.tsx` - Contests listing with filters
- `src/components/meus-plantoes-tab.tsx` - My shifts (published and bought)
- `src/components/perfil-tab.tsx` - User profile with info and ratings
- `src/components/admin-tab.tsx` - Admin panel (5 sub-sections)
- `src/lib/store.ts` - Zustand store
- `src/lib/utils.ts` - Utility functions
- `src/app/api/` - All API routes
- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Seed data script

## API Routes - Favorites, Notifications & Admin Stats (Task: api-fav-notif)
- **Created**: 2024-01-XX by api-fav-notif agent
- **Files Added**:
  - `src/app/api/favorites/route.ts` - GET (list user favorites with shift details + seller avgRating) and POST (add favorite)
  - `src/app/api/favorites/[shiftId]/route.ts` - DELETE (remove favorite by userId + shiftId)
  - `src/app/api/notifications/route.ts` - GET (list user notifications, ordered by createdAt desc) and POST (create notification with type INFO/SUCCESS/WARNING)
  - `src/app/api/notifications/[id]/read/route.ts` - PUT (mark notification as read, verifies userId ownership)
  - `src/app/api/admin/stats/route.ts` - GET (admin dashboard stats with role verification: totalUsers by role, totalShifts by status, totalContests by status, totalHospitals, totalLocations, totalRatings, recentRegistrations, recentShifts, averageShiftValue, revenue)
- **Patterns Followed**: Same as existing shifts API for seller avgRating calculation, standard Next.js Route Handler pattern with `db` from `@/lib/db`

## Unresolved Issues / Next Steps
1. **Authentication**: Currently using simple email/password comparison (no JWT/sessions) - should add proper auth for production
2. **File Uploads**: Document upload (CRM, COREN, CPF) not yet implemented - currently text fields only
3. **Payment Integration**: Registration fees are displayed but no payment processing
4. **Push Notifications**: No notification system for shift updates or approval status changes
5. **Map Integration**: Hospital/shift locations could benefit from map visualization
6. **Chat/Messaging**: No direct communication between buyer and seller
7. **Shift Scheduling**: Could add recurring shift patterns
8. **Analytics Dashboard**: Admin could benefit from more detailed analytics
9. **Email Verification**: No email verification on registration
10. **Dark Mode**: Theme variables are set but no toggle implemented
