export type EventStatus = 'Draft' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Archived';
export type UserStatus = 'Active' | 'Suspended' | 'Inactive';
export type RoleType = 'Super Admin' | 'Event Admin' | 'Event Staff' | 'Photographer' | 'Viewer';
export type SyncStatus = 'Uploading' | 'Processing' | 'Completed' | 'Failed';

export interface Event {
  id: number;
  name: string;
  dates: string;
  status: EventStatus;
  registrants: number;
  photos: number;
  members: number;
  location: string;
  checkedIn: number;
  surveyResponses: number;
}

export interface EventMember {
  peepId: string;
  name: string;
  avatar: string;
  role: RoleType;
  permissions: string[];
  status: UserStatus;
  addedDate: string;
}

export interface User {
  id: string;
  peepId: string;
  name: string;
  email: string;
  avatar: string;
  role: RoleType;
  assignedEvents: number;
  status: UserStatus;
  lastActive: string;
}

export interface Role {
  id: string;
  name: RoleType;
  description: string;
  userCount: number;
  status: 'Active' | 'Inactive';
  permissions: Record<string, string[]>;
}

export interface RegistrationRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  username: string;
  ticketType: string;
  checkedIn: boolean;
}

export interface SyncEntry {
  id: number;
  time: string;
  user: string;
  action: string;
  event: string;
  status: SyncStatus;
  count: number;
}

export interface ActivityEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  event: string;
  details: string;
}

export const events: Event[] = [
  { id: 1, name: 'MONOMAX Event', dates: '5 – 6 Sep 2026', status: 'Completed', registrants: 1248, photos: 8520, members: 12, location: 'Bangkok', checkedIn: 1102, surveyResponses: 1102 },
  { id: 2, name: 'Pattaya Countdown 2027', dates: '31 Dec 2026', status: 'Upcoming', registrants: 3420, photos: 0, members: 18, location: 'Pattaya', checkedIn: 0, surveyResponses: 0 },
  { id: 3, name: 'PEEP Sport Day', dates: '20 Sep 2026', status: 'Ongoing', registrants: 820, photos: 2350, members: 9, location: 'Chiang Mai', checkedIn: 764, surveyResponses: 402 },
  { id: 4, name: 'Bangkok Music Festival', dates: '15 Oct 2026', status: 'Upcoming', registrants: 2100, photos: 0, members: 14, location: 'Bangkok', checkedIn: 0, surveyResponses: 0 },
  { id: 5, name: 'PEEP Annual Gala 2025', dates: '10 Dec 2025', status: 'Archived', registrants: 520, photos: 3200, members: 8, location: 'Bangkok', checkedIn: 498, surveyResponses: 410 },
  { id: 6, name: 'Songkran Photo Walk', dates: '13 Apr 2026', status: 'Completed', registrants: 340, photos: 5100, members: 6, location: 'Bangkok', checkedIn: 318, surveyResponses: 298 },
  { id: 7, name: 'Hua Hin Weekend Run', dates: '8 Nov 2026', status: 'Draft', registrants: 0, photos: 0, members: 3, location: 'Hua Hin', checkedIn: 0, surveyResponses: 0 },
];

export const eventMembers: EventMember[] = [
  { peepId: 'PPS001', name: 'Aom Siriporn', avatar: 'AS', role: 'Event Staff', permissions: ['View Event', 'View Registration', 'View Survey'], status: 'Active', addedDate: '2026-08-01' },
  { peepId: 'PPS002', name: 'Beam Natthawut', avatar: 'BN', role: 'Photographer', permissions: ['View Event', 'View Photos', 'Upload Photos', 'Sync Photos'], status: 'Active', addedDate: '2026-08-02' },
  { peepId: 'PPS003', name: 'Tom Chaiyaphon', avatar: 'TC', role: 'Viewer', permissions: ['View Event'], status: 'Active', addedDate: '2026-08-05' },
  { peepId: 'PPS004', name: 'Nong Pattaraporn', avatar: 'NP', role: 'Event Admin', permissions: ['View Event', 'View Registration', 'View Survey', 'View Reports', 'Manage Members'], status: 'Active', addedDate: '2026-07-28' },
  { peepId: 'PPS005', name: 'Mint Wanida', avatar: 'MW', role: 'Photographer', permissions: ['View Event', 'View Photos', 'Upload Photos'], status: 'Active', addedDate: '2026-08-10' },
];

export const users: User[] = [
  { id: '1', peepId: 'PPS001', name: 'Aom Siriporn', email: 'aom@peepshare.com', avatar: 'AS', role: 'Event Staff', assignedEvents: 3, status: 'Active', lastActive: '2 hours ago' },
  { id: '2', peepId: 'PPS002', name: 'Beam Natthawut', email: 'beam@peepshare.com', avatar: 'BN', role: 'Photographer', assignedEvents: 5, status: 'Active', lastActive: '30 min ago' },
  { id: '3', peepId: 'PPS003', name: 'Tom Chaiyaphon', email: 'tom@peepshare.com', avatar: 'TC', role: 'Viewer', assignedEvents: 1, status: 'Active', lastActive: '1 day ago' },
  { id: '4', peepId: 'PPS004', name: 'Nong Pattaraporn', email: 'nong@peepshare.com', avatar: 'NP', role: 'Event Admin', assignedEvents: 4, status: 'Active', lastActive: '5 hours ago' },
  { id: '5', peepId: 'PPS005', name: 'Mint Wanida', email: 'mint@peepshare.com', avatar: 'MW', role: 'Photographer', assignedEvents: 2, status: 'Active', lastActive: '3 hours ago' },
  { id: '6', peepId: 'PPS006', name: 'Palm Surachet', email: 'palm@peepshare.com', avatar: 'PS', role: 'Event Staff', assignedEvents: 2, status: 'Suspended', lastActive: '5 days ago' },
  { id: '7', peepId: 'PPS007', name: 'Fern Kanokwan', email: 'fern@peepshare.com', avatar: 'FK', role: 'Viewer', assignedEvents: 1, status: 'Active', lastActive: '12 hours ago' },
];

export const roles: Role[] = [
  {
    id: 'super-admin', name: 'Super Admin', description: 'Full system access across all events and features.', userCount: 5, status: 'Active',
    permissions: {
      EVENT: ['View Event', 'Create Event', 'Edit Event', 'Delete Event'],
      REGISTRATION: ['View Registration Data', 'Export Registration Data'],
      SURVEY: ['View Survey', 'Export Survey Data'],
      REPORT: ['View Event Report', 'Export Report'],
      PHOTOS: ['View Photos', 'Upload Photos', 'Sync Photos', 'Delete Photos'],
      MEMBERS: ['View Members', 'Manage Members'],
      SYSTEM: ['Manage System Settings', 'View Activity Log'],
    },
  },
  {
    id: 'event-admin', name: 'Event Admin', description: 'Manage assigned events and their data.', userCount: 12, status: 'Active',
    permissions: {
      EVENT: ['View Event', 'Edit Event'],
      REGISTRATION: ['View Registration Data', 'Export Registration Data'],
      SURVEY: ['View Survey', 'Export Survey Data'],
      REPORT: ['View Event Report', 'Export Report'],
      PHOTOS: ['View Photos'],
      MEMBERS: ['View Members', 'Manage Members'],
      SYSTEM: ['View Activity Log'],
    },
  },
  {
    id: 'event-staff', name: 'Event Staff', description: 'View event data and reports for assigned events.', userCount: 28, status: 'Active',
    permissions: {
      EVENT: ['View Event'],
      REGISTRATION: ['View Registration Data'],
      SURVEY: ['View Survey'],
      REPORT: ['View Event Report'],
      PHOTOS: ['View Photos'],
      MEMBERS: ['View Members'],
      SYSTEM: [],
    },
  },
  {
    id: 'photographer', name: 'Photographer', description: 'Can access assigned events and manage event photos.', userCount: 45, status: 'Active',
    permissions: {
      EVENT: ['View Event'],
      REGISTRATION: [],
      SURVEY: [],
      REPORT: [],
      PHOTOS: ['View Photos', 'Upload Photos', 'Sync Photos', 'Delete Photos'],
      MEMBERS: [],
      SYSTEM: [],
    },
  },
  {
    id: 'viewer', name: 'Viewer', description: 'View-only access to assigned events.', userCount: 32, status: 'Active',
    permissions: {
      EVENT: ['View Event'],
      REGISTRATION: [],
      SURVEY: [],
      REPORT: [],
      PHOTOS: ['View Photos'],
      MEMBERS: [],
      SYSTEM: [],
    },
  },
];

export const allPermissions: Record<string, string[]> = {
  EVENT: ['View Event', 'Create Event', 'Edit Event', 'Delete Event'],
  REGISTRATION: ['View Registration Data', 'Export Registration Data'],
  SURVEY: ['View Survey', 'Export Survey Data'],
  REPORT: ['View Event Report', 'Export Report'],
  PHOTOS: ['View Photos', 'Upload Photos', 'Sync Photos', 'Delete Photos'],
  MEMBERS: ['View Members', 'Manage Members'],
  SYSTEM: ['Manage System Settings', 'View Activity Log'],
};

export const registrationData: RegistrationRow[] = [
  { id: 1, name: 'Suchada Thammasiri', phone: '081-234-5678', email: 'suchada@email.com', eventDate: '5 Sep 2026', username: '@suchada.t', ticketType: 'VIP', checkedIn: true },
  { id: 2, name: 'Kittipong Maneechai', phone: '089-876-5432', email: 'kittipong@email.com', eventDate: '5 Sep 2026', username: '@kittipong.m', ticketType: 'General', checkedIn: true },
  { id: 3, name: 'Warunya Sompong', phone: '062-345-6789', email: 'warunya@email.com', eventDate: '6 Sep 2026', username: '@warunya.s', ticketType: 'General', checkedIn: false },
  { id: 4, name: 'Pichaporn Rattanasak', phone: '090-123-4567', email: 'pichaporn@email.com', eventDate: '5 Sep 2026', username: '@picha.r', ticketType: 'VIP', checkedIn: true },
  { id: 5, name: 'Thanakorn Jiraphan', phone: '085-678-9012', email: 'thanakorn@email.com', eventDate: '6 Sep 2026', username: '@thanakorn.j', ticketType: 'General', checkedIn: true },
  { id: 6, name: 'Nattapong Srisuk', phone: '087-234-5670', email: 'nattapong@email.com', eventDate: '5 Sep 2026', username: '@nattapong.s', ticketType: 'General', checkedIn: false },
  { id: 7, name: 'Lalita Wongsakorn', phone: '091-345-6780', email: 'lalita@email.com', eventDate: '6 Sep 2026', username: '@lalita.w', ticketType: 'VIP', checkedIn: true },
  { id: 8, name: 'Chaiwat Bunyaporn', phone: '083-456-7890', email: 'chaiwat@email.com', eventDate: '5 Sep 2026', username: '@chaiwat.b', ticketType: 'General', checkedIn: true },
];

export const syncActivity: SyncEntry[] = [
  { id: 1, time: '09:32', user: 'Beam Natthawut', action: 'Uploaded', event: 'MONOMAX Event', status: 'Completed', count: 1250 },
  { id: 2, time: '10:15', user: 'Mint Wanida', action: 'Uploaded', event: 'MONOMAX Event', status: 'Completed', count: 820 },
  { id: 3, time: '10:22', user: 'System', action: 'Failed sync', event: 'MONOMAX Event', status: 'Failed', count: 30 },
  { id: 4, time: '11:05', user: 'Beam Natthawut', action: 'Retried', event: 'MONOMAX Event', status: 'Completed', count: 30 },
  { id: 5, time: '13:40', user: 'Mint Wanida', action: 'Uploaded', event: 'PEEP Sport Day', status: 'Processing', count: 450 },
  { id: 6, time: '14:20', user: 'Beam Natthawut', action: 'Uploaded', event: 'Songkran Photo Walk', status: 'Completed', count: 980 },
  { id: 7, time: '15:00', user: 'Mint Wanida', action: 'Uploaded', event: 'PEEP Sport Day', status: 'Completed', count: 450 },
];

export const activityLog: ActivityEntry[] = [
  { id: 1, timestamp: '2026-09-21 09:32', user: 'Admin (Suchada)', action: 'Added member', event: 'MONOMAX Event', details: 'Added Beam Natthawut as Photographer' },
  { id: 2, timestamp: '2026-09-21 09:45', user: 'Admin (Suchada)', action: 'Changed permissions', event: 'MONOMAX Event', details: 'Updated Photographer role permissions' },
  { id: 3, timestamp: '2026-09-21 10:15', user: 'Beam Natthawut', action: 'Uploaded photos', event: 'MONOMAX Event', details: 'Uploaded 820 photos' },
  { id: 4, timestamp: '2026-09-21 11:00', user: 'Aom Siriporn', action: 'Exported data', event: 'MONOMAX Event', details: 'Exported Registration Data as CSV' },
  { id: 5, timestamp: '2026-09-21 11:30', user: 'Admin (Suchada)', action: 'Created event', event: 'Hua Hin Weekend Run', details: 'New event created with Draft status' },
  { id: 6, timestamp: '2026-09-21 12:00', user: 'Admin (Suchada)', action: 'Changed role', event: 'PEEP Sport Day', details: 'Changed Palm Surachet role to Event Staff' },
  { id: 7, timestamp: '2026-09-21 13:20', user: 'Mint Wanida', action: 'Uploaded photos', event: 'PEEP Sport Day', details: 'Uploaded 450 photos' },
  { id: 8, timestamp: '2026-09-21 14:05', user: 'Nong Pattaraporn', action: 'Viewed report', event: 'MONOMAX Event', details: 'Viewed Event Report' },
];
