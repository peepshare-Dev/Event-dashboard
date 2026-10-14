# เอกสาร Requirements ฉบับภาษาไทย — PEEP SHARE Admin (Frontend)

> สถานะเอกสาร: ฉบับแรก (v0.1) จัดทำจากการ Audit Source Code เมื่อ 13 ต.ค. 2026
> กลุ่มผู้อ่าน: PM, BA, Frontend Developer, Backend Developer และ QA

## 1. วัตถุประสงค์

เอกสารชุดนี้อธิบายพฤติกรรมของระบบ **ตามที่ Source Code ใน Repository ทำงานจริง** ณ วันที่ตรวจสอบ เพื่อใช้เป็นฐานสำหรับ
- วางแผนการพัฒนา Backend / API
- ส่งต่องานให้ทีม QA เขียน Test Case
- ให้ PM/BA ยืนยัน Business Rules ที่ยังไม่ชัดเจน

เอกสารนี้ **ไม่ใช่** Product Specification ฉบับเป้าหมาย สิ่งที่ยังไม่มีในโค้ดจะถูกระบุเป็น `ยังไม่ได้พัฒนา`, `TBD` หรือ `รอยืนยันจาก PM/Dev` เสมอ ไม่มีการเติม Business Logic ขึ้นเอง

## 2. ข้อเท็จจริงสำคัญที่ต้องรู้ก่อนอ่าน

1. **ไม่มี Backend และไม่มี API Call ใดๆ** — ค้นทั้ง `src/` ไม่พบ `fetch`, `axios`, `XMLHttpRequest` หรือ `WebSocket`
2. **ข้อมูลทั้งหมดเป็น Mock / Seed Data** จาก `src/data/*` และเก็บใน React `useState` หรือตัวแปรระดับ Module
3. **ไม่มีการบันทึกข้อมูลถาวร** ยกเว้นการตั้งค่าภาษา (`localStorage` key `peepshare.lang` ใน `src/i18n/index.tsx`) — Refresh หน้าเว็บแล้วข้อมูลกลับเป็นค่าเริ่มต้นทั้งหมด
4. **Authentication เป็นแบบจำลอง** — กรอกอะไรก็เข้าสู่ระบบได้ (`src/App.tsx`, `src/views/LoginPage.tsx`)
5. **ไม่มีการบังคับใช้ Role / Permission ใดๆ** — Role ที่แสดงบน Header/Sidebar เป็นข้อความ Hardcode ต่อ Service
6. **ไม่มี URL Routing** — การเปลี่ยนหน้าใช้ State ใน `App.tsx` และ State ภายในแต่ละ Service (ไม่มี React Router)
7. Repository นี้เป็นโปรเจกต์ Figma Make (React 19 + Vite 8 + Tailwind CSS v4)

## 3. สารบัญ

| ไฟล์ | เนื้อหา |
|---|---|
| [01-service-overview.md](01-service-overview.md) | ภาพรวมระบบ Service ทั้งหมด หน้าจอ บทบาท และสถานะ Implementation |
| [02-user-flows.md](02-user-flows.md) | User Flow ราย Service พร้อม Mermaid Diagram |
| [03-user-stories.md](03-user-stories.md) | User Stories และ Acceptance Criteria (Given/When/Then) |
| [04-functional-requirements.md](04-functional-requirements.md) | Functional Requirements ราย Service |
| [05-business-rules-and-data.md](05-business-rules-and-data.md) | Business Rules, Validation, Status, Data Model |
| [06-api-and-integration-gaps.md](06-api-and-integration-gaps.md) | API ที่ต้องพัฒนาและช่องว่างการเชื่อมต่อ |
| [07-dev-qa-handoff.md](07-dev-qa-handoff.md) | รายการส่งต่อ Dev / QA, Known Issues, QA Scenarios |
| [08-requirements-traceability.md](08-requirements-traceability.md) | ตาราง Traceability Service → Page → US → FR → AC → Source → QA |

รายงานการตรวจทานเอกสาร: [../documentation-review-report.md](../documentation-review-report.md)

## 4. ระบบ ID

| Prefix | ความหมาย | ตัวอย่าง |
|---|---|---|
| `US-<SVC>-NNN` | User Story | `US-EVENT-001` |
| `FR-<SVC>-NNN` | Functional Requirement | `FR-EVENT-001` |
| `AC-<SVC>-NNN` | Acceptance Criteria (เลขรันต่อเนื่องภายใน Service) | `AC-EVENT-001` |
| `BR-<SVC>-NNN` | Business Rule | `BR-MEDIA-003` |
| `GAP-NNN` | API / Integration Gap | `GAP-004` |
| `QA-<SVC>-NNN` | QA Scenario | `QA-EFORM-002` |
| `ISS-NNN` | Known Issue / ข้อบกพร่องที่พบในโค้ด | `ISS-001` |
| `Q-NNN` | คำถามที่ต้องยืนยันกับ PM/Dev | `Q-007` |

รหัส Service (`<SVC>`):

| รหัส | Service / โมดูล | Entry Component |
|---|---|---|
| `AUTH` | Login และ App Shell (Service Selection, Header, ภาษา) | `src/App.tsx` |
| `DASH` | Event Dashboard (Data Viewer) | `src/views/EventDashboardApp.tsx` |
| `SYNC` | PEEP SYNC (Photographer Workspace) | `src/views/PeepSyncApp.tsx` |
| `EVENT` | Set Event — รายการ Event, วงจรสถานะ, Event Workspace, Activity Log | `src/views/set-event/SetEventApp.tsx` |
| `EFORM` | Set Event — ฟอร์มสร้าง/แก้ไข Event | `src/views/set-event/EventFormPage.tsx` |
| `COMM` | Set Event — Communication / Broadcast Automation | `src/views/set-event/event-form/CommunicationSection.tsx` |
| `TPL` | Set Event — Regis Form / Survey Form Template Library | `src/views/set-event/FormLibrary.tsx` |
| `MEDIA` | Media Ads (Banner / Cover Page ในแอป) | `src/views/MediaAdsApp.tsx` |
| `ADMIN` | User Management ระดับบัญชี (Users, Roles & Permissions) | `src/views/AccountAdminPage.tsx` |

> หมายเหตุ: ยังไม่มีเอกสารภาษาอังกฤษใน `docs/requirements/` ID ทั้งหมดในชุดนี้จึงเป็นชุดแรก เมื่อจัดทำฉบับภาษาอังกฤษให้ใช้ ID เดียวกัน

## 5. สถานะ Implementation ที่ใช้ในเอกสาร

| สถานะ | ความหมาย |
|---|---|
| **พัฒนาแล้วใน Frontend** | UI และ Logic ทำงานได้จริงในเบราว์เซอร์ (ข้อมูลอยู่ใน Local State / Mock — ไม่มี Backend) |
| **พัฒนาแล้วบางส่วน** | มี UI และทำงานได้บางส่วน แต่มีปุ่มที่ไม่ทำงาน หรือมีพฤติกรรมไม่ครบ |
| **ใช้ Mock Data / จำลองการทำงาน** | แสดงผลจากข้อมูล Hardcode หรือจำลองผลลัพธ์ (เช่น `setTimeout`, ค่าคงที่) โดยไม่มี Logic จริง |
| **ยังไม่ได้พัฒนา** | มีเพียง UI (ปุ่มไม่มี Handler) หรือไม่มีเลย |
| **รอยืนยันจาก PM/Dev** | ไม่สามารถยืนยันจากโค้ดได้ ต้องให้ผู้รับผิดชอบตัดสินใจ |

**ทุกสถานะในเอกสารนี้หมายถึง Frontend เท่านั้น** ฝั่ง Backend ถือว่า `ยังไม่ได้พัฒนา` สำหรับทุก Feature (ดู [06-api-and-integration-gaps.md](06-api-and-integration-gaps.md))

## 6. แหล่งอ้างอิง (ตามลำดับความน่าเชื่อถือ)

1. Source Code ใน `src/` — หลักฐานหลัก
2. `Design.md` — Design System และเป้าหมายด้าน UX (ใช้เป็น "เอกสารอ้างอิง" ไม่ใช่หลักฐานว่าพัฒนาแล้ว)
3. `src/imports/pasted_text/event-dashboard-spec.md` และ `peep-share-dashboard-update.md` — Prompt/Spec ต้นทางของ UI (ใช้อ้างอิงเจตนา ไม่ใช่หลักฐาน)
4. สมมติฐาน — ระบุชัดเจนว่า `รอยืนยันจาก PM/Dev`

## 7. ขอบเขตการตรวจสอบ

ตรวจแล้ว: ทุกไฟล์ใน `src/views/`, `src/components/`, `src/data/`, `src/App.tsx`, `src/main.tsx`, `src/i18n/index.tsx`

ตรวจไม่ครบ / ไม่ได้ตรวจ:
- `src/i18n/th/*.ts` — ไม่ได้ตรวจความถูกต้องของคำแปล UI ทีละข้อความ
- `src/views/SyncActivity.tsx` — ตรวจแล้วแต่ **ไม่ถูก import ที่ใด** (Dead Code) จึงไม่นับเป็น Feature
- `src/views/SystemSettings.tsx` — ตรวจแล้ว แต่ **เข้าถึงไม่ได้** จากเมนู (เมนูถูก Comment ออก)
- ไม่ได้ทดสอบบนเบราว์เซอร์จริง (Runtime) — ข้อสรุปทั้งหมดมาจากการอ่านโค้ด รายการที่ต้องยืนยันขณะรันระบุว่า `Unverified`
- Service **Coupon** และ **PEEP OA** มีเพียง Placeholder (`ServicePlaceholder.tsx`) ไม่มี Feature ให้ตรวจ
