# 08 — Requirements Traceability

เส้นทาง: `Service → Page → User Story → Functional Requirement → Acceptance Criteria → Source File → QA Scenario`
Path ใน Source File อ้างอิงจาก `src/`

## 1. ตาราง Traceability หลัก

### AUTH

| Page | User Story | Functional Requirements | Acceptance Criteria | Source File | QA |
|---|---|---|---|---|---|
| Login | US-AUTH-001 | FR-AUTH-001 | AC-AUTH-001, 002, 003 | `views/LoginPage.tsx`, `App.tsx` | QA-AUTH-001 |
| Login (QR) | US-AUTH-002 | FR-AUTH-002 | AC-AUTH-004, 005 | `views/LoginPage.tsx` | QA-AUTH-002 |
| Select Service / Loading / Placeholder | US-AUTH-003 | FR-AUTH-003, FR-AUTH-004 | AC-AUTH-006, 007, 008 | `views/ServiceSelection.tsx`, `components/ServiceCard.tsx`, `views/ServiceLoading.tsx`, `views/ServicePlaceholder.tsx`, `data/mock.ts` | QA-AUTH-003 |
| Header / Login | US-AUTH-004 | FR-AUTH-005 | AC-AUTH-009, 010 | `i18n/index.tsx`, `components/Header.tsx` | QA-AUTH-004 |
| Header | US-AUTH-005 | FR-AUTH-006 | AC-AUTH-011, 012, 013 | `components/Header.tsx`, `App.tsx` | QA-AUTH-005 |
| Sidebar (ทุก Service) | — | FR-AUTH-007 | — | `components/Sidebar.tsx` | — |

### DASH — Event Dashboard

| Page | User Story | Functional Requirements | Acceptance Criteria | Source File | QA |
|---|---|---|---|---|---|
| Event List | US-DASH-001 | FR-DASH-001, 002, 003, 004, 005 | AC-DASH-001 – 005 | `views/EventList.tsx`, `views/EventDashboardApp.tsx` | QA-DASH-001 |
| Event Detail › Registration | US-DASH-002 | FR-DASH-006, 007, 008 | AC-DASH-006 – 009 | `views/EventDetail.tsx`, `views/RegistrationData.tsx` | QA-DASH-002 |
| Event Detail › Survey | US-DASH-003 | FR-DASH-009, 010, 011 | AC-DASH-010 – 013 | `views/SurveyFeedback.tsx` | QA-DASH-003 |
| Event Detail › Survey › Submissions | US-DASH-004 | FR-DASH-012 | AC-DASH-014, 015 | `views/SurveyFeedback.tsx` | QA-DASH-004 |

### SYNC — PEEP SYNC

| Page | User Story | Functional Requirements | Acceptance Criteria | Source File | QA |
|---|---|---|---|---|---|
| Event List / Event Detail (Overview, Collections) | US-SYNC-001 | FR-SYNC-001, 002, 003 (+ FR-DASH-002–007, 009–012 ใช้ร่วม) | AC-SYNC-001, 002, 003 | `views/PeepSyncApp.tsx`, `views/EventList.tsx`, `views/EventDetail.tsx` | QA-SYNC-001 |
| Event Detail › Members & Access | US-SYNC-002 | FR-SYNC-004, 005, 006, 007 | AC-SYNC-004 – 008 | `views/MembersAccess.tsx` | QA-SYNC-002 |
| Cloud Management | US-SYNC-003 | FR-SYNC-008, 009 | AC-SYNC-009, 010 | `views/CloudManagement.tsx` | QA-SYNC-003 |
| Collections | US-SYNC-004 | FR-SYNC-010, 011 | AC-SYNC-011, 012 | `views/Collections.tsx` | QA-SYNC-004 |
| Collection Detail | US-SYNC-005 | FR-SYNC-012, 013 | AC-SYNC-013 – 016 | `views/Collections.tsx`, `components/ui/Pagination.tsx`, `components/ui/FilterSelect.tsx` | QA-SYNC-005 |
| Share Modal | US-SYNC-006 | FR-SYNC-014, 015 | AC-SYNC-017 – 020 | `views/Collections.tsx`, `components/set-event/qr.tsx` | QA-SYNC-006 |
| People access / Delete | US-SYNC-007 | FR-SYNC-016, 017 | AC-SYNC-021, 022, 023 | `views/Collections.tsx` | QA-SYNC-007 |
| Photo Sync / Upload | US-SYNC-008 | FR-SYNC-018, 019 | AC-SYNC-024, 025 | `views/PhotoManagement.tsx`, `views/Collections.tsx` | QA-SYNC-008 |

### EVENT — Set Event (List, Lifecycle, Workspace)

| Page | User Story | Functional Requirements | Acceptance Criteria | Source File | QA |
|---|---|---|---|---|---|
| Event List | US-EVENT-001 | FR-EVENT-001, 002, 003, 004, 005 | AC-EVENT-001 – 006 | `views/set-event/SetEventList.tsx`, `components/set-event/EventTable.tsx`, `data/setEvents.ts` | QA-EVENT-001 |
| Event List › Duplicate | US-EVENT-002 | FR-EVENT-006, FR-EVENT-018 | AC-EVENT-007, 008 | `views/set-event/SetEventApp.tsx` | QA-EVENT-002 |
| Event List › Delete | US-EVENT-003 | FR-EVENT-007, 008 | AC-EVENT-009, 010, 011 | `views/set-event/SetEventApp.tsx` | QA-EVENT-003 |
| Workspace › Overview | US-EVENT-004 | FR-EVENT-009, 010 | AC-EVENT-012, 013 | `views/set-event/workspace/EventOverview.tsx`, `components/set-event/EventWorkspaceSidebar.tsx` | QA-EVENT-004 |
| Workspace › Collection | US-EVENT-005 | FR-EVENT-011, FR-EVENT-018 | AC-EVENT-014, 015 | `views/set-event/workspace/EventCollection.tsx` | QA-EVENT-005 |
| Workspace › QR Code / Scanner | US-EVENT-006 | FR-EVENT-012, 013, FR-EVENT-018 | AC-EVENT-016 – 019 | `views/set-event/workspace/EventQrLinks.tsx`, `components/set-event/NewLinkModal.tsx`, `components/set-event/qr.tsx` | QA-EVENT-006 |
| Workspace › Activity logs | US-EVENT-007 | FR-EVENT-014, 015 | AC-EVENT-020, 021, 022 | `views/set-event/workspace/EventActivityLog.tsx`, `data/eventActivity.ts` | QA-EVENT-007 |
| Activity Log (System) | US-EVENT-008 | FR-EVENT-016 | AC-EVENT-023, 024 | `views/ActivityLog.tsx` | QA-EVENT-008 |
| ทุกหน้าใน Set Event | US-EVENT-009 | FR-EVENT-017 | AC-EVENT-025 | `views/set-event/SetEventApp.tsx` | QA-EVENT-009 |
| Workspace › User management | (ใช้ US-SYNC-002) | FR-EVENT-019 | (AC-SYNC-004 – 008) | `views/set-event/workspace/EventUsers.tsx` | QA-SYNC-002 |
| System Settings | — | FR-EVENT-020 | — | `views/SystemSettings.tsx` | — |

### EFORM — Create/Edit Event

| Page | User Story | Functional Requirements | Acceptance Criteria | Source File | QA |
|---|---|---|---|---|---|
| Create/Edit › Stepper | US-EFORM-001 | FR-EFORM-001, 002, 005, 008, 009 | AC-EFORM-001 – 004 | `views/set-event/EventFormPage.tsx`, `components/set-event/form/FormStepper.tsx`, `event-form/InformationSection.tsx`, `event-form/ScheduleSection.tsx` | QA-EFORM-001 |
| Create/Edit › Save Draft | US-EFORM-002 | FR-EFORM-003, 004, 009, 021 | AC-EFORM-005, 006 | `views/set-event/EventFormPage.tsx`, `event-form/formModel.ts` | QA-EFORM-002 |
| Create/Edit › Review & Publish | US-EFORM-003 | FR-EFORM-003, 006, 007 | AC-EFORM-007 – 011 | `views/set-event/EventFormPage.tsx`, `components/set-event/StatusVisibilityPanel.tsx` | QA-EFORM-003 |
| Step 2 › Location | US-EFORM-004 | FR-EFORM-010, 011 | AC-EFORM-012, 013, 014 | `event-form/LocationSection.tsx`, `formModel.ts` | QA-EFORM-004 |
| Step 2 › Registration | US-EFORM-005 | FR-EFORM-012 | AC-EFORM-015, 016, 017 | `event-form/RegistrationSection.tsx` | QA-EFORM-005 |
| Step 3 › Event Form / Survey Form | US-EFORM-006 | FR-EFORM-014, 015, 016 | AC-EFORM-018 – 021 | `event-form/AttendeeFormSection.tsx`, `event-form/SurveyFormSection.tsx`, `components/set-event/form/EventFormBuilder.tsx`, `TemplatePicker.tsx` | QA-EFORM-006 |
| Step 1 › Information (Banner, Description) | US-EFORM-007 | FR-EFORM-008, 017, 018 | AC-EFORM-022, 023 | `components/set-event/BannerDropzone.tsx`, `components/set-event/RichTextEditor.tsx` | QA-EFORM-007 |
| Header › Preview | US-EFORM-008 | FR-EFORM-019 | AC-EFORM-024 | `components/set-event/EventPreviewModal.tsx` | QA-EFORM-008 |
| Action bar › Cancel | US-EFORM-009 | FR-EFORM-020 | AC-EFORM-025 | `views/set-event/EventFormPage.tsx` | QA-EFORM-009 |
| Step 3 › Collection | — | FR-EFORM-013 | — | `components/set-event/form/CollectionSelector.tsx` | — |

### COMM

| Page | User Story | Functional Requirements | Acceptance Criteria | Source File | QA |
|---|---|---|---|---|---|
| Step 4 › Communication | US-COMM-001 | FR-COMM-001 | AC-COMM-001, 002 | `event-form/CommunicationSection.tsx`, `data/automations.ts` | QA-COMM-001 |
| Automation Drawer | US-COMM-002 | FR-COMM-003, 004, 005, 006 | AC-COMM-003 – 006 | `components/set-event/automation/*` | QA-COMM-002 |
| Automation List / Journey | US-COMM-003 | FR-COMM-002, 007 | AC-COMM-007, 008 | `CommunicationSection.tsx`, `AutomationCard.tsx`, `AutomationJourney.tsx` | QA-COMM-003 |
| (Backend) | US-COMM-004 | FR-COMM-008 | AC-COMM-009 (TBD) | — | QA-COMM-004 (TBD) |

### TPL

| Page | User Story | Functional Requirements | Acceptance Criteria | Source File | QA |
|---|---|---|---|---|---|
| Regis Form / Survey Form | US-TPL-001 | FR-TPL-001, 002 | AC-TPL-001, 002 | `views/set-event/FormLibrary.tsx`, `data/formTemplates.ts` | QA-TPL-001 |
| Template Drawer (Edit) | US-TPL-002 | FR-TPL-003 | AC-TPL-003, 004 | `views/set-event/FormLibrary.tsx` | QA-TPL-002 |
| Template actions | US-TPL-003 | FR-TPL-004, 005 | AC-TPL-005, 006 | `views/set-event/FormLibrary.tsx` | QA-TPL-003 |
| Event Form › Use Template / Drawer (View) | US-TPL-004 | FR-TPL-006, FR-EFORM-016 | AC-TPL-007, 008 | `components/set-event/form/TemplatePicker.tsx`, `views/set-event/SetEventApp.tsx` | QA-TPL-004 |

### MEDIA

| Page | User Story | Functional Requirements | Acceptance Criteria | Source File | QA |
|---|---|---|---|---|---|
| List (3 Placement) | US-MEDIA-001 | FR-MEDIA-001, 002, 003, 004 | AC-MEDIA-001 – 004 | `views/MediaAdsApp.tsx`, `promo/PromoList.tsx`, `promo/PromoManager.tsx`, `promo/placements.ts`, `data/appBanners.ts` | QA-MEDIA-001 |
| Form | US-MEDIA-002 | FR-MEDIA-005, 006, 007, 008, 013, 014 | AC-MEDIA-005 – 009 | `promo/PromoForm.tsx`, `promo/PromoPreview.tsx`, `data/mock/promoApi.ts`, `components/set-event/BannerDropzone.tsx` | QA-MEDIA-002 |
| List › Row menu | US-MEDIA-003 | FR-MEDIA-009, 010 | AC-MEDIA-010, 011, 012 | `promo/PromoList.tsx`, `promo/PromoManager.tsx` | QA-MEDIA-003 |
| Sort | US-MEDIA-004 | FR-MEDIA-011 | AC-MEDIA-013, 014 | `promo/PromoSort.tsx` | QA-MEDIA-004 |
| List › Delete | US-MEDIA-005 | FR-MEDIA-012 | AC-MEDIA-015 | `promo/PromoList.tsx`, `data/mock/promoApi.ts` | QA-MEDIA-005 |
| Form / Sidebar | US-MEDIA-006 | FR-MEDIA-015 | AC-MEDIA-016 | `views/MediaAdsApp.tsx`, `promo/PromoForm.tsx` | QA-MEDIA-006 |

### ADMIN

| Page | User Story | Functional Requirements | Acceptance Criteria | Source File | QA |
|---|---|---|---|---|---|
| Users | US-ADMIN-001 | FR-ADMIN-001 | AC-ADMIN-001, 002 | `views/UserManagement.tsx`, `views/AccountAdminPage.tsx` | QA-ADMIN-001 |
| Users › Suspend | US-ADMIN-002 | FR-ADMIN-002 | AC-ADMIN-003 | `views/UserManagement.tsx` | QA-ADMIN-002 |
| User Detail | US-ADMIN-003 | FR-ADMIN-003 | AC-ADMIN-004 | `views/UserManagement.tsx` | QA-ADMIN-003 |
| Roles & Permissions | US-ADMIN-004 | FR-ADMIN-004, 005, 006 | AC-ADMIN-005, 006, 007 | `views/RoleManagement.tsx`, `data/mock.ts` | QA-ADMIN-004 |
| Users (CRUD) | US-ADMIN-005 | FR-ADMIN-008 | AC-ADMIN-008 (TBD) | `views/UserManagement.tsx` | QA-ADMIN-005 (TBD) |
| ทั้งระบบ | — | FR-ADMIN-007 | — | `App.tsx`, `components/Header.tsx` | — |

## 2. ช่องว่างใน Traceability

| ประเภท | รายการ | หมายเหตุ |
|---|---|---|
| FR ที่ไม่มี User Story เฉพาะ | FR-AUTH-007 (Sidebar), FR-EVENT-018 (Toast — ถูกอ้างจาก US อื่น), FR-EVENT-020 (System Settings — เข้าถึงไม่ได้), FR-EFORM-013 (Collection ในฟอร์ม), FR-ADMIN-007 (บังคับใช้สิทธิ์) | FR-EFORM-013 และ FR-ADMIN-007 ควรมี US และ AC เพิ่มเมื่อ PM ยืนยันขอบเขต |
| FR ที่ใช้ร่วมกันระหว่าง Service | FR-DASH-002–007, 009–012 (ใช้ใน PEEP SYNC ด้วย), FR-SYNC-004–007 (ใช้ใน Set Event › User management), FR-SYNC-008–017 (Cloud/Collections ใช้ใน Set Event ด้วย) | QA ควรทดสอบซ้ำในทุก Service ที่ใช้ |
| AC ที่เป็น TBD | AC-COMM-009, AC-ADMIN-008 | รอ `Q-011`, `Q-012` |
| Requirement ที่ไม่มีหลักฐานในโค้ด | US-COMM-004 / FR-COMM-008, US-ADMIN-005 / FR-ADMIN-008, US-SYNC-008 (ส่วนการอัปโหลดจริง), FR-ADMIN-007 | ติดป้าย [ยังไม่ยืนยัน] / ยังไม่ได้พัฒนา |
| Feature ใน `Design.md` ที่ไม่มีในโค้ดและไม่มี US | Event Reports (§16), Collection Sharing แบบ Password/Expiration/Allow download (§20), Event Detail แท็บ Photos/Settings (§13) | `Q-024`; ไม่สร้าง US เพราะไม่มีหลักฐาน |
| Source ที่ไม่มี Requirement | `views/SyncActivity.tsx` (Dead code), `RegistrationData`/`SurveyFeedback` โหมด Standalone | ดู [06](06-api-and-integration-gaps.md) หัวข้อ 4 |
| Requirement ซ้ำ | ไม่พบ ID ซ้ำ; พฤติกรรม Unsaved guard ถูกอธิบายใน FR-EVENT-017 (ระดับ App) และ FR-EFORM-020 (ระดับฟอร์ม) — เป็นคนละ Layer โดยเจตนา | — |

## 3. สรุปจำนวน

| Service | User Stories | Functional Requirements | Acceptance Criteria | QA Scenarios |
|---|---|---|---|---|
| AUTH | 5 | 7 | 13 | 5 |
| DASH | 4 | 12 | 15 | 4 |
| SYNC | 8 | 19 | 25 | 8 |
| EVENT | 9 | 20 | 25 | 9 |
| EFORM | 9 | 21 | 25 | 9 |
| COMM | 4 | 8 | 9 | 4 |
| TPL | 4 | 6 | 8 | 4 |
| MEDIA | 6 | 15 | 16 | 6 |
| ADMIN | 5 | 8 | 8 | 5 |
| **รวม** | **54** | **116** | **144** | **54** |
