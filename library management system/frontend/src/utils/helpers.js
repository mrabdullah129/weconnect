import Swal from 'sweetalert2';

// Format date
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount || 0);
};

// Image URL helper
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL?.replace('/api', '')}${path}`;
};

// Initials from name
export const getInitials = (name = '') => {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

// SweetAlert helpers
export const confirmDelete = async (itemName = 'this item') => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Delete ${itemName}? This action cannot be undone.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#6B7280',
    confirmButtonText: 'Yes, Delete!',
    cancelButtonText: 'Cancel',
    backdrop: true,
  });
  return result.isConfirmed;
};

export const showSuccess = (message) => {
  Swal.fire({ icon: 'success', title: 'Success!', text: message, timer: 2000, showConfirmButton: false });
};

export const showError = (message) => {
  Swal.fire({ icon: 'error', title: 'Error!', text: message });
};

// Status badge helper
export const getStatusBadge = (status) => {
  const map = {
    active: 'badge-success', inactive: 'badge-secondary',
    available: 'badge-success', unavailable: 'badge-warning',
    borrowed: 'badge-info', returned: 'badge-success',
    overdue: 'badge-danger', lost: 'badge-danger',
    pending: 'badge-warning', paid: 'badge-success', waived: 'badge-secondary',
    suspended: 'badge-danger', expired: 'badge-secondary',
  };
  return map[status] || 'badge-secondary';
};

// Export to CSV
export const exportToCSV = (data, filename) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

// Truncate text
export const truncate = (text, len = 60) => {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '…' : text;
};

// Debounce
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
