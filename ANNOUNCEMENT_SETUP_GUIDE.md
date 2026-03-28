# Announcement System - Setup & Implementation Guide

## 📋 What Was Created

A complete announcement system allowing super admins to send targeted announcements to stores with real-time notifications for sellers.

---

## 🚀 Installation Steps

### Step 1: Generate Prisma Migration
Run this command to create the database migration:

```bash
cd d:\EcommerceDemoShop-main\EcommerceDemoShop-main
npx prisma migrate dev --name add_announcements
```

This will:
- Create the 4 new database tables (Announcement, AnnouncementStore, AnnouncementRead)
- Update the Store table with new relationships
- Generate Prisma client

---

## 📁 Files Created/Modified

### New Files Created:
```
app/api/admin/announcements/route.js
app/api/store/announcements/route.js
app/admin/announcements/page.jsx
app/store/announcements/page.jsx
components/admin/AdminAnnouncementsTab.jsx
components/store/StoreAnnouncementsTab.jsx
components/store/StoreAnnouncementsBadge.jsx
```

### Modified Files:
```
prisma/schema.prisma                    (Added 4 models + enums)
components/admin/AdminSidebar.jsx       (Added Announcements link)
components/store/StoreSidebar.jsx       (Added Announcements link)
components/store/StoreNavbar.jsx        (Added badge component)
```

---

## 👨‍💻 Admin Usage

### Creating Announcements
1. Go to **Admin Panel** → **Announcements** tab
2. Click **"New Announcement"** button
3. Fill in:
   - **Title**: Announcement headline
   - **Type**: Select urgency level (Normal/Urgent/Highly Urgent)
   - **Content**: Write announcement (preserves formatting & spaces)
   - **Stores**: Select 1 or multiple stores
4. Click **"Send Announcement"**

### Managing Announcements
- **View Details**: Click "Show Details" to see full content & recipient stores
- **Archive**: Click trash icon to archive (soft delete)
- **Filter**: Switch between Active/Archived tabs
- **Track**: See read count for each store

---

## 🏪 Seller/Store Usage

### Viewing Announcements
1. **Badge Icon**: Look for bell icon in top navbar showing unread count
2. **Go to Announcements**: Click the bell or navigate to Announcements tab
3. **View Details**: Click any announcement to see full content
4. **Mark Status**: Choose "Mark as Read" or "Mark as Seen"

### Badge Behavior
- Shows red badge with unread count (1-99+)
- Auto-decreases when you read announcements
- Refreshes every 20 seconds
- Visible in both desktop navbar and sidebar

---

## 🎨 UI/UX Features

### Color Coding by Type:
- **Normal** (Blue): Standard announcements
- **Urgent** (Orange): Requires attention
- **Highly Urgent** (Red): Critical alerts

### Visual Indicators:
- Green checkmark: Announcement read
- Red dot: Unread announcement
- Badge number: Unread count

### Formatting:
- Content preserves exactly as typed (spaces, line breaks, paragraphs)
- Uses monospace font for clear readability
- Maximum height with scrollable view

---

## 🔍 Database Schema

### Announcement Model
```javascript
{
  id: String (unique)
  title: String
  content: String (preserves formatting)
  type: AnnouncementType (enum)
  createdBy: String (admin userId)
  createdAt: DateTime
  status: AnnouncementStatus ('ACTIVE' or 'ARCHIVED')
  storeAnnouncements: AnnouncementStore[]
}
```

### AnnouncementStore Model (Junction)
```javascript
{
  id: String (unique)
  announcementId: String (FK)
  storeId: String (FK)
  reads: AnnouncementRead[]
}
```

### AnnouncementRead Model
```javascript
{
  id: String (unique)
  announcementStoreId: String (FK)
  storeId: String (FK)
  readAt: DateTime
  status: String ('read', 'seen', 'dismissed')
}
```

---

## 📡 API Endpoints

### Admin Endpoints

**GET /api/admin/announcements**
```
Query: page=1, limit=10, type=NORMAL, status=ACTIVE
Response: { data[], pagination{}, counts{} }
```

**POST /api/admin/announcements**
```
Body: { title, content, type, storeIds[] }
Response: { success, message, data }
```

**DELETE /api/admin/announcements?id=xyz**
```
Response: { success, message }
```

### Store Endpoints

**GET /api/store/announcements**
```
Query: includeRead=false
Response: { data[], counts{ total, unread, read } }
```

**POST /api/store/announcements**
```
Body: { announcementStoreId, action }
Response: { success, message, data }
```

---

## 🧪 Testing Scenarios

### Scenario 1: Single Store Announcement
1. Create announcement for Store 1
2. Login as Store 1 seller
3. Verify badge shows "1"
4. View announcement
5. Mark as read
6. Verify badge disappears

### Scenario 2: Multi-Store Announcement
1. Create announcement for Stores 1, 2, 3
2. Login as each seller
3. Verify all receive same announcement
4. Test independent read tracking

### Scenario 3: Urgent Announcement
1. Create "Highly Urgent" announcement
2. Verify red badge appears
3. Verify urgent styling in announcement list

### Scenario 4: Archive Feature
1. Create announcement
2. Archive it
3. Verify it moves to Archived tab
4. Verify sellers don't see archived announcements

---

## ⚙️ Configuration

### Auto-Refresh Intervals:
- Seller sidebar/dashboard: Every 30 seconds
- Navbar badge: Every 20 seconds
- Mobile: Same intervals

### Pagination:
- Admin list: 10 announcements per page
- Easily expandable in API endpoint

### Limits:
- Max characters: No hard limit (uses TEXT in database)
- Max stores per announcement: No limit
- Badge display: Shows 99+ for very high counts

---

## 🐛 Troubleshooting

### Badge not showing?
- Clear browser cache
- Hard refresh page (Ctrl+Shift+R)
- Check authentication token
- Verify route is `/store/announcements`

### Announcements not appearing?
- Verify migration ran: `npx prisma db push`
- Check user is logged in as seller
- Verify store is active (`isActive: true`)
- Check announcement type and status

### Content formatting not preserved?
- Use monospace font (currently set)
- Test with simple text first
- Check textarea value is being captured

---

## 📝 Notes

- All timestamps use UTC
- Announcements are soft-deleted (archived, not removed)
- Read tracking is per-store (not per individual)
- Content supports up to 65,535 characters (LONGTEXT)
- No file uploads currently (text only)

---

## 🚀 Future Enhancements

Consider adding:
1. Scheduled announcements (send at specific time)
2. File attachments (PDFs, images)
3. Announcement analytics (view rates, click rates)
4. Email notifications for urgent announcements
5. Drill-down patterns (by category or performance)
6. Search/filter in seller view

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Migration ran successfully: `npx prisma studio`
- [ ] Admin can navigate to `/admin/announcements`
- [ ] Seller can navigate to `/store/announcements`
- [ ] Bell badge appears in store navbar
- [ ] Create announcement works
- [ ] Multi-store selection works
- [ ] Formatting is preserved in seller view
- [ ] Read tracking works
- [ ] Badge count decrements on read
- [ ] Archive functionality works
- [ ] Mobile responsive on small screens
- [ ] No console errors
- [ ] Real-time updates working

---

## 📞 Support

For issues:
1. Check browser console for errors
2. Verify Prisma migration completed
3. Check authentication is working
4. Review API responses in Network tab
5. Check database has new tables

