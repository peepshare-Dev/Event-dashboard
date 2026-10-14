# 07 — รายการส่งต่องาน Dev และ QA

## 1. สรุปสำหรับทีม

| กลุ่ม | สิ่งที่ต้องรู้ |
|---|---|
| **Frontend Dev** | UI เกือบครบ แต่ไม่มี Data Layer; ควรเพิ่ม API Client, Loading/Error State, Auth Guard และ Permission Gating; แก้ Known Issues ด้านล่าง |
| **Backend Dev** | ไม่มี API ใดๆ; เริ่มจาก `PromoApi` (Media Ads) ซึ่งมี Interface ชัดเจนที่สุด; Validation ทั้งหมดใน [05](05-business-rules-and-data.md) ต้องทำซ้ำฝั่ง Server |
| **QA** | ทดสอบได้เฉพาะพฤติกรรม Frontend; ข้อมูลรีเซ็ตเมื่อ Refresh; Error State ของ Media Ads ทดสอบไม่ได้ (Mock ไม่ Error); ใช้ QA Scenarios ในหัวข้อ 4 |
| **PM/BA** | ตอบคำถามในหัวข้อ 3 ก่อนเริ่ม Backend โดยเฉพาะ `Q-001`, `Q-002`, `Q-010` |

## 2. Known Issues (พบจากการอ่านโค้ด)

ระดับ: **High** = กระทบ Flow หลัก / ทำให้ทดสอบผิด, **Medium** = ฟังก์ชันไม่ครบ, **Low** = ความสม่ำเสมอ/UX

| ID | ระดับ | ปัญหา | ไฟล์ | FR ที่เกี่ยวข้อง |
|---|---|---|---|---|
| ISS-001 | High | Login ไม่ตรวจ Credential ใดๆ | `views/LoginPage.tsx` | FR-AUTH-001 |
| ISS-002 | Low | เมนู "User Profile" ไม่มีการทำงานในทุก Service | `components/Header.tsx` | FR-AUTH-006 |
| ISS-003 | Medium | Sort คอลัมน์ Date ไม่ทำงาน (ไม่มี Comparator) แต่ไอคอนลูกศรเปลี่ยน | `views/EventList.tsx` | FR-DASH-004 |
| ISS-004 | High | ปุ่ม Export CSV/Excel ของ Registration ไม่มี `onClick` | `views/RegistrationData.tsx` | FR-DASH-008 |
| ISS-005 | Medium | Event List (PEEP SYNC) ปุ่ม Edit, Access, ⋯ ไม่มีการทำงาน | `views/EventList.tsx` | FR-SYNC-001 |
| ISS-006 | Medium | Add Member: ค้นหา ID ใดก็พบ "Kanya Srisuwan"; ไม่มีกรณีไม่พบ, ไม่ตรวจซ้ำ | `views/MembersAccess.tsx` | FR-SYNC-005 |
| ISS-007 | High | สมาชิก Event เป็นชุดเดียวกันทุก Event และหายเมื่อเปลี่ยนแท็บ/หน้า | `views/MembersAccess.tsx`, `workspace/EventUsers.tsx` | FR-SYNC-004, FR-EVENT-019 |
| ISS-008 | Low | Cloud: Upgrade Storage, Manage Storage, Manage Plan, Upgrade ไม่มีการทำงาน; สถานะ full ไม่มี UI; ตัวเลขตารางรวม 61.3 GB ไม่ตรงกับ 28.5 GB | `views/CloudManagement.tsx` | FR-SYNC-008, 009 |
| ISS-009 | Medium | Collections: Delete ในหน้ารายการ, Bulk Download/Delete, Download Collection, Upload (ไม่มี onChange) ไม่ทำงาน | `views/Collections.tsx` | FR-SYNC-010, 013, 017, 018 |
| ISS-010 | Medium | Share Modal: ตัวเลือก Viewer/Editor ของลิงก์สาธารณะไม่ถูกบันทึก; บันทึก Private access โดยไม่เลือกใครจะตั้ง Private แม้ยังมีผู้มีสิทธิ์ | `views/Collections.tsx` | FR-SYNC-014 |
| ISS-011 | Medium | แท็บ Mine ผูก `CURRENT_AUTHOR='Suchadas'` ไม่ตรงกับผู้ใช้ที่แสดง `@suchada.t` | `data/setEvents.ts` | FR-EVENT-001 |
| ISS-012 | Low | Move to Trash / Delete Permanently ไม่มี Toast; ลบถาวรไม่บันทึก Activity | `views/set-event/SetEventApp.tsx` | FR-EVENT-007, 008 |
| ISS-013 | Medium | Collection Picker ใน Set Event ใช้ `mockCollections` คงที่ — Collection ที่สร้างในเมนู Collections เลือกไม่ได้; ลิงก์แล้วไม่อัปเดต `linkedEvent` | `workspace/EventCollection.tsx`, `form/CollectionSelector.tsx` | FR-EVENT-011, FR-EFORM-013 |
| ISS-014 | Low | การสร้าง/ลบ QR Link และการแก้ Lat/Lng ไม่ถูกบันทึกใน Activity log | `data/eventActivity.ts` | FR-EVENT-014 |
| ISS-015 | Medium | Activity Log ระดับระบบใน Set Event แสดงข้อมูล Mock ของ Event Dashboard; ตัวกรอง User แบบ Case-sensitive และไม่มี "Admin (Suchada)" | `views/ActivityLog.tsx` | FR-EVENT-016 |
| ISS-016 | Medium | วันที่ที่ไม่มีเวลา (Registration, QR expiry, Draft event) ถูกบันทึกเป็นค่าว่าง แต่ Validation สมมติ 00:00/23:59 | `event-form/formModel.ts` | FR-EFORM-009 |
| ISS-017 | Medium | Media Ads Content ID เป็นข้อความอิสระไม่ตรวจว่ามีจริง; เปลี่ยน Content Type ไม่ล้าง ID (Comment ระบุว่าควรล้าง) | `promo/PromoForm.tsx` | FR-MEDIA-007 |
| ISS-018 | Low | Suspend/Reactivate ผู้ใช้หายเมื่อ Remount | `views/UserManagement.tsx` | FR-ADMIN-002 |
| ISS-019 | High | Role: Save Changes, View Users ไม่มีการทำงาน; Create Role ปิด Modal โดยไม่บันทึก; User Edit ไม่มีการทำงาน | `views/RoleManagement.tsx`, `views/UserManagement.tsx` | FR-ADMIN-004–006, 008 |
| ISS-020 | Medium | Unsaved-changes guard ไม่ครอบคลุม Header Switch Service/Log Out, หน้า Sort ของ Media Ads, Template Drawer, Automation Drawer, `FormLibrary.onOpenEvent` และ Refresh (`beforeunload`) | `SetEventApp.tsx`, `MediaAdsApp.tsx`, `FormLibrary.tsx` | FR-EVENT-017, FR-MEDIA-015 |
| ISS-021 | Low | QR Link, Media URL, Map Link ยอมรับ `http://` แต่ข้อความ Error ระบุ "starting with https://" | `NewLinkModal.tsx`, `PromoForm.tsx`, `formModel.ts` | FR-EVENT-012, FR-MEDIA-006 |
| ISS-022 | Low | Copy Link ใน Share Modal แสดง "Copied" แม้คัดลอกไม่สำเร็จ; CopyIdButton ล้มเหลวแบบเงียบ | `views/Collections.tsx`, `CopyIdButton.tsx` | FR-SYNC-015, FR-EVENT-010 |
| ISS-023 | High (Security) | Description HTML ไม่ถูก Sanitize ก่อนแสดง (`dangerouslySetInnerHTML`, หน้า Preview) | `EventPreviewModal.tsx`, `RichTextEditor.tsx` | FR-EFORM-018, 019 |
| ISS-024 | Medium (Security) | Password ของ Event เก็บแบบ Plain text (ระบุว่า Mock only) | `data/setEvents.ts`, `formModel.ts` | FR-EFORM-006 |
| ISS-025 | Low | ค้นหา Media Ads เทียบข้อความ Click Action ภาษาอังกฤษเสมอ แม้ UI เป็นภาษาไทย | `promo/PromoList.tsx` | FR-MEDIA-003 |
| ISS-026 | Low | Community ID ใช้ Hint เดียวกับ PEEP OA ID | `CommunicationSection.tsx` | FR-COMM-001 |
| ISS-027 | Low | ชื่อไฟล์ QR PNG ตัดอักขระที่ไม่ใช่ a–z0–9 ออก — ชื่อ Event ภาษาไทยหาย | `components/set-event/qr.tsx` | FR-EVENT-013 |
| ISS-028 | Low | ป้าย Role การเข้าถึง Collection ไม่สม่ำเสมอ ("Edit" vs "Editor") | `views/Collections.tsx` | FR-SYNC-016 |
| ISS-029 | Low | Photo Sync/Event List ใน PEEP SYNC แสดง Event สถานะ Draft และทุก Event (ไม่กรองตามการมอบหมาย) | `PhotoManagement.tsx`, `EventList.tsx` | FR-SYNC-001, 019 |
| ISS-030 | Low | Role Detail: คลิกข้อความ Permission ไม่ติ๊ก Checkbox (Label ไม่ผูก Input) | `views/RoleManagement.tsx` | FR-ADMIN-006 |

## 3. คำถามที่ต้องยืนยันกับ PM/Dev

| ID | คำถาม | ผลกระทบ | เกี่ยวข้อง |
|---|---|---|---|
| Q-001 | Event ของ Set Event (`setEventsSeed`) และ Event ของ Event Dashboard/PEEP SYNC (`events`) เป็น Entity เดียวกันหรือไม่? สถานะชุด Draft/Pending/Published/... กับ Upcoming/Ongoing/Completed/Archived สัมพันธ์กันอย่างไร? | Data Model หลักของ Backend, การแสดงผลทุก Service | FR-DASH-001, FR-EVENT-001 |
| Q-002 | โมเดลสิทธิ์: Permission ระดับ Role (7 หมวด, `allPermissions`) กับ Permission ต่อ Event (9 รายการ, Members & Access) ใช้ร่วมกันอย่างไร? (`Design.md` §22 ระบุ 2 ชั้น) | Authorization ทั้งระบบ | FR-ADMIN-006, 007, FR-SYNC-005 |
| Q-003 | Role ใดเข้าถึง Service ใดได้บ้าง (Event Dashboard, Set Event, Media Ads, PEEP SYNC, Account Admin)? | หน้า Select Service, Route Guard | FR-AUTH-003 |
| Q-004 | Data Viewer ควรเห็นการ์ด Photos และ Members หรือไม่? Photographer ควรเห็นแท็บ Registration/Survey หรือไม่? | การซ่อนข้อมูลตาม Role | FR-DASH-006, FR-SYNC-001 |
| Q-005 | Photographer เห็นทุก Event หรือเฉพาะ Event ที่ได้รับมอบหมาย? เห็น Draft หรือไม่? | Query scope ของ Event List | FR-SYNC-001 |
| Q-006 | Photo Sync ทำงานอย่างไร (เว็บเบราว์เซอร์อัปโหลดเอง หรือมี Desktop Agent)? รองรับ RAW/50 GB ต่อ Batch จริงหรือไม่? | สถาปัตยกรรม Upload | FR-SYNC-018, 019 |
| Q-007 | Login ใช้บัญชี PEEP SHARE เดิม (เบอร์โทร/QR จากแอป) หรือระบบบัญชีแยก? นโยบาย Session/Remember me/Forgot password? | Auth API | FR-AUTH-001, 002 |
| Q-008 | ข้อมูลใดต้องบันทึกถาวรและข้อมูลใดเป็น UI Preference (เช่น Sidebar ย่อ, ตัวกรองที่จำไว้)? | ขอบเขต API และ Local storage | ทุก Service |
| Q-009 | ต้องการแท็บ Pending และ Scheduled ในรายการ Event หรือไม่? | UX ของ Review flow | FR-EVENT-001 |
| Q-010 | ใครเป็นผู้ Review/Publish? ผู้สร้าง Publish เองได้หรือไม่? Create → Private โดยตรงได้หรือไม่? Published → Draft ได้หรือไม่? | State machine และ Permission | FR-EFORM-003, 006, 007 |
| Q-011 | การส่งข้อความ Automation: ผู้รับคือใคร, Timezone, การส่งซ้ำ/ล้มเหลว, ระบบ PEEP OA API? | Messaging backend | FR-COMM-008 |
| Q-012 | ผู้ใช้ระบบ Admin มาจากไหน (เชิญด้วย PEEP SHARE ID / สร้างใหม่)? ต้องมี Add/Edit/Delete User หรือไม่? | User provisioning | FR-ADMIN-008 |
| Q-013 | Registration Data ต้องเป็น Dynamic Columns ตามฟอร์มของ Event (ตาม `Design.md` §14) หรือไม่? | Schema คำตอบฟอร์ม | FR-DASH-007 |
| Q-014 | การลบสมาชิก Event และการ Unlink Collection ต้องมีการยืนยันหรือไม่? | UX / ความปลอดภัยข้อมูล | FR-SYNC-007, FR-EVENT-011 |
| Q-015 | การลบถาวร Event ต้องบันทึก Audit หรือไม่? Trash เก็บกี่วัน? | Data retention | FR-EVENT-008 |
| Q-016 | 1 Event มีได้หลาย Collection (ตาม `Design.md` §18) หรือ 1 Collection (ตามโค้ด Set Event)? | Data Model | FR-EVENT-011, FR-SYNC-003 |
| Q-017 | System Settings ยังอยู่ในขอบเขตหรือไม่? | Scope | FR-EVENT-020 |
| Q-018 | รายการ Event Type และ Organizer (MONO, JAS, HR, LXL, other) เป็น Master Data ที่แก้ไขได้หรือไม่? | Master Data API | FR-EFORM-008 |
| Q-019 | Timezone ที่ใช้สำหรับเวลา Event, การเผยแพร่ตามเวลา, Banner Schedule? | การคำนวณสถานะ | FR-EFORM-009, FR-MEDIA-004 |
| Q-020 | ต้องการ Ticket Tier, การอนุมัติผู้สมัคร, Waitlist, การชำระเงินจริงหรือไม่? | Registration/Payment | FR-EFORM-012 |
| Q-021 | หน้า Event ฝั่งผู้เข้าร่วมอยู่ที่ใด (แอปมือถือ/เว็บ)? Preview ต้องเหมือนจริงแค่ไหน? | Preview | FR-EFORM-019 |
| Q-022 | Spec ขนาดรูป Cover Page จริง (โค้ดสมมติ 1080 × 1440, 3:4) | Media Ads | FR-MEDIA-001 |
| Q-023 | รายการ Deep Link ของแอป และวิธีค้นหา/ตรวจสอบ Content ID | Media Ads | FR-MEDIA-007 |
| Q-024 | "Event Reports" ใน `Design.md` §16 และ Spec เดิม ยังอยู่ในขอบเขตหรือไม่? (ไม่มีในโค้ด) | Scope | — |
| Q-025 | การกู้คืน Event จาก Trash ควรเป็นปุ่ม Restore หรือแก้ไขสถานะในฟอร์ม? กู้คืนแล้วได้สถานะอะไร? | Lifecycle | FR-EVENT-007 |
| Q-026 | ต้องการเอกสารฉบับภาษาอังกฤษหรือไม่ และใครดูแลให้สองภาษาตรงกัน? (เพิ่มจากการตรวจทาน — ดู `documentation-review-report.md` BIL-001) | การส่งต่อเอกสาร | ทั้งหมด |

## 4. QA Scenarios

> ทุก Scenario ทดสอบบน Frontend ปัจจุบัน (ข้อมูล Mock) — Refresh หน้าเพื่อรีเซ็ตข้อมูล
> คอลัมน์ "ผลที่คาดหวัง" อ้าง AC ใน [03-user-stories.md](03-user-stories.md)

| QA ID | Scenario | ขั้นตอนหลัก | ผลที่คาดหวัง (AC) | US |
|---|---|---|---|---|
| QA-AUTH-001 | Login ด้วยเบอร์โทร | เว้นว่าง → Log In; กรอกค่าใดๆ → Log In; สลับแสดงรหัส | AC-AUTH-001, 002, 003 | US-AUTH-001 |
| QA-AUTH-002 | QR Login จำลอง | แท็บ QR → Simulate Scan → Esc → Simulate Scan → Verify | AC-AUTH-004, 005 | US-AUTH-002 |
| QA-AUTH-003 | เปิด Service | เปิดแต่ละ Service, Coupon, PEEP OA | AC-AUTH-006, 007, 008 | US-AUTH-003 |
| QA-AUTH-004 | เปลี่ยนภาษา | เลือก TH → Refresh | AC-AUTH-009, 010 | US-AUTH-004 |
| QA-AUTH-005 | เมนูโปรไฟล์ | Switch Service, Log Out, User Profile | AC-AUTH-011, 012, 013 | US-AUTH-005 |
| QA-DASH-001 | Event List (Dashboard) | ตรวจไม่มี Draft, ค้นหา, กรอง, Sort ทุกคอลัมน์ | AC-DASH-001–005 | US-DASH-001 |
| QA-DASH-002 | Registration | เปิด MONOMAX → กรอง Check-in, ค้นหาด้วยอีเมล/เบอร์โทร, กด CSV | AC-DASH-006–009 | US-DASH-002 |
| QA-DASH-003 | Survey | Event ไม่มี Survey; MONOMAX ฟอร์ม #28 Submissions และ Overview | AC-DASH-010–013 | US-DASH-003 |
| QA-DASH-004 | Survey Export | Export CSV/XLS ของฟอร์ม #28; ตรวจไฟล์เปิดใน Excel (ภาษาไทย/BOM); ฟอร์ม #29 ปุ่ม Disable | AC-DASH-014, 015 | US-DASH-004 |
| QA-SYNC-001 | Event (PEEP SYNC) | Event List 7 รายการ, Overview, Collections tab | AC-SYNC-001–003 | US-SYNC-001 |
| QA-SYNC-002 | Members | Add (ID ว่าง/มีค่า), Edit, Remove, เปลี่ยนแท็บแล้วกลับ | AC-SYNC-004–008 | US-SYNC-002 |
| QA-SYNC-003 | Cloud | ตรวจตัวเลข, ค้นหาตาราง, กดปุ่ม Upgrade | AC-SYNC-009, 010 | US-SYNC-003 |
| QA-SYNC-004 | Create Collection | ชื่อว่าง/ช่องว่าง, สร้างสำเร็จ, เปลี่ยนเมนูแล้วกลับ | AC-SYNC-011, 012 | US-SYNC-004 |
| QA-SYNC-005 | File Browser | Collection ใหญ่ (12,820 ไฟล์): Pagination, Filter, Select ข้ามหน้า, Clear | AC-SYNC-013–016 | US-SYNC-005 |
| QA-SYNC-006 | Share | Public, Restricted, Copy Link, Download QR | AC-SYNC-017–020 | US-SYNC-006 |
| QA-SYNC-007 | Access & Delete | Remove คนสุดท้าย, Delete Collection, Delete จากรายการ | AC-SYNC-021–023 | US-SYNC-007 |
| QA-SYNC-008 | Upload/Photo Sync | Photo Sync page; Photo Sync Modal → Continue | AC-SYNC-024, 025 | US-SYNC-008 |
| QA-EVENT-001 | Set Event List | จำนวนแท็บ, Trash, ค้นหา Trim, ช่วงวันที่, Sort 3 สถานะ, Clear | AC-EVENT-001–006 | US-EVENT-001 |
| QA-EVENT-002 | Duplicate | Duplicate Event ที่มี QR (4827) จากแท็บ Published | AC-EVENT-007, 008 | US-EVENT-002 |
| QA-EVENT-003 | Trash/Delete | Move to Trash, ตรวจ Activity, Delete Permanently, Cancel | AC-EVENT-009–011 | US-EVENT-003 |
| QA-EVENT-004 | Overview | Capacity, คลิกการ์ด QR | AC-EVENT-012, 013 | US-EVENT-004 |
| QA-EVENT-005 | Link Collection | Link, Activity, Unlink | AC-EVENT-014, 015 | US-EVENT-005 |
| QA-EVENT-006 | QR Links | ชื่อซ้ำ, URL ผิด, สร้าง, Download, (ทดสอบ http:// — ISS-021) | AC-EVENT-016–019 | US-EVENT-006 |
| QA-EVENT-007 | Event Activity | แก้ Venue, เปลี่ยนสถานะ, เปิดรหัสผ่าน | AC-EVENT-020–022 | US-EVENT-007 |
| QA-EVENT-008 | System Activity | ตรวจจำนวน, กรอง | AC-EVENT-023, 024 | US-EVENT-008 |
| QA-EVENT-009 | Unsaved guard | แก้ฟอร์ม → คลิก Sidebar; แก้ฟอร์ม → Header Switch Service (ISS-020) | AC-EVENT-025 | US-EVENT-009 |
| QA-EFORM-001 | Stepper | Create: Next ว่าง, Step ถูกล็อก; Edit: กระโดด Step | AC-EFORM-001–004 | US-EFORM-001 |
| QA-EFORM-002 | Save Draft | ชื่ออย่างเดียว; วันสิ้นสุดก่อนเริ่ม; วันที่ไม่มีเวลา (ISS-016) | AC-EFORM-005, 006 | US-EFORM-002 |
| QA-EFORM-003 | Review & Publish | Create Event → Pending → Publish; Draft ปุ่ม Disable; Scheduled อดีต; Password 3 ตัว | AC-EFORM-007–011 | US-EFORM-003 |
| QA-EFORM-004 | Location | Hybrid, วาง Map Link, Lat 95 | AC-EFORM-012–014 | US-EFORM-004 |
| QA-EFORM-005 | Registration | Paid ไม่มี Payment, Limited "abc", Fee 0 | AC-EFORM-015–017 | US-EFORM-005 |
| QA-EFORM-006 | Form Builder | ไม่มีฟิลด์, Dropdown ไม่มีตัวเลือก, เปลี่ยนประเภท, ปิดฟอร์ม | AC-EFORM-018–021 | US-EFORM-006 |
| QA-EFORM-007 | Banner | .gif, 60 MB, JPEG ปกติ | AC-EFORM-022, 023 | US-EFORM-007 |
| QA-EFORM-008 | Preview | Modal, แท็บใหม่, ไม่มีคำอธิบาย | AC-EFORM-024 | US-EFORM-008 |
| QA-EFORM-009 | Cancel | Cancel ไม่มีการแก้ไข / มีการแก้ไข | AC-EFORM-025 | US-EFORM-009 |
| QA-COMM-001 | Communication | เปิด, OA ID ว่าง, OA ID รูปแบบผิด, Blur เติม # | AC-COMM-001, 002 | US-COMM-001 |
| QA-COMM-002 | Automation Editor | Before Event default, 5 ข้อความ, ข้อความว่าง, ตัวแปรใน Preview | AC-COMM-003–006 | US-COMM-002 |
| QA-COMM-003 | Automation List | Default 3 รายการ, Duplicate, Delete, Toggle → Journey | AC-COMM-007, 008 | US-COMM-003 |
| QA-COMM-004 | Message Delivery | TBD | AC-COMM-009 | US-COMM-004 |
| QA-TPL-001 | Template List | จำนวน, Used in, ค้นหา | AC-TPL-001, 002 | US-TPL-001 |
| QA-TPL-002 | Template Edit | ชื่อว่าง, เฉพาะ heading | AC-TPL-003, 004 | US-TPL-002 |
| QA-TPL-003 | Duplicate/Delete | ลบ Template ที่ถูกใช้, Duplicate | AC-TPL-005, 006 | US-TPL-003 |
| QA-TPL-004 | Use Template | สร้าง Template → ใช้ในฟอร์ม; คลิก Used in events | AC-TPL-007, 008 | US-TPL-004 |
| QA-MEDIA-001 | Banner List | 3 เมนู, ตัวกรองสถานะ/ช่วงวันที่, Clear all | AC-MEDIA-001–004 | US-MEDIA-001 |
| QA-MEDIA-002 | Banner Form | Validation ทุกฟิลด์ (ตาราง BR-MEDIA-002), Save, เปลี่ยน Action | AC-MEDIA-005–009 | US-MEDIA-002 |
| QA-MEDIA-003 | Activate/Deactivate/Duplicate | Active, Expired, Draft, Duplicate | AC-MEDIA-010–012 | US-MEDIA-003 |
| QA-MEDIA-004 | Sort | ไม่เปลี่ยน → Disable; ลูกศร; Drag (Desktop); Save | AC-MEDIA-013, 014 | US-MEDIA-004 |
| QA-MEDIA-005 | Delete | ลบกลางลำดับ ตรวจ Priority | AC-MEDIA-015 | US-MEDIA-005 |
| QA-MEDIA-006 | Discard guard | แก้ฟอร์ม → เปลี่ยนเมนู; แก้ฟอร์ม → Switch Service (ISS-020) | AC-MEDIA-016 | US-MEDIA-006 |
| QA-ADMIN-001 | Users | จำนวน, ค้นหา ID, กรอง Role | AC-ADMIN-001, 002 | US-ADMIN-001 |
| QA-ADMIN-002 | Suspend | Suspend → Roles → Users | AC-ADMIN-003 | US-ADMIN-002 |
| QA-ADMIN-003 | User Detail | เปิดผู้ใช้ 2 คน เปรียบเทียบ Activity | AC-ADMIN-004 | US-ADMIN-003 |
| QA-ADMIN-004 | Roles | ติ๊ก Permission, Save, Create Role | AC-ADMIN-005–007 | US-ADMIN-004 |
| QA-ADMIN-005 | User CRUD | TBD | AC-ADMIN-008 | US-ADMIN-005 |

### ข้อแนะนำการทดสอบเพิ่มเติม (ไม่มี AC เฉพาะ)
- **Responsive:** ทดสอบที่ < 640, 640–1023, ≥ 1024 px (Sidebar Drawer, ตารางเลื่อนแนวนอน — Set Event List ไม่มีมุมมองการ์ด) ตาม `Design.md` §28–29
- **i18n:** สลับ TH ในทุกหน้าเพื่อหาข้อความที่ไม่ได้แปล (ไม่ได้ตรวจในการ Audit นี้)
- **Accessibility:** Escape ปิด Modal — Modal ทั่วไปรองรับ แต่ Create Collection, Create Role, Add Member, Edit Member ไม่รองรับ
- **Time-dependent:** สถานะ Media Ads (Scheduled/Expired) และ Scheduled publish ขึ้นกับนาฬิกาเครื่อง — ทดสอบโดยเปลี่ยนเวลาเครื่องหรือแก้วันที่รายการ

## 5. ลำดับงานที่แนะนำ (ข้อเสนอ — รอยืนยัน)
1. ยืนยัน `Q-001`, `Q-002`, `Q-003`, `Q-007`, `Q-010` (กระทบ Data Model และ Auth)
2. Auth + Current User (`GAP-001`) และ Permission gating (`FR-ADMIN-007`)
3. Media Ads API ตาม `PromoApi` (`GAP-018`) — Frontend พร้อมที่สุด
4. Set Event CRUD/Lifecycle (`GAP-005`) + Upload (`GAP-006`) + Sanitization (`GAP-016`)
5. Registration/Survey (`GAP-003`, `GAP-004`) และรวม Event Model
6. Collections/Sharing/Photo Sync (`GAP-007`, `GAP-010`)
7. Messaging/Scheduler (`GAP-015`)
