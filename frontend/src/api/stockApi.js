export async function fetchServerStatus() {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('Failed to fetch server status');
  return res.json();
}

export async function fetchFilterOptions() {
  const res = await fetch('/api/filters');
  if (!res.ok) throw new Error('Failed to fetch filter options');
  return res.json();
}

export async function fetchProducts(filters, page = 1, pageSize = 24) {
  const params = new URLSearchParams();

  params.set('page', page);
  params.set('page_size', pageSize);

  if (filters.search?.trim()) params.set('search', filters.search.trim());
  if (filters.image_source && filters.image_source !== 'all') {
    params.set('image_source', filters.image_source);
  }

  // Multi-select dropdown arrays
  const multiKeys = [
    'bag_no', 'so_no', 'customer', 'design_no', 'description',
    'dia_qlty', 'metal_kt', 'location', 'sublocation', 'rfid',
    'set_code', 'cent_sz'
  ];

  multiKeys.forEach((key) => {
    if (filters[key] && Array.isArray(filters[key]) && filters[key].length > 0) {
      filters[key].forEach((val) => params.append(key, val));
    }
  });

  // Min-Max range numeric parameters
  const rangeKeys = [
    'min_gross_wt', 'max_gross_wt',
    'min_net_wt', 'max_net_wt',
    'min_dia_wt', 'max_dia_wt',
    'min_center_wt', 'max_center_wt'
  ];

  rangeKeys.forEach((key) => {
    const val = filters[key];
    if (val !== '' && val !== null && val !== undefined) {
      params.set(key, val);
    }
  });

  const res = await fetch(`/api/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}