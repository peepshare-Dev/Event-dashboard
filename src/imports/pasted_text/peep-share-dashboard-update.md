Update the existing PEEP SHARE Event Dashboard project.

Do NOT redesign or replace the existing dashboard.
Keep the current visual design, layout, sidebar, typography, colors, spacing, table styles, buttons, cards, icons, and interaction patterns.

Add 2 new main menu sections to the existing PEEP SHARE Super Admin dashboard:

1. Cloud Management
2. Collection Management

These features are connected to the PEEP SHARE My Cloud system.

==================================================
1. SIDEBAR UPDATE
==================================================

Update the existing sidebar.

Add a new section:

CLOUD

- Cloud Management
- Collections

Keep all existing menus unchanged.

The sidebar should look consistent with the current design.

Cloud Management and Collections should have clear active states when selected.

==================================================
2. CLOUD MANAGEMENT
==================================================

Create a new page:

Cloud Management

Purpose:
Allow PEEP SHARE Super Admin to monitor cloud storage usage, remaining storage, storage packages, and upgrade storage.

The page should feel like a professional cloud storage management dashboard.

--------------------------------------------------
PAGE HEADER
--------------------------------------------------

Title:
Cloud Management

Description:
Manage your PEEP SHARE cloud storage and storage plans.

Show the current storage summary prominently.

--------------------------------------------------
STORAGE OVERVIEW
--------------------------------------------------

Create a large storage usage card.

Example:

Cloud Storage

71.5 GB available

28.5 GB used
100 GB total

Use a horizontal progress bar.

Show:

Used
28.5 GB

Available
71.5 GB

Total
100 GB

Add a button:

[ Manage Storage ]

--------------------------------------------------
STORAGE BREAKDOWN
--------------------------------------------------

Create a card:

Storage Usage

Show file type usage:

Photos
18.2 GB

Videos
7.8 GB

Documents
2.5 GB

Other
0 GB

Total Used
28.5 GB

Use clean visual indicators or progress bars.

--------------------------------------------------
CURRENT PLAN
--------------------------------------------------

Create a card:

Current Plan

100 GB Cloud Storage

Status:
Active

Renewal:
31 December 2027

Button:
[ Manage Plan ]

--------------------------------------------------
STORAGE PACKAGE
--------------------------------------------------

Create a section:

Upgrade Storage

Show available packages as cards.

Example:

100 GB
Current Plan

200 GB
฿XXX / month
[Upgrade]

500 GB
฿XXX / month
[Upgrade]

1 TB
฿XXX / month
[Upgrade]

Use realistic placeholder pricing only.

Make the current plan visually distinct.

--------------------------------------------------
STORAGE USAGE BY EVENT
--------------------------------------------------

Create a table:

Storage Usage by Event

Columns:

Event
Collection
Files
Storage Used
Last Updated
Status

Example:

MONOMAX Event
MONOMAX Event Photos
8,520 files
18.2 GB
Today
Active

Pattaya Countdown
Event Photos
12,820 files
24.5 GB
Yesterday
Active

Sport Day
Sport Photos
3,240 files
8.4 GB
Active

Add:
Search
Filter
Sort

--------------------------------------------------
STORAGE STATES
--------------------------------------------------

Create UI states for:

Normal storage usage

Storage almost full

Storage full

Example warning state:

Storage almost full

85 GB / 100 GB used

15 GB remaining

[Upgrade Storage]

Use a warning color but keep the overall design consistent.

==================================================
3. COLLECTION MANAGEMENT
==================================================

Create a new page:

Collections

Purpose:
Collections work similarly to folders in Google Drive, but are part of the PEEP SHARE My Cloud ecosystem.

A Collection can contain multiple file types:

- Images
- Videos
- Documents
- Audio
- Other files

For the Event system, Collections will mainly contain Event Photos.

Important:
Do NOT design Collections as a simple photo gallery.
It must feel like a cloud file/folder management system.

--------------------------------------------------
PAGE HEADER
--------------------------------------------------

Title:
Collections

Description:
Manage and organize files stored in your PEEP SHARE Cloud.

Top actions:

[Search Collections]
[Filter]
[+ Create Collection]

--------------------------------------------------
COLLECTION LIST
--------------------------------------------------

Create a clean table or card-based file management layout.

Recommended table columns:

Collection Name
Owner
Linked Event
Files
Storage
Last Updated
Sharing
Status
Actions

Example:

MONOMAX Event Photos
Aom
MONOMAX Event
8,520 files
18.2 GB
Today
Public Link
Active

Pattaya Countdown Photos
Beam
Pattaya Countdown
12,820 files
24.5 GB
Yesterday
Private
Active

Event Documents
Admin
MONOMAX Event
42 files
850 MB
2 days ago
Restricted
Active

Use file/folder-style icons.

--------------------------------------------------
4. CREATE COLLECTION
--------------------------------------------------

When clicking:

[+ Create Collection]

Open a modal or drawer.

Title:

Create Collection

Fields:

Collection Name
[________________]

Description
[________________]

Owner
[Select User]

Link to Event
[Select Event]

Storage Location
PEEP SHARE Cloud

Buttons:

[Cancel]
[Create Collection]

After creation, open the Collection Detail page.

==================================================
5. COLLECTION DETAIL
==================================================

Create a detailed Collection page.

Example:

← Collections

MONOMAX Event Photos

Linked Event:
MONOMAX Event 2026

Owner:
Aom

Created:
5 September 2026

Storage:
18.2 GB

Files:
8,520

Top actions:

[Upload]
[Share]
[Download]
[More]

--------------------------------------------------
FILE TYPE TABS
--------------------------------------------------

Create tabs:

All Files
Photos
Videos
Documents
Audio
Other

The main content should resemble a modern cloud drive.

For the Event Photo use case, Photos should be the default tab.

--------------------------------------------------
FILE VIEW
--------------------------------------------------

For Photos:

Use a clean image grid.

Show:
- Thumbnail
- File name
- File size
- Date uploaded
- Photographer/uploader

For Documents and other file types:
Use list/table view with file type icons.

Allow:
- Select file
- Download
- Delete
- Rename
- View details

==================================================
6. COLLECTION SHARING
==================================================

This is an important feature.

A Collection can be shared with Event attendees through:

1. URL
2. QR Code

Create a Share Collection modal.

Title:

Share Collection

Collection:
MONOMAX Event Photos

--------------------------------------------------
SHARE URL
--------------------------------------------------

Show:

Share URL

https://peepshare.com/c/monomax-event-2026

[Copy Link]

--------------------------------------------------
QR CODE
--------------------------------------------------

Display a QR Code preview.

Buttons:

[Download QR Code]
[Copy Link]

--------------------------------------------------
ACCESS SETTINGS
--------------------------------------------------

Add:

Who can access?

○ Anyone with the link
○ PEEP SHARE users only
○ Restricted users

Download permission:

☑ Allow downloading files

Optional:

Expiration

○ Never
○ Set expiration date

Optional:

Password protection

○ No password
○ Require password

Button:

[Save Sharing Settings]

==================================================
7. COLLECTION ACCESS STATES
==================================================

Create visual states:

Public
Private
Restricted
Expired

Use status pills consistent with the existing dashboard.

Example:

Public
green status

Private
gray status

Restricted
orange status

Expired
red status

==================================================
8. EVENT ↔ COLLECTION RELATIONSHIP
==================================================

Make the relationship between Event and Collection very clear.

Example:

MONOMAX EVENT
       ↓
MONOMAX EVENT PHOTOS
       ↓
8,520 Photos
       ↓
Share URL / QR Code
       ↓
Event Attendees
       ↓
View / Download Photos

A Collection can be linked to an Event.

An Event can have multiple Collections.

Example:

MONOMAX EVENT
│
├── Event Photos
├── Behind the Scenes
├── Highlight Videos
└── Event Documents

Design the UI so that the Event relationship is clearly visible.

==================================================
9. PHOTOGRAPHER CONNECTION
==================================================

The Collection must connect with the existing Photo Management workflow.

Photographer flow:

Event
↓
Photo Management
↓
Select Event Collection
↓
Upload / Sync Photos
↓
Processing
↓
Collection
↓
Share with attendees

Do not create a separate unrelated photo storage system.

Photo Management should feed files into the selected Collection.

==================================================
10. MY CLOUD CONCEPT
==================================================

Use the following product relationship:

PEEP SHARE My Cloud
↓
Collections
↓
Files

Collections are similar to folders in Google Drive.

However, Collections can be:
- Linked to Events
- Shared using URL
- Shared using QR Code
- Downloadable
- Connected to Photo Management

Do not call Collections "Albums".
Use the terminology:
"Collection"

==================================================
11. SUPER ADMIN EXPERIENCE
==================================================

The Super Admin should be able to:

Cloud Management:
- View total storage
- View used storage
- View available storage
- View storage breakdown
- View storage usage by Event
- View current package
- View available packages
- Upgrade storage

Collection Management:
- View all Collections
- Search Collections
- Filter Collections
- Create Collection
- Edit Collection
- Delete Collection
- Link Collection to Event
- View files
- Upload files
- Manage files
- Share Collection
- Generate QR Code
- Copy sharing URL
- Manage access permissions
- Enable/disable downloads

==================================================
12. UI CONSISTENCY
==================================================

Very important:

Use the existing PEEP SHARE Event Dashboard design system.

Do not introduce a completely new visual style.

Keep:

Primary orange:
#FF6115

Primary dark:
#E5540F

White:
#FFFFFF

Background:
#F5F7FA

Dark text:
#1A1A1A

Gray text:
#6B7280

Border:
#E5E7EB

Use:
- Rounded cards
- Soft borders
- Minimal shadows
- Clean tables
- Status pills
- Orange primary CTA buttons
- Consistent icon style
- Same sidebar
- Same top navigation
- Same spacing system

==================================================
13. RESPONSIVE DESIGN
==================================================

Design for desktop first.

Also support tablet and mobile.

Desktop:
Sidebar + top navigation + content area.

Mobile:
Collapsible sidebar.
Responsive cards.
Scrollable tables.
Responsive Collection file grid.

==================================================
14. IMPORTANT UX PRINCIPLE
==================================================

Cloud Management answers:

"How much storage do I have?"

Collections answers:

"What files do I have and how do I organize/share them?"

Event answers:

"What is happening at this event?"

Photo Management answers:

"How does the photographer get photos into the Event?"

Keep these concepts clearly separated.

==================================================
15. FINAL SIDEBAR
==================================================

The final sidebar should be:

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

Make sure both new pages are fully accessible from the sidebar and have active navigation states.

Create all necessary screens, modals, drawers, empty states, loading states, success states, warning states, and error states for these two new features.

The result should look like a polished enterprise SaaS product integrated into the existing PEEP SHARE Event Dashboard.