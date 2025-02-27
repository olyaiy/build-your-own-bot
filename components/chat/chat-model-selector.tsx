'use client';

import type { Model } from '@/lib/db/schema';

// Extend the Model type to include the isDefault flag
export type ModelWithDefault = Model & {
  isDefault: boolean | null;
}; 