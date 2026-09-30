import { Icon } from '@iconify/react';

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export type DashboardRole = 'admin' | 'data-viewer';

// Admin PeepShare. Users & Access and System moved to the Set Event service.
export const adminNavSections: NavSection[] = [
  {
    title: 'EVENT MANAGEMENT',
    items: [
      { id: 'event-list', label: 'Event List', icon: <Icon icon="solar:calendar-linear" width={16} height={16} />, badge: 7 },
    ],
  },
  {
    title: 'DATA',
    items: [
      { id: 'registration', label: 'Registration Data', icon: <Icon icon="solar:clipboard-list-linear" width={16} height={16} /> },
      { id: 'survey', label: 'Survey & Feedback', icon: <Icon icon="solar:chart-2-linear" width={16} height={16} /> },
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
      { id: 'photos', label: 'Photo Management', icon: <Icon icon="solar:gallery-linear" width={16} height={16} /> },
      { id: 'sync', label: 'Sync Activity', icon: <Icon icon="solar:refresh-circle-linear" width={16} height={16} /> },
    ],
  },
];

// Data Viewer — sidebar is always just Event List. Registration/Survey data is
// viewed via tabs inside the selected Event's detail page, not separate nav items.
export const dataViewerNavSections: NavSection[] = [
  {
    title: 'EVENT MANAGEMENT',
    items: [
      { id: 'event-list', label: 'Event List', icon: <Icon icon="solar:calendar-linear" width={16} height={16} />, badge: 7 },
    ],
  },
];

// PEEP SYNC — Photographer service, split out of the Event Dashboard.
export const peepSyncNavSections: NavSection[] = [
  {
    title: 'EVENT',
    items: [
      { id: 'event-list', label: 'Event List', icon: <Icon icon="solar:calendar-linear" width={16} height={16} />, badge: 7 },
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
      { id: 'event-list', label: 'Event List', icon: <Icon icon="solar:calendar-linear" width={22} height={22} />, badge: 7 },
    ],
  },
  {
    title: 'MEDIA',
    items: [
      { id: 'banner-image', label: 'Banner image', icon: <Icon icon="solar:gallery-wide-linear" width={22} height={22} /> },
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
    title: 'USERS & ACCESS',
    items: [
      { id: 'users', label: 'User Management', icon: <Icon icon="solar:users-group-rounded-linear" width={22} height={22} /> },
      { id: 'roles', label: 'Role Management', icon: <Icon icon="solar:shield-linear" width={22} height={22} /> },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'activity', label: 'Activity Log', icon: <Icon icon="solar:history-linear" width={22} height={22} /> },
      { id: 'settings', label: 'System Settings', icon: <Icon icon="solar:settings-linear" width={22} height={22} /> },
    ],
  },
];

// Sections inside a single event (shown in the event sidebar when an event is open in Set Event).
export type EventSectionId = 'overview' | 'detail' | 'collection' | 'qr' | 'users';

export const eventWorkspaceSections: { id: EventSectionId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'solar:graph-up-linear' },
  { id: 'detail', label: 'Event Detail', icon: 'solar:document-text-linear' },
  { id: 'collection', label: 'Collection', icon: 'solar:folder-linear' },
  { id: 'qr', label: 'QR Code / Scanner', icon: 'solar:qr-code-linear' },
  { id: 'users', label: 'User management', icon: 'solar:user-circle-linear' },
];
