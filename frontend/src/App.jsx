import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SidebarFilters from './components/SidebarFilters';
import ProductGrid from './components/ProductGrid';
import { fetchServerStatus, fetchFilterOptions, fetchProducts } from './api/stockApi';

export default function App() {
  const [syncStatus, setSyncStatus] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Active Filters State
  const [filters, setFilters] = useState({
    search: '',
    image_source: 'all',
    bag_no: [],
    so_no: [],
    customer: [],
    design_no: [],
    description: [],
    dia_qlty: [],
    metal_kt: [],
    location: [],
    sublocation: [],
    rfid: [],
    set_code: [],
    min_gross_wt: '',
    max_gross_wt: '',
    min_net_wt: '',
    max_net_wt: '',
    min_dia_wt: '',
    max_dia_wt: '',
    min_center_wt: '',
    max_center_wt: ''
  });

  // 1. Initial Load: Check server health and get filter options
  useEffect(() => {
    async function init() {
      try {
        const status = await fetchServerStatus();
        setSyncStatus(status);
        const opts = await fetchFilterOptions();
        setFilterOptions(opts);
      } catch (err) {
        console.error("Initialization error:", err);
      }
    }
    init();
  }, []);

  // 2. Load Products with Debounce for search and range inputs
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchProducts(filters, page, pageSize);
      setProducts(data.items || []);
      setTotalItems(data.total_items || 0);
      setTotalPages(data.total_pages || 1);

      // Dynamically update dropdown options to match Excel cascading behaviour
      if (data.available_options) {
        setFilterOptions(prev => ({
          ...prev,
          dropdowns: data.available_options
        }));
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(handler);
  }, [loadData]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page whenever filter changes
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      image_source: 'all',
      bag_no: [],
      so_no: [],
      customer: [],
      design_no: [],
      description: [],
      dia_qlty: [],
      metal_kt: [],
      location: [],
      sublocation: [],
      rfid: [],
      set_code: [],
      min_gross_wt: '',
      max_gross_wt: '',
      min_net_wt: '',
      max_net_wt: '',
      min_dia_wt: '',
      max_dia_wt: '',
      min_center_wt: '',
      max_center_wt: ''
    });
    setPage(1);
  };

  const handleForceRefresh = async () => {
    try {
      await fetch('/api/refresh', { method: 'POST' });
      const status = await fetchServerStatus();
      setSyncStatus(status);
      const opts = await fetchFilterOptions();
      setFilterOptions(opts);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        search={filters.search}
        onSearchChange={(val) => handleFilterChange('search', val)}
        syncStatus={syncStatus}
        onRefresh={handleForceRefresh}
      />

        <div className="flex flex-1 p-5 gap-5 overflow-hidden bg-slate-100/70">        <SidebarFilters
          filterOptions={filterOptions}
          activeFilters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        <ProductGrid
          products={products}
          totalItems={totalItems}
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          isLoading={isLoading}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}