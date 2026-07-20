const ALLOWED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const ALLOWED_COLOURS = [
  'Pearl White',
  'Midnight Black',
  'Dusty Rose',
  'Sage Green',
  'Lavender',
  'Soft Camel',
];

// Sri Lankan mobile: starts with 07, exactly 10 digits (spaces/dashes optional)
const MOBILE_REGEX = /^07[0-9]{8}$/;

function validateOrder(body) {
  const errors = {};

  // customer_name
  const name = (body.customer_name || '').trim();
  if (!name) {
    errors.customer_name = 'Full name is required.';
  } else if (name.length < 2 || name.length > 100) {
    errors.customer_name = 'Name must be between 2 and 100 characters.';
  }

  // address
  const address = (body.address || '').trim();
  if (!address) {
    errors.address = 'Address is required.';
  } else if (address.length < 10) {
    errors.address = 'Please enter your full address (at least 10 characters).';
  }

  // mobile_number — strip spaces/dashes before validating
  const mobile = (body.mobile_number || '').trim().replace(/[\s\-]/g, '');
  if (!mobile) {
    errors.mobile_number = 'Mobile number is required.';
  } else if (!MOBILE_REGEX.test(mobile)) {
    errors.mobile_number = 'Enter a valid Sri Lankan mobile number (e.g. 071 234 5678).';
  }

  // size
  const size = (body.size || '').trim().toUpperCase();
  if (!size) {
    errors.size = 'Please select a size.';
  } else if (!ALLOWED_SIZES.includes(size)) {
    errors.size = `Size must be one of: ${ALLOWED_SIZES.join(', ')}.`;
  }

  // colour
  const colour = (body.colour || '').trim();
  if (!colour) {
    errors.colour = 'Please select a colour.';
  } else if (!ALLOWED_COLOURS.includes(colour)) {
    errors.colour = `Colour must be one of: ${ALLOWED_COLOURS.join(', ')}.`;
  }

  const hasErrors = Object.keys(errors).length > 0;
  return {
    valid: !hasErrors,
    errors,
    cleaned: hasErrors ? null : {
      customer_name: name,
      address,
      mobile_number: mobile,
      size,
      colour,
      notes: (body.notes || '').trim().slice(0, 500),
    },
  };
}

module.exports = { validateOrder, ALLOWED_SIZES, ALLOWED_COLOURS };
