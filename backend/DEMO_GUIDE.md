# 🚁 Live Drone Delivery Demo

## Quick Start for Live Demo

### Generate Fresh Orders with Moving Drones

```bash
# In the backend directory
npm run fresh-orders
```

**What this does:**
- 🗑️ Clears all existing orders
- 🎲 Generates 50 fresh orders with current timestamp
- 🚁 **16-20 drones moving RIGHT NOW** (on-the-way status)
- 🍳 **12-15 drones starting soon** (preparing status)  
- ✅ **~15-20 completed deliveries** (delivered status) 
- ❌ **~5 cancelled orders** (cancelled status)

### Why This Works

**Time-Based Movement:**
- `preparing` orders: Drones start 1-10 minutes **from now**
- `on-the-way` orders: Drones started 1-15 minutes **ago** (moving NOW!)

**Every time you run the script:**
1. All timestamps are relative to **current time**
2. You'll see immediate drone movement on the map
3. Fresh data for realistic demo experience

### Demo Workflow

1. **Generate Orders**: `npm run fresh-orders`
2. **Start Backend**: `npm run dev` 
3. **Start Frontend**: Navigate to admin-dashboard and run the frontend
4. **View Live Map**: Go to Delivery Management → See drones moving!

### Perfect For:
- ✅ Live demos and presentations  
- ✅ Testing drone movement algorithms
- ✅ Showcasing real-time delivery tracking
- ✅ Quick development iterations

---

*Run this script anytime you want fresh, moving drones for your demo!* 🎯