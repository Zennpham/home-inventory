#  The Master Guide: Apple Shortcuts & Automation

This guide provides a professional setup for native iOS/macOS notifications using your Home Inventory API.

## 1. The API Endpoint
Your system provides a specialized, flat JSON endpoint for notifications:
- **URL**: `http://YOUR_LOCAL_IP:5050/api/notifications`
- **Method**: `GET`
- **Format**: Array of alerts (Low Stock, Expiry, Renewal).

---

## 2. Setting Up the Shortcut (iOS/macOS)

### A. Fetch & Notify (Manual or Tap)
1. **Get Contents of URL**: Set to your API URL.
2. **Repeat with Each Item** (in the URL contents).
3. **Show Notification**:
   - **Title**: `Title` (from the item)
   - **Body**: `Message` (from the item)
   - **Sound**: Enabled.
4. **Get Contents of URL** (Optional): 
   - **Method**: `PATCH`
   - **Body**: `{"ids": ["LIST_OF_IDS"]}`
   - *This marks them as read so you don't get the same alert twice.*

### B. The Automation (The "Hands-Free" Way)
1. Go to **Shortcuts App** > **Automation**.
2. Create **New Automation** > **Time of Day** (e.g., 8:00 AM).
3. Set it to **Run Immediately** (Next.js/Shortcuts won't ask for permission).
4. For the **Action**, select the "Fetch & Notify" shortcut you created above.

---

## 3. The "Live View" (MongoDB Atlas Trigger)
To ensure the database identifies expiring items even without the app running, set up a **Scheduled Trigger**:

### Step-by-Step Atlas Setup:
1. Log in to **MongoDB Atlas**.
2. Go to **Triggers** (Sidebar) > **Add Trigger**.
3. **Trigger Type**: Scheduled.
4. **Schedule Type**: Basic (Every 24 hours).
5. **Function Content**: Use the script below.

### The Automation Script:
```javascript
exports = async function() {
  const mongodb = context.services.get("mongodb-atlas");
  const items = mongodb.db("HomeInv").collection("items");
  const notifications = mongodb.db("HomeInv").collection("notifications");
  const subscriptions = mongodb.db("HomeInv").collection("subscriptions");

  const now = new Date();
  const alertThreshold = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days

  // 1. Find Low Stock Items
  const lowStock = await items.find({ $expr: { $lte: ["$quantity", "$minStock"] } }).toArray();
  for (const item of lowStock) {
    await notifications.updateOne(
      { itemId: item._id, type: "low-stock", read: false },
      { $setOnInsert: { title: "Low Stock", message: `${item.name} is running low`, type: "low-stock", createdAt: new Date() } },
      { upsert: true }
    );
  }

  // 2. Find Expiring Subscriptions
  const renewals = await subscriptions.find({ renewalDate: { $lte: alertThreshold, $gte: now } }).toArray();
  for (const sub of renewals) {
    await notifications.updateOne(
        { message: { $regex: sub.serviceName }, read: false },
        { $setOnInsert: { title: "Subscription Renewal", message: `${sub.serviceName} will renew soon`, type: "expiry", createdAt: new Date() } },
        { upsert: true }
    );
  }
};
```

---

## 4. Pro Tip: Dynamic Summary
Instead of 10 notifications, you can set the Shortcut to "Combine Text" and show one single dynamic summary of your morning tasks.

> [!TIP]
> Use the **Widget** on your iPhone Home Screen to trigger a "Check Inventory" scan every morning with one tap!
