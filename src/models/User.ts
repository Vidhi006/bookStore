import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Purchase History Item ──────────────────────────────
export interface PurchaseItem {
  bookId: string;
  title: string;
  author: string;
  price: number;
  quantity: number;
  coverImage?: string;
}

// ── Purchase / Order Record ────────────────────────────
export interface IPurchase {
  orderId: string;
  items: PurchaseItem[];
  totalAmount: number;
  shippingAddress: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: Date;
}

// ── Saved Address ──────────────────────────────────────
export interface ISavedAddress {
  id: string;
  type: string;
  fullName: string;
  mobile: string;
  pincode?: string;
  locality?: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
}

// ── Linked social account ──────────────────────────────
export interface IOAuthAccount {
  provider: 'google' | 'facebook';
  providerAccountId: string;
}

// ── User Document ──────────────────────────────────────
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'customer';
  isEmailVerified: boolean;
  mobile?: string;
  addresses: ISavedAddress[];
  wishlist: string[];
  verificationCode?: string;
  verificationCodeExpiry?: number;  // Unix ms timestamp
  resetCode?: string;
  resetCodeExpiry?: number;
  purchases: IPurchase[];           // Full purchase history
  oauthAccounts: IOAuthAccount[];   // Linked Google/Facebook accounts
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseItemSchema = new Schema<PurchaseItem>({
  bookId:     { type: String, required: true },
  title:      { type: String, required: true },
  author:     { type: String, required: true },
  price:      { type: Number, required: true },
  quantity:   { type: Number, required: true },
  coverImage: { type: String },
}, { _id: false });

const PurchaseSchema = new Schema<IPurchase>({
  orderId:         { type: String, required: true },
  items:           [PurchaseItemSchema],
  totalAmount:     { type: Number, required: true },
  shippingAddress: { type: String, default: 'Standard Delivery' },
  status:          { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  createdAt:       { type: Date, default: Date.now },
}, { _id: false });

const OAuthAccountSchema = new Schema<IOAuthAccount>({
  provider:          { type: String, enum: ['google', 'facebook'], required: true },
  providerAccountId: { type: String, required: true },
}, { _id: false });

const AddressSchema = new Schema<ISavedAddress>({
  id:       { type: String, required: true },
  type:     { type: String, default: 'Home' },
  fullName: { type: String, default: '' },
  mobile:   { type: String, default: '' },
  pincode:  { type: String },
  locality: { type: String },
  address:  { type: String, default: '' },
  city:     { type: String, default: '' },
  state:    { type: String, default: '' },
  landmark: { type: String },
}, { _id: false });

const UserSchema = new Schema<IUser>(
  {
    name:                   { type: String, required: true, trim: true },
    email:                  { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:           { type: String, required: true },
    role:                   { type: String, enum: ['admin', 'customer'], default: 'customer' },
    isEmailVerified:        { type: Boolean, default: false },
    mobile:                 { type: String },
    addresses:              { type: [AddressSchema], default: [] },
    wishlist:               { type: [String], default: [] },
    verificationCode:       { type: String },
    verificationCodeExpiry: { type: Number },
    resetCode:              { type: String },
    resetCodeExpiry:        { type: Number },
    purchases:              [PurchaseSchema],
    oauthAccounts:          { type: [OAuthAccountSchema], default: [] },
    avatarUrl:              { type: String },
  },
  { timestamps: true }
);

UserSchema.index({
  'oauthAccounts.provider': 1,
  'oauthAccounts.providerAccountId': 1,
});

// Prevent model re-registration in dev hot reload
const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
