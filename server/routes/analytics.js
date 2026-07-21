const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const { requireAdmin } = require('../middleware/auth');

router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const supabase = getDb();
    
    // We fetch all orders to aggregate. In a huge production db, you'd use raw SQL or RPCs.
    // For this size, fetching select fields is acceptable, or we can use Supabase aggregate functions if available.
    // Since Supabase REST doesn't support GROUP BY natively without RPC, we'll fetch necessary fields.
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, amount, created_at');

    if (error) throw error;

    let stats = {
      totalOrders: orders.length,
      pendingOrders: 0,
      confirmedOrders: 0,
      readyForCourier: 0,
      inTransit: 0,
      delivered: 0,
      returned: 0,
      totalRevenue: 0,
      todayRevenue: 0
    };

    const today = new Date().toDateString();

    orders.forEach(order => {
      const amt = parseFloat(order.amount) || 0;
      stats.totalRevenue += amt;
      
      const orderDate = new Date(order.created_at).toDateString();
      if (orderDate === today) {
        stats.todayRevenue += amt;
      }

      switch (order.status) {
        case 'pending': stats.pendingOrders++; break;
        case 'confirmed': stats.confirmedOrders++; break;
        case 'ready_for_courier': stats.readyForCourier++; break;
        case 'in_transit': stats.inTransit++; break;
        case 'delivered': stats.delivered++; break;
        case 'returned': stats.returned++; break;
      }
    });

    res.json(stats);
  } catch (err) {
    console.error('[analytics dashboard]', err);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

router.get('/orders-overview', requireAdmin, async (req, res) => {
  try {
    const supabase = getDb();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status, created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (error) throw error;

    const dailyData = {};

    orders.forEach(order => {
      const dateKey = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { name: dateKey, orders: 0, delivered: 0, returned: 0 };
      }
      
      dailyData[dateKey].orders++;
      if (order.status === 'delivered') dailyData[dateKey].delivered++;
      if (order.status === 'returned') dailyData[dateKey].returned++;
    });

    // Convert to sorted array
    const result = Object.values(dailyData).sort((a, b) => {
      return new Date(a.name + ' ' + new Date().getFullYear()) - new Date(b.name + ' ' + new Date().getFullYear());
    });

    res.json(result);
  } catch (err) {
    console.error('[analytics orders-overview]', err);
    res.status(500).json({ error: 'Failed to fetch orders overview' });
  }
});

router.get('/courier-status', requireAdmin, async (req, res) => {
  try {
    const supabase = getDb();
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('status')
      .in('status', ['processing', 'in_transit', 'out_for_delivery', 'delivered', 'returned']);

    if (error) throw error;

    let stats = {
      processing: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      returned: 0
    };

    orders.forEach(order => {
      if (stats[order.status] !== undefined) {
        stats[order.status]++;
      }
    });

    res.json(stats);
  } catch (err) {
    console.error('[analytics courier-status]', err);
    res.status(500).json({ error: 'Failed to fetch courier status' });
  }
});

module.exports = router;
