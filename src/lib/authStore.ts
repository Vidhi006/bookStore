import bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import connectMongoDB from '@/lib/mongodb';
import UserModel, { IUser } from '@/models/User';
import { signToken, JWTPayload } from '@/lib/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/resend';
import { sanitizeUser as mapUser } from '@/lib/mappers';
import { Address, User } from '@/types';

// ── Helper: Map Mongoose doc → safe User type ─────────
export function sanitizeUser(user: IUser): User & { token?: string } {
  return mapUser(user);
}

export function createTokenForUser(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
  return signToken(payload);
}

function sixDigitCode() {
  return randomInt(100000, 1000000).toString();
}

// ── Auth Operations ───────────────────────────────────

export async function findUserByEmail(email: string) {
  await connectMongoDB();
  return UserModel.findOne({ email: email.trim().toLowerCase() });
}

export async function findUserById(id: string) {
  await connectMongoDB();
  return UserModel.findById(id);
}

export async function createUser(data: { name: string; email: string; password: string; mobile?: string }) {
  await connectMongoDB();
  const code = sixDigitCode();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await UserModel.create({
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    passwordHash,
    role: 'customer',
    isEmailVerified: false,
    mobile: data.mobile?.trim() || undefined,
    addresses: [],
    wishlist: [],
    verificationCode: code,
    verificationCodeExpiry: expiry,
    purchases: [],
  });

  const delivery = await sendVerificationEmail(user.email, code, user.name);

  return {
    user: sanitizeUser(user),
    emailSent: delivery.success,
    ...(delivery.error ? { emailError: delivery.error } : {}),
  };
}

export async function verifyPassword(email: string, password: string) {
  await connectMongoDB();
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function issueVerificationCode(email: string): Promise<{ success: boolean; error?: string }> {
  await connectMongoDB();
  const user = await findUserByEmail(email);
  if (!user) return { success: false, error: 'No account found with this email.' };

  const code = sixDigitCode();
  const expiry = Date.now() + 10 * 60 * 1000;
  await UserModel.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { verificationCode: code, verificationCodeExpiry: expiry }
  );

  const delivery = await sendVerificationEmail(user.email, code, user.name);
  if (!delivery.success) {
    await UserModel.findByIdAndUpdate(user._id, {
      $unset: { verificationCode: 1, verificationCodeExpiry: 1 },
    });
    return { success: false, error: `Unable to send verification email: ${delivery.error}` };
  }

  return { success: true };
}

export async function verifyUserCode(email: string, code: string): Promise<{ success: boolean; user?: ReturnType<typeof sanitizeUser>; token?: string; error?: string }> {
  await connectMongoDB();
  const user = await findUserByEmail(email);
  if (!user) return { success: false, error: 'Account not found.' };

  if (user.isEmailVerified) {
    return { success: false, error: 'Email is already verified. Please sign in.' };
  }

  if (!user.verificationCode || user.verificationCode !== code.trim()) {
    return { success: false, error: 'Invalid verification code. Please check your email or request a new one.' };
  }

  if (!user.verificationCodeExpiry || Date.now() >= user.verificationCodeExpiry) {
    return { success: false, error: 'Verification code expired. Please request a new code.' };
  }

  const updated = await UserModel.findOneAndUpdate(
    {
      _id: user._id,
      isEmailVerified: false,
      verificationCode: code.trim(),
      verificationCodeExpiry: { $gt: Date.now() },
    },
    {
      $set: { isEmailVerified: true },
      $unset: { verificationCode: 1, verificationCodeExpiry: 1 },
    },
    { new: true }
  );

  if (!updated) return { success: false, error: 'Verification code expired or already used. Please request a new code.' };
  const token = createTokenForUser(updated);
  return { success: true, user: sanitizeUser(updated), token };
}

export async function issueResetCode(email: string): Promise<{ success: boolean; error?: string }> {
  await connectMongoDB();
  const user = await findUserByEmail(email);
  if (!user) return { success: false, error: 'No account with this email address.' };

  const code = sixDigitCode();
  const expiry = Date.now() + 10 * 60 * 1000;
  await UserModel.findByIdAndUpdate(user._id, { resetCode: code, resetCodeExpiry: expiry });

  const delivery = await sendPasswordResetEmail(user.email, code, user.name);
  if (!delivery.success) {
    await UserModel.findByIdAndUpdate(user._id, {
      $unset: { resetCode: 1, resetCodeExpiry: 1 },
    });
    return { success: false, error: `Unable to send password reset email: ${delivery.error}` };
  }

  return { success: true };
}

export async function resetPassword(email: string, code: string, newPass: string) {
  await connectMongoDB();
  const user = await findUserByEmail(email);
  if (!user) return { success: false, error: 'Account not found.' };
  if (!user.resetCode || user.resetCode !== code.trim()) return { success: false, error: 'Invalid reset code.' };
  if (!user.resetCodeExpiry || Date.now() >= user.resetCodeExpiry) return { success: false, error: 'Reset code expired.' };

  const passwordHash = await bcrypt.hash(newPass, 10);
  const updated = await UserModel.findOneAndUpdate(
    { _id: user._id, resetCode: code.trim(), resetCodeExpiry: { $gt: Date.now() } },
    {
      $set: { passwordHash, isEmailVerified: true },
      $unset: { resetCode: 1, resetCodeExpiry: 1 },
    },
    { new: true }
  );
  if (!updated) return { success: false, error: 'Reset code expired or already used. Please request a new code.' };

  return { success: true };
}

// ── Profile & Address Updates ──────────────────────────
export async function updateUserProfile(
  userId: string,
  updates: { name?: string; mobile?: string; addresses?: Address[]; wishlist?: string[] }
) {
  await connectMongoDB();
  const $set: Record<string, unknown> = {};
  if (typeof updates.name === 'string' && updates.name.trim()) $set.name = updates.name.trim();
  if (typeof updates.mobile === 'string') $set.mobile = updates.mobile.trim();
  if (Array.isArray(updates.addresses)) $set.addresses = updates.addresses;
  if (Array.isArray(updates.wishlist)) $set.wishlist = updates.wishlist;

  return UserModel.findByIdAndUpdate(userId, { $set }, { new: true, runValidators: true });
}

// ── Purchase History ───────────────────────────────────
export async function addPurchaseToUser(userId: string, purchase: {
  orderId: string;
  items: { bookId: string; title: string; author: string; price: number; quantity: number; coverImage?: string }[];
  totalAmount: number;
  shippingAddress: string;
}) {
  await connectMongoDB();
  await UserModel.findByIdAndUpdate(userId, {
    $push: {
      purchases: {
        orderId: purchase.orderId,
        items: purchase.items,
        totalAmount: purchase.totalAmount,
        shippingAddress: purchase.shippingAddress,
        status: 'Pending',
        createdAt: new Date(),
      },
    },
  });
}

export async function getUserPurchases(userId: string) {
  await connectMongoDB();
  const user = await UserModel.findById(userId).select('purchases');
  return user?.purchases ?? [];
}

// ── Seed Demo Accounts ─────────────────────────────────
export async function seedDemoAccounts() {
  await connectMongoDB();

  const adminHash = await bcrypt.hash('admin123', 10);
  await UserModel.findOneAndUpdate(
    { email: 'admin@bookhaven.com' },
    {
      $setOnInsert: {
        name: 'Administrator',
        email: 'admin@bookhaven.com',
        passwordHash: adminHash,
        role: 'admin',
        isEmailVerified: true,
        purchases: [],
      },
    },
    { upsert: true }
  );

  const customerHash = await bcrypt.hash('customer123', 10);
  await UserModel.findOneAndUpdate(
    { email: 'customer@bookhaven.com' },
    {
      $setOnInsert: {
        name: 'Poonam Yadav',
        email: 'customer@bookhaven.com',
        passwordHash: customerHash,
        role: 'customer',
        isEmailVerified: true,
        mobile: '81678954778',
        addresses: [
          {
            id: 'addr-work',
            type: 'Work',
            fullName: 'Poonam Yadav',
            mobile: '81678954778',
            pincode: '560102',
            locality: 'HSR Layout',
            address: 'BridgeLabz Solutions LLP, No. 42, 14th Main, 15th Cross, Sector 4, Opp to BDA complex, near Kumarakom restaurant, HSR Layout, Bangalore',
            city: 'Bengaluru',
            state: 'Karnataka',
            landmark: 'Near Kumarakom restaurant',
          },
        ],
        wishlist: [],
        purchases: [],
      },
    },
    { upsert: true }
  );
}
