/**
 * One-off migration: convert legacy USD catalogue prices to INR.
 *
 * Usage:
 *   npm run prices:inr
 *
 * Safe to re-run: only rows still priced below Rs. 100 (i.e. still in dollars)
 * are touched. Books already priced in rupees (Rs. 780+) are left alone.
 */
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

// ── Env loading (Next.js isn't running this script) ──────────────────────────
function loadEnvFiles() {
  for (const file of ['.env.local', '.env']) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    for (const line of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnvFiles();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is missing. Add it to .env.local or .env.');
  process.exit(1);
}

// ── Conversion ───────────────────────────────────────────────────────────────
const USD_TO_INR = 83;

/** 1826 -> 1829, so prices look like Indian MRPs (…9). */
function toIndianPrice(usd) {
  return Math.max(9, Math.round((usd * USD_TO_INR) / 10) * 10 - 1);
}

/** Anything under Rs. 100 is a leftover dollar amount (books cost far more). */
const isLegacyUsd = (value) => typeof value === 'number' && value > 0 && value < 100;

function convertCartItem(item) {
  if (!item || !item.book) return { item, changed: false };
  const book = { ...item.book };
  let changed = false;

  if (isLegacyUsd(book.price)) {
    book.price = toIndianPrice(book.price);
    changed = true;
  }
  if (isLegacyUsd(book.originalPrice)) {
    book.originalPrice = toIndianPrice(book.originalPrice);
    changed = true;
  }

  return { item: changed ? { ...item, book } : item, changed };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 20000 });
  const db = mongoose.connection.db;

  // 1. Books -----------------------------------------------------------------
  const books = db.collection('books');
  const legacyBooks = await books.find({ price: { $lt: 100 } }).toArray();

  if (legacyBooks.length) {
    await books.bulkWrite(
      legacyBooks.map((book) => {
        const update = { price: toIndianPrice(book.price) };
        if (isLegacyUsd(book.originalPrice)) {
          update.originalPrice = toIndianPrice(book.originalPrice);
        }
        return { updateOne: { filter: { _id: book._id }, update: { $set: update } } };
      }),
      { ordered: false }
    );
  }
  console.log(`Books converted: ${legacyBooks.length}`);

  // 2. Orders ----------------------------------------------------------------
  const orders = db.collection('orders');
  const orderDocs = await orders.find({}).toArray();
  let ordersChanged = 0;

  for (const order of orderDocs) {
    let items = order.items;
    let changed = false;

    if (Array.isArray(items)) {
      items = items.map((item) => {
        const result = convertCartItem(item);
        if (result.changed) changed = true;
        return result.item;
      });
    } else if (typeof items === 'string') {
      try {
        items = JSON.parse(items).map((item) => {
          const result = convertCartItem(item);
          if (result.changed) changed = true;
          return result.item;
        });
      } catch {
        // Leave malformed legacy data untouched.
      }
    }

    let totalAmount = order.totalAmount;
    if (isLegacyUsd(totalAmount)) {
      const total = Array.isArray(items)
        ? items.reduce(
            (sum, item) => sum + (item?.book?.price || 0) * (item?.quantity || 0),
            0
          )
        : 0;
      totalAmount = total > 0 ? Math.round(total) : toIndianPrice(totalAmount);
      changed = true;
    }

    if (changed) {
      await orders.updateOne({ _id: order._id }, { $set: { items, totalAmount } });
      ordersChanged += 1;
    }
  }
  console.log(`Orders converted: ${ordersChanged}`);

  // 3. User purchase history -------------------------------------------------
  const users = db.collection('users');
  const userDocs = await users.find({ 'purchases.0': { $exists: true } }).toArray();
  let usersChanged = 0;

  for (const user of userDocs) {
    let changed = false;
    const purchases = (user.purchases || []).map((purchase) => {
      let purchaseChanged = false;
      const items = (purchase.items || []).map((item) => {
        if (!isLegacyUsd(item?.price)) return item;
        purchaseChanged = true;
        return { ...item, price: toIndianPrice(item.price) };
      });

      let totalAmount = purchase.totalAmount;
      if (isLegacyUsd(totalAmount)) {
        const total = items.reduce(
          (sum, item) => sum + (item?.price || 0) * (item?.quantity || 0),
          0
        );
        totalAmount = total > 0 ? Math.round(total) : toIndianPrice(totalAmount);
        purchaseChanged = true;
      }

      if (purchaseChanged) changed = true;
      return purchaseChanged ? { ...purchase, items, totalAmount } : purchase;
    });

    if (changed) {
      await users.updateOne({ _id: user._id }, { $set: { purchases } });
      usersChanged += 1;
    }
  }
  console.log(`User purchase histories converted: ${usersChanged}`);

  const total = await books.countDocuments();
  console.log(`Done. Catalogue has ${total} books, all priced in INR.`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Migration failed:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
