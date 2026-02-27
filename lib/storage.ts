// All Supabase Storage bucket names defined in one place.
// Import from here everywhere — never hardcode bucket names inline.
// BUILD agents: add your project-specific buckets here.

export const BUCKETS = {
  // Add project-specific buckets here during build
  // Example:
  // maintenancePhotos: 'maintenance-photos',
  // documents: 'hoa-documents',
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];
