import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Starfield from '../components/Starfield';
import './OrderForm.css';

export default function OrderForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_name: '',
    address: '',
    mobile_number: '',
    size: '',
    colour: '',
    notes: '',
  });
  
  const [meta, setMeta] = useState({ sizes: [], colours: [] });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/orders/meta')
      .then(res => res.json())
      .then(data => setMeta(data))
      .catch(err => console.error('Failed to load meta:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setServerError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        if (data.error && !data.fields) setServerError(data.error);
        setIsSubmitting(false);
        return;
      }

      // Success
      navigate('/confirmation', { state: { order: data } });
    } catch (err) {
      setServerError("Couldn't place your order. Check your connection and try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <Starfield />
      <div className="form-wrapper glass-card">
        <header className="form-header">
          <h1 className="h-brand">Izzy Signature</h1>
          <p>Place your custom order</p>
        </header>

        {serverError && <div className="error-banner">{serverError}</div>}

        <form onSubmit={handleSubmit} className="order-form" noValidate>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="customer_name">Full Name *</label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              className={errors.customer_name ? 'has-error' : ''}
              placeholder="e.g. Jane Doe"
            />
            {errors.customer_name && <span className="error-text">{errors.customer_name}</span>}
          </div>

          {/* Address */}
          <div className="form-group">
            <label htmlFor="address">Delivery Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'has-error' : ''}
              rows="3"
              placeholder="Full delivery address"
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          {/* Mobile */}
          <div className="form-group">
            <label htmlFor="mobile_number">Mobile Number *</label>
            <input
              type="tel"
              id="mobile_number"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleChange}
              className={errors.mobile_number ? 'has-error' : ''}
              placeholder="07X XXXXXXX"
            />
            {errors.mobile_number && <span className="error-text">{errors.mobile_number}</span>}
          </div>

          {/* Size & Colour Grid */}
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="size">Size *</label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className={errors.size ? 'has-error' : ''}
              >
                <option value="">Select Size</option>
                {meta.sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.size && <span className="error-text">{errors.size}</span>}
            </div>

            <div className="form-group half">
              <label htmlFor="colour">Colour *</label>
              <select
                id="colour"
                name="colour"
                value={formData.colour}
                onChange={handleChange}
                className={errors.colour ? 'has-error' : ''}
              >
                <option value="">Select Colour</option>
                {meta.colours.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.colour && <span className="error-text">{errors.colour}</span>}
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label htmlFor="notes">Order Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              placeholder="Any special requests or measurements..."
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
