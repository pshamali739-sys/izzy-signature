const express = require('express');
const router = express.Router();
const { getDb } = require('../db/db');
const { requireAdmin } = require('../middleware/auth');

// Trans Express API configuration
const TRANS_EXPRESS_BASE_URL = process.env.TRANS_EXPRESS_BASE_URL || 'https://portal.transexpress.lk/api';
const TRANS_EXPRESS_TOKEN = process.env.TRANS_EXPRESS_TOKEN;

// Create shipment via Trans Express
router.post('/dispatch', requireAdmin, async (req, res) => {
  const { orders } = req.body; // Array of order objects
  
  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ error: 'Orders array is required' });
  }

  try {
    // Prepare shipment data for Trans Express
    const shipmentData = orders.map(order => ({
      order_id: order.order_code,
      customer_name: order.customer_name,
      address: order.address,
      order_description: 'Custom Order',
      customer_phone: order.mobile_number,
      customer_phone2: order.mobile_number2 || '',
      cod_amount: order.amount || 3500,
      remarks: 'Generated from Izzy OMS'
    }));

    // Call Trans Express API
    const response = await fetch(`${TRANS_EXPRESS_BASE_URL}/orders/upload/auto-without-city`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TRANS_EXPRESS_TOKEN}`
      },
      body: JSON.stringify(shipmentData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to create shipment', details: responseData });
    }

    const supabase = getDb();
    const shipmentResults = [];

    // Process each order response
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const apiResponse = responseData[i] || responseData;

      // Create courier shipment record
      const { data: shipment, error: shipmentError } = await supabase
        .from('courier_shipments')
        .insert([{
          order_id: order.id,
          courier_name: 'Trans Express',
          waybill_id: apiResponse.waybill_id || null,
          tracking_status: apiResponse.status || 'Processing',
          api_response: apiResponse
        }])
        .select()
        .single();

      if (shipmentError) {
        console.error('Failed to create shipment record:', shipmentError);
        shipmentResults.push({
          order_id: order.id,
          success: false,
          error: shipmentError.message
        });
      } else {
        // Update order status
        await supabase
          .from('orders')
          .update({ 
            status: 'sent_to_courier',
            courier_status: apiResponse.status || 'Processing',
            waybill_id: apiResponse.waybill_id || null
          })
          .eq('id', order.id);

        shipmentResults.push({
          order_id: order.id,
          success: true,
          waybill_id: shipment.waybill_id,
          tracking_status: shipment.tracking_status
        });
      }
    }

    res.json({
      success: true,
      message: `${shipmentResults.filter(r => r.success).length} orders dispatched successfully`,
      results: shipmentResults,
      api_response: responseData
    });

  } catch (error) {
    console.error('Courier dispatch error:', error);
    res.status(500).json({ error: 'Failed to dispatch orders', details: error.message });
  }
});

// Get tracking status
router.get('/tracking/:waybillId', requireAdmin, async (req, res) => {
  const { waybillId } = req.params;

  try {
    const response = await fetch(`${TRANS_EXPRESS_BASE_URL}/tracking`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TRANS_EXPRESS_TOKEN}`
      },
      body: JSON.stringify({ waybill_id: waybillId })
    });

    const trackingData = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch tracking status', details: trackingData });
    }

    // Update local shipment record
    const supabase = getDb();
    const { error: updateError } = await supabase
      .from('courier_shipments')
      .update({ 
        tracking_status: trackingData.current_status,
        api_response: trackingData,
        updated_at: new Date().toISOString()
      })
      .eq('waybill_id', waybillId);

    if (updateError) {
      console.error('Failed to update shipment record:', updateError);
    }

    // Update order status based on courier status
    const statusMapping = {
      'Processing': 'processing',
      'Picked Up': 'in_transit',
      'In Transit': 'in_transit',
      'Out For Delivery': 'out_for_delivery',
      'Delivered': 'delivered',
      'Returned': 'returned',
      'Canceled': 'cancelled'
    };

    const newOrderStatus = statusMapping[trackingData.current_status];
    if (newOrderStatus) {
      await supabase
        .from('orders')
        .update({ 
          courier_status: trackingData.current_status,
          status: newOrderStatus
        })
        .eq('waybill_id', waybillId);
    }

    res.json({
      success: true,
      tracking_data: trackingData
    });

  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Failed to fetch tracking status', details: error.message });
  }
});

// Get all courier shipments
router.get('/shipments', requireAdmin, async (req, res) => {
  try {
    const supabase = getDb();
    const { data: shipments, error } = await supabase
      .from('courier_shipments')
      .select(`
        *,
        orders (
          order_code,
          customer_name,
          mobile_number,
          address,
          amount,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch shipments' });
    }

    res.json({ data: shipments });
  } catch (error) {
    console.error('Shipments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// Sync locations from Trans Express
router.post('/sync-locations', requireAdmin, async (req, res) => {
  try {
    const supabase = getDb();

    // Fetch provinces (you may need to adjust the endpoint)
    const provincesResponse = await fetch(`${TRANS_EXPRESS_BASE_URL}/provinces`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${TRANS_EXPRESS_TOKEN}`
      }
    });

    const provinces = await provincesResponse.json();
    let syncedCount = 0;

    // Process each province and its districts/cities
    for (const province of provinces) {
      // Fetch districts for this province
      const districtsResponse = await fetch(`${TRANS_EXPRESS_BASE_URL}/districts?province_id=${province.id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${TRANS_EXPRESS_TOKEN}`
        }
      });

      const districts = await districtsResponse.json();

      for (const district of districts) {
        // Fetch cities for this district
        const citiesResponse = await fetch(`${TRANS_EXPRESS_BASE_URL}/cities?district_id=${district.id}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${TRANS_EXPRESS_TOKEN}`
          }
        });

        const cities = await citiesResponse.json();

        // Insert locations
        for (const city of cities) {
          const { error: insertError } = await supabase
            .from('locations')
            .upsert({
              province: province.name,
              district: district.name,
              city: city.name,
              province_id: province.id,
              district_id: district.id,
              city_id: city.id
            }, {
              onConflict: 'province,district,city'
            });

          if (!insertError) {
            syncedCount++;
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Synced ${syncedCount} locations`,
      synced_count: syncedCount
    });

  } catch (error) {
    console.error('Location sync error:', error);
    res.status(500).json({ error: 'Failed to sync locations', details: error.message });
  }
});

// Get locations
router.get('/locations', requireAdmin, async (req, res) => {
  try {
    const supabase = getDb();
    const { province, district } = req.query;

    let query = supabase.from('locations').select('*');

    if (province) {
      query = query.eq('province', province);
    }
    if (district) {
      query = query.eq('district', district);
    }

    const { data: locations, error } = await query.order('province, district, city');

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch locations' });
    }

    // Get unique provinces
    const { data: allLocations } = await supabase.from('locations').select('province');
    const provinces = [...new Set(allLocations?.map(l => l.province) || [])];

    res.json({ 
      data: locations,
      provinces 
    });
  } catch (error) {
    console.error('Locations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

module.exports = router;
