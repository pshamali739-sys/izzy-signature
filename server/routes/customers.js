const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const { requireAdmin } = require('../middleware/auth');

router.get('/risk', requireAdmin, async (req, res) => {
  try {
    const supabase = getDb();
    
    // Fetch all orders to aggregate by customer
    const { data: orders, error } = await supabase
      .from('orders')
      .select('customer_name, mobile_number, status');

    if (error) throw error;

    const customers = {};

    orders.forEach(order => {
      const phone = order.mobile_number;
      if (!phone) return;

      if (!customers[phone]) {
        customers[phone] = {
          customer_name: order.customer_name,
          phone: phone,
          total_orders: 0,
          return_count: 0,
          reject_count: 0
        };
      }

      customers[phone].total_orders++;
      if (order.status === 'returned') customers[phone].return_count++;
      if (order.status === 'rejected') customers[phone].reject_count++;
    });

    const riskProfiles = Object.values(customers).map(c => {
      const return_rate = c.total_orders > 0 ? (c.return_count / c.total_orders) * 100 : 0;
      
      let risk_level = 'Low';
      let risk_score = 10; // Base score

      if (c.return_count > 3 || c.reject_count > 2 || return_rate > 50) {
        risk_level = 'High';
        risk_score = 80 + Math.min(20, c.return_count * 5 + c.reject_count * 10);
      } else if (c.return_count > 1 || c.reject_count > 0 || return_rate > 25) {
        risk_level = 'Medium';
        risk_score = 40 + Math.min(39, c.return_count * 10 + c.reject_count * 15);
      }

      return {
        customer_name: c.customer_name,
        phone: c.phone,
        risk_score: Math.round(risk_score),
        risk_level,
        return_count: c.return_count,
        reject_count: c.reject_count
      };
    });

    // Filter out only medium and high risk, then sort by highest score first
    const topRisks = riskProfiles
      .filter(c => c.risk_level === 'High' || c.risk_level === 'Medium')
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10); // Return top 10

    res.json(topRisks);
  } catch (err) {
    console.error('[customers risk]', err);
    res.status(500).json({ error: 'Failed to calculate customer risk' });
  }
});

module.exports = router;
