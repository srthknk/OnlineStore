# Dynamic Alert Notifications System - Setup Guide

## What Was Changed

### 1. **Removed Static Banners**
   - ❌ Removed green "Premium Quality Groceries" banner from Navbar
   - ❌ Removed purple "Get 20% OFF" offer banner from Banner.jsx

### 2. **Created Dynamic Alert System**

#### New Files Created:
- 📄 `components/AlertBanner.jsx` - Dynamic banner that fetches alerts
- 📄 `app/api/alerts/active/route.js` - Public endpoint to fetch active alerts
- 📄 `app/api/admin/alerts/route.js` - Admin endpoint to create/list alerts
- 📄 `app/api/admin/alerts/[id]/route.js` - Admin endpoint to update/delete alerts
- 📄 `app/admin/alerts/page.jsx` - Admin panel UI for managing alerts

#### Files Modified:
- 📝 `prisma/schema.prisma` - Added Alert model
- 📝 `app/(public)/layout.jsx` - Replaced Banner with AlertBanner
- 📝 `components/Navbar.jsx` - Removed green top bar

### 3. **Database Schema**

Added new Alert model with fields:
```prisma
model Alert {
    id          String      @id @default(cuid())
    title       String      // Main message
    message     String      // Detailed message
    type        AlertType   // INFO, WARNING, PROMOTION, URGENT
    bgColor     String      // Tailwind gradient class
    textColor   String      // Text color (e.g., "text-white")
    isActive    Boolean     @default(true)
    icon        String?     // Emoji icon
    priority    Int         @default(1) // Higher = shown first
    createdBy   String      // Admin user ID
    createdAt   DateTime
    updatedAt   DateTime
    expiresAt   DateTime?   // Optional expiry
}
```

## Setup Instructions

### Step 1: Run Database Migration
```bash
npx prisma migrate dev --name add_alerts
```

### Step 2: Access Admin Panel
Go to: `http://localhost:3000/admin/alerts`

### Step 3: Create Your First Alert
1. Click "Create Alert" button
2. Fill in:
   - **Title**: e.g., "500 Rs Off Today"
   - **Message**: e.g., "Use code SAVE500 for 500 rs discount"
   - **Type**: Choose from INFO, WARNING, PROMOTION, or URGENT
   - **Background Color**: Select gradient color
   - **Icon**: Add emoji (e.g., 🎉, ⚠️, 📢)
   - **Priority**: Higher number shows first
   - **Expires At**: Optional date when alert auto-deactivates
   - **Active**: Toggle to show/hide without deleting

### Step 4: Alerts Will Display
The alert will automatically appear as a banner on the homepage with:
- Beautiful gradient background
- Icon and title
- Detailed message
- Close button for users to dismiss

## API Endpoints

### Public Endpoints
- `GET /api/alerts/active` - Fetch the highest priority active alert

### Admin Endpoints
- `GET /api/admin/alerts` - List all alerts
- `POST /api/admin/alerts` - Create new alert
- `PUT /api/admin/alerts/[id]` - Update alert
- `DELETE /api/admin/alerts/[id]` - Delete alert

## Features

✅ **Dynamic Content** - Admin can create/edit alerts anytime
✅ **Priority System** - Higher priority alerts show first
✅ **Auto Expiry** - Set expiration dates for time-limited offers
✅ **Customizable Colors** - 5 gradient color presets
✅ **Alert Types** - INFO, WARNING, PROMOTION, URGENT
✅ **Emoji Support** - Add emojis for visual appeal
✅ **Close Button** - Users can dismiss alerts
✅ **Active Toggle** - Deactivate without deleting

## Example Alerts

### Offer
```
Title: 500 Rs Off Today
Message: Use code SAVE500 on all products
Type: PROMOTION
Icon: 🎉
```

### Delivery Alert
```
Title: Delivery Delays Expected
Message: Due to heavy rain, delivery might be delayed by 1-2 days
Type: WARNING
Icon: ⚠️
```

### System Alert
```
Title: Maintenance Notice
Message: Site maintenance happening tonight 11 PM - 2 AM
Type: URGENT
Icon: 📢
```

## Troubleshooting

### Migration Failed?
```bash
# Reset and try again (WARNING: deletes all data)
npx prisma migrate reset
npx prisma migrate dev --name add_alerts
```

### Alerts Not Showing?
1. Check if alert is Active in admin panel
2. Check priority and expiration date
3. Open browser DevTools → Network → check `/api/alerts/active` call
4. Check if alert is expired

### Need Help?
Check the console logs in browser DevTools (F12 → Console tab)
