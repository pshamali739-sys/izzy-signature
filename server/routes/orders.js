const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const { requireAdmin } = require('../middleware/auth');
const { validateOrder, ALLOWED_SIZES, ALLOWED_COLOURS } = require('../middleware/validate');

function generateOrderCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `IZY-${code}`;
}

router.get('/meta', (req, res) => {
  res.json({ sizes: ALLOWED_SIZES, colours: ALLOWED_COLOURS });
});

router.post('/', async (req, res) => {
  const result = validateOrder(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: 'Validation failed', fields: result.errors });
  }

  const supabase = getDb();
  const { customer_name, address, mobile_number, size, colour, notes } = result.cleaned;

  let order_code;
  let inserted = null;

  // Retry up to 5 times for unique code
  for (let attempt = 0; attempt < 5; attempt++) {
    order_code = generateOrderCode();
    
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        order_code,
        customer_name,
        address,
        mobile_number,
        size,
        colour,
        notes: notes || null,
        status: 'pending'
      }])
      .select()
      .single();

    if (!error) {
      inserted = data;
      break;
    }
    
    if (error.code !== '23505') { // 23505 is PostgreSQL unique violation
      console.error('[orders] insert error:', error.message);
      return res.status(500).json({ error: 'Could not save your order. Please try again.' });
    }
  }

  if (!inserted) {
    return res.status(500).json({ error: 'Could not generate unique order code. Please try again.' });
  }

  res.status(201).json({
    order_code: inserted.order_code,
    status: inserted.status,
    created_at: inserted.created_at,
  });
});

router.get('/', requireAdmin, async (req, res) => {
  const supabase = getDb();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const status = req.query.status || '';
  const search = (req.query.search || '').trim();

  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' });

  if (status && ['pending','confirmed','no_answer','rejected'].includes(status)) {
    query = query.eq('status', status);
  }
  
  if (search) {
    query = query.or(`customer_name.ilike.%${search}%,mobile_number.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }

  res.json({
    data,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});

router.get('/:id', requireAdmin, async (req, res) => {
  const supabase = getDb();
  const id = req.params.id;
  
  let query = supabase.from('orders').select('*');
  
  // UUID check rough regex to know whether to query by id or order_code
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  if (isUuid) {
    query = query.eq('id', id);
  } else {
    query = query.eq('order_code', id);
  }
  
  const { data: order, error } = await query.single();

  if (error || !order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

router.patch('/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending','confirmed','no_answer','rejected'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }

  const supabase = getDb();
  const id = req.params.id;
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const matchColumn = isUuid ? 'id' : 'order_code';

  const { data: updated, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq(matchColumn, id)
    .select()
    .single();

  if (error || !updated) return res.status(404).json({ error: 'Order not found' });

  res.json(updated);
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const supabase = getDb();
  const id = req.params.id;
  
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const matchColumn = isUuid ? 'id' : 'order_code';

  const { error, count } = await supabase
    .from('orders')
    .delete({ count: 'exact' })
    .eq(matchColumn, id);

  if (error || count === 0) return res.status(404).json({ error: 'Order not found' });

  res.json({ message: 'Order deleted' });
});

module.exports = router;
