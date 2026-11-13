'use client';

import React from 'react';
import { Tag, Rate, Tooltip } from 'antd';
import {
  ShoppingCartOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
} from '@ant-design/icons';
import { Book } from '@/types';
import { useBookStore } from '@/context/BookStoreContext';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const { addToCart, toggleWishlist, isInWishlist, setSelectedBook, user } = useBookStore();
  const wishlisted = isInWishlist(book.id);
  const outOfStock = book.stock <= 0;

  return (
    <div
      className="book-card-hover"
      style={{
        background: '#FFFFFF',
        borderRadius: '10px',
        border: '1px solid #EDEAE3',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: 'default',
      }}
    >
      {/* Cover Image */}
      <div
        style={{
          position: 'relative',
          height: '220px',
          background: '#F5F3EE',
          overflow: 'hidden',
          cursor: 'pointer',
          flexShrink: 0,
        }}
        onClick={() => setSelectedBook(book)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={book.title}
          src={book.coverImage}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
          }}
          onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.04)'; }}
          onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
        />

        {/* Genre badge */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          <span style={{
            background: 'rgba(255,255,255,0.95)', borderRadius: '4px',
            padding: '2px 8px', fontSize: '11px', fontWeight: 600,
            color: '#3D5A3E', border: '1px solid #D4E4D5',
          }}>
            {book.genre}
          </span>
          {book.badge && (
            <span style={{
              background: '#3D5A3E', borderRadius: '4px',
              padding: '2px 8px', fontSize: '11px', fontWeight: 600, color: '#fff',
            }}>
              {book.badge}
            </span>
          )}
        </div>

        {/* Wishlist */}
        <Tooltip title={wishlisted ? 'Remove from Saved' : 'Save'}>
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(book.id); }}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              background: 'rgba(255,255,255,0.95)', border: '1px solid #EDEAE3',
              borderRadius: '50%', width: '34px', height: '34px',
              display: 'grid', placeItems: 'center', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(28,25,23,0.1)',
            }}
          >
            {wishlisted
              ? <HeartFilled style={{ color: '#A03E38', fontSize: '15px' }} />
              : <HeartOutlined style={{ color: '#78716C', fontSize: '15px' }} />}
          </button>
        </Tooltip>

        {/* Quick View */}
        <div style={{
          position: 'absolute', bottom: '8px', right: '8px',
          background: 'rgba(28,25,23,0.72)', color: '#fff',
          fontSize: '11px', padding: '3px 8px', borderRadius: '5px',
          display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500,
        }}>
          <EyeOutlined /> Quick View
        </div>

        {outOfStock && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(250,250,248,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              background: '#1C1917', color: '#fff', borderRadius: '6px',
              padding: '6px 14px', fontSize: '12px', fontWeight: 600,
            }}>Sold Out</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '0' }}>
        <div style={{ flex: 1 }}>
          {/* Title */}
          <h3 style={{
            margin: '0 0 3px 0', fontSize: '15px', fontWeight: 700,
            color: '#1C1917', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            letterSpacing: '-0.01em',
          }} title={book.title}>
            {book.title}
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#A8A29E', fontWeight: 500 }}>
            {book.author}
          </p>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
            <Rate disabled defaultValue={book.rating} allowHalf style={{ fontSize: '11px', color: '#C07B36' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#78716C' }}>{book.rating}</span>
          </div>
        </div>

        {/* Price + Stock + CTA */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#1C1917', letterSpacing: '-0.02em' }}>
              ${book.price.toFixed(2)}
            </span>
            {book.stock > 0 ? (
              <span style={{
                fontSize: '11px', fontWeight: 500, color: '#3D5A3E',
                background: '#EBF2EB', borderRadius: '4px', padding: '2px 8px',
              }}>
                In Stock
              </span>
            ) : (
              <span style={{
                fontSize: '11px', fontWeight: 500, color: '#A03E38',
                background: '#FEF2F2', borderRadius: '4px', padding: '2px 8px',
              }}>
                Sold Out
              </span>
            )}
          </div>

          <button
            disabled={outOfStock}
            onClick={() => addToCart(book)}
            style={{
              width: '100%', border: 'none', borderRadius: '6px',
              padding: '10px 0', fontSize: '13px', fontWeight: 600,
              cursor: outOfStock ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              background: outOfStock ? '#F5F3EE' : '#3D5A3E',
              color: outOfStock ? '#A8A29E' : '#fff',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => { if (!outOfStock) (e.currentTarget as HTMLButtonElement).style.background = '#2E4530'; }}
            onMouseLeave={e => { if (!outOfStock) (e.currentTarget as HTMLButtonElement).style.background = '#3D5A3E'; }}
          >
            <ShoppingCartOutlined style={{ fontSize: '14px' }} />
            {outOfStock ? 'Sold Out' : user ? 'Add to Cart' : 'Sign In to Add'}
          </button>
        </div>
      </div>
    </div>
  );
};
