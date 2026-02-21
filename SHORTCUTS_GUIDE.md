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
  const mongodb = context.services.get("Cluster0"); // Thay "Cluster0" bằng tên service của bạn
  const items = mongodb.db("HomeInv").collection("items");
  const notifications = mongodb.db("HomeInv").collection("notifications");
  const subscriptions = mongodb.db("HomeInv").collection("subscriptions");

  const now = new Date();
  const alertThreshold = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days

  // 1. Low Stock (with Quantity details)
  const lowStock = await items.find({ $expr: { $lte: ["$quantity", "$minStock"] } }).toArray();
  for (const item of lowStock) {
    await notifications.updateOne(
      { itemId: item._id, type: "low-stock" }, // Removed read: false requirement
      { 
          $set: { 
              message: `${item.name} is low: only ${item.quantity} ${item.unit} left (Min: ${item.minStock})`,
              read: false, // Force make it unread (New Notification)
              updatedAt: new Date()
          },
          $setOnInsert: { 
              title: "Low Stock Alert", 
              type: "low-stock", 
              createdAt: new Date() 
          }
      },
      { upsert: true }
    );
  }

  // 2. Expiring Subscriptions (with Days Left)
  const renewals = await subscriptions.find({ renewalDate: { $lte: alertThreshold, $gte: now } }).toArray();
  for (const sub of renewals) {
    const daysLeft = Math.ceil((new Date(sub.renewalDate) - now) / (1000 * 60 * 60 * 24));
    await notifications.updateOne(
        { message: { $regex: sub.serviceName } },
        { 
            $set: { 
                message: `${sub.serviceName} renews in ${daysLeft} days ($${sub.price})`, 
                read: false,
                updatedAt: new Date()
            },
            $setOnInsert: { 
                title: "Subscription Renewal", 
                type: "expiry", 
                createdAt: new Date() 
            }
        },
        { upsert: true }
    );
  }

  // 3. Expiring Items & Batches
  const expiringItems = await items.find({
    $or: [
      { expiryDate: { $lte: alertThreshold, $gte: now } },
      { "batches.expiryDate": { $lte: alertThreshold, $gte: now } }
    ]
  }).toArray();

  let expiryCount = 0;

  for (const item of expiringItems) {
    // Check Root Expiry
    if (item.expiryDate && new Date(item.expiryDate) <= alertThreshold && new Date(item.expiryDate) >= now) {
        const daysLeft = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
        await notifications.updateOne(
            { itemId: item._id, type: "expiry", title: "Item Expiring" },
            { 
               $set: { 
                 message: `${item.name} expires in ${daysLeft} days`, 
                 read: false, // Nag user again
                 updatedAt: new Date()
               },
               $setOnInsert: { 
                 title: "Item Expiring", 
                 type: "expiry", 
                 locationName: "Inventory", 
                 createdAt: new Date() 
               }
            },
            { upsert: true }
        );
        expiryCount++;
    }

    // Check Batches
    if (item.batches && item.batches.length > 0) {
        for (const batch of item.batches) {
            if (batch.expiryDate && new Date(batch.expiryDate) <= alertThreshold && new Date(batch.expiryDate) >= now) {
                const daysLeft = Math.ceil((new Date(batch.expiryDate) - now) / (1000 * 60 * 60 * 24));
                await notifications.updateOne(
                    { itemId: item._id, title: "Batch Expiring", message: { $regex: batch.id || '' } },
                    { 
                        $set: {
                           message: `${item.name} (Batch #${batch.id || 'N/A'}) expires in ${daysLeft} days`,
                           read: false, // Nag user again
                           updatedAt: new Date()
                        },
                        $setOnInsert: { 
                           title: "Batch Expiring",
                           type: "expiry", 
                           locationName: "Inventory", 
                           createdAt: new Date() 
                        }
                    },
                    { upsert: true }
                );
                expiryCount++;
            }
        }
    }
  }

  return { 
    status: "success", 
    lowStockCount: lowStock.length, 
    renewalCount: renewals.length,
    expiringAlertsGenerated: expiryCount 
  };
};
```

---

## 4. Pro Tip: Dynamic Summary (All-in-One Message)
Instead of getting 10 "ding" sounds, create a "Morning Report":

1.  **Get Contents of URL** (API).
2.  **Repeat with Each Item**:
    *   Inside the loop, adding a **Text** action.
    *   Insert variables: `🔴 [Title]: [Message]`.
3.  **End Repeat**.
4.  **Combine Text** (The results of the Repeat loop) with **New Lines**.
5.  **Show Notification**:
    *   **Body**: Pass the "Combined Text" here.

-> Kết quả nó sẽ ra dạng list đẹp thế này:
```text
🔴 Low Stock: Sữa tươi is low (left: 1)
🔴 Item Expiring: Trứng gà expires in 2 days
🔴 Renewal: Netflix renews in 3 days
```
