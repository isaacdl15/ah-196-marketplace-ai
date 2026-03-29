// Supabase Storage bucket name constants
// NEVER hardcode bucket names inline — always import from here

export const BUCKETS = {
  templateImages: 'template-images',
  landingAssets: 'landing-page-assets',
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];
