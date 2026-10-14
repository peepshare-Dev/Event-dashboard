# รายงานการตรวจทานเอกสาร Requirements (Documentation Review Report)

- **วันที่ตรวจ:** 13 ต.ค. 2026
- **ขอบเขต:** `docs/requirements/` (ภาษาอังกฤษ) และ `docs/requirements/th/` (ภาษาไทย) เทียบกับ Source Code ใน `src/`
- **ผู้อ่าน:** PM, BA, Tech Lead, Backend/Frontend Developer, QA

---

## A. Executive Summary

1. **ไม่มีเอกสารภาษาอังกฤษให้เปรียบเทียบ** — ไม่พบไฟล์ใดใน `docs/requirements/` ทั้งใน Working tree และใน Git history (`git log --all -- docs` ว่าง) เอกสารชุดเดียวที่มีคือฉบับภาษาไทยใน `docs/requirements/th/` ซึ่งจัดทำในรอบเดียวกันนี้ (Prompt 09) **ดังนั้นการตรวจความสอดคล้องสองภาษา (หัวข้อ C) จึงทำไม่ได้และระบุสถานะเป็น `Incomplete Audit`** ผู้ตรวจไม่ได้สร้างฉบับภาษาอังกฤษขึ้นเองเพื่อเปรียบเทียบ เพราะจะเป็นการเปรียบเทียบเอกสารกับคำแปลของตัวเอง ซึ่งไม่มีคุณค่าในการตรวจสอบ
2. **เอกสารภาษาไทยผ่านการตรวจกับ Source Code** — ตรวจพฤติกรรมสำคัญ 27 จุดด้วยการอ่านโค้ดโดยตรงหลังจัดทำเอกสาร ทั้ง 27 จุดตรงกับเอกสาร พบความคลาดเคลื่อนเล็กน้อย 3 จุด (อ้างชื่อฟังก์ชันผิด, รายการ Permission ไม่ครบ, คำอธิบาย State Diagram กำกวม) ซึ่งแก้ไขแล้ว
3. **ความสอดคล้องภายในเอกสาร (Internal Consistency)** ตรวจด้วยสคริปต์: ไม่มี ID ซ้ำ, ทุก ID ที่ถูกอ้างอิงมีนิยาม, จำนวนในตารางสรุปตรงกับเนื้อหาจริง (54 US / 116 FR / 144 AC / 54 QA / 30 ISS / 25 Q / 20 GAP)
4. **ข้อเท็จจริงหลักที่เอกสารสะท้อน:** ระบบเป็น Frontend Prototype ที่ไม่มี Backend, ไม่มี API, ไม่มี Authentication จริง, ไม่มีการบังคับใช้สิทธิ์ และไม่มีการบันทึกข้อมูลถาวร (ยกเว้นภาษา) — ทุก Service จึงยังไม่พร้อมส่งต่อให้ Backend โดยไม่มีการยืนยันจาก PM/Dev ในประเด็นโมเดลข้อมูลและสิทธิ์
5. **ความพร้อมโดยรวม:** เอกสารภาษาไทย **พร้อมให้ Developer/QA Review** ในฐานะ "บันทึกพฤติกรรม Frontend ปัจจุบัน" แต่ **ยังไม่พร้อมเป็น Spec สำหรับพัฒนา Backend** จนกว่าจะตอบคำถาม `Q-001`, `Q-002`, `Q-003`, `Q-007`, `Q-010`

---

## B. Coverage Matrix

| Service | User Stories | Functional Requirements | Acceptance Criteria | QA Scenarios | ตรวจกับ Source Code | ตรวจสองภาษา |
|---|---|---|---|---|---|---|
| AUTH — Login & Shell | 5 | 7 | 13 | 5 | ✅ ครบทุกไฟล์ | ❌ ไม่มีฉบับ EN |
| DASH — Event Dashboard | 4 | 12 | 15 | 4 | ✅ ครบทุกไฟล์ | ❌ ไม่มีฉบับ EN |
| SYNC — PEEP SYNC | 8 | 19 | 25 | 8 | ✅ ครบทุกไฟล์ | ❌ ไม่มีฉบับ EN |
| EVENT — Set Event (List/Workspace) | 9 | 20 | 25 | 9 | ✅ ครบทุกไฟล์ | ❌ ไม่มีฉบับ EN |
| EFORM — Set Event (Form) | 9 | 21 | 25 | 9 | ✅ ครบทุกไฟล์ | ❌ ไม่มีฉบับ EN |
| COMM — Automation | 4 | 8 | 9 (1 TBD) | 4 (1 TBD) | ✅ ครบทุกไฟล์ | ❌ ไม่มีฉบับ EN |
| TPL — Template Library | 4 | 6 | 8 | 4 | ✅ ครบทุกไฟล์ | ❌ ไม่มีฉบับ EN |
| MEDIA — Media Ads | 6 | 15 | 16 | 6 | ✅ ครบทุกไฟล์ | ❌ ไม่มีฉบับ EN |
| ADMIN — User Management | 5 | 8 | 8 (1 TBD) | 5 (1 TBD) | ✅ ครบทุกไฟล์ | ❌ ไม่มีฉบับ EN |
| Coupon, PEEP OA | 0 | (อยู่ใน FR-AUTH-004) | 0 | 0 | ✅ เป็นเพียง Placeholder | — |
| **รวม** | **54** | **116** | **144** | **54** | | |

**ไฟล์ที่ตรวจแล้ว:** ทุกไฟล์ใน `src/views/`, `src/components/`, `src/data/`, `src/App.tsx`, `src/main.tsx`, `src/i18n/index.tsx`
**ไฟล์ที่ไม่ได้ตรวจละเอียด:** `src/i18n/th/*.ts` (คำแปล UI), `src/assets/*`, `src/index.css`

---

## C. Bilingual Consistency Issues

| ID | ระดับ | ประเด็น | Requirement IDs | ผลกระทบ |
|---|---|---|---|---|
| BIL-001 | **High** | ไม่มีเอกสารภาษาอังกฤษใน `docs/requirements/` จึงตรวจความเท่ากันของ ID, Actor, Main Flow, AC, Business Rules และ Implementation Status ระหว่างสองภาษาไม่ได้เลย | ทั้งหมด | ทีมที่ใช้ภาษาอังกฤษ (หรือ Vendor) ไม่มีเอกสารอ้างอิง; ถ้ามีคนเขียนฉบับ EN แยกโดยไม่ยึด ID ชุดนี้ จะเกิด ID ซ้อนและ Traceability แตก |
| BIL-002 | Medium | Prompt 09 กำหนดให้ "คง ID ให้ตรงกับเอกสารภาษาอังกฤษ หากมีอยู่แล้ว" — เนื่องจากไม่มี ID ในชุดภาษาไทยจึงเป็นชุดแรก (Source of truth) | ทั้งหมด | ฉบับ EN ที่จะทำต่อ **ต้องใช้ ID ชุดนี้** (`US-/FR-/AC-/BR-/GAP-/ISS-/Q-/QA-`) |
| BIL-003 | Low | ข้อความ UI, Error Message, ชื่อฟิลด์และ Code Identifier ในเอกสารไทยคงเป็นภาษาอังกฤษตามโค้ด (ตามข้อกำหนด Prompt 09 §3) — ฉบับ EN ต้องใช้ข้อความเดียวกันทุกตัวอักษร | ทุก AC และ BR-EFORM/BR-MEDIA | QA ใช้ข้อความเหล่านี้เป็น Expected result |

**ข้อเสนอ:** หากต้องการฉบับภาษาอังกฤษ ให้แปลจากชุดภาษาไทยนี้โดยคงโครงสร้างไฟล์ (`README.md`, `01`–`08`) และ ID ทั้งหมด แล้วรันการตรวจตามหัวข้อนี้อีกครั้ง

---

## D. Source Code Verification

### D.1 วิธีตรวจ
1. Audit ครั้งแรก: อ่านทุกไฟล์ในขอบเขตแบบแบ่ง Service (4 กลุ่ม) และบันทึกหลักฐานพร้อมเลขบรรทัด
2. หลังเขียนเอกสาร: สุ่มตรวจซ้ำ 27 จุดสำคัญโดยอ่านโค้ดโดยตรง (ตารางด้านล่าง)
3. ตรวจความสอดคล้องของ ID ด้วยสคริปต์ (ซ้ำ, อ้างอิงไม่มีนิยาม, จำนวน)

### D.2 Requirements ที่ยืนยันจาก Source Code แล้ว (ตรวจซ้ำรอบสอง)

| # | Requirement | สิ่งที่ยืนยัน | หลักฐาน | ผล |
|---|---|---|---|---|
| 1 | FR-AUTH-001 | Login ไม่ตรวจ Credential (`handleSubmit` → `onLogin()`) | `views/LoginPage.tsx` | ✅ ตรง |
| 2 | FR-AUTH-006 | ไม่มีผู้ส่ง `onProfileClick` | ค้นหา `src/` | ✅ ตรง |
| 3 | FR-DASH-001 | `listed = dashboard ? events.filter(status !== 'Draft')` | `views/EventList.tsx:29` | ✅ ตรง |
| 4 | FR-DASH-004 | ไม่มีเงื่อนไข Sort สำหรับ `dates` | `views/EventList.tsx` | ✅ ตรง |
| 5 | FR-DASH-008 | ปุ่ม CSV/Excel ไม่มี `onClick` | `views/RegistrationData.tsx` | ✅ ตรง |
| 6 | FR-DASH-012 | BOM `﻿`, CRLF, `application/vnd.ms-excel`, ชื่อไฟล์ `survey-{id}-responses` | `views/SurveyFeedback.tsx` | ✅ ตรง |
| 7 | FR-SYNC-005 | ผลค้นหาคงที่ "Kanya Srisuwan", `peepId \|\| 'PPS008'`, วันที่ `toISOString` | `views/MembersAccess.tsx` | ✅ ตรง |
| 8 | FR-SYNC-005 | Permission 9 รายการ | `views/MembersAccess.tsx` (`ALL_PERMISSIONS`) | ⚠️ เดิมระบุไม่ครบ (ขาด Sync Photos) → **แก้แล้ว** |
| 9 | FR-SYNC-014 | `linkRole` ถูกใช้เฉพาะแสดงผล ไม่ถูกบันทึก | `views/Collections.tsx` | ✅ ตรง |
| 10 | BR-SYNC-023 | ลบคนสุดท้ายขณะ Restricted → Private | `views/Collections.tsx` (`saveAccess`) | ⚠️ เดิมอ้างชื่อ `removeAccess` → **แก้แล้ว** |
| 11 | FR-EVENT-001 | `matchesTab` (Trash เฉพาะแท็บ Trash, Mine = `CURRENT_AUTHOR`) และ `EVENT_TABS` ไม่มี Pending/Scheduled | `data/setEvents.ts` | ✅ ตรง |
| 12 | FR-EVENT-005 | `PAGE_SIZE = 10` | `views/set-event/SetEventList.tsx` | ✅ ตรง |
| 13 | FR-EVENT-006 | Duplicate ล้าง `qrLinks`, `scheduledAt`, `password`; Draft; registrants 0 | `views/set-event/SetEventApp.tsx` | ✅ ตรง |
| 14 | FR-EVENT-008 | ลบถาวรไม่เรียก `log` | `views/set-event/SetEventApp.tsx` (`handleConfirmDelete`) | ✅ ตรง |
| 15 | FR-EVENT-012 | ชื่อไม่ซ้ำแบบไม่สนตัวพิมพ์; URL ยอมรับ http | `components/set-event/NewLinkModal.tsx` | ✅ ตรง |
| 16 | FR-EVENT-014 | `qrLinks` ไม่อยู่ใน `TRACKED`; 34 ฟิลด์ | `data/eventActivity.ts` | ✅ ตรง |
| 17 | FR-EVENT-020 | เมนู Settings ถูก Comment ออก | `data/navigation.tsx:79` | ✅ ตรง |
| 18 | FR-EFORM-003 | `resultingStatus` | `views/set-event/EventFormPage.tsx` | ✅ ตรง |
| 19 | FR-EFORM-006/007 | `canPublish`, `showPublish`, `reviewFlow`, `lockedStatuses` | `views/set-event/EventFormPage.tsx` | ✅ ตรง |
| 20 | BR-EFORM-001/002 | ข้อความ Validation ตัวอย่าง 4 ข้อความพบในโค้ด | `event-form/formModel.ts` | ✅ ตรง |
| 21 | FR-EFORM-006 | Password Plain text พร้อม Comment "Mock only" | `data/setEvents.ts:57` | ✅ ตรง |
| 22 | FR-EFORM-017 | JPEG/PNG, 50 MB | `components/set-event/BannerDropzone.tsx` | ✅ ตรง |
| 23 | FR-TPL-001 | "Used in" ไม่กรอง `enabled` | `views/set-event/FormLibrary.tsx` | ✅ ตรง |
| 24 | FR-MEDIA-004 | `displayStatus` ลำดับ draft → inactive → scheduled → expired → active | `data/appBanners.ts` | ✅ ตรง |
| 25 | FR-MEDIA-006 | URL ยอมรับ http | `views/set-event/promo/PromoForm.tsx` | ✅ ตรง |
| 26 | FR-MEDIA-007 | เปลี่ยน Content Type ไม่ล้าง ID แม้มี Comment "A new type needs a new item." | `views/set-event/promo/PromoForm.tsx` | ✅ ตรง |
| 27 | FR-ADMIN-005/006 | Create Role เรียก `onClose`; Save Changes ไม่มี `onClick`; User Edit ไม่มี `onClick` | `views/RoleManagement.tsx`, `views/UserManagement.tsx` | ✅ ตรง |
| — | FR-EVENT-017 / FR-MEDIA-015 | ไม่มี `beforeunload` | ค้นหา `src/` (0 รายการ) | ✅ ตรง |

### D.3 ข้อแก้ไขที่ทำในการตรวจทานรอบนี้

| ไฟล์ | การแก้ไข | หลักฐาน |
|---|---|---|
| `th/04-functional-requirements.md` | FR-SYNC-005: เติม "Sync Photos" ในรายการ Permission ให้ครบ 9 รายการ | `MembersAccess.tsx` `ALL_PERMISSIONS` |
| `th/05-business-rules-and-data.md` | BR-SYNC-023: แก้ชื่อฟังก์ชันอ้างอิง `removeAccess` → `saveAccess` | `Collections.tsx` |
| `th/02-user-flows.md` | State Diagram: ระบุว่า Private/Scheduled → Published ต้องเลือก Published ใน Panel ก่อนกด Publish | `EventFormPage.tsx` `resultingStatus` |
| `th/04-functional-requirements.md` | เพิ่มการอ้างอิงกลับ (Back-reference) จาก FR ไปยัง ISS-022 ถึง ISS-030 ที่เดิมมีเฉพาะในตาราง Known Issues | `07-dev-qa-handoff.md` |

ไม่มีการเปลี่ยนแปลง Requirement ID ใดๆ

### D.4 รายการที่ยังยืนยันไม่ได้ (Unverified / รอตรวจสอบ)

| รายการ | เหตุผล |
|---|---|
| พฤติกรรมขณะรันจริง (Runtime) ทั้งหมด | ตรวจด้วยการอ่านโค้ดเท่านั้น ไม่ได้รันเบราว์เซอร์ |
| FR-EFORM-005: Password ผิดตอนกด Next ใน Create อาจไม่เปิด Status Panel ทำให้ผู้ใช้มองไม่เห็น Error | ต้องทดสอบ Runtime |
| US-EVENT-003 / Q-025: การกู้คืนจาก Trash โดยแก้สถานะในฟอร์ม | ต้องทดสอบ Runtime และยืนยันกับ PM |
| FR-EFORM-011: ลิงก์ย่อ Google Maps (`maps.app.goo.gl`) | ไม่มีพิกัดใน URL — ต้องทดสอบ |
| ความครบถ้วนของคำแปลภาษาไทยใน UI (`i18n/th/*`) | ไม่ได้อยู่ในขอบเขตการ Audit |
| จำนวน Seed ที่คำนวณ (เช่น แท็บ Published 61, Workshop Sign-up ใช้ใน 16 Event) | คำนวณโดยรัน Generator แยก ไม่ได้ดูบนหน้าจอจริง |
| **พฤติกรรม Backend ใดๆ** | ไม่มี Backend — ห้ามสรุปว่าทำงานแล้ว |

---

## E. Missing Requirements

รายการที่อาจตกหล่น (จากโค้ด, `Design.md` หรือแนวปฏิบัติทั่วไป) — **ยังไม่ได้เพิ่มเป็น Requirement เพราะไม่มีหลักฐานยืนยันความต้องการ**

| ID | ประเภท | รายการ | ที่มา | ระดับ |
|---|---|---|---|---|
| MISS-001 | Feature | Authorization / Permission gating ทั้งระบบ (มีเพียง FR-ADMIN-007 แบบ TBD ไม่มี US/AC) | โค้ดไม่มี; `Design.md` §22 | **Critical** |
| MISS-002 | Feature | Event Reports | `Design.md` §16, Spec เดิม | Medium |
| MISS-003 | Feature | Event Detail แท็บ Photos และ Settings | `Design.md` §13 | Medium |
| MISS-004 | Feature | Collection Sharing: Allow download, Expiration, Password, "PEEP SHARE users only" | `Design.md` §20 | Medium |
| MISS-005 | Feature | QR Scanner (เมนูชื่อ "QR Code / Scanner" แต่ไม่มีการสแกน) และการบังคับ QR Expiry | โค้ด (ชื่อเมนู, `qrExpiresAt`) | Medium |
| MISS-006 | Flow | Auto-publish เมื่อถึงเวลา Scheduled | โค้ด (ข้อความ "Publish automatically on a chosen date.") | High |
| MISS-007 | Flow | Restore จาก Trash ที่ชัดเจน | โค้ด (ข้อความใน Modal) | Medium |
| MISS-008 | Flow | Forgot Password, Session timeout, Remember me | โค้ด (ปุ่ม/Checkbox ที่ไม่ทำงาน) | High |
| MISS-009 | Validation | Backend Validation และ Uniqueness (ชื่อ Event/Collection/Banner, PEEP SHARE ID ของสมาชิก) | — | High |
| MISS-010 | Validation | ขนาดภาพ (Pixel) ของ Banner/Cover ตามขนาดแนะนำ | โค้ด (ข้อความแนะนำเท่านั้น) | Low |
| MISS-011 | Error Handling | Loading/Error State ใน Set Event, Event Dashboard, PEEP SYNC, Account Admin | `Design.md` §25–26 | High |
| MISS-012 | Error Handling | Toast ประเภท Error/Warning (ปัจจุบันมีเพียงสำเร็จ) | โค้ด | Medium |
| MISS-013 | Error Handling | หน้า 403 / ไม่มีสิทธิ์, หน้า 404 / Event ไม่พบ | — | Medium |
| MISS-014 | Non-functional | Deep link / URL Routing (ปัจจุบัน Refresh แล้วกลับหน้าแรก) | โค้ด (ไม่มี Router) | Medium |
| MISS-015 | Non-functional | Security: HTML Sanitization, Password Hashing | โค้ด (`ISS-023`, `ISS-024`) | High |
| MISS-016 | Requirement | US/AC สำหรับ FR-EFORM-013 (Collection ในฟอร์ม) และ FR-AUTH-007 (Sidebar) | Traceability | Low |

---

## F. Questions for PM/Dev

คำถามทั้งหมดอยู่ใน [th/07-dev-qa-handoff.md](th/07-dev-qa-handoff.md) หัวข้อ 3 (`Q-001` ถึง `Q-025`) — ลำดับความสำคัญก่อนเริ่ม Backend:

| ลำดับ | ID | คำถาม (ย่อ) | ส่วนที่ได้รับผลกระทบ |
|---|---|---|---|
| 1 | Q-001 | Event ของ Set Event กับ Event Dashboard/PEEP SYNC เป็น Entity เดียวกันหรือไม่ และสถานะสองชุดสัมพันธ์กันอย่างไร | Data Model หลัก, ทุก Service |
| 2 | Q-002 | โมเดลสิทธิ์ระดับ Role (7 หมวด) กับระดับ Event (9 รายการ) | Authorization |
| 3 | Q-003 | Role ใดเข้า Service ใดได้ | Route Guard, Select Service |
| 4 | Q-007 | ใช้บัญชี PEEP SHARE เดิมหรือไม่ | Auth API |
| 5 | Q-010 | ใคร Review/Publish และเส้นทางสถานะที่อนุญาต | Set Event State machine |
| 6 | Q-016 | Event : Collection เป็น 1:1 หรือ 1:N | Data Model, UI Collection |
| 7 | Q-019 | Timezone | Schedule, Banner status |
| 8 | Q-011 | การส่งข้อความ Automation | Messaging backend |
| 9 | Q-013 | Registration Dynamic Columns | Registration schema |
| 10 | Q-024 | Event Reports ยังอยู่ในขอบเขตหรือไม่ | Scope |

คำถามใหม่จากการตรวจทานรอบนี้:
- **Q-026** — ต้องการเอกสารฉบับภาษาอังกฤษหรือไม่ และใครเป็นผู้ดูแลให้สองภาษาตรงกันเมื่อมีการแก้ไข? (กระทบ BIL-001)

---

## G. Remaining Risks

| ID | ระดับ | ความเสี่ยง | ผลกระทบต่อการพัฒนา/ทดสอบ |
|---|---|---|---|
| RISK-001 | **Critical** | ข้อมูล Event สองชุดที่ไม่เชื่อมกัน (`Q-001`) | หาก Backend ออกแบบตามแต่ละหน้าจอ จะได้ Event สองตารางที่ต้องรวมภายหลัง |
| RISK-002 | **Critical** | ไม่มีการบังคับใช้สิทธิ์ และโมเดลสิทธิ์สองชุดไม่สอดคล้อง (`Q-002`) | Data Viewer/Photographer เห็นข้อมูลเกินสิทธิ์ใน Prototype; ถ้าส่งมอบ UI นี้ตรงๆ จะรั่วข้อมูลส่วนบุคคล (ชื่อ, เบอร์โทร, อีเมล ผู้ลงทะเบียน) |
| RISK-003 | High | ไม่มีเอกสารภาษาอังกฤษ | ทีมที่ไม่อ่านภาษาไทยเข้าถึงไม่ได้; เสี่ยงเกิดเอกสารแยกที่ ID ไม่ตรงกัน |
| RISK-004 | High | Stored XSS จาก Description HTML (`ISS-023`) | ต้องมี Sanitization ฝั่ง Server ก่อนเปิดใช้จริง |
| RISK-005 | High | AC เขียนตามพฤติกรรมปัจจุบัน รวมถึงข้อบกพร่อง (ทำเครื่องหมาย ⚠️) | QA อาจบันทึกข้อบกพร่องเป็น "ผ่าน" หากไม่อ่านหมายเหตุ — เมื่อแก้ ISS ต้องแก้ AC ที่เกี่ยวข้องด้วย |
| RISK-006 | High | Error State ของ Media Ads ทดสอบไม่ได้กับ Mock | ต้องมี Mock ที่ Error ได้ หรือทดสอบหลังเชื่อม API |
| RISK-007 | Medium | Priority ของ FR เป็นข้อเสนอของผู้จัดทำ ไม่ใช่ของ PM | อาจวางลำดับงานผิด |
| RISK-008 | Medium | ข้อสรุปมาจากการอ่านโค้ด ไม่ได้รันจริง | อาจมีพฤติกรรม Runtime ต่างจากเอกสาร (ดู D.4) |
| RISK-009 | Medium | เวลาไม่มี Timezone และสถานะคำนวณจากนาฬิกาเบราว์เซอร์ | สถานะ Banner/Scheduled ไม่ตรงกันระหว่างผู้ใช้ต่างเขตเวลา |
| RISK-010 | Low | โค้ดเปลี่ยนแปลงเร็ว (ไฟล์ใหม่หลายไฟล์ยังไม่ Commit เช่น `MediaAdsApp.tsx`, `AccountAdminPage.tsx`, `i18n/`) | เอกสารอาจล้าสมัยเร็ว — ควรอ้าง Commit ที่ตรวจเมื่อ Commit แล้ว |

---

## H. Readiness Assessment

| Service | สถานะ | เหตุผล |
|---|---|---|
| AUTH — Login & Shell | **Needs Technical Clarification** | Authentication ทั้งหมดเป็นการจำลอง; ต้องตัดสินใจ `Q-007`, `Q-003` |
| DASH — Event Dashboard | **Needs PM Confirmation** | เอกสารครบตามโค้ด แต่ขึ้นกับ `Q-001` (Event model), `Q-004` (การมองเห็นข้อมูล), `Q-013` (Dynamic columns) |
| SYNC — PEEP SYNC | **Needs PM Confirmation** | Photo Sync และ Cloud เป็น Mock ทั้งหมด; ต้องยืนยัน `Q-005`, `Q-006`, `Q-016` |
| EVENT — Set Event (List/Workspace) | **Ready for Developer Review** | พฤติกรรม Frontend ครบและตรวจแล้ว; ประเด็นเปิด (`Q-009`, `Q-015`, `Q-025`) ไม่ขัดขวางการ Review |
| EFORM — Set Event (Form) | **Needs PM Confirmation** | Validation และ Mapping ครบถ้วน แต่ State machine ต้องยืนยัน (`Q-010`, `Q-019`, `Q-020`) |
| COMM — Automation | **Needs Technical Clarification** | การตั้งค่าครบ แต่การส่งจริงไม่มีเลย (`Q-011`, `GAP-015`) |
| TPL — Template Library | **Ready for Developer Review** | ครบและตรวจแล้ว; ขึ้นกับ Event Form model เพียงเล็กน้อย |
| MEDIA — Media Ads | **Ready for Developer Review** | มี Mock API Contract (`PromoApi`), Loading/Error State, Validation ครบ; ประเด็นเปิด `Q-022`, `Q-023` ไม่ขัดขวาง |
| ADMIN — User Management | **Needs PM Confirmation** | ส่วนสำคัญ (Create Role, Save Permission, User CRUD) ยังไม่ได้พัฒนา; ขึ้นกับ `Q-002`, `Q-012` |
| เอกสารสองภาษา (ทั้งชุด) | **Incomplete Audit** | ไม่มีฉบับภาษาอังกฤษ (BIL-001) |

> **ข้อสรุป:** ห้ามถือว่าเอกสารชุดนี้ "ครบถ้วน" — ตรวจครบทุก Service ใน Source Code แล้ว แต่ **การตรวจสองภาษายังไม่ได้ทำ** และ **ไม่ได้ทดสอบ Runtime**
