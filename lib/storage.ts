export const BUCKETS = {
  daedoCsvs: 'daedo-csvs',
  waiverDocs: 'waiver-docs',
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];
