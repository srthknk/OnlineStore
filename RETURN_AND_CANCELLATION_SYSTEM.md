# Comprehensive Return & Cancellation System Architecture

## 🎯 Features Implemented

### 1. **User End (Customer)**

#### Order Card Enhancements
- ✅ **"Order Cancelled" Badge**: Shows when order.isCancelled = true
- ✅ **Return Button**: Appears when:
  - Order status = DELIVERED
  - Less than 3 days since delivery
  - Order not already cancelled
  - No existing return request
- ✅ **Responsive Button Layout**: Buttons flex-wrap with min-width for clean mobile/desktop display
- ✅ **Track Button Hidden**: When order is cancelled

#### Return Order Modal
- ✅ Return reason dropdown (DEFECTIVE_PRODUCT, NOT_AS_DESCRIBED, WRONG_ITEM_RECEIVED, etc.)
- ✅ Description textarea (max 500 chars)
- ✅ Image upload (max 3 images, with preview)
- ✅ Days remaining countdown (3 days from delivery)
- ✅ Form validation
- ✅ API integration for return submission

### 2. **Seller Dashboard**

#### Tab Navigation
- ✅ **All Orders Tab**: All active orders with status statistics
- ✅ **Pending Cancellations Tab**: Orders where isCancelled=true & no pickup assigned (with badge count)
- ✅ **Returned Orders Tab**: Orders where returnRequestedAt is set (with badge count)

#### Pending Cancellations Section
- ✅ Dropdown to select delivery partner for pickup
- ✅ Assign button to assign partner to cancellation pickup
- ✅ Shows assigned partner if already assigned
- ✅ Pickup scheduled date tracking

#### Return Orders Section
- ✅ Shows return reason and customer message
- ✅ Approve/reject return functionality
- ✅ Return approval date tracking

#### Order Statistics
- ✅ Pending cancellations count badge
- ✅ Returned orders count badge
- ✅ Color-coded tabs for different sections

### 3. **Database Schema Updates** (Prisma)

#### New Enums
- ✅ ReturnReason: DEFECTIVE_PRODUCT, NOT_AS_DESCRIBED, WRONG_ITEM_RECEIVED, MISSING_PARTS, SIZE_NOT_FIT, QUALITY_ISSUE, DAMAGED_PACKAGING, CHANGED_MIND, OTHER_REASON

#### New Order Fields
```prisma
// Return Details
returnRequestedAt     DateTime?          // When return was requested
returnReason          ReturnReason?      // Reason enum
returnDescription     String?            // Customer's description
returnImages          String[]           // Array of image URLs
pickupAssignedTo      String?            // Delivery partner ID
pickupScheduledAt     DateTime?          // When pickup is scheduled
pickupCompletedAt     DateTime?          // When pickup was completed
returnApprovedAt      DateTime?          // When seller approved return
refundStatus          PaymentStatus?     // Refund status (PENDING, SUCCESS, FAILED, REFUNDED)
```

---

## ⚙️ API Endpoints Needed

### POST /api/orders/return
**Purpose**: Customer submits return request
```json
{
  "orderId": "...",
  "reason": "DEFECTIVE_PRODUCT",
  "description": "Product has defects...",
  "images": ["url1", "url2", "url3"]
}
```
**Response**: Order updated with returnRequestedAt, returnReason, etc.

### POST /api/orders/{id}/assign-pickup
**Purpose**: Seller assigns delivery partner for pickup
```json
{
  "orderId": "...",
  "deliveryPartnerId": "...",
  "pickupScheduledAt": "2026-04-05T10:00:00Z"
}
```
**Response**: Order updated with pickupAssignedTo and pickupScheduledAt

### POST /api/orders/{id}/approve-return
**Purpose**: Seller approves return request
```json
{
  "orderId": "..."
}
```
**Response**: Order updated with returnApprovedAt

### PUT /api/orders/{id}/pickup-status
**Purpose**: Delivery partner updates pickup status
```json
{
  "orderId": "...",
  "status": "PICKED_UP", // or "COMPLETED"
  "notes": "Item picked up successfully"
}
```
**Response**: Order updated with pickupCompletedAt

### POST /api/upload
**Purpose**: Upload images for return evidence
```form-data
{
  "file": File
}
```
**Response**: { "url": "..." }

### GET /api/orders/pending-cancellations
**Purpose**: Get list of orders pending pickup assignment
**Response**: Orders array filtered by isCancelled=true & !pickupAssignedTo

### GET /api/orders/returned
**Purpose**: Get list of returned orders
**Response**: Orders array filtered by returnRequestedAt is set

### GET /api/delivery-partners
**Purpose**: Get seller's delivery partners for pickup assignment
**Response**: DeliveryPartner array

---

## 🔄 Order State Flow

### Cancellation Flow
```
ORDER_PLACED/PROCESSING 
  ↓ (User clicks Cancel)
User sees CancelOrderModal → Submits → API /api/orders/cancel
  ↓
Order: isCancelled=true, cancelledAt=now, cancelledBy='buyer'
  ↓ (Seller assigns pickup)
API /api/orders/{id}/assign-pickup → pickupAssignedTo='DP-001'
  ↓ (Delivery partner picks up)
API /api/orders/{id}/pickup-status → pickupCompletedAt=now
  ↓
Refund processed → refundStatus=SUCCESS
```

### Return Flow
```
DELIVERED (within 3 days)
  ↓ (User clicks Return)
User sees ReturnOrderModal → Submits with reason, description, images
  ↓
API /api/orders/return → returnRequestedAt=now, returnReason, returnDescription, returnImages
  ↓ (Seller approves)
API /api/orders/{id}/approve-return → returnApprovedAt=now
  ↓ (Seller assigns pickup)
API /api/orders/{id}/assign-pickup → pickupAssignedTo='DP-001'
  ↓ (Delivery partner picks up)
API /api/orders/{id}/pickup-status → pickupCompletedAt=now
  ↓
Refund processed → refundStatus=SUCCESS
```

---

## 📦 Delivery Partner Dashboard Integration

### Things Delivery Partner Sees:
1. **Pickup Tasks**: Orders where `pickupAssignedTo` = their ID
2. **Cancelled Orders**: For quick pickup
3. **Returned Orders**: For collection with pickup status
4. **Task Status Updates**: Mark as picked up/completed

### New Endpoints for Delivery Partner:
- GET /api/delivery-partner/pickups
- PUT /api/delivery-partner/pickups/{id}/status

---

## 🎨 UX Flow Summary

### Customer Journey
1. Order Delivered ↓
2. Within 3 days: See "Return" button ↓
3. Click Return → Fill form → Submit ↓
4. See "Return Requested" status ↓
5. Wait for seller approval & pickup ↓
6. Delivery partner picks up ↓
7. Receive refund

### Seller Journey  
1. See "Pending Cancellations" tab with badge ↓
2. Click order → See pickup assignment form ↓
3. Select delivery partner & assign ↓
4. See "Returned Orders" tab ↓
5. Approve return requests ↓
6. Track pickup status ↓
7. Process refunds

### Delivery Partner Journey
1. Receive pickup task (email/notification) ↓
2. Go to Dashboard → See pending pickups ↓
3. Navigate to address ↓
4. Pick up item ↓
5. Update status in app ↓
6. Complete task

---

## ✅ Component Checklist

### Created:
- ✅ ReturnOrderModal.jsx

### Updated:
- ✅ OrderCard.jsx (added return button, cancelled badge)
- ✅ app/(public)/orders/page.jsx (no changes needed - parent already passes callbacks)
- ✅ app/store/orders/page.jsx (added tabs, pending cancellations, returned orders)
- ✅ prisma/schema.prisma (added Return fields and enums)

### To Create (API Endpoints):
- [ ] /api/orders/return (POST)
- [ ] /api/orders/{id}/assign-pickup (POST)
- [ ] /api/orders/{id}/approve-return (POST)
- [ ] /api/orders/{id}/pickup-status (PUT)
- [ ] /api/delivery-partners (GET)
- [ ] /api/delivery-partner/pickups (GET)

---

## 🚀 Next Steps

1. **Run Migration**: `npx prisma migrate dev --name add_returns`
2. **Create API Endpoints**: Implement the 6 remaining endpoints
3. **Test Return Flow**: End-to-end testing
4. **Add Delivery Partner UI**: Show pickups in delivery partner dashboard
5. **Add Refund Logic**: Process refunds when pickup completed
6. **Add Notifications**: Email/SMS notifications at each stage

---

## 📋 Technical Notes

- **3-Day Return Window**: Calculated from `deliveryCompletedAt` or `createdAt`
- **Image Upload**: Uses existing ImageKit integration
- **Responsive Design**: Mobile-first with flex-wrap buttons
- **State Management**: React local state for UI, DB for persistence
- **Authentication**: Clerk for user/seller/delivery partner roles
- **Icon Set**: FontAwesome (faUndo for return, faBan for cancelled)

---

## 🔐 Security Considerations

- Only customers can request returns (validate `userId`)
- Only sellers can approve returns (validate store ownership)
- Only assigned delivery partners can update pickup status
- Validate order status before allowing operations
- Prevent return requests if already cancelled or returned
- Rate limit return request submissions

