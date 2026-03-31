# ⚡ Quick Reference Guide - Return & Cancellation System

## 📁 Files Created (7 files)

### Components (1 file)
- **`components/ReturnOrderModal.jsx`**
  - Return form with reason dropdown, description, image upload
  - 3-day window countdown
  - Image preview and removal
  - Form validation

### API Endpoints (5 files)
- **`app/api/orders/return/route.js`** - POST customer return request
- **`app/api/orders/assign-pickup/route.js`** - POST seller assigns delivery partner
- **`app/api/orders/approve-return/route.js`** - POST seller approves return
- **`app/api/orders/pickup-status/route.js`** - PUT delivery partner updates pickup
- **`app/api/delivery-partners/route.js`** - GET seller's delivery partners

### Documentation (2 files)
- **`RETURN_AND_CANCELLATION_SYSTEM.md`** - Complete system architecture
- **`IMPLEMENTATION_COMPLETE.md`** - Implementation guide with examples

---

## 🔴 Files Modified (3 files)

### Database
- **`prisma/schema.prisma`**
  - Added `ReturnReason` enum (9 values)
  - Added 8 new Order fields for return/pickup tracking

### Components
- **`components/OrderCard.jsx`**
  - Added: "Order Cancelled" badge (red, conditional)
  - Added: Return button (blue, within 3 days)
  - Added: Import ReturnOrderModal
  - Updated: Button layout (flex wrap, responsive)
  - Improved: Track button hidden when cancelled

### Seller Dashboard
- **`app/store/orders/page.jsx`**
  - Added: Tab navigation (All Orders / Pending Cancellations / Returned)
  - Added: Badge counts for pending/returned orders (RED/BLUE)
  - Added: Pickup assignment UI in modal
  - Added: Return info display in modal
  - Added: Filter function for tab switching
  - Updated: Stats calculation for new categories

---

## 🎯 Features at a Glance

### Customer Side
```
Order Delivered 
  ↓
Within 3 days? → Show Return Button
  ↓
Click Return → Fill Form → Submit
  ↓
See Return Status in Orders List
```

### Seller Side
```
Cancellations Tab → Pending Pickups (RED badge count)
  ↓
Click Order → Assign Delivery Partner
  ↓
See Pickup Status

Returns Tab → Return Requests (BLUE badge count)
  ↓
Click Order → Approve → Assign DP
  ↓
Track Pickup
```

### Delivery Partner Side
```
New Pickup Task
  ↓
View in Dashboard
  ↓
Navigate to Customer
  ↓
Pick Up Item
  ↓
Mark Complete in App
```

---

## 📋 Code Examples

### Return Button (OrderCard.jsx)
```jsx
{isReturnEligible() && (
    <button 
        onClick={() => setShowReturnModal(true)}
        className="flex-1 min-w-[70px] px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700"
    >
        <FontAwesomeIcon icon={faUndo} /> Return
    </button>
)}
```

### Cancelled Badge (OrderCard.jsx)
```jsx
{isCancelled && (
    <div className="inline-flex bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded text-xs font-semibold">
        Order Cancelled
    </div>
)}
```

### Tab Navigation (Seller Dashboard)
```jsx
<button onClick={() => setActiveTab('pending-cancellations')}>
    <FontAwesomeIcon icon={faBan} /> Pending Cancellations
    {orderStats.pendingCancellations > 0 && (
        <span className="px-2 py-0.5 text-xs bg-red-600 text-white rounded-full">
            {orderStats.pendingCancellations}
        </span>
    )}
</button>
```

---

## 🔄 Key Database Changes

### Before (Order Model)
```prisma
model Order {
    id            String
    status        OrderStatus
    isCancelled   Boolean
    cancelledAt   DateTime?
    cancellationReason CancellationReason?
    // .. other fields
}
```

### After (Order Model)
```prisma
model Order {
    // ... existing fields ...
    
    // Return Details (NEW)
    returnRequestedAt     DateTime?
    returnReason          ReturnReason?
    returnDescription     String?
    returnImages          String[]
    pickupAssignedTo      String?
    pickupScheduledAt     DateTime?
    pickupCompletedAt     DateTime?
    returnApprovedAt      DateTime?
    refundStatus          PaymentStatus?
}
```

---

## 🚀 Quick Start (For Developers)

1. **Backup your DB** (if production)

2. **Update Prisma Schema**
   ```bash
   npx prisma migrate dev --name add_return_fields
   ```

3. **Test Return Flow**
   - Create a delivered order
   - Within 3 days, see "Return" button
   - Click Return → Fill form → Submit
   - Check seller dashboard "Returned Orders" tab

4. **Test Cancellation Flow**
   - Cancel an order (ORDER_PLACED status)
   - Check "Pending Cancellations" tab
   - Assign delivery partner
   - Verify pickup assigned

---

## ✅ Validation Logic (Server-Side)

### Return Request Validation
- ✅ User is authenticated
- ✅ Order exists
- ✅ User owns the order
- ✅ Order status = DELIVERED
- ✅ Less than 3 days since delivery
- ✅ Order not cancelled
- ✅ No existing return request
- ✅ Reason and description provided

### Pickup Assignment Validation
- ✅ User is authenticated
- ✅ User is seller/store owner
- ✅ Order is cancelled or has return
- ✅ Delivery partner exists
- ✅ Required fields provided

### Pickup Status Update Validation
- ✅ User is authenticated
- ✅ User is the assigned delivery partner
- ✅ Pickup was assigned
- ✅ Status is valid

---

## 🎨 Color Scheme

| Feature | Color | Icon | Usage |
|---------|-------|------|-------|
| Cancel | Red | Ban | Cancelled orders, cancel button |
| Return | Blue | Undo | Return button, return requests |
| Pending | Orange | Bell | Pending orders |
| Delivered | Green | Check | Delivered orders |
| Action | Black | Eye | View details button |
| Track | Dark Gray | Truck | Track shipment |

---

## 📊 Statistics Displayed

### All Orders Tab
- Total Orders
- Pending (ORDER_PLACED)
- Processing (PROCESSING)
- Shipped (SHIPPED)
- Delivered (DELIVERED)
- Cancelled (isCancelled=true)

### Pending Cancellations Tab
- Count badge (RED): `orders where isCancelled && !pickupAssignedTo`

### Returned Orders Tab
- Count badge (BLUE): `orders where returnRequestedAt is set`

---

## 🔐 Security Checklist

✅ Endpoint Authorization
- All endpoints check `auth()`
- Sellers verified against store
- Delivery partners verified against assignment

✅ Data Validation
- All inputs validated server-side
- Status transitions checked
- Time window (3 days) enforced server-side

✅ Ownership Checks
- Customers can only access own orders
- Sellers can only manage own store orders
- Delivery partners can only pickup assigned orders

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- Return/Cancel buttons stack vertically
- Modals full-width with padding
- Tab text shows with badges
- Images in grid of 3

### Desktop (≥ 768px)
- Buttons wrap responsively
- Modals centered with max-width
- Statistics in 6-column grid
- Easier form interaction

---

## 🧪 Testing Checklist

- [ ] Create test order
- [ ] Wait 2 days (or adjust system date)
- [ ] Check "Return" button appears
- [ ] Submit return form
- [ ] Check seller dashboard
- [ ] Approve return
- [ ] Assign delivery partner
- [ ] Mark pickup complete
- [ ] Verify on mobile
- [ ] Verify on desktop

---

## 🎯 Important Reminders

⚠️ **MUST DO BEFORE PRODUCTION**
- [ ] Run `npx prisma migrate dev`
- [ ] Test all 3 user roles (customer, seller, DP)
- [ ] Check 3-day window logic
- [ ] Verify modal images upload

---

## 📚 Documentation Files

1. **RETURN_AND_CANCELLATION_SYSTEM.md**
   - Complete architecture
   - All features detailed
   - Data flow diagrams
   - Component checklist

2. **IMPLEMENTATION_COMPLETE.md**
   - Step-by-step implementation guide
   - Code examples
   - API endpoint reference
   - Sample delivery partner dashboard
   - Testing scenarios

3. **This File (QUICK_REFERENCE.md)**
   - Quick lookup
   - Code snippets
   - File locations
   - Validation logic

---

## 🎓 Architecture Pattern Used

```
Order Screen
├── OrderCard (Component)
│   ├── Return Button → ReturnOrderModal
│   ├── Cancel Button → CancelOrderModal (existing)
│   └── Cancelled Badge
│
Seller Dashboard (New Tabs)
├── All Orders Tab
├── Pending Cancellations Tab (Red badge)
│   └── Pickup Assignment UI
└── Returned Orders Tab (Blue badge)
    └── Return Approval UI

API Layer
├── POST /api/orders/return
├── POST /api/orders/assign-pickup
├── POST /api/orders/approve-return
├── PUT /api/orders/pickup-status
└── GET /api/delivery-partners
```

---

## 💡 Pro Tips

1. **Badge Counts Update**: Uses `orders.filter()` - add refetch after updates
2. **Modal State**: Use `showReturnModal` state instead of full modal component
3. **Image Upload**: Ensure `/api/upload` endpoint exists
4. **Responsive Buttons**: Use `flex-wrap gap-2` with `min-w-[70px]` for clean layout
5. **Date Check**: Days since delivery: `Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24))`

---

## ❓ FAQ

**Q: What if order is in transit when return requested?**
A: Return button won't show (requires DELIVERED status)

**Q: Can seller cancel an order after delivery?**
A: No, only customers can initiate returns after delivery. Sellers manage cancellations before shipping.

**Q: What happens to money when return is submitted?**
A: Logic in your refund system (not in this code). Track with `refundStatus` field.

**Q: Can customer modify return request?**
A: No, once submitted, seller must approve/reject. Add update endpoint if needed.

**Q: How do delivery partners get notified?**
A: Add webhook/email notification. This code just tracks assignments.

---

## 📞 Support Reference

- **Return Window**: 3 days from `deliveryCompletedAt`
- **Cancelled Order Status**: Check `isCancelled` boolean (not `status`)
- **Pickup Tracked**: `pickupAssignedTo` (DP ID) + `pickupCompletedAt` (timestamp)
- **Return Tracked**: `returnRequestedAt` + `returnApprovedAt`+  `pickupCompletedAt`

