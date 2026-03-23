// Sirena Phase 2 — TypeScript types

export interface SirenaCreator {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  niche: string | null;
  avatar_url: string | null;
  locale: 'en' | 'es';
  plan: 'free' | 'pro';
  page_theme_color: string;
  page_bg: string;
  page_font: string;
  page_link_text: string | null;
  share_enabled: boolean;
  payout_email: string | null;
  payout_threshold: number;
  stripe_account_id: string | null;
  is_admin: boolean;
  onboarding_done: boolean;
  created_at: string;
  updated_at: string;
}

export interface SirenaLink {
  id: string;
  creator_id: string;
  link_type: 'link' | 'instagram' | 'youtube' | 'tiktok' | 'email' | 'other';
  title: string;
  url: string;
  visible: boolean;
  show_thumbnail: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface SirenaProduct {
  id: string;
  creator_id: string;
  name: string;
  description: string | null;
  product_type: 'pdf' | 'video' | 'audio' | 'bundle' | 'course' | 'preset';
  price_cents: number;
  is_free: boolean;
  access: 'everyone' | 'subscribers';
  status: 'draft' | 'active' | 'paused';
  cover_image_url: string | null;
  file_url: string | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SirenaSale {
  id: string;
  creator_id: string;
  product_id: string | null;
  customer_email: string;
  amount_cents: number;
  platform_fee_cents: number;
  net_cents: number;
  status: 'completed' | 'pending' | 'refunded';
  stripe_payment_intent_id: string | null;
  created_at: string;
}

export interface SirenaPayout {
  id: string;
  creator_id: string;
  amount_cents: number;
  payout_email: string;
  status: 'requested' | 'processing' | 'paid' | 'failed';
  notes: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface SirenaNotificationPrefs {
  creator_id: string;
  new_sale: boolean;
  payout_processed: boolean;
  new_follower: boolean;
  monthly_summary: boolean;
  tips_updates: boolean;
}

export interface SirenaWaitlist {
  waitlist_id: string;
  email: string;
  niche: string;
  locale: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  ip_country: string | null;
  created_at: string;
}
