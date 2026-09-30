# PEEP SHARE Event Dashboard - Design System & UI Guidelines

## 1. Product Overview

PEEP SHARE Event Dashboard is an internal web application for managing
Events, Event data, Cloud Storage, Collections, Photos, Users, Roles,
and permissions.

The product has two major concept:

1.  **Event Management**
    -   Events
    -   Registration Data
    -   Survey & Feedback
    -   Event Reports
    -   Event Members & Access
    -   Photographer / Photo Management
2.  **My Cloud / Content Management**
    -   Cloud Storage
    -   Collections
    -   Files
    -   Collection sharing via URL and QR Code

### Core Product Relationship

``` text
PEEP SHARE
│
├── Event
│   ├── Registration
│   ├── Survey
│   ├── Reports
│   ├── Members & Access
│   └── Photo Management
│       └── Upload / Sync
│
└── My Cloud
    └── Collections
        ├── Images
        ├── Videos
        ├── Documents
        ├── Audio
        └── Other Files
```

An Event can have one or multiple Collections.

A Collection is similar to a folder in a cloud drive, but it can be
linked to an Event and shared with attendees through a URL or QR Code.

------------------------------------------------------------------------

## 2. Design Principles

### 2.1 Clear hierarchy

The UI should immediately communicate:

-   Where the user is
-   Which Event they are viewing
-   What action they can perform
-   What data belongs to the current Event
-   What permissions the current user has

### 2.2 Enterprise SaaS with a friendly PEEP SHARE personality

The interface should feel:

-   Professional
-   Clean
-   Reliable
-   Friendly
-   Modern
-   Easy to scan

Avoid overly decorative dashboards.

### 2.3 Data-first design

Tables, filters, search, status, permissions, storage usage, and system
states are more important than decorative elements.

### 2.4 Progressive disclosure

Do not show every setting at once.

Use:

-   Tabs
-   Drawers
-   Modals
-   Detail pages
-   More menus

for secondary actions.

### 2.5 Consistent terminology

Use these terms consistently:

-   Event
-   Collection
-   Cloud Storage
-   Registration Data
-   Survey & Feedback
-   Event Report
-   Photo Management
-   Sync Activity
-   User Management
-   Role Management

Do not call Collections "Albums".

------------------------------------------------------------------------

# 3. Brand & Color

## Primary

``` text
Primary Orange: #FF6115
Primary Dark:   #E5540F
```

Use the primary orange for:

-   Primary CTA
-   Active navigation
-   Selected states
-   Important highlights
-   Links when appropriate
-   Progress indicators when appropriate

Do not use orange for large background areas.

## Neutral

``` text
White:        #FFFFFF
Page BG:      #F5F7FA
Text Dark:    #1A1A1A
Text Primary: #374151
Text Gray:    #6B7280
Border:       #E5E7EB
Divider:      #F0F0F0
```

## Semantic

``` text
Success: Green
Warning: Amber
Error: Red
Info: Blue
```

Semantic colors should only communicate system state and should not
become decorative colors.

------------------------------------------------------------------------

# 4. Typography

Use a clean modern sans-serif font.

Recommended:

-   Inter
-   Noto Sans Thai
-   system sans-serif fallback

Typography hierarchy:

``` text
Page Title
28–32px / Semibold

Section Title
20–24px / Semibold

Card Title
16–18px / Semibold

Body
14–16px / Regular

Secondary Text
13–14px / Regular

Table Header
12–13px / Semibold

Caption
12px / Regular
```

For Thai text, prioritize readability and comfortable line height.

------------------------------------------------------------------------

# 5. Layout

## Desktop

Primary target width:

``` text
1440px
```

Recommended layout:

``` text
Sidebar: 280px
Top Header: 72px
Main content: flexible
Page padding: 24–32px
```

Content should have a maximum readable width where appropriate, but
data-heavy pages may use the available width.

## Page structure

``` text
┌───────────────────────────────────────────────┐
│ Top Header                                    │
├──────────────┬────────────────────────────────┤
│              │                                │
│ Sidebar      │ Main Content                   │
│              │                                │
│              │ Page Header                    │
│              │                                │
│              │ Content Cards / Tables         │
│              │                                │
└──────────────┴────────────────────────────────┘
```

------------------------------------------------------------------------

# 6. Sidebar

Sidebar sections:

``` text
PEEP SHARE
Event Dashboard

EVENT
  Event List

DATA
  Registration Data
  Survey & Feedback
  Event Reports

CLOUD
  Cloud Management
  Collections

PHOTO
  Photo Management
  Sync Activity

USERS & ACCESS
  User Management
  Role Management

SYSTEM
  Activity Log
  System Settings
```

### Sidebar behavior

Desktop: - Fixed or sticky sidebar - Width around 260--280px

Collapsed desktop: - Icon-only sidebar - Tooltips for icons

Mobile: - Sidebar becomes a drawer - Hidden by default - Open through a
menu button

Active menu: - Soft orange background - Orange icon - Orange/dark-orange
text - Rounded corners

Do not use a large solid orange block for the entire active item.

------------------------------------------------------------------------

# 7. Top Header

The header contains:

-   Mobile menu button
-   Breadcrumb or page context where useful
-   Language selector
-   Notification
-   User avatar
-   Username
-   Role
-   Profile menu

Example:

``` text
[☰]    Event Management          🇹🇭   🔔   Avatar
                                      @suchada.t
                                      Administrator
```

On mobile: - Hide non-essential text - Keep avatar, notification, and
menu controls - Move profile information into the profile drawer/menu

------------------------------------------------------------------------

# 8. Buttons

Primary button:

``` text
Background: #FF6115
Text: #FFFFFF
Radius: 10–12px
Height: 40–44px
```

Examples:

-   -   Create Event
-   -   Create Collection
-   Add Member
-   Save Changes
-   Upgrade Storage

Secondary button:

``` text
White background
Gray border
Dark text
```

Examples:

-   Cancel
-   Back
-   Filter
-   Download

Destructive:

Use red only for destructive actions.

Examples:

-   Delete
-   Remove Member
-   Delete Collection

------------------------------------------------------------------------

# 9. Cards

Cards should use:

``` text
Background: #FFFFFF
Border: 1px solid #E5E7EB
Radius: 12–16px
Subtle shadow only when useful
```

Avoid excessive shadows.

Cards should group related information.

------------------------------------------------------------------------

# 10. Tables

Tables are a core component of this product.

Requirements:

-   Clear column headers
-   Comfortable row height
-   Hover state
-   Sortable columns when useful
-   Search
-   Filter
-   Pagination
-   Row actions
-   Responsive behavior

Desktop tables should remain spacious.

Example:

``` text
Event | Date | Status | Registrants | Photos | Members | Actions
```

Do not squeeze every column into mobile.

------------------------------------------------------------------------

# 11. Responsive Table Strategy

On tablet:

-   Allow horizontal scrolling for complex tables
-   Keep important columns visible where possible

On mobile:

Use one of these strategies depending on the data:

### Strategy A: Horizontal scrolling

For data-heavy tables.

### Strategy B: Card rows

For user/event lists.

Example:

``` text
MONOMAX Event
5–6 Sep 2026
Completed

1,248 Registrants
8,520 Photos

[View]
```

### Strategy C: Hide secondary columns

Show only critical information.

Do not simply shrink table text until it becomes unreadable.

------------------------------------------------------------------------

# 12. Event Management

## Event List

Primary actions:

-   Search
-   Filter
-   Create Event

Statuses:

-   Draft
-   Upcoming
-   Ongoing
-   Completed
-   Archived

Event cards/table should communicate:

-   Event name
-   Date
-   Status
-   Registrants
-   Photos
-   Members

------------------------------------------------------------------------

# 13. Event Detail

Tabs:

``` text
Overview
Registration
Survey
Photos
Members & Access
Settings
```

Overview should show:

-   Registered
-   Checked-in
-   Survey responses
-   Photos
-   Event members
-   Recent activity

------------------------------------------------------------------------

# 14. Registration Data

Registration forms can have different questions per Event.

Therefore:

-   Use dynamic table columns
-   Support search
-   Support filters
-   Support sorting
-   Support detail view
-   Support CSV / Excel export

Do not assume all Events have the same fields.

------------------------------------------------------------------------

# 15. Survey & Feedback

Show:

-   Response count
-   Response rate
-   Average satisfaction
-   Question results
-   Open-ended feedback

Use charts only where they improve understanding.

Do not overload the page with charts.

------------------------------------------------------------------------

# 16. Event Reports

Event Report combines:

``` text
Registration
+
Attendance
+
Survey
+
Photo Activity
```

The report should provide a high-level summary first, followed by
detailed sections.

------------------------------------------------------------------------

# 17. Cloud Management

Cloud Management answers:

> "How much storage do I have?"

Show:

-   Total storage
-   Used storage
-   Available storage
-   Usage percentage
-   Storage breakdown
-   Current plan
-   Available plans
-   Storage usage by Event

Example:

``` text
100 GB Total

28.5 GB Used
71.5 GB Available
```

Storage categories:

-   Photos
-   Videos
-   Documents
-   Other

Include states:

-   Normal
-   Almost full
-   Full

------------------------------------------------------------------------

# 18. Collection Management

Collections answer:

> "What files do I have and how do I organize and share them?"

A Collection is similar to a cloud-drive folder.

It can contain:

-   Images
-   Videos
-   Documents
-   Audio
-   Other files

A Collection can be linked to an Event.

An Event can have multiple Collections.

Example:

``` text
MONOMAX EVENT
├── Event Photos
├── Behind the Scenes
├── Highlight Videos
└── Event Documents
```

------------------------------------------------------------------------

# 19. Collection Detail

Collection page should contain:

-   Collection name
-   Owner
-   Linked Event
-   Storage
-   File count
-   Created date
-   Last updated
-   Share
-   Upload
-   Download
-   More actions

File tabs:

``` text
All Files
Photos
Videos
Documents
Audio
Other
```

Photos should use a grid.

Other file types can use list/table view.

------------------------------------------------------------------------

# 20. Collection Sharing

A Collection can be shared through:

-   URL
-   QR Code

Access options:

``` text
Anyone with the link
PEEP SHARE users only
Restricted users
```

Download:

``` text
Allow download
```

Optional:

-   Expiration
-   Password
-   Restricted access

Show clear states:

-   Public
-   Private
-   Restricted
-   Expired

------------------------------------------------------------------------

# 21. Photo Management

Photo Management is a workflow for photographers.

Flow:

``` text
Event
↓
Photo Management
↓
Select Collection
↓
Select Folder / Sync
↓
Scan
↓
Detect New Photos
↓
Upload / Sync
↓
Processing
↓
Collection
```

Photo states:

-   Scanning
-   Uploading
-   Processing
-   Completed
-   Failed

------------------------------------------------------------------------

# 22. Permissions

Use a two-layer permission model.

## Layer 1: Event Access

Can this user access the Event?

## Layer 2: Feature Permission

What can this user do inside the Event?

Example:

``` text
Beam
Role: Photographer

MONOMAX Event
✓ View Event
✓ View Photos
✓ Upload Photos
✓ Sync Photos
✕ Registration
✕ Survey
✕ Export
✕ Manage Members
```

------------------------------------------------------------------------

# 23. Role Management

Roles can include:

-   Super Admin
-   Event Admin
-   Event Staff
-   Photographer
-   Viewer

Role Management should use a permission matrix.

Allow Super Admin to:

-   Create Role
-   Edit Role
-   Configure permissions
-   Activate/deactivate Role

------------------------------------------------------------------------

# 24. Empty States

Every major page must have a meaningful empty state.

Example:

``` text
No Collections yet

Create a Collection to organize files and share
Event content with attendees.

[+ Create Collection]
```

Avoid blank white screens.

------------------------------------------------------------------------

# 25. Loading States

Use:

-   Skeleton loaders
-   Progress indicators
-   Upload progress
-   Processing status

Avoid blocking the entire dashboard for long operations.

------------------------------------------------------------------------

# 26. Error States

Errors should explain:

1.  What happened
2.  What the user can do next

Example:

``` text
Upload failed

30 files could not be uploaded.

[View Failed Files]
[Retry All]
```

------------------------------------------------------------------------

# 27. Accessibility

Requirements:

-   Sufficient color contrast
-   Keyboard navigation
-   Visible focus states
-   Buttons with clear labels
-   Tooltips for icon-only actions
-   Do not rely only on color to communicate status
-   Form labels should always be visible
-   Touch targets should be at least approximately 44px on mobile

------------------------------------------------------------------------

# 28. Responsive Breakpoints

Use these breakpoints as a baseline:

``` text
Mobile:
< 640px

Tablet:
640px – 1023px

Desktop:
1024px – 1439px

Large Desktop:
≥ 1440px
```

Do not design separate unrelated layouts.

Use the same component system and adapt the layout.

------------------------------------------------------------------------

# 29. Responsive Behavior

## Desktop ≥ 1024px

-   Full sidebar
-   Full top header
-   Multi-column cards
-   Full data tables
-   Side-by-side controls

## Tablet 640--1023px

-   Collapsible sidebar
-   2-column cards where possible
-   Tables can scroll horizontally
-   Reduce page padding
-   Reduce non-essential navigation text

## Mobile \< 640px

-   Sidebar becomes drawer
-   Single-column layout
-   Cards stack vertically
-   Tables become cards or horizontal scroll containers
-   Filters move into a filter drawer
-   Primary CTA remains accessible
-   Modals become full-screen or bottom sheets where appropriate
-   Collection photos use 2-column grid
-   File details use compact cards
-   Hide secondary metadata until needed

------------------------------------------------------------------------

# 30. Responsive Spacing

Desktop:

``` text
Page padding: 32px
Card gap: 24px
Section gap: 24–32px
```

Tablet:

``` text
Page padding: 20–24px
Card gap: 16–20px
```

Mobile:

``` text
Page padding: 16px
Card gap: 12–16px
Section gap: 20–24px
```

------------------------------------------------------------------------

# 31. Responsive Collection Gallery

Desktop:

``` text
4–6 columns depending on viewport
```

Tablet:

``` text
3–4 columns
```

Mobile:

``` text
2 columns
```

Maintain consistent aspect ratios.

Images should use object-fit cover for thumbnails.

------------------------------------------------------------------------

# 32. Responsive Cloud Storage Cards

Desktop:

``` text
[Storage Overview] [Storage Breakdown] [Current Plan]
```

Tablet:

``` text
[Storage Overview]
[Storage Breakdown] [Current Plan]
```

Mobile:

``` text
[Storage Overview]

[Storage Breakdown]

[Current Plan]

[Upgrade Storage]
```

------------------------------------------------------------------------

# 33. Responsive Interaction Rules

Do not remove functionality on mobile.

Instead:

-   Move filters into drawers
-   Move secondary actions into More menus
-   Convert side panels into bottom sheets
-   Convert tables into cards where appropriate
-   Keep core actions visible
-   Preserve search
-   Preserve sorting/filtering

------------------------------------------------------------------------

# 34. Design Quality Bar

The final product should feel like a polished SaaS administration
product.

It should not feel like:

-   A generic AI dashboard
-   A template marketplace
-   A photo-only gallery
-   A basic CRUD admin panel

The UI should communicate that PEEP SHARE manages:

Events + People + Data + Cloud + Collections + Photos + Permissions.

Maintain consistency across every screen.
