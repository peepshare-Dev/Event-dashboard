import { appBannerApi, coverPageApi, type PromoApi } from '../../../data/mock/promoApi';
import { BANNER_IMAGE_SIZE, COVER_IMAGE_SIZE } from '../../../data/appBanners';

/**
 * Where a promo appears. Banner and Cover Page share the list, form, sort and click-action
 * system; this config holds what differs between them.
 */
export interface Placement {
  key: 'banner' | 'cover';
  /** "Banner" / "Cover Page" */
  noun: string;
  menuTitle: string;
  subtitle: string;
  icon: string;
  imageSize: string;
  /** Image / thumbnail shape. */
  shape: 'banner' | 'cover';
  /** Cover Page adds Show Frequency. */
  frequency: boolean;
  formIntro: string;
  previewDescription: string;
  sortSubtitle: string;
  deactivateText: string;
  emptyText: string;
  api: PromoApi;
}

export const BANNER_PLACEMENT: Placement = {
  key: 'banner',
  noun: 'Banner',
  menuTitle: 'Set Banner in App',
  subtitle: 'Manage promotional banners displayed in Peep Share App.',
  icon: 'solar:gallery-wide-linear',
  imageSize: BANNER_IMAGE_SIZE,
  shape: 'banner',
  frequency: false,
  formIntro: 'Set what the banner shows, when it appears, and what happens when users tap it.',
  previewDescription: 'How it appears in the Peep Share app.',
  sortSubtitle: 'Drag and drop banners to change their display priority. The top banner shows first in the app.',
  deactivateText: 'will no longer be displayed in the app.',
  emptyText: 'Create a banner to promote events, coupons and campaigns inside the Peep Share app.',
  api: appBannerApi,
};

export const COVER_PLACEMENT: Placement = {
  key: 'cover',
  noun: 'Cover Page',
  menuTitle: 'Set Cover Page in App',
  subtitle: 'Manage promotional popups displayed when users enter Peep Share.',
  icon: 'solar:smartphone-2-linear',
  imageSize: COVER_IMAGE_SIZE,
  shape: 'cover',
  frequency: true,
  formIntro: 'Set the popup users see when they open the app, how often they see it, and where it leads.',
  previewDescription: 'The popup users see when they open Peep Share.',
  sortSubtitle: 'Drag and drop to change the order in which Cover Pages are displayed.',
  deactivateText: 'will no longer be displayed to users.',
  emptyText: 'Create a Cover Page to show a popup with a promotion or announcement when users open the Peep Share app.',
  api: coverPageApi,
};
