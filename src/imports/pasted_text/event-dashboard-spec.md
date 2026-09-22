Build a responsive web-based Event Management Dashboard for PEEP SHARE.

Use the uploaded reference image as the primary visual and UI style reference.

IMPORTANT:
Do not simply clone the reference screen.
Keep the same overall visual language, layout structure, spacing, typography, colors, table style, sidebar style, card style, and interaction patterns, but expand it into a complete Event Management Dashboard for PEEP SHARE.

The product is an internal administration system used by PEEP SHARE administrators to manage Events, Users, Event access, Roles, Registration Data, Surveys, Photos, and permissions.

==================================================
1. PRODUCT CONCEPT
==================================================

Product name:
PEEP SHARE Event Dashboard

The system has multiple user roles.

Main roles:

1. PEEP SHARE Super Admin
2. Event Admin / Event Staff
3. Photographer
4. Viewer

The PEEP SHARE Super Admin has the highest permission level.

The Super Admin can:
- View all Events
- Create and manage Events
- Control which PEEP SHARE users can access each Event
- Assign users to Events
- Assign Roles to users
- Manage Roles and Permissions
- View Registration Data
- View Survey / Feedback Data
- View Event Reports
- Manage Event Photos
- Monitor photo synchronization
- Manage system-level settings
- View activity logs

==================================================
2. VISUAL DESIGN
==================================================

Follow the uploaded reference image closely.

Visual direction:
- Clean modern SaaS dashboard
- Professional but friendly
- PEEP SHARE brand feeling
- White main content area
- Very light gray page background
- Orange as the primary brand color
- Dark navy / gray text
- Soft borders
- Rounded cards
- Subtle shadows
- Spacious layout
- Clear table hierarchy
- Minimal and elegant icons
- Desktop-first responsive design

Primary brand color:
#FF6115

Supporting colors:
- Primary dark: #E5540F
- White: #FFFFFF
- Background: #F5F7FA
- Text dark: #1A1A1A
- Text gray: #6B7280
- Border: #E5E7EB
- Success: green
- Warning: amber
- Error: red

Use a similar sidebar and top navigation structure as the reference image.

==================================================
3. GLOBAL LAYOUT
==================================================

Create:

LEFT SIDEBAR
TOP HEADER
MAIN CONTENT AREA

Sidebar should be approximately 280px wide.

Top header should contain:
- Language selector
- Notification icon
- User avatar
- PEEP SHARE ID / username
- Current role
- Profile dropdown

Example:

@suchada.t
Administrator

==================================================
4. SIDEBAR INFORMATION ARCHITECTURE
==================================================

Create the following sidebar structure:

PEEP SHARE
Event Dashboard

EVENT MANAGEMENT
- Event List

DATA
- Registration Data
- Survey & Feedback
- Event Reports

PHOTOS
- Photo Management
- Sync Activity

USERS & ACCESS
- User Management
- Role Management

SYSTEM
- Activity Log
- System Settings

The sidebar should support:
- Active state
- Hover state
- Collapsed state
- Icons
- Section labels
- Badge counters where useful

==================================================
5. EVENT LIST
==================================================

The default landing page should be:

Event List

Use the uploaded reference image as the visual reference for this page.

Header:

Event List
[Search Events] [Filter] [+ Create Event]

Do NOT use "Create Tag".
Change it to:
"+ Create Event"

Event table columns:

#
Event Name
Event Date
Status
Registrants
Photos
Members
Actions

Example data:

1
MONOMAX Event
5 - 6 September 2026
Completed
1,248
8,520
12

2
Pattaya Countdown
31 December 2026
Upcoming
3,420
0
18

3
PEEP Sport Day
20 September 2026
Ongoing
820
2,350
9

Statuses:
- Draft
- Upcoming
- Ongoing
- Completed
- Archived

Use status pills similar to the reference image.

Actions:
- View
- Edit
- Manage Access
- More

Add:
- Search
- Status filter
- Date filter
- Pagination
- Sortable table columns

==================================================
6. EVENT DETAIL
==================================================

When clicking an Event, open Event Detail.

Example:

MONOMAX Event
5 - 6 September 2026

Create a secondary tab navigation:

Overview
Registration
Survey
Photos
Members & Access
Settings

Overview should show:

EVENT SUMMARY

Registered
1,248

Checked-in
1,102

Survey Responses
1,102

Photos
8,520

Event Members
12

Then show:
- Registration overview
- Attendance overview
- Survey overview
- Photo upload overview
- Recent activity

==================================================
7. MEMBERS & ACCESS
==================================================

This is one of the most important features.

The PEEP SHARE Super Admin controls which users can access each Event.

Create a page:

Members & Access

Header:

Members & Access
[+ Add Member]

Table:

PEEP SHARE ID
Name
Role
Permissions
Status
Added Date
Actions

Example:

PPS001
Aom
Event Staff
Registration, Survey
Active

PPS002
Beam
Photographer
Photos, Upload
Active

PPS003
Tom
Viewer
View Event
Active

Actions:
- Edit access
- Change role
- Remove access

==================================================
8. ADD MEMBER FLOW
==================================================

When clicking "+ Add Member":

Open a modal or drawer.

Title:
Add Event Member

Fields:

PEEP SHARE ID
[ Search PEEP SHARE ID ]

After searching, show:

User:
Name
Profile image
PEEP SHARE ID

Role:
[ Select Role ]

Available roles:
- Event Admin
- Event Staff
- Photographer
- Viewer

Then show:

Permissions

[✓] View Event
[✓] View Photos
[ ] Upload Photos
[ ] View Registration
[ ] View Survey
[ ] View Reports
[ ] Export Data
[ ] Manage Members

Buttons:
Cancel
Add Member

Make permission changes visually clear.

==================================================
9. ROLE MANAGEMENT
==================================================

Create a dedicated sidebar menu:

USERS & ACCESS
- User Management
- Role Management

Role Management is specifically for PEEP SHARE Super Admin.

The page should contain:

Role Management

[+ Create Role]

Table:

Role Name
Description
Users
Permissions
Status
Actions

Example:

Super Admin
Full system access
5 users

Event Admin
Manage assigned Events
12 users

Event Staff
View Event data and reports
28 users

Photographer
Manage Event photos
45 users

Viewer
View assigned Events
32 users

==================================================
10. ROLE MANAGEMENT DETAIL
==================================================

When clicking a Role:

Role Detail

Example:

Photographer

Description:
Can access assigned Events and manage Event Photos.

Show a Permission Matrix.

PERMISSIONS

EVENT
[✓] View Event
[ ] Create Event
[ ] Edit Event
[ ] Delete Event

REGISTRATION
[ ] View Registration Data
[ ] Export Registration Data

SURVEY
[ ] View Survey
[ ] Export Survey Data

REPORT
[ ] View Event Report
[ ] Export Report

PHOTOS
[✓] View Photos
[✓] Upload Photos
[✓] Sync Photos
[✓] Delete Photos

MEMBERS
[ ] View Members
[ ] Manage Members

SYSTEM
[ ] Manage System Settings
[ ] View Activity Log

Buttons:
Cancel
Save Changes

Allow Super Admin to create custom roles.

==================================================
11. USER MANAGEMENT
==================================================

Create:

User Management

Header:
User Management
[Search] [Filter]

Table:

User
PEEP SHARE ID
Assigned Events
Role
Status
Last Active
Actions

Actions:
- View User
- Edit Roles
- View Events
- Suspend User

User Detail page should contain:

Profile
PEEP SHARE ID
Name
Email
Status

Assigned Events

Event Name
Role
Permissions
Status

Activity

Recent actions performed by the user.

==================================================
12. REGISTRATION DATA
==================================================

Create:

Registration Data

Allow Super Admin to select:

Event
[ All Events ▼ ]

Show summary cards:

Total Registrants
Checked-in
Attendance Rate

Then a dynamic data table.

Important:
Registration questions are different for each Event.

Therefore the table must support dynamic columns.

Example:

Name
Phone
Email
Event Date
PEEP SHARE Username
Custom Questions

Features:
- Search
- Filter
- Sort
- View detail
- Export CSV
- Export Excel

==================================================
13. SURVEY & FEEDBACK
==================================================

Create:

Survey & Feedback

Allow Event selection.

Show:

Total Responses
Response Rate
Average Satisfaction

Then:
- Satisfaction summary
- Question analytics
- Response distribution
- Open-ended feedback

Actions:
View Responses
Export Data

==================================================
14. EVENT REPORT
==================================================

Create:

Event Reports

An Event Report combines:

Registration
Attendance
Survey
Photos

Example:

MONOMAX Event Report

Registered
1,248

Checked-in
1,102

Attendance Rate
88%

Survey Responses
1,102

Average Satisfaction
4.5 / 5

Photos
8,520

Include sections:
- Event Overview
- Registration
- Attendance
- Survey
- Photo Activity

Button:
Export Report

==================================================
15. PHOTO MANAGEMENT
==================================================

Create:

Photo Management

The Photographer is responsible for adding photos to Events.

Photo workflow:

Local Computer
↓
Select Folder
↓
Scan Photos
↓
Detect Existing Photos
↓
Identify New Photos
↓
Upload / Sync
↓
Processing
↓
Completed
↓
Event Gallery

Show photo states:

Uploading
Processing
Completed
Failed

Example:

MONOMAX Event

8,520 Total Photos

8,430 Completed
60 Processing
30 Failed

Actions:
- View Photos
- Retry Failed
- View Sync Activity

==================================================
16. SYNC ACTIVITY
==================================================

Create:

Sync Activity

Show activity logs such as:

09:32
Beam
Uploaded 1,250 photos
MONOMAX Event

10:15
Aom
Uploaded 820 photos

10:22
30 photos failed
MONOMAX Event

Filters:
- Event
- User
- Status
- Date

==================================================
17. ACTIVITY LOG
==================================================

Create a system-wide Activity Log.

Show:

Timestamp
User
Action
Event
Details

Examples:

Admin added a new Event member.

Admin changed Photographer permissions.

Beam uploaded 850 photos.

Aom exported Registration Data.

Admin changed Role permissions.

Include filters:
- User
- Event
- Action
- Date

==================================================
18. SYSTEM SETTINGS
==================================================

Create:

System Settings

Sections:

General
Registration
Survey
Photos
Storage
Notifications

Keep system-level settings separate from individual Event settings.

==================================================
19. IMPORTANT PERMISSION MODEL
==================================================

Implement a two-layer permission system.

LAYER 1:
Event Access

Does the user have access to this Event?

LAYER 2:
Feature Permission

What can the user do inside the Event?

Example:

Beam
↓
MONOMAX Event
↓
Role: Photographer

Permissions:
✓ View Event
✓ View Photos
✓ Upload Photos
✓ Sync Photos
✕ Registration Data
✕ Survey
✕ Export Data
✕ Manage Members

The UI must reflect these permissions.

==================================================
20. SUPER ADMIN CAPABILITIES
==================================================

The PEEP SHARE Super Admin should be able to:

- See ALL Events
- Create Events
- Edit Events
- Archive Events
- Manage Event Access
- Add / Remove Event Members
- Assign Roles
- Create Custom Roles
- Edit Permissions
- Manage Users
- View all Registration Data
- View all Survey Data
- View Reports
- Manage Event Photos
- View Photo Sync Activity
- View Storage
- View Activity Logs
- Manage System Settings

==================================================
21. INTERACTION REQUIREMENTS
==================================================

Build the project as a functional prototype.

The following interactions must work:

- Sidebar navigation
- Event list search
- Event filters
- Event detail navigation
- Add Event
- Add Member
- Assign Role
- Edit Permissions
- Create Role
- Edit Role
- Search Users
- Filter Users
- View Registration Data
- View Survey Data
- View Reports
- View Photo Management
- View Sync Activity
- Activity Log filtering

Use realistic mock data.

No backend is required for this prototype unless needed.
Use local state / mock data for interactions.

==================================================
22. RESPONSIVE DESIGN
==================================================

Primary target:
Desktop / Laptop

Also support:
Tablet
Mobile

Desktop should closely follow the uploaded reference image.

Maintain:
- Sidebar
- Top navigation
- Content card
- Tables
- Modals
- Drawers
- Tabs

On smaller screens:
- Collapse sidebar
- Convert tables into responsive layouts
- Preserve important actions

==================================================
23. UX PRINCIPLES
==================================================

Prioritize:

1. Clear hierarchy
2. Easy Event discovery
3. Clear permission management
4. Low cognitive load
5. Strong table usability
6. Clear system status
7. Safe handling of sensitive Registration Data
8. Clear distinction between Event-level settings and System-level settings

Avoid:
- Excessive colors
- Overly complex dashboards
- Unnecessary animations
- Dense UI
- Decorative components that do not provide useful information

==================================================
24. FINAL NAVIGATION STRUCTURE
==================================================

Use this final sidebar:

PEEP SHARE
Event Dashboard

EVENT MANAGEMENT
  Event List

DATA
  Registration Data
  Survey & Feedback
  Event Reports

PHOTOS
  Photo Management
  Sync Activity

USERS & ACCESS
  User Management
  Role Management

SYSTEM
  Activity Log
  System Settings

==================================================
25. IMPORTANT DESIGN REQUEST
==================================================

The uploaded image is the visual reference.

Preserve its:
- Sidebar style
- Orange PEEP SHARE branding
- Table design
- Rounded cards
- Typography hierarchy
- Header structure
- Spacing
- Status pills
- Search field
- Action buttons
- Minimal SaaS dashboard aesthetic

But redesign the information architecture for the PEEP SHARE Event Dashboard described above.

The result should look like a polished real-world enterprise SaaS product, not a generic AI-generated dashboard.

Start by implementing the Super Admin experience and make Event List the default screen.