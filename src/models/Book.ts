import mongoose, { Schema, Document, Model } from 'mongoose';
import { Genre, Review } from '@/types';

export interface IBook extends Document {
  id: string;
  isbn: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount?: number;
  reviews?: Review[];
  genre: Genre;
  stock: number;
  coverImage: string;
  description: string;
  publishedYear: number;
  language?: string;
  pages?: number;
  publisher?: string;
  badge?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<Review>(
  {
    id:      { type: String, required: true },
    user:    { type: String, required: true },
    initials:{ type: String, default: '' },
    rating:  { type: Number, default: 5 },
    comment: { type: String, default: '' },
    date:    { type: String, default: () => new Date().toISOString().split('T')[0] },
  },
  { _id: false }
);

const BookSchema = new Schema<IBook>(
  {
    id:            { type: String, required: true, unique: true },
    isbn:          { type: String, required: true, unique: true },
    title:         { type: String, required: true },
    author:        { type: String, required: true },
    price:         { type: Number, required: true },
    originalPrice: { type: Number },
    rating:        { type: Number, default: 4.5 },
    reviewCount:   { type: Number, default: 0 },
    reviews:       { type: [ReviewSchema], default: [] },
    genre:         { type: String, required: true },
    stock:         { type: Number, default: 10 },
    coverImage:    { type: String, required: true },
    description:   { type: String, default: '' },
    publishedYear: { type: Number, default: () => new Date().getFullYear() },
    language:      { type: String, default: 'English' },
    pages:         { type: Number },
    publisher:     { type: String },
    badge:         { type: String },
  },
  { timestamps: true }
);

const BookModel: Model<IBook> =
  (mongoose.models.Book as Model<IBook>) || mongoose.model<IBook>('Book', BookSchema);

export default BookModel;
