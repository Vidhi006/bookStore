'use client';

import React from 'react';
import { Input, Select, Slider } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useBookStore } from '@/context/BookStoreContext';
import { GENRE_LIST } from '@/data/initialBooks';

export const FilterBar: React.FC = () => {
  const { filters, setFilters, filteredBooks, books } = useBookStore();

  const handleReset = () => {
    setFilters({ searchQuery: '', selectedGenre: 'All', maxPrice: 40, sortBy: 'none' });
  };

  return (
    <div style={{
      background: '#FFFFFF', borderRadius: '10px', border: '1px solid #EDEAE3',
      padding: '20px 24px', marginBottom: '24px',
    }}>
      {/* Filters row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {/* Search */}
        <div style={{ flex: '2 1 220px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '6px', letterSpacing: '0.02em' }}>
            Search
          </label>
          <Input
            prefix={<SearchOutlined style={{ color: '#C9C0B0' }} />}
            placeholder="Title or author…"
            allowClear
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            style={{ borderRadius: '6px', borderColor: '#EDEAE3', height: '40px' }}
          />
        </div>

        {/* Genre */}
        <div style={{ flex: '1 1 160px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '6px', letterSpacing: '0.02em' }}>
            Genre
          </label>
          <Select
            value={filters.selectedGenre}
            onChange={(value) => setFilters((prev) => ({ ...prev, selectedGenre: value }))}
            style={{ width: '100%' }}
            size="middle"
            options={GENRE_LIST.map((genre) => ({ value: genre, label: genre }))}
          />
        </div>

        {/* Price */}
        <div style={{ flex: '1 1 160px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#57534E', letterSpacing: '0.02em' }}>
              Max Price
            </label>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#3D5A3E' }}>
              ${filters.maxPrice.toFixed(0)}
            </span>
          </div>
          <Slider
            min={5} max={40} step={1}
            value={filters.maxPrice}
            onChange={(val) => setFilters((prev) => ({ ...prev, maxPrice: val }))}
            tooltip={{ formatter: (val) => `$${val}` }}
            style={{ margin: '8px 0 0' }}
          />
        </div>

        {/* Sort */}
        <div style={{ flex: '1 1 150px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#57534E', marginBottom: '6px', letterSpacing: '0.02em' }}>
            Sort By
          </label>
          <Select
            value={filters.sortBy}
            onChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
            style={{ width: '100%' }}
            size="middle"
            options={[
              { value: 'none', label: 'Featured' },
              { value: 'price-asc', label: 'Price: Low → High' },
              { value: 'price-desc', label: 'Price: High → Low' },
              { value: 'rating-desc', label: 'Top Rated' },
            ]}
          />
        </div>

        {/* Reset */}
        <div style={{ flex: '0 0 auto', paddingTop: '22px' }}>
          <button
            onClick={handleReset}
            style={{
              background: 'none', border: '1px solid #EDEAE3', borderRadius: '6px',
              padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '6px', fontSize: '13px', fontWeight: 500, color: '#78716C',
              height: '40px',
            }}
          >
            <ReloadOutlined style={{ fontSize: '12px' }} /> Reset
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F5F3EE',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
      }}>
        <span style={{ fontSize: '13px', color: '#A8A29E' }}>
          Showing <strong style={{ color: '#1C1917' }}>{filteredBooks.length}</strong> of {books.length} titles
        </span>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {filters.selectedGenre !== 'All' && (
            <span
              style={{
                fontSize: '12px', fontWeight: 500, color: '#3D5A3E',
                background: '#EBF2EB', borderRadius: '4px', padding: '2px 10px',
                cursor: 'pointer',
              }}
              onClick={() => setFilters((p) => ({ ...p, selectedGenre: 'All' }))}
            >
              {filters.selectedGenre} ×
            </span>
          )}
          {filters.searchQuery && (
            <span
              style={{
                fontSize: '12px', fontWeight: 500, color: '#7B5E3A',
                background: '#FDF0E4', borderRadius: '4px', padding: '2px 10px',
                cursor: 'pointer',
              }}
              onClick={() => setFilters((p) => ({ ...p, searchQuery: '' }))}
            >
              "{filters.searchQuery}" ×
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
