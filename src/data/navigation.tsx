import { Icon } from '@iconify/react';

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  /** Sub-menu. The parent opens the first child and stays highlighted while any child is active. */
  children?: { id: string; label: string }[];
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

// Event Dashboard (Data Viewer only): just Event List. Registration / Survey data is
// viewed via tabs inside the selected event's detail page, not separate nav items.
export const eventDashboardNavSections: NavSection[] = [
  {
    title: 'EVENT MANAGEMENT',
    items: [
      { id: 'event-list', label: 'Event List', icon: <Icon icon="solar:calendar-linear" width={16} height={16} /> },
    ],
  },
];

// PEEP SYNC — Photographer service, split out of the Event Dashboard.
export const peepSyncNavSections: NavSection[] = [
  {
    title: 'EVENT',
    items: [
      { id: 'event-list', label: 'Event List', icon: <Icon icon="solar:calendar-linear" width={16} height={16} /> },
    ],
  },
  {
    title: 'CLOUD',
    items: [
      { id: 'cloud', label: 'Cloud Management', icon: <Icon icon="solar:cloud-linear" width={16} height={16} /> },
      { id: 'collections', label: 'Collections', icon: <Icon icon="solar:folder-linear" width={16} height={16} /> },
    ],
  },
  {
    title: 'PHOTOS',
    items: [
      { id: 'photo-sync', label: 'Photo Sync', icon: <Icon icon="solar:gallery-send-linear" width={16} height={16} /> },
    ],
  },
];

// Set Event — event setup service. "Set Event" is the service name shown in the
// sidebar brand, not a nav item.
export const setEventNavSections: NavSection[] = [
  {
    title: 'EVENT MANAGEMENT',
    items: [
      { id: 'event-list', label: 'Event List', icon: <Icon icon="solar:calendar-linear" width={22} height={22} /> },
    ],
  },
  {
    title: 'FORMS',
    items: [
      { id: 'regis-forms', label: 'Regis Form', icon: <Icon icon="solar:document-add-linear" width={22} height={22} /> },
      { id: 'survey-forms', label: 'Survey Form', icon: <Icon icon="solar:chat-square-like-linear" width={22} height={22} /> },
    ],
  },
  {
    title: 'CLOUD',
    items: [
      { id: 'cloud', label: 'Cloud Management', icon: <Icon icon="solar:cloud-linear" width={22} height={22} /> },
      { id: 'collections', label: 'Collections', icon: <Icon icon="solar:folder-linear" width={22} height={22} /> },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'activity', label: 'Activity Log', icon: <Icon icon="solar:history-linear" width={22} height={22} /> },
      // System Settings is hidden for now; uncomment to bring it back (SetEventApp still renders it).
      // { id: 'settings', label: 'System Settings', icon: <Icon icon="solar:settings-linear" width={22} height={22} /> },
    ],
  },
];

// Media Ads — in-app Banner and Cover Page, moved out of Set Event.
// Banners show on two app screens, each with its own list.
export const mediaAdsNavSections: NavSection[] = [
  {
    title: 'MEDIA',
    items: [
      {
        id: 'app-banners',
        label: 'Set Banner in App',
        icon: <Icon icon="solar:gallery-wide-linear" width={22} height={22} />,
        children: [
          { id: 'banner-home', label: 'Home page' },
          { id: 'banner-community', label: 'Community page' },
        ],
      },
      { id: 'app-cover-pages', label: 'Set Cover Page in App', icon: <Icon icon="solar:smartphone-2-linear" width={22} height={22} /> },
    ],
  },
];

// User management — account level, opened from the profile menu.
export const accountAdminNavSections: NavSection[] = [
  {
    title: 'USER MANAGEMENT',
    items: [
      { id: 'users', label: 'Users', icon: <Icon icon="solar:users-group-rounded-linear" width={22} height={22} /> },
      { id: 'roles', label: 'Roles & Permissions', icon: <Icon icon="solar:shield-linear" width={22} height={22} /> },
    ],
  },
];

// Sections inside a single event (shown in the event sidebar when an event is open in Set Event).
export type EventSectionId = 'overview' | 'detail' | 'collection' | 'qr' | 'users' | 'activity';

export const eventWorkspaceSections: { id: EventSectionId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'solar:graph-up-linear' },
  { id: 'detail', label: 'Event Detail', icon: 'solar:document-text-linear' },
  { id: 'collection', label: 'Collection', icon: 'solar:folder-linear' },
  { id: 'qr', label: 'QR Code / Scanner', icon: 'solar:qr-code-linear' },
  { id: 'users', label: 'User management', icon: 'solar:user-circle-linear' },
  { id: 'activity', label: 'Activity logs', icon: 'solar:history-linear' },
];
