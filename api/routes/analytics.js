const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const { requireAdmin } = require('../middleware/auth');

// Dashboard KPI Stats
router.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const supabase = getDb();
    
    // Get all orders for stats calculation
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*');
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }

    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today);

    const stats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
      readyForCourier: orders.filter(o => o.status === 'ready_for_courier').length,
      inTransit: orders.filter(o => o.status === 'in_transit').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      returned: orders.filter(o => o.status === 'returned').length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.amount || 3500), 0),
      todayRevenue: todayOrders.reduce((sum, o) => sum + (o.amount || 3500), 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Orders Overview Chart Data
router.get('/orders-overview', requireAdmin, async (req, res) => {
  try {
    const supabase = getDb();
    
    // Get orders from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch orders overview' });
    }

    // Group by date for chart
    const groupedData = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (!groupedData[date]) {
        groupedData[date] = { name: date, orders: 0, delivered: 0, returned: 0 };
      }
      groupedData[date].orders++;
      if (order.status === 'delivered') groupedData[date].delivered++;
      if (order.status === 'returned') groupedData[date].returned++;
    });

    const chartData = Object.values(groupedData);
    res.json(chartData);
  } catch (error) {
    console.error('Orders overview error:', error);
    res.status(500).json({ error: 'Failed to fetch orders overview' });
  }
});

// Courier Status Overview
router.get('/courier-status', requireAdmin, async (req, res) => {
  try {
    const supabase = getDb();
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['processing', 'in_transit', 'out_for_delivery', 'delivered', 'returned']);
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch courier status' });
    }

    const stats = {
      processing: orders.filter(o => o.status === 'processing').length,
      in_transit: orders.filter(o => o.status === 'in_transit').length,
      out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      returned: orders.filter(o => o.status === 'returned').length
    };

    res.json(stats);
  } catch (error) {
    console.error('Courier status error:', error);
    res.status(500).json({ error: 'Failed to fetch courier status' });
  }
});

module.exports = router;
