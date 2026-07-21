const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const { requireAdmin } = require('../middleware/auth');

router.get('/', requireAdmin, async (req, res) => {
  try {
    const supabase = getDb();
    
    // Fetch last 15 updated orders for notifications
    const { data: recentOrders, error } = await supabase
      .from('orders')
      .select('id, order_code, customer_name, status, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(15);

    if (error) throw error;

    const notifications = [];
    
    recentOrders.forEach(order => {
      // Check if it's a newly created order
      if (order.created_at === order.updated_at && order.status === 'pending') {
        notifications.push({
          id: order.id + '-new',
          type: 'new',
          title: 'New Order Received',
          message: `New order ${order.order_code} from ${order.customer_name}`,
          timestamp: order.created_at
        });
      }
      // Status updates
      else if (order.status === 'delivered') {
        notifications.push({
          id: order.id + '-delivered',
          type: 'success',
          title: 'Order Delivered',
          message: `Order ${order.order_code} has been delivered`,
          timestamp: order.updated_at
        });
      }
      else if (order.status === 'returned') {
        notifications.push({
          id: order.id + '-returned',
          type: 'warning',
          title: 'Order Returned',
          message: `Order ${order.order_code} was returned`,
          timestamp: order.updated_at
        });
      }
      else if (order.status === 'out_for_delivery') {
        notifications.push({
          id: order.id + '-out',
          type: 'info',
          title: 'Shipment Update',
          message: `Order ${order.order_code} is out for delivery`,
          timestamp: order.updated_at
        });
      }
    });

    // We can also fetch the top risk customer as a notification if we calculate it, 
    // but for simplicity we rely on recent order statuses.
    
    // Sort by timestamp descending
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(notifications.slice(0, 10)); // return top 10 recent notifications
  } catch (err) {
    console.error('[notifications]', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

module.exports = router;
