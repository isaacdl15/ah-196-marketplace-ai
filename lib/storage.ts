// Supabase Storage bucket name constants
// NEVER hardcode bucket names inline — always import from here

export const BUCKETS = {
  avatars: 'sirena-avatars',
  covers: 'sirena-covers',
  products: 'sirena-products',
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];
