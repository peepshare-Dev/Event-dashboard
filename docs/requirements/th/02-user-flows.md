# 02 — User Flows

รูปแบบ: `Service → Page → User Action → System Response → Data Dependency → Result`
ทุก Flow อ้างอิงจาก Source Code หากเป็นการจำลองจะระบุไว้

---

## 1. AUTH — เข้าสู่ระบบและเลือก Service

```mermaid
flowchart TD
    A([เปิดแอป]) --> B{isAuthenticated?}
    B -- ไม่ --> L[LoginPage]
    L --> M{เลือกวิธี}
    M -- Username Login --> U[กรอกเบอร์โทร + รหัสผ่าน]
    U --> V{ช่องว่าง?}
    V -- ใช่ --> VE[Browser แสดง required] --> U
    V -- ไม่ --> OK[onLogin — ไม่ตรวจ Credential]
    M -- QR Code Login --> Q[แสดงไอคอน QR]
    Q --> QS[กด Simulate Scan]
    QS --> QV[Modal รหัส 831106]
    QV -- Cancel / Esc / คลิกนอก --> Q
    QV -- Verify & Continue --> OK
    OK --> S[Select Service]
    B -- ใช่ --> S
    S -- Open Service --> LD[Loading 1200ms]
    LD --> SV{service.id}
    SV -- event-dashboard --> D[EventDashboardApp]
    SV -- set-event --> E[SetEventApp]
    SV -- media-ads --> MA[MediaAdsApp]
    SV -- peep-sync --> P[PeepSyncApp]
    SV -- coupon / peep-oa --> PH[ServicePlaceholder]
    S -- เมนูโปรไฟล์ → User management --> AD[AccountAdminPage]
    D & E & MA & P & PH & AD -- Switch Service --> S
    D & E & MA & P & PH & AD & S -- Log Out --> L
```

| ขั้น | User Action | System Response | Data Dependency | Result |
|---|---|---|---|---|
| 1 | กรอกเบอร์โทรและรหัสผ่าน กด Log In | ตรวจเฉพาะ HTML `required` แล้วตั้ง `isAuthenticated=true` | ไม่มี | เข้าหน้า Select Service |
| 2 | กด Open Service | แสดง Loading 1.2 วินาที (`setTimeout`) | `services` ใน `mock.ts` | เปิด Service |
| 3 | เปลี่ยนภาษา (หน้า Login หรือ Header) | เปลี่ยนภาษาทันที บันทึก `localStorage` | `peepshare.lang` | ภาษาคงอยู่หลัง Refresh |
| 4 | Log Out | `isAuthenticated=false` | — | กลับหน้า Login (State ของ Service ถูก Unmount) |

**จุดที่ไม่มี:** การจัดการ Session หมดอายุ, การล็อกบัญชี, ข้อความ Credential ผิด, Forgot Password Flow

---

## 2. DASH — Event Dashboard

```mermaid
flowchart TD
    A[Event List — dashboard mode<br/>ไม่แสดง Draft] --> B[ค้นหาชื่อ / กรองสถานะ / Sort / Page]
    A -- คลิกชื่อ Event --> C[Event Detail<br/>Summary Cards]
    C --> T{แท็บ}
    T -- Registration ค่าเริ่มต้น --> R[ตารางผู้ลงทะเบียน<br/>ค้นหา + กรอง Check-in]
    R -. CSV / Excel .-> X[ไม่มีการทำงาน]
    T -- Survey --> SL[รายการแบบสำรวจของ Event]
    SL -- ไม่มีแบบสำรวจ --> SE[Empty: No surveys yet]
    SL -- คลิกการ์ด --> SD[Form Detail]
    SD --> SS[Submissions table]
    SD --> SO[Overview Statistics]
    SS -- CSV / Excel --> DL[ดาวน์โหลดไฟล์จริง<br/>survey-id-responses.csv/.xls]
    C -- Breadcrumb Event List / เมนู --> A
```

| ขั้น | User Action | System Response | Data | Result |
|---|---|---|---|---|
| 1 | เปิด Event List | กรอง Draft ออก, แสดง 6 Event, คอลัมน์ Check-ins | `events` | รายการ Event |
| 2 | คลิกชื่อ Event | แสดง Event Detail แท็บ Registration | `events`, `registrationData` | ข้อมูลผู้ลงทะเบียนของ Event |
| 3 | เลือกแท็บ Survey → การ์ดฟอร์ม | แสดง Submissions | `surveyForms` | ตารางคำตอบ |
| 4 | กด CSV / Excel ใน Submissions | สร้าง Blob และดาวน์โหลด | Submissions ของฟอร์ม | ไฟล์ CSV (UTF-8 BOM) หรือ XLS (HTML Table) |

---

## 3. SYNC — PEEP SYNC

### 3.1 Event และ Members

```mermaid
flowchart TD
    A[Event List — แสดงทุกสถานะรวม Draft] -- View / คลิกชื่อ --> B[Event Detail]
    A -. Edit / Access / ⋯ .-> X[ไม่มีการทำงาน]
    B --> T{แท็บ}
    T --> O[Overview — ตัวเลขคำนวณจากสัดส่วน Hardcode]
    T --> R[Registration]
    T --> S[Survey]
    T --> C[Collections — อ่านอย่างเดียว จาก mockCollections]
    T --> M[Members & Access]
    M -- Add Member --> AM[Panel: กรอก PEEP SHARE ID → Search]
    AM --> F[พบ Kanya Srisuwan เสมอ]
    F --> RP[เลือก Role + Permissions]
    RP -- Add Member --> M
    M -- Edit --> EM[Modal Edit Access] -- Save --> M
    M -- Remove --> M2[ลบทันที ไม่มีการยืนยัน]
```

### 3.2 Collections

```mermaid
flowchart TD
    L[Collections List<br/>เรียงตาม updatedAt ล่าสุด] -- Create Collection --> CR[Modal: Name* / Description / Owner / Event]
    CR -- Create --> L
    L -- Share --> SH[Share Modal]
    L -. Delete ในรายการ .-> X[ไม่มีการทำงาน]
    L -- View / คลิกชื่อ --> D[Collection Detail]
    D --> FB[File Browser: Gallery/List, ค้นหา, กรอง Type/Status, 24 ไฟล์ต่อหน้า]
    FB -- เลือกไฟล์ --> BB[Bulk bar: Unselect ทำงาน / Download, Delete ไม่ทำงาน]
    D -. Upload .-> X2[เปิด File Picker แต่ไม่ประมวลผลไฟล์]
    D -- Upload ▾ → Photo Sync --> PS[เลือกโฟลเดอร์] -- Continue --> PSN[ไปเมนู Photo Sync<br/>เฉพาะใน PEEP SYNC]
    D -- Share --> SH
    D -- ⋮ People with access --> PA[แก้ Role / Remove ทันที]
    D -- ⋮ Delete Collection --> DC[ยืนยัน] --> L
    SH -- Anyone with link --> PUB[Sharing = Public Link]
    SH -- เลือกคน/กลุ่ม --> RES[Sharing = Restricted]
    SH -- ไม่เลือกใคร --> PRI[Sharing = Private]
    SH -- Copy Link --> CL[คัดลอก https://peepshare.com/c/slug]
    SH -- Download QR Code --> QR[ดาวน์โหลด slug-qr.png จริง]
```

### 3.3 Cloud Management และ Photo Sync

- **Cloud Management:** แสดงค่าคงที่ (28.5 / 100 GB) ค้นหาตาราง "Storage Usage by Event" ได้ ปุ่ม Upgrade/Manage ทั้งหมดไม่ทำงาน
- **Photo Sync (`PhotoManagement.tsx`):** เลือก Event จาก Dropdown → แสดงตัวเลขคำนวณจากสัดส่วน Hardcode, Progress 94% คงที่, ขั้นตอน Workflow เป็นภาพนิ่ง ปุ่มทั้งหมดไม่ทำงาน

---

## 4. EVENT / EFORM — Set Event

### 4.1 วงจรชีวิต Event (Status Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> Draft: Save Draft (Create)
    [*] --> Pending: Create Event (Step สุดท้าย)
    [*] --> Private: Create + เลือก Private ใน Status Panel แล้วกด Save
    Draft --> Pending: Submit to Review
    Draft --> Draft: Save Draft
    Pending --> Published: Publish
    Pending --> Scheduled: Schedule (เลือก Scheduled + วันเวลาอนาคต)
    Pending --> Private: Publish (เลือก Private)
    Private --> Published: Publish (หลังเลือก Published ใน Panel)
    Scheduled --> Published: Publish (หลังเลือก Published ใน Panel)
    Published --> Published: Save Changes
    Draft --> Trash: Delete / Move to Trash
    Pending --> Trash
    Private --> Trash
    Scheduled --> Trash
    Published --> Trash
    Trash --> [*]: Delete Permanently
    Trash --> Draft: แก้ไขแล้วเลือกสถานะใหม่ (Unverified ที่ Runtime)
```

> หมายเหตุ: ไม่มีกลไกเปลี่ยน `Scheduled` → `Published` อัตโนมัติเมื่อถึง `scheduledAt` (ไม่มีโค้ดที่ใช้ค่านี้)
> การเปลี่ยนสถานะบางเส้นทาง (เช่น Published → Draft ผ่าน Status Panel) อนุญาตใน UI แต่ไม่มีการระบุ Business Rule — ดู `Q-010`

### 4.2 สร้าง Event (Create)

```mermaid
flowchart TD
    L[Event List] -- Create Event --> S1[Step 1: Event Info<br/>Information + Schedule]
    S1 -- Next: Validate เฉพาะ Step นี้ --> E1{มี Error?}
    E1 -- ใช่ --> S1
    E1 -- ไม่ --> S2[Step 2: Venue & Registration]
    S2 -- Next --> S3[Step 3: Attendee Experience<br/>Collection / Event Form / Survey Form]
    S3 -- Next --> S4[Step 4: Communication]
    S4 -- Create Event --> V{Validate ทั้งฟอร์ม Complete}
    V -- ไม่ผ่าน --> J[ไปยัง Step แรกที่มี Error + Focus]
    V -- ผ่าน --> W[สถานะ Pending<br/>เปิด Event Workspace → Event Detail<br/>ไฮไลต์ปุ่ม Publish 3 วินาที]
    S1 & S2 & S3 & S4 -- Save Draft --> D{Validate รูปแบบ}
    D -- ผ่าน --> L2[กลับ Event List + Toast saved as draft]
    S1 -- Cancel --> G{มีการแก้ไข?}
    G -- ใช่ --> DM[Modal Discard changes?]
    G -- ไม่ --> L
```

### 4.3 แก้ไขและเผยแพร่ (Edit / Publish)

| ขั้น | User Action | System Response | Data | Result |
|---|---|---|---|---|
| 1 | กดชื่อ Event หรือไอคอน Edit | เปิด Workspace (Overview หรือ Event Detail) | `events` state | Workspace ของ Event |
| 2 | แก้ไข Step ใดก็ได้ (กระโดดข้าม Step ได้ใน Edit) | ไม่ Validate ตอนกด Next | — | — |
| 3 | กด Submit to Review (Draft) | Validate Complete → สถานะ Pending | — | ไฮไลต์ปุ่ม Publish |
| 4 | กด Publish (Pending/Private/Scheduled) | Validate Complete → Published / Private / Scheduled | — | กลับ Event List + Toast |
| 5 | กด Save Changes (สถานะอื่น) | Validate Complete ตามสถานะที่เลือกใน Panel | — | กลับ Event List + Toast "updated" |

### 4.4 Event Workspace

```mermaid
flowchart LR
    W[Event Workspace] --> O[Overview<br/>สรุปข้อมูล อ่านอย่างเดียว]
    W --> D[Event Detail = ฟอร์ม Edit]
    W --> C[Collection<br/>Link / Change / Unlink ทันที]
    W --> Q[QR Code / Scanner<br/>New link / Copy / Download PNG / Delete]
    W --> U[User management<br/>MembersAccess ชุดเดียวกันทุก Event]
    W --> A[Activity logs<br/>Diff จากการบันทึก + ประวัติตัวอย่าง]
    O -- การ์ด QR links --> Q
    O -- Edit event --> D
```

### 4.5 ทำซ้ำ / ลบ

| Action | System Response | Result |
|---|---|---|
| Duplicate (ไม่ใช่ Trash) | สร้างสำเนา ID ใหม่ ชื่อ "(Copy)" สถานะ Draft ล้าง registrants, qrLinks, scheduledAt, password | แทรกต่อจากต้นฉบับ, ไฮไลต์ "NEW" 4 วินาที, Toast |
| Delete (ไม่ใช่ Trash) | Modal "Move event to Trash?" | สถานะ Trash, บันทึก Activity "Moved to Trash", **ไม่มี Toast** |
| Delete (Trash) | Modal "Delete event permanently?" | ลบออกจากรายการ, **ไม่บันทึก Activity, ไม่มี Toast** |

---

## 5. COMM — Broadcast Automation

```mermaid
flowchart TD
    C[Step 4 Communication] --> T{Enable automated messages?}
    T -- ปิด --> E[Empty state + ปุ่ม Enable Communication]
    T -- เปิด --> F[กรอก PEEP OA ID* / Community ID]
    F --> J[Journey: Registers → Gets QR → Event day nears → Checks in → Event ends]
    J --> LST[รายการ Automation<br/>Event ใหม่มี 3 รายการเริ่มต้น]
    LST -- Add Broadcast / Edit --> DR[Drawer: Name, Trigger, Timing, Channel PEEP OA, Messages 1–5]
    DR -- Save Automation --> V{validateDraft}
    V -- ผ่าน --> LST
    LST -- Duplicate / Toggle / Delete ยืนยัน --> LST
    LST -. ไม่มีการส่งข้อความจริง .-> X[เก็บใน details.communication]
```

---

## 6. TPL — Template Library (Regis Form / Survey Form)

```mermaid
flowchart TD
    L[รายการ Template ตามประเภท] -- ค้นหา --> L
    L -- Create Template --> E[Drawer Edit]
    L -- View / คลิกชื่อ --> V[Drawer View: Fields, Used in events]
    V -- คลิก #id ชื่อ Event --> EV[เปิด Event → Event Detail]
    V -- Edit Template --> E
    V -- Duplicate --> E2[สำเนา (Copy) เปิดใน Edit]
    E -- Save: Validate --> V
    L -- Delete ยืนยัน --> L
    T[ฟอร์ม Event: Use Template] -. คัดลอก ไม่ผูก .-> L
```

---

## 7. MEDIA — Media Ads

```mermaid
flowchart TD
    N[เลือกเมนู: Home banner / Community banner / Cover Page] --> L[List<br/>Loading skeleton → รายการ]
    L -- Create --> F[Form + Live Preview]
    L -- Edit / คลิกชื่อ --> F
    F -- Save: Validate --> OK[บันทึกผ่าน Mock API 600ms] --> L
    F -- Cancel/Back/เปลี่ยนเมนู ขณะแก้ไข --> DG[Discard changes?]
    L -- ⋮ Duplicate --> DP[สำเนา Draft → เปิด Edit]
    L -- ⋮ Change Priority / Sort --> S[Sort: Drag & Drop / ลูกศร] -- Save Order --> L
    L -- ⋮ Deactivate --> DC{แสดงอยู่หรือ Scheduled?}
    DC -- ใช่ --> CM[ยืนยัน] --> L
    DC -- Expired --> L
    L -- ⋮ Activate --> L
    L -- ⋮ Delete ยืนยัน --> L
```

สถานะที่แสดง (คำนวณทุกครั้งที่ Render): `draft` → Draft, `inactive` → Inactive, Schedule ก่อนเริ่ม → Scheduled, Schedule เลยวันสิ้นสุด → Expired, อื่นๆ → Active

---

## 8. ADMIN — User Management

```mermaid
flowchart TD
    S[Select Service] -- Profile → User management --> U[Users List]
    U -- ค้นหา / กรอง Role --> U
    U -- View --> UD[User Detail<br/>Assigned events และ Activity เป็น Hardcode]
    U -- Suspend / Reactivate --> U
    U -. Edit .-> X[ไม่มีการทำงาน]
    U -- เมนู Roles & Permissions --> R[Role List]
    R -- Create Role --> CM[Modal] -- Create Role --> R2[ปิด Modal ไม่บันทึก]
    R -- Edit / คลิกชื่อ --> RD[Permission Matrix — ติ๊กได้]
    RD -. Save Changes .-> X2[ไม่มีการทำงาน]
    R -. View Users .-> X3[ไม่มีการทำงาน]
```
