# 06 — API และช่องว่างในการเชื่อมต่อ (API & Integration Gaps)

## 1. สรุปสถานะ

| หัวข้อ | สถานะ | หลักฐาน |
|---|---|---|
| HTTP/API Client | **ไม่มี** — ไม่พบ `fetch`, `axios`, `XMLHttpRequest`, `WebSocket` | ค้นหาทั้ง `src/` |
| Environment Config | ไม่มีการใช้ `import.meta.env` | ค้นหาทั้ง `src/` |
| Mock API ที่มี Interface | `data/mock/promoApi.ts` (Media Ads เท่านั้น) | Comment: "MOCK ONLY — stands in for the banner / cover page / content / coupon APIs, which don't exist in this project yet... the signatures are the contract." |
| Persistence | `localStorage` เฉพาะภาษา | `i18n/index.tsx` |
| การเชื่อมต่อภายนอกที่ทำงานจริง | Google Maps Embed (iframe), Google Fonts (ในหน้า Preview แท็บใหม่), Clipboard API, Fullscreen API, File System Access API (`showDirectoryPicker`), ไลบรารี `qrcode` | ดู `GAP-013` |

> **ข้อห้ามในการตีความ:** API ที่ระบุด้านล่างเป็น **ช่องว่างที่ Frontend ต้องการ** ไม่ใช่ Spec ของ Backend ที่ยืนยันแล้ว Endpoint, Payload และ Schema ทั้งหมดเป็น `TBD` และต้องให้ทีม Backend ออกแบบ ชื่อ Operation ด้านล่างอ้างอิงจากการกระทำที่ UI ต้องการเท่านั้น

---

## 2. รายการ Gap

### GAP-001 — Authentication, Session และ Current User
- **ใช้โดย:** FR-AUTH-001, 002, 006; FR-EVENT-001 (Mine); FR-ADMIN-007
- **พฤติกรรมปัจจุบัน:** `isAuthenticated` เป็น `useState(false)`; ชื่อผู้ใช้ `@suchada.t`, Role ตาม Service แบบ Hardcode; Author ของ Set Event = `'Suchadas'`
- **Operation ที่ Frontend ต้องการ:** Login ด้วยเบอร์โทร+รหัสผ่าน, QR Login Session (สร้าง QR, รอสแกน, ยืนยันรหัส), Logout, ดึงข้อมูลผู้ใช้ปัจจุบัน (ชื่อ, Avatar, Role, สิทธิ์ต่อ Service), Forgot Password, Remember me / Refresh session
- **คำถาม:** `Q-007` (ใช้บัญชี PEEP SHARE เดิมหรือไม่), `Q-002`, `Q-003`

### GAP-002 — Event Data สำหรับ Event Dashboard และ PEEP SYNC
- **ใช้โดย:** FR-DASH-001–006, FR-SYNC-001–002
- **ปัจจุบัน:** `events` 7 รายการใน `mock.ts`; ฟิลด์ `dates` เป็นข้อความ
- **ต้องการ:** List Events (search, status filter, sort รวมวันที่, pagination, scope ตามสิทธิ์/การมอบหมาย), Event Summary (registrants, checkedIn, surveyResponses, photos, members), Overview breakdown จริง (ticket type, photo status, team by role)
- **คำถาม:** `Q-001` (รวมกับ Set Event), `Q-005`

### GAP-003 — Registration
- **ใช้โดย:** FR-DASH-007, 008; FR-EVENT-010 (registrants); FR-EFORM-014
- **ปัจจุบัน:** `registrationData` 13 แถว; registrants ใน Set Event เป็นค่าคงที่; ฟอร์มลงทะเบียน (`eventForm`) ไม่มีหน้าฝั่งผู้เข้าร่วม
- **ต้องการ:** List Registrations ต่อ Event (search รวม phone?, filter check-in, sort, pagination, **dynamic columns** ตามฟอร์ม), Export CSV/Excel, Registration detail, Check-in status, การส่งคำตอบฟอร์มจากผู้เข้าร่วม
- **คำถาม:** `Q-013`

### GAP-004 — Survey Responses
- **ใช้โดย:** FR-DASH-009–012
- **ปัจจุบัน:** `surveyForms` Mock; Export ทำฝั่ง Client
- **ต้องการ:** List Survey Forms ต่อ Event, Submissions (pagination), สถิติสรุป, Export (ฝั่ง Server เมื่อข้อมูลมาก)
- **หมายเหตุ:** ต้องเชื่อมโมเดลคำถามระหว่าง Set Event Builder และ Dashboard (`Q-001`)

### GAP-005 — Set Event: Event CRUD และ Lifecycle
- **ใช้โดย:** FR-EVENT-001–008, FR-EFORM-003, 004, 006, 007, 021
- **ปัจจุบัน:** `useState(setEventsSeed)` 100 รายการ; ID = max+1; รหัสผ่าน Plain text
- **ต้องการ:** List (tab/scope, search, filters, sort, pagination, counts ต่อแท็บ), Get, Create, Update, Duplicate, Submit for review, Publish/Schedule/Private, Move to Trash, Restore, Delete permanently, **Scheduler สำหรับ Auto-publish ตาม `scheduledAt`**, Server-side Validation (กฎใน `BR-EFORM-001/002`), Password Hashing, Concurrency (แก้ไขพร้อมกัน — TBD)
- **คำถาม:** `Q-010`, `Q-015`, `Q-025`

### GAP-006 — File / Media Upload
- **ใช้โดย:** FR-EFORM-017, 018; FR-COMM-004; FR-MEDIA-013; FR-SYNC-018
- **ปัจจุบัน:** `URL.createObjectURL` (ไม่อัปโหลด); Media Ads ใช้ `uploadImage` Mock (900 ms) ที่คืน Blob URL
- **ต้องการ:** Upload รูป (JPEG/PNG ≤ 50 MB), วิดีโอ/ไฟล์แนบใน Rich Text, ความคืบหน้า, การตรวจขนาด Pixel (TBD), CDN URL ถาวร

### GAP-007 — Collections, Files และ Sharing
- **ใช้โดย:** FR-SYNC-003, 010–017; FR-EVENT-011; FR-EFORM-013
- **ปัจจุบัน:** `mockCollections` 6 รายการ; ไฟล์สร้างด้วย `mockFiles`; Collection เชื่อม Event ด้วยชื่อ
- **ต้องการ:** CRUD Collection, List Files (search, type/status filter, pagination), Bulk Download/Delete, Download Collection, Sharing (public link, restricted list, roles), People access, Public link resolution (`/c/{slug}`), เชื่อม Event ด้วย ID
- **คำถาม:** `Q-016`

### GAP-008 — Cloud Storage และ Billing
- **ใช้โดย:** FR-SYNC-008, 009; FR-SYNC-002
- **ปัจจุบัน:** ค่าคงที่ทั้งหมด
- **ต้องการ:** Storage quota/usage, Breakdown ตามประเภท, Usage by Event, Current plan, Package list/ราคา, Upgrade/Manage plan (Payment)

### GAP-009 — Event Members และ User Lookup
- **ใช้โดย:** FR-SYNC-004–007; FR-EVENT-019
- **ปัจจุบัน:** `eventMembers` ชุดเดียวกันทุก Event; Search คืน "Kanya Srisuwan" เสมอ
- **ต้องการ:** Lookup user by PEEP SHARE ID (พบ/ไม่พบ), List/Add/Update/Remove member **ต่อ Event**, Role + Permission ต่อ Event
- **คำถาม:** `Q-002`, `Q-014`

### GAP-010 — Photo Sync / Upload Pipeline
- **ใช้โดย:** FR-SYNC-018, 019
- **ปัจจุบัน:** UI จำลองทั้งหมด (Progress 94% คงที่)
- **ต้องการ:** Folder sync/scan, ตรวจรูปซ้ำ/รูปใหม่, Upload batch, Processing status, Retry failed, Upload sessions history (เดิมมีหน้า `SyncActivity.tsx` ที่ไม่ได้ใช้)
- **คำถาม:** `Q-006`

### GAP-011 — QR Link และ Check-in
- **ใช้โดย:** FR-EVENT-012, 013
- **ปัจจุบัน:** สร้าง QR ฝั่ง Client จาก URL; ไม่มีปลายทาง `/e/{id}/...` จริง; `qrExpiresAt` ไม่ถูกบังคับใช้
- **ต้องการ:** CRUD QR Links, Route ปลายทาง (register/check-in/survey), การบังคับหมดอายุ, Scanner (เมนูชื่อ "QR Code / Scanner" แต่ไม่มีฟังก์ชันสแกน)

### GAP-012 — Audit / Activity Log
- **ใช้โดย:** FR-EVENT-014–016; FR-ADMIN-003
- **ปัจจุบัน:** Log ระดับ Event สร้างจาก Diff ใน Session; ประวัติก่อนหน้าเป็น `sampleActivity` (Mock); Log ระดับระบบเป็นข้อมูลของ Event Dashboard
- **ต้องการ:** บันทึก Audit ฝั่ง Server (ผู้ใช้จริง, เวลา Server), Query ต่อ Event/ระบบ/ผู้ใช้ พร้อม Filter และ Pagination, นโยบายการเก็บรักษา

### GAP-013 — บริการภายนอกที่ Frontend เรียกโดยตรง
| บริการ | ใช้ที่ | หมายเหตุ |
|---|---|---|
| Google Maps Embed `https://maps.google.com/maps?q=...&output=embed` | `LocationSection.tsx` | ไม่ใช้ API Key; ต้องยืนยันเงื่อนไขการใช้งาน |
| Google Fonts | `EventPreviewModal.tsx` (หน้า Preview แท็บใหม่) | — |
| Clipboard / Fullscreen / File System Access API | หลายจุด | ขึ้นกับเบราว์เซอร์; บางจุดไม่มี Fallback |

### GAP-014 — Payment
- **ใช้โดย:** FR-EFORM-012
- **ปัจจุบัน:** เลือก Payment Methods (PromptPay, Credit / Debit Card, Bank Transfer) เท่านั้น
- **ต้องการ:** Payment Gateway, สถานะการชำระ, การคืนเงิน — TBD (`Q-020`)

### GAP-015 — Messaging (PEEP OA), Scheduler และการส่งแบบสำรวจ
- **ใช้โดย:** FR-COMM-001–008; FR-EFORM-015
- **ปัจจุบัน:** เก็บการตั้งค่าเท่านั้น; ไม่ตรวจ OA ID
- **ต้องการ:** Verify OA/Community ID, Trigger events (registration, check-in, event end), Scheduler (before event, delay, specific datetime, survey send time), Template rendering ตัวแปร, Delivery status, Claim Gift flow
- **คำถาม:** `Q-011`

### GAP-016 — HTML Sanitization
- **ใช้โดย:** FR-EFORM-018, 019
- **ปัจจุบัน:** Description HTML ถูกเก็บและแสดงด้วย `dangerouslySetInnerHTML` / แทรกในหน้า Preview โดยไม่ Sanitize
- **ต้องการ:** Sanitize ฝั่ง Server ก่อนบันทึกและก่อนแสดงต่อผู้เข้าร่วม (ความเสี่ยง Stored XSS)

### GAP-017 — Form Templates
- **ใช้โดย:** FR-TPL-001–006, FR-EFORM-016
- **ต้องการ:** CRUD Templates แยกประเภท, Usage count ต่อ Template, ผู้แก้ไขล่าสุด

### GAP-018 — Banner / Cover Page API
- **ใช้โดย:** FR-MEDIA-001–015
- **ปัจจุบัน:** Mock ตาม Interface `PromoApi` (list/save/remove/reorder/uploadImage) — **เป็นจุดเริ่มต้นที่ดีที่สุดสำหรับ Backend Contract**
- **ต้องการเพิ่ม:** แยกตาม Placement (home banner, community banner, cover), Server-side status computation และ Timezone, การส่งข้อมูลให้แอปมือถือ (Active ตาม Priority, Frequency ต่อผู้ใช้), Error responses ที่ UI รองรับอยู่แล้ว (load/save/delete/reorder/upload)

### GAP-019 — Deep Links, Content และ Coupon Lookup
- **ใช้โดย:** FR-MEDIA-007
- **ปัจจุบัน:** App Page 5 รายการ Placeholder; Content ID เป็นข้อความอิสระ; `contentApi.search` (Mock) ไม่ถูกใช้; `couponApi.search` คืน 4 รายการ
- **ต้องการ:** รายการ Deep Link ที่แอปรองรับ, Content search/validate (Event, Post, Community), Coupon search (เชื่อม Service Coupon)
- **คำถาม:** `Q-023`

### GAP-020 — Users, Roles และ Permissions
- **ใช้โดย:** FR-ADMIN-001–008
- **ต้องการ:** List/Get/Update user status, Assigned events จริง, User activity, CRUD Role, Permission matrix save, Role activation, Users by role, การบังคับใช้สิทธิ์ทั้ง Frontend (ซ่อนเมนู) และ Backend (Authorization)
- **คำถาม:** `Q-002`, `Q-003`, `Q-012`

---

## 3. สถานะ Loading / Error ที่ Frontend ต้องเพิ่มเมื่อเชื่อม API

| Service | Loading State | Error State | หมายเหตุ |
|---|---|---|---|
| Media Ads | ✅ มี (Skeleton, Saving…, Uploading…) | ✅ มี (ยังไม่เคยถูกทดสอบ เพราะ Mock ไม่ Error) | พร้อมที่สุด |
| Set Event | ❌ ไม่มี (บันทึกแบบ Synchronous) | ❌ ไม่มี Toast Error | ต้องเพิ่มทั้งหมด |
| Event Dashboard | ❌ | ❌ | ต้องเพิ่มทั้งหมด |
| PEEP SYNC | ❌ (ยกเว้น QR "Preparing…") | ❌ | ต้องเพิ่มทั้งหมด |
| Account Admin | ❌ | ❌ | ต้องเพิ่มทั้งหมด |

`Design.md` §25–26 กำหนดให้มี Skeleton, Progress และข้อความ Error ที่บอก "เกิดอะไรขึ้น" และ "ทำอะไรต่อได้"

## 4. Dead Code / Mock ที่ควรลบหรือเชื่อมเมื่อเชื่อม API
- `views/SyncActivity.tsx` — ไม่ถูก import
- `views/SystemSettings.tsx` — เข้าถึงไม่ได้
- `contentApi` ใน `data/mock/promoApi.ts` — ไม่ถูกใช้; Prop `events` ใน `PromoForm` ไม่ถูกใช้
- `Header` prop `roleSwitcher` ("Preview as") — ไม่มีผู้ใช้
- `RegistrationData.tsx` / `SurveyFeedback.tsx` โหมด Standalone (ไม่ใช่ `inEvent`) — เข้าถึงไม่ได้
- `SaveAction 'draft'` ใน `EventFormPage.tsx` — ไม่มีปุ่มเรียก
