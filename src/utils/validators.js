export function validateEmail(email) {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  return null;
}

export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validatePhone(phone) {
  if (!phone) return 'Phone is required';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) return 'Phone must be at least 10 digits';
  return null;
}

export function validateEIN(ein) {
  if (!ein) return null;
  if (!/^\d{2}-\d{7}$/.test(ein)) return 'EIN must be in XX-XXXXXXX format';
  return null;
}

export function validateSubcontractorForm(data) {
  const errors = {};
  const nameErr = validateRequired(data.company_name, 'Company name');
  if (nameErr) errors.company_name = nameErr;

  const emailErr = data.email ? validateEmail(data.email) : null;
  if (emailErr) errors.email = emailErr;

  const phoneErr = data.phone ? validatePhone(data.phone) : null;
  if (phoneErr) errors.phone = phoneErr;

  const einErr = validateEIN(data.ein);
  if (einErr) errors.ein = einErr;

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAgentForm(data) {
  const errors = {};
  const nameErr = validateRequired(data.name, 'Agent name');
  if (nameErr) errors.name = nameErr;

  const agencyErr = validateRequired(data.agency, 'Agency name');
  if (agencyErr) errors.agency = agencyErr;

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  return { valid: Object.keys(errors).length === 0, errors };
}
