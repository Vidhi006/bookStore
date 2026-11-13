import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import connectMongoDB from '@/lib/mongodb';
import UserModel, { IUser, IOAuthAccount } from '@/models/User';

export type OAuthProviderId = 'google' | 'facebook';

export interface OAuthUserInput {
  provider: OAuthProviderId;
  providerAccountId: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

const link = (
  provider: OAuthProviderId,
  providerAccountId: string
): IOAuthAccount => ({ provider, providerAccountId });

/**
 * Find-or-create the single Mongoose user for a social sign-in.
 *
 * Safety rules:
 *  - Only called after the Auth.js `signIn` callback has verified the
 *    provider-asserted email address.
 *  - Lookup order is: linked provider account -> verified email -> create.
 *  - Existing password, role, addresses, wishlist and purchases are never
 *    overwritten when linking a provider.
 *  - The unique email index plus the duplicate-key retry prevent duplicates
 *    when two sign-ins race.
 */
export async function findOrCreateOAuthUser(input: OAuthUserInput): Promise<IUser> {
  await connectMongoDB();

  const email = input.email.trim().toLowerCase();
  const name = (input.name || email.split('@')[0] || 'Reader').trim();
  const oauthAccount = link(input.provider, input.providerAccountId);

  // 1. This exact provider account is already linked.
  const linked = await UserModel.findOne({
    oauthAccounts: {
      $elemMatch: {
        provider: input.provider,
        providerAccountId: input.providerAccountId,
      },
    },
  });
  if (linked) return linked;

  // 2. The verified email already belongs to an account -> link in place.
  const existing = await UserModel.findOne({ email });
  if (existing) {
    await UserModel.updateOne(
      { _id: existing._id },
      {
        $addToSet: { oauthAccounts: oauthAccount },
        $set: {
          isEmailVerified: true,
          ...(input.image ? { avatarUrl: input.image } : {}),
        },
      }
    );
    const updated = await UserModel.findById(existing._id);
    if (!updated) throw new Error('User disappeared while linking the social account.');
    return updated;
  }

  // 3. Brand-new user. A random unusable password hash keeps the existing
  //    required field intact and blocks password login until a reset.
  const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);

  try {
    return await UserModel.create({
      name,
      email,
      passwordHash,
      role: 'customer',
      isEmailVerified: true,
      addresses: [],
      wishlist: [],
      purchases: [],
      oauthAccounts: [oauthAccount],
      ...(input.image ? { avatarUrl: input.image } : {}),
    });
  } catch (error) {
    // Another request won the unique-email race. Link to the winner.
    const raced = await UserModel.findOne({ email });
    if (!raced) throw error;

    await UserModel.updateOne(
      { _id: raced._id },
      {
        $addToSet: { oauthAccounts: oauthAccount },
        $set: { isEmailVerified: true },
      }
    );
    const updated = await UserModel.findById(raced._id);
    if (!updated) throw error;
    return updated;
  }
}
