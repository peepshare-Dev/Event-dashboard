# 04 — Functional Requirements

> **หมายเหตุการอ่าน**
> - ทุก FR อธิบายพฤติกรรมที่ **ตรวจสอบได้จาก Source Code** ถ้าเป็นความต้องการที่ยังไม่มีโค้ดจะระบุสถานะ `ยังไม่ได้พัฒนา`
> - **Priority** ไม่มีหลักฐานในโค้ด ค่าในเอกสารเป็น **ข้อเสนอของผู้จัดทำ** (`เสนอ: Must/Should/Could`) ต้องให้ PM ยืนยัน
> - **Implementation Status** หมายถึง Frontend เท่านั้น ทุก FR ไม่มี Backend/API
> - Path ใน Source Evidence อ้างอิงจาก `src/`

---

## AUTH — Login และ App Shell

### FR-AUTH-001 — เข้าสู่ระบบด้วยเบอร์โทรและรหัสผ่าน (จำลอง)
- **รายละเอียด:** ระบบต้องแสดงฟอร์มรหัสประเทศ (+66), เบอร์โทร, รหัสผ่าน, Remember me และปุ่ม Log In
- **Actor:** ผู้ดูแลระบบที่ยังไม่เข้าสู่ระบบ
- **Trigger:** กด Log In / Enter
- **Preconditions:** `isAuthenticated=false`
- **Input:** `countryCode`, `phone`, `password`, `rememberMe`
- **Processing Rules:** ตรวจเฉพาะ HTML `required` ของเบอร์โทรและรหัสผ่าน แล้วเรียก `onLogin()` ทันที; ไม่ใช้ค่าที่กรอก; `rememberMe` ไม่ถูกใช้
- **Output:** หน้า Select Service
- **Postconditions:** `isAuthenticated=true`, `screen='services'` (หน่วยความจำเท่านั้น — Refresh แล้วต้อง Login ใหม่)
- **Error Handling:** ไม่มี (ไม่มีกรณี Credential ผิด, Lockout, Network Error)
- **Dependencies:** ต้องมี Authentication API — `GAP-001`
- **Priority:** เสนอ: Must
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน
- **Source Evidence:** `views/LoginPage.tsx` (`UsernameLoginForm`), `App.tsx` (`handleLogin`)

### FR-AUTH-002 — เข้าสู่ระบบด้วย QR Code (จำลอง)
- **รายละเอียด:** ระบบต้องแสดงพื้นที่ QR, คำแนะนำการสแกน และ Modal รหัสยืนยัน
- **Actor:** ผู้ดูแลระบบ
- **Trigger:** กด "Simulate Scan" แล้ว "Verify & Continue"
- **Preconditions:** อยู่แท็บ QR Code Login
- **Input:** ไม่มี
- **Processing Rules:** แสดงไอคอนแทน QR จริง; รหัสยืนยัน `831106` คงที่; Modal ปิดด้วย Cancel/Escape/คลิกพื้นหลัง
- **Output:** หน้า Select Service
- **Postconditions:** `isAuthenticated=true`
- **Error Handling:** ไม่มี (ไม่มี QR หมดอายุ/สแกนล้มเหลว)
- **Dependencies:** QR Login Session API — `GAP-001`
- **Priority:** เสนอ: Should
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน
- **Source Evidence:** `views/LoginPage.tsx` (`QRLogin`, `VerificationModal`)

### FR-AUTH-003 — แสดงรายการ Service และเปิด Service
- **รายละเอียด:** ระบบต้องแสดงการ์ด Service จาก `services` และเปิด Service ที่เลือกหลังหน้า Loading
- **Actor:** ผู้ใช้ที่เข้าสู่ระบบ
- **Trigger:** กด Open Service
- **Preconditions:** `isAuthenticated=true`
- **Input:** `serviceId`
- **Processing Rules:** แสดง Loading "Opening {name}..." 1200 ms (`setTimeout`) แล้ว Render ตาม `service.id`: `event-dashboard`, `set-event`, `media-ads`, `peep-sync`; อื่นๆ → Placeholder; `environment='Staging'` แสดงป้าย Staging (ไม่มีในข้อมูลปัจจุบัน)
- **Output:** หน้าแรกของ Service
- **Postconditions:** `screen={name:'service', serviceId}`
- **Error Handling:** `serviceId` ไม่พบ → แสดงหน้า Select Service
- **Dependencies:** `data/mock.ts` (`services`); ไม่มีการตรวจสิทธิ์ต่อ Service (`Q-003`)
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `App.tsx`, `views/ServiceSelection.tsx`, `components/ServiceCard.tsx`, `views/ServiceLoading.tsx`

### FR-AUTH-004 — หน้า Placeholder สำหรับ Service ที่ยังไม่พัฒนา
- **รายละเอียด:** Coupon และ PEEP OA ต้องแสดงหน้า "You are now accessing {name}." พร้อมปุ่ม Switch Service
- **Actor:** ผู้ใช้ · **Trigger:** เปิด Service `coupon`/`peep-oa` · **Preconditions:** เข้าสู่ระบบแล้ว
- **Input:** `service` · **Processing Rules:** ไม่มี · **Output:** หน้า Placeholder · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** —
- **Priority:** TBD
- **Implementation Status:** ยังไม่ได้พัฒนา (Feature ของ Coupon / PEEP OA)
- **Source Evidence:** `views/ServicePlaceholder.tsx`

### FR-AUTH-005 — สลับภาษาและจดจำภาษา
- **รายละเอียด:** ระบบต้องรองรับ EN/TH และจดจำภาษาที่เลือก
- **Actor:** ผู้ใช้ทุกคน
- **Trigger:** เลือกภาษาจากหน้า Login หรือ Header
- **Preconditions:** —
- **Input:** `lang: 'en' | 'th'`
- **Processing Rules:** อ่านค่าเริ่มจาก `localStorage['peepshare.lang']` (ค่าอื่น → `en`); `t(text)` ใช้ข้อความอังกฤษเป็น Key, ไม่มีคำแปล → แสดงอังกฤษ; รองรับ `{var}` และ Prefix `[context]`; ตั้ง `document.documentElement.lang`
- **Output:** UI เปลี่ยนภาษาทันที
- **Postconditions:** บันทึกลง `localStorage`
- **Error Handling:** `localStorage` ใช้ไม่ได้ → ใช้ได้เฉพาะ Session (try/catch)
- **Dependencies:** `i18n/th/*` (ไม่ได้ตรวจความครบถ้วนของคำแปล)
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `i18n/index.tsx`, `components/Header.tsx`, `views/LoginPage.tsx`

### FR-AUTH-006 — เมนูโปรไฟล์: Switch Service และ Log Out
- **รายละเอียด:** Header ต้องมีเมนู User Profile, User management (เงื่อนไข), Switch Service, Log Out
- **Actor:** ผู้ใช้ที่เข้าสู่ระบบ
- **Trigger:** คลิกชื่อผู้ใช้ที่ Header แล้วเลือกเมนู
- **Preconditions:** เข้าสู่ระบบแล้ว
- **Input:** —
- **Processing Rules:** Switch Service → `screen='services'`; Log Out → `isAuthenticated=false`; User management แสดงเมื่อส่ง `onUserManagement` (เฉพาะ `ServiceSelection`, `AccountAdminPage`); User Profile เรียก `onProfileClick` ที่ไม่มีผู้ส่ง → ไม่ทำอะไร
- **Output:** เปลี่ยนหน้า
- **Postconditions:** Component ของ Service ถูก Unmount → State ทั้งหมดของ Service หาย (ยกเว้นข้อมูล Media Ads ที่อยู่ระดับ Module)
- **Error Handling:** ไม่มีการเตือนข้อมูลยังไม่บันทึก (`ISS-020`)
- **Dependencies:** Logout/Session API — `GAP-001`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน (User Profile ไม่ทำงาน `ISS-002`)
- **Source Evidence:** `components/Header.tsx` (`menuItems`), `App.tsx`

### FR-AUTH-007 — Sidebar แบบย่อ/ขยาย และ Drawer บนมือถือ
- **รายละเอียด:** Sidebar ต้องย่อ (64 px) / ขยาย (272 px) ได้บนจอ ≥1024 px และเป็น Drawer บนจอเล็ก
- **Actor:** ผู้ใช้ · **Trigger:** ปุ่มลูกศร / Hamburger · **Preconditions:** อยู่ใน Service ที่มี Sidebar
- **Input:** — · **Processing Rules:** เมนูที่มี `children` คลิกแม่แล้วเปิดลูกแรก; Drawer ปิดเมื่อคลิกพื้นหลัง/X/เลือกเมนู
- **Output:** Sidebar เปลี่ยนสภาพ · **Postconditions:** สถานะย่อไม่ถูกจดจำ
- **Error Handling:** —
- **Dependencies:** `data/navigation.tsx`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `components/Sidebar.tsx`, `components/Header.tsx`

---

## DASH — Event Dashboard

### FR-DASH-001 — รายการ Event สำหรับ Data Viewer
- **รายละเอียด:** ในโหมด `dashboard` ระบบต้องไม่แสดง Event สถานะ Draft, ใช้คอลัมน์ Check-ins แทน Photos และไม่มีคอลัมน์ Actions
- **Actor:** Data Viewer · **Trigger:** เปิด Event Dashboard / คลิกเมนู Event List
- **Preconditions:** เปิด Service `event-dashboard`
- **Input:** `events` (`data/mock.ts`)
- **Processing Rules:** `listed = events.filter(status !== 'Draft')`; ชิปสถานะไม่มี Draft; หัวตาราง "{n} events total" นับจาก `listed`
- **Output:** ตาราง #, Event Name (+location), Date, Status, Registrants, Check-ins, Members; มือถือเป็นการ์ดพร้อมปุ่ม View Event
- **Postconditions:** —
- **Error Handling:** ไม่มีข้อมูล → "No events found."; ไม่มี Loading/Error State
- **Dependencies:** Event List API — `GAP-002`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (Mock)
- **Source Evidence:** `views/EventList.tsx`, `views/EventDashboardApp.tsx`

### FR-DASH-002 — ค้นหา Event ตามชื่อ
- **รายละเอียด:** ค้นหาแบบ Substring ไม่สนตัวพิมพ์บน `name` เท่านั้น
- **Actor:** Data Viewer / Photographer · **Trigger:** พิมพ์ในช่องค้นหา · **Preconditions:** อยู่ Event List
- **Input:** `search` · **Processing Rules:** ไม่ Trim คำค้น; เปลี่ยนคำค้นแล้วกลับหน้า 1
- **Output:** รายการที่ตรง · **Postconditions:** State หายเมื่อเปิด Event Detail แล้วกลับมา
- **Error Handling:** ไม่พบ → "No events found."
- **Dependencies:** —
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/EventList.tsx`

### FR-DASH-003 — กรอง Event ตามสถานะ
- **รายละเอียด:** ชิป All / Upcoming / Ongoing / Completed / Archived (+Draft ใน PEEP SYNC) เทียบค่าเท่ากันทุกตัวอักษร
- **Actor / Trigger / Preconditions:** เหมือน FR-DASH-002 (คลิกชิป)
- **Input:** `statusFilter` · **Processing Rules:** เปลี่ยนแล้วกลับหน้า 1 · **Output:** รายการที่ตรง · **Postconditions:** —
- **Error Handling:** ไม่พบ → "No events found."
- **Dependencies:** —
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/EventList.tsx`

### FR-DASH-004 — เรียงลำดับ Event
- **รายละเอียด:** คลิกหัวคอลัมน์ Event Name, Date, Registrants, Check-ins/Photos เพื่อเรียง
- **Actor / Trigger:** ผู้ใช้คลิกหัวคอลัมน์ · **Preconditions:** —
- **Input:** `sortCol`, `sortDir` · **Processing Rules:** ค่าเริ่มต้น `name` asc; คลิกคอลัมน์เดิมสลับทิศ; คอลัมน์ใหม่ → asc; Name ใช้ `localeCompare`; Registrants/Metric ใช้ลบเลข; **Date ไม่มี Comparator → ลำดับไม่เปลี่ยน**
- **Output:** ตารางเรียงแล้ว · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** ต้องการรูปแบบวันที่ที่ Sort ได้ (`dates` เป็นข้อความแสดงผล เช่น "5 – 6 Sep 2026")
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วบางส่วน (`ISS-003`)
- **Source Evidence:** `views/EventList.tsx` (`.sort`)

### FR-DASH-005 — แบ่งหน้ารายการ Event
- **รายละเอียด:** 10 รายการต่อหน้า; Desktop แสดง "Showing {from}–{to} of {total}", Prev/Next, ปุ่มเลขหน้า; มือถือแสดงเมื่อ > 1 หน้า
- **Actor / Trigger:** คลิกหน้า · **Preconditions:** —
- **Input:** `page` · **Processing Rules:** Prev/Next Disable ที่ขอบ · **Output:** รายการหน้าที่เลือก · **Postconditions:** —
- **Error Handling:** 0 รายการ → "Showing 0–0 of 0"
- **Dependencies:** API ต้องรองรับ Pagination — `GAP-002`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/EventList.tsx`

### FR-DASH-006 — การ์ดสรุป Event
- **รายละเอียด:** Event Detail ต้องแสดง Breadcrumb, ชื่อ, สถานะ, วันที่·สถานที่ และการ์ด Registered, Checked-in (+"{pct}% attendance" เมื่อ registrants>0), Survey Responses, Photos, Members
- **Actor:** Data Viewer / Photographer · **Trigger:** คลิกชื่อ Event · **Preconditions:** —
- **Input:** `Event` · **Processing Rules:** pct = round(checkedIn/registrants×100); แสดงทุกการ์ดในทุก Service
- **Output:** หน้า Event Detail · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** Event Summary API — `GAP-002`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (Mock) — การแสดง Photos/Members ต่อ Data Viewer รอยืนยัน `Q-004`
- **Source Evidence:** `views/EventDetail.tsx`

### FR-DASH-007 — ตารางข้อมูลผู้ลงทะเบียน
- **รายละเอียด:** แท็บ Registration แสดงผู้ลงทะเบียนของ Event พร้อมค้นหาและกรอง Check-in
- **Actor:** Data Viewer · **Trigger:** เปิดแท็บ Registration · **Preconditions:** อยู่ Event Detail
- **Input:** `eventId`, `search`, `checkInFilter`
- **Processing Rules:** แสดง `registrationData` ที่ `eventId` ตรง; ค้นหาไม่สนตัวพิมพ์บน name/email/username (ไม่ Trim, ไม่รวม phone); กรอง All / Checked In / Not Checked In; ไม่มี Sort/Pagination; ไม่แสดง `ticketType`
- **Output:** ตาราง #, Name, Phone, Email, PEEP SHARE Username, Event Date, Check-in (In/Out)
- **Postconditions:** —
- **Error Handling:** ไม่มีข้อมูล/ไม่ตรง → "No registrants found."
- **Dependencies:** Registration API — `GAP-003`; คอลัมน์คงที่ ขัดกับ `Design.md` §14 ที่ต้องการ Dynamic Columns (`Q-013`)
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (Mock)
- **Source Evidence:** `views/RegistrationData.tsx` (`EventRegistrationDetail`)

### FR-DASH-008 — Export ข้อมูลผู้ลงทะเบียน
- **รายละเอียด:** ปุ่ม CSV / Excel ในแท็บ Registration
- **Actor:** Data Viewer · **Trigger:** กดปุ่ม · **Preconditions:** —
- **Input:** — · **Processing Rules:** **ปุ่มไม่มี `onClick`**
- **Output:** ไม่มี · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** Export API หรือ Client-side Export — `GAP-003`
- **Priority:** เสนอ: Must (Role Data Viewer ใน Mock มีสิทธิ์ "Export Registration Data")
- **Implementation Status:** ยังไม่ได้พัฒนา (`ISS-004`)
- **Source Evidence:** `views/RegistrationData.tsx`

### FR-DASH-009 — รายการแบบสำรวจของ Event
- **รายละเอียด:** แท็บ Survey แสดงการ์ดฟอร์มของ Event
- **Actor:** Data Viewer · **Trigger:** เปิดแท็บ Survey · **Preconditions:** —
- **Input:** `surveyForms` ที่ `eventId` ตรง
- **Processing Rules:** การ์ดแสดง Form #id, Enabled (`status='Active'`)/Disabled, ชื่อ, "{n} respondents", "{n} questions", คะแนนเฉลี่ย "x.x / 5" เมื่อมีคำถาม rating และมีคำตอบ (นับเฉพาะค่า > 0)
- **Output:** รายการการ์ด · **Postconditions:** —
- **Error Handling:** ไม่มีฟอร์ม → "No surveys yet" / "This event doesn't have any survey forms."
- **Dependencies:** Survey API — `GAP-004`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (Mock)
- **Source Evidence:** `views/SurveyFeedback.tsx`

### FR-DASH-010 — ตารางคำตอบแบบสำรวจ (Submissions)
- **รายละเอียด:** แสดงคำตอบทั้งหมดของฟอร์มเป็นตาราง
- **Actor:** Data Viewer · **Trigger:** คลิกการ์ดฟอร์ม · **Preconditions:** —
- **Input:** `SurveyForm.submissions`
- **Processing Rules:** คอลัมน์ #, IP Address, Peepshare ID, ต่อคำถาม, Submitted at; rating แสดงดาว 5 ดวง + (n); text ตัด 2 บรรทัด; ไม่มีคำตอบ → "—"; ท้ายตาราง "Total: {n} entries"; ไม่มี Search/Sort/Pagination
- **Output:** ตาราง · **Postconditions:** ฟอร์มที่เลือกหายเมื่อเปลี่ยนแท็บ
- **Error Handling:** ไม่มีคำตอบ → "No responses yet"
- **Dependencies:** `GAP-004`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (Mock)
- **Source Evidence:** `views/SurveyFeedback.tsx` (`SurveyFormDetail`)

### FR-DASH-011 — สถิติภาพรวมแบบสำรวจ
- **รายละเอียด:** แท็บ Overview Statistics สรุปผลต่อคำถาม
- **Actor / Trigger:** Data Viewer เลือกแท็บย่อย · **Preconditions:** มีคำตอบ
- **Input:** คำถามและคำตอบ
- **Processing Rules:** radio = จำนวนและ % ของคำตอบทั้งหมด (เทียบข้อความตรงตัว); rating = ค่าเฉลี่ยของค่า > 0, ดาว = round(avg), การกระจาย 5→1; text = รายการคำตอบที่ไม่ว่างพร้อม Peepshare ID และเวลา
- **Output:** การ์ดสถิติ · **Postconditions:** —
- **Error Handling:** ไม่มีคำตอบ → "No responses to summarize yet"
- **Dependencies:** อาจคำนวณฝั่ง Server เมื่อข้อมูลมาก — `GAP-004`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/SurveyFeedback.tsx`

### FR-DASH-012 — Export คำตอบแบบสำรวจ
- **รายละเอียด:** ดาวน์โหลดคำตอบเป็น CSV หรือ Excel
- **Actor:** Data Viewer · **Trigger:** กด CSV / Excel · **Preconditions:** มีคำตอบ ≥ 1 (ไม่เช่นนั้นปุ่ม Disable)
- **Input:** submissions ของฟอร์ม
- **Processing Rules:** CSV = UTF-8 + BOM, ครอบทุกช่องด้วย `"` และ Escape `"`, CRLF, `text/csv`; Excel = HTML `<table>` ชนิด `application/vnd.ms-excel` นามสกุล `.xls`; คอลัมน์ #, IP, Peepshare ID, คำถาม, Submitted at; ชื่อไฟล์ `survey-{formId}-responses.{csv|xls}`
- **Output:** ไฟล์ดาวน์โหลด (Blob + `<a download>`)
- **Postconditions:** —
- **Error Handling:** ไม่มี
- **Dependencies:** หากข้อมูลมาก ควรย้ายไป Server — `GAP-004`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/SurveyFeedback.tsx`

---

## SYNC — PEEP SYNC

### FR-SYNC-001 — รายการ Event สำหรับ Photographer
- **รายละเอียด:** แสดงทุก Event (รวม Draft) คอลัมน์ Photos และ Actions (View, Edit, Access, ⋯)
- **Actor:** Photographer · **Trigger:** เปิด PEEP SYNC · **Preconditions:** —
- **Input:** `events` · **Processing Rules:** Search/Filter/Sort/Pagination ตาม FR-DASH-002–005; View → Event Detail; **Edit, Access, ⋯ ไม่มี Handler**
- **Output:** ตาราง · **Postconditions:** —
- **Error Handling:** "No events found."
- **Dependencies:** การกรองตาม Event ที่ได้รับมอบหมาย — `Q-005`, `GAP-002`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน (`ISS-005`) — ดู `ISS-029`
- **Source Evidence:** `views/EventList.tsx`, `views/PeepSyncApp.tsx`

### FR-SYNC-002 — Overview ของ Event (ตัวเลขจำลอง)
- **รายละเอียด:** แท็บ Overview แสดงการ์ด Registration, Survey, Photo Activity, Event Team
- **Actor:** Photographer · **Trigger:** เปิด Event Detail (แท็บเริ่มต้น) · **Preconditions:** —
- **Input:** `Event`
- **Processing Rules:** General = round(registrants×0.72), VIP = round(registrants×0.28); Attendance = round(checkedIn/registrants×100); Response Rate = round(surveyResponses/checkedIn×100); Photo Completed = round(photos×0.99), Processing = round(photos×0.007), Failed = ส่วนที่เหลือ; Team: Event Admin 2, Event Staff 4, Photographer 4, Viewer = members−10 หรือ 2 (ค่าคงที่)
- **Output:** การ์ดสรุป · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** ต้องการข้อมูลจริงจาก API — `GAP-002`, `GAP-008`
- **Priority:** เสนอ: Should
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน
- **Source Evidence:** `views/EventDetail.tsx` (`OverviewTab`)

### FR-SYNC-003 — แท็บ Collections ของ Event (อ่านอย่างเดียว)
- **รายละเอียด:** แสดง Collection ที่ `linkedEvent` ตรงกับชื่อ Event พร้อมสรุปจำนวน ไฟล์ และพื้นที่
- **Actor:** Photographer · **Trigger:** เปิดแท็บ · **Preconditions:** —
- **Input:** `mockCollections` (Static)
- **Processing Rules:** เชื่อมด้วย **ชื่อ Event** (String) ไม่ใช่ ID; Collection ที่สร้าง/แก้ในหน้า Collections ไม่สะท้อนที่นี่; การ์ดคลิกไม่ได้
- **Output:** การ์ด Collections, Total Files, Total Storage (GB 1 ตำแหน่ง) · **Postconditions:** —
- **Error Handling:** ไม่มี → "No collections linked to this event yet."
- **Dependencies:** Collection API — `GAP-007`
- **Priority:** เสนอ: Should
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน
- **Source Evidence:** `views/EventDetail.tsx` (`CollectionsTab`)

### FR-SYNC-004 — รายชื่อสมาชิก Event
- **รายละเอียด:** แท็บ Members & Access แสดงสมาชิก พร้อม Role, Permissions, Status, Added Date
- **Actor:** ผู้ดูแล Event · **Trigger:** เปิดแท็บ · **Preconditions:** —
- **Input:** `eventMembers` (5 รายการ **ชุดเดียวกันทุก Event**)
- **Processing Rules:** Status "Active" = เขียว, อื่นๆ = แดง; ไม่มี Search/Pagination
- **Output:** ตาราง/การ์ด · **Postconditions:** State หายเมื่อ Unmount
- **Error Handling:** ไม่มี Empty State (ตารางว่าง)
- **Dependencies:** Event Member API — `GAP-009`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน (`ISS-007`)
- **Source Evidence:** `views/MembersAccess.tsx`, `data/mock.ts` (`eventMembers`)

### FR-SYNC-005 — เพิ่มสมาชิก Event
- **รายละเอียด:** ค้นหาผู้ใช้ด้วย PEEP SHARE ID แล้วกำหนด Role และ Permission
- **Actor:** ผู้ดูแล Event · **Trigger:** Add Member → Search → Add Member · **Preconditions:** —
- **Input:** `peepId`, `role` (Event Admin / Event Staff / Photographer / Viewer; ค่าเริ่ม Viewer), `permissions` (9 รายการตาม `ALL_PERMISSIONS`: View Event, View Photos, Upload Photos, Sync Photos, View Registration, View Survey, View Reports, Export Data, Manage Members; ค่าเริ่ม ["View Event"])
- **Processing Rules:** Search ทำงานเมื่อ `peepId.trim()` ไม่ว่าง; **ผลลัพธ์คือ "Kanya Srisuwan" เสมอ**; แก้ไข ID → ต้องค้นหาใหม่; Add Member Disable จนกว่าจะค้นหา; เลือก Role ไม่ตั้ง Permission อัตโนมัติ; บันทึก `peepId || 'PPS008'` (ไม่ Trim), Status Active, `addedDate` = วันที่ UTC
- **Output:** แถวใหม่ท้ายตาราง · **Postconditions:** Local State
- **Error Handling:** ไม่มีกรณีไม่พบผู้ใช้, ไม่ตรวจ ID ซ้ำ, อนุญาต 0 Permission
- **Dependencies:** User Lookup API — `GAP-009`
- **Priority:** เสนอ: Must
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน (`ISS-006`)
- **Source Evidence:** `views/MembersAccess.tsx` (`AddMemberModal`)

### FR-SYNC-006 — แก้ไขสิทธิ์สมาชิก
- **รายละเอียด:** Modal "Edit Access — {name}" แก้ Role และ Permission
- **Actor / Trigger:** ผู้ดูแล Event กด Edit → Save Changes · **Preconditions:** มีสมาชิก
- **Input:** `role`, `permissions` · **Processing Rules:** แทนที่สมาชิกตาม `peepId`; ไม่มี Validation; ปุ่ม "Role" ในแถว **ไม่มี Handler**
- **Output:** แถวอัปเดต · **Postconditions:** Local State
- **Error Handling:** —
- **Dependencies:** `GAP-009`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน
- **Source Evidence:** `views/MembersAccess.tsx` (`EditMemberModal`)

### FR-SYNC-007 — ลบสมาชิก Event
- **รายละเอียด:** กด Remove เพื่อลบสมาชิกออกทันที
- **Actor / Trigger:** ผู้ดูแล Event กด Remove · **Preconditions:** —
- **Input:** `peepId` · **Processing Rules:** ไม่มีการยืนยัน · **Output:** แถวหาย · **Postconditions:** Local State
- **Error Handling:** —
- **Dependencies:** `GAP-009`
- **Priority:** เสนอ: Must (ควรมีการยืนยัน — `Q-014`)
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/MembersAccess.tsx`

### FR-SYNC-008 — ภาพรวมพื้นที่ Cloud
- **รายละเอียด:** แสดงพื้นที่ใช้/คงเหลือ/ทั้งหมด, แยกตามประเภทไฟล์, แพ็กเกจปัจจุบัน และแพ็กเกจอัปเกรด
- **Actor:** Photographer / Admin · **Trigger:** เมนู Cloud Management · **Preconditions:** —
- **Input:** ค่าคงที่ USED 28.5 GB, TOTAL 100 GB, Photos 18.2, Videos 7.8, Documents 2.5, Other 0
- **Processing Rules:** ≥100% = full (ไม่มี UI แยก), ≥80% = warning (Banner + แถบสีเหลือง), อื่นๆ = normal; USAGE_PCT ปัดเศษได้ 28
- **Output:** การ์ด Cloud Storage, Storage Usage, Current Plan (100 GB, Active, Renewal 31 Dec 2027, Monthly), Upgrade Storage (200 GB ฿199, 500 GB ฿449, 1 TB ฿849 /เดือน)
- **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** Storage/Billing API — `GAP-008`
- **Priority:** เสนอ: Should
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน; ปุ่ม Upgrade Storage, Manage Storage, Manage Plan, Upgrade ไม่มี Handler (`ISS-008`)
- **Source Evidence:** `views/CloudManagement.tsx`

### FR-SYNC-009 — ตาราง Storage Usage by Event
- **รายละเอียด:** ตาราง Event, Collection, Files, Storage Used (แถบ % ของ 100 GB), Last Updated, Status พร้อมช่องค้นหา
- **Actor / Trigger:** ผู้ใช้พิมพ์ค้นหา · **Preconditions:** —
- **Input:** `EVENT_USAGE` (4 แถว Hardcode) · **Processing Rules:** ค้นหาไม่สนตัวพิมพ์บน event หรือ collection (ไม่ Trim); ไม่มี Sort/Pagination
- **Output:** ตาราง · **Postconditions:** —
- **Error Handling:** ไม่พบ → ตารางว่าง (ไม่มี Empty State)
- **Dependencies:** `GAP-008`; ผลรวม GB ในตาราง (61.3) ไม่สอดคล้องกับ 28.5 GB
- **Priority:** เสนอ: Could
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน
- **Source Evidence:** `views/CloudManagement.tsx`

### FR-SYNC-010 — รายการ Collection
- **รายละเอียด:** แสดง Collection ทั้งหมดพร้อมค้นหาและกรอง Sharing
- **Actor:** Photographer / Admin · **Trigger:** เมนู Collections · **Preconditions:** —
- **Input:** `mockCollections` (6) ใน Local State
- **Processing Rules:** เรียง `updatedAt` มากไปน้อย (คงที่); ค้นหาไม่สนตัวพิมพ์บน name, linkedEvent, owner (ไม่ Trim); ชิป All / Public Link / Private / Restricted / Expired; ไม่มี Pagination; ขนาด ≥1 GB แสดง GB ไม่เช่นนั้น MB
- **Output:** ตาราง Collection Name, Owner, Linked Event, Files, Storage, Last Updated, Sharing, Status, Actions (View, Share, Delete)
- **Postconditions:** State หายเมื่อเปลี่ยนเมนู
- **Error Handling:** "No collections found"
- **Dependencies:** `GAP-007`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (ปุ่ม Delete ในแถวไม่มี Handler `ISS-009`)
- **Source Evidence:** `views/Collections.tsx`

### FR-SYNC-011 — สร้าง Collection
- **รายละเอียด:** Modal สร้าง Collection
- **Actor / Trigger:** ผู้ใช้กด Create Collection → Create · **Preconditions:** —
- **Input:** Collection Name (บังคับ), Description, Owner (`users`), Link to Event (`events`)
- **Processing Rules:** ปุ่ม Disable เมื่อ `!name.trim()`; ค่าเริ่มต้น Description "No description provided", Owner "Admin", Event "—"; บันทึก `id=Date.now()`, files 0, storageGb 0, sharing Private, status Active, lastUpdated "Just now", ownerAvatar "ST"; แทรกบนสุด; Storage Location "PEEP SHARE Cloud" เป็นข้อความเท่านั้น
- **Output:** Collection ใหม่ · **Postconditions:** Local State
- **Error Handling:** ไม่ตรวจชื่อซ้ำ
- **Dependencies:** `GAP-007`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/Collections.tsx` (`CreateCollectionModal`)

### FR-SYNC-012 — เรียกดูไฟล์ใน Collection
- **รายละเอียด:** File Browser แบบ Gallery/List พร้อมค้นหา กรอง และแบ่งหน้า
- **Actor:** ผู้ใช้ · **Trigger:** เปิด Collection Detail · **Preconditions:** —
- **Input:** `mockFiles(collection)` สร้างจากจำนวนไฟล์ (ประเภท/สถานะตามสูตร Modulo)
- **Processing Rules:** ค้นหาชื่อไฟล์ (Trim, ไม่สนตัวพิมพ์); File type All/Photos/Videos/Documents/Audio/Other; Status All/Uploaded/Processing/Failed; เปลี่ยนเงื่อนไข → หน้า 1; 24 ไฟล์/หน้า; Pagination แสดงเมื่อ > 1 หน้า (Ellipsis เมื่อ > 7 หน้า); Clear Disable เมื่อไม่มีเงื่อนไข; ปุ่ม Filter by ซ่อน/แสดงตัวกรอง (ค่าเริ่มแสดง)
- **Output:** รายการไฟล์ · **Postconditions:** —
- **Error Handling:** "No files match your search" / "No files in this collection yet"
- **Dependencies:** File List API — `GAP-007`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (ไฟล์ Mock)
- **Source Evidence:** `views/Collections.tsx` (`CollectionDetail`, `mockFiles`), `components/ui/Pagination.tsx`

### FR-SYNC-013 — เลือกไฟล์และ Bulk Action
- **รายละเอียด:** เลือกไฟล์รายตัว/ทั้งหน้า และแสดงแถบ Bulk
- **Actor / Trigger:** คลิกการ์ด/Checkbox · **Preconditions:** มีไฟล์
- **Input:** `selected` · **Processing Rules:** Select all สลับทั้งหน้า (on/off/mixed); การเลือกคงอยู่ข้ามหน้าและตัวกรอง; Unselect all ทำงาน; **Download และ Delete ในแถบ Bulk ไม่มี Handler**
- **Output:** "{n} selected" · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** `GAP-007`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วบางส่วน (`ISS-009`)
- **Source Evidence:** `views/Collections.tsx`

### FR-SYNC-014 — ตั้งค่าการแชร์ Collection
- **รายละเอียด:** Share Modal กำหนดผู้เข้าถึงและบันทึกสถานะ Sharing
- **Actor:** เจ้าของ Collection · **Trigger:** กด Share (รายการ/รายละเอียด) → Share · **Preconditions:** —
- **Input:** Who has access (Anyone with the link / Private access), Link role (Viewer/Editor), รายการบุคคล/กลุ่ม, Role ร่วม (Viewer/Editor ค่าเริ่ม Editor)
- **Processing Rules:** ค่าเริ่ม = link ถ้า Sharing ปัจจุบันเป็น Public Link; ค้นหาบุคคล Trim ไม่สนตัวพิมพ์บน name+meta; Groups 3 กลุ่ม Hardcode, Friends = `users`; บันทึก: link → **Public Link**, มีผู้ถูกเลือก → **Restricted**, ไม่มี → **Private**; คนที่มีอยู่แล้วอัปเดต Role, คนใหม่ต่อท้าย, ไม่รวม Owner; อัปเดต lastUpdated "Just now" และ `updatedAt`; **Link role ไม่ถูกบันทึก**
- **Output:** Sharing ใหม่ · **Postconditions:** Collection ย้ายขึ้นบนสุด
- **Error Handling:** "No matching people found"
- **Dependencies:** Sharing API — `GAP-007`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน (`ISS-010`)
- **Source Evidence:** `views/Collections.tsx` (`ShareModal`, `saveSharing`)

### FR-SYNC-015 — คัดลอกลิงก์และดาวน์โหลด QR ของ Collection
- **รายละเอียด:** Copy Link และ Download QR Code ใน Share Modal
- **Actor / Trigger:** กดปุ่ม · **Preconditions:** —
- **Input:** slug ของ Collection
- **Processing Rules:** ลิงก์ `https://peepshare.com/c/{slug}`; Copy ใช้ `navigator.clipboard` แสดง Copied 2 วินาที **แม้ล้มเหลว**; QR PNG 1024 px margin 2 ด้วย `qrcode` (โหลดแบบ Dynamic) ชื่อ `{slug}-qr.png`; ระหว่างสร้างปุ่มแสดง "Preparing…"
- **Output:** Clipboard / ไฟล์ PNG · **Postconditions:** —
- **Error Handling:** ไม่มี UI แจ้งข้อผิดพลาด
- **Dependencies:** URL ปลายทางของ Collection สาธารณะ — `GAP-007`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend — ดู `ISS-022`
- **Source Evidence:** `views/Collections.tsx`, `components/set-event/qr.tsx`

### FR-SYNC-016 — จัดการผู้มีสิทธิ์เข้าถึง Collection
- **รายละเอียด:** Modal People with access แสดงเจ้าของและผู้มีสิทธิ์ พร้อมเปลี่ยน Role / Remove
- **Actor:** เจ้าของ · **Trigger:** ⋮ → People with access · **Preconditions:** —
- **Input:** `accessById[collection.id]`
- **Processing Rules:** เจ้าของแสดงก่อนพร้อมไอคอนมงกุฎ; เปลี่ยน Role (Viewer/"Edit") และ Remove มีผลทันที ไม่มีการยืนยัน; ลบคนสุดท้ายขณะ Restricted → Private; เปลี่ยน Role ไม่อัปเดต lastUpdated
- **Output:** รายชื่ออัปเดต · **Postconditions:** Local State
- **Error Handling:** "Not shared with anyone yet."
- **Dependencies:** `GAP-007`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend (ป้าย "Edit" vs "Editor" ไม่สม่ำเสมอ) — ดู `ISS-028`
- **Source Evidence:** `views/Collections.tsx` (`PeopleAccessModal`)

### FR-SYNC-017 — ลบ Collection
- **รายละเอียด:** ลบ Collection จากเมนู ⋮ ในหน้ารายละเอียด
- **Actor / Trigger:** เจ้าของกด Delete Collection → ยืนยัน · **Preconditions:** —
- **Input:** Collection
- **Processing Rules:** Modal "Delete this collection?" / "{name} and its {n} files will be deleted. This cannot be undone."; ยืนยัน → ลบออกจาก State และกลับรายการ (ไม่ลบ `accessById`); Download Collection ใน ⋮ เป็น no-op; Delete ในหน้ารายการไม่มี Handler
- **Output:** Collection ถูกลบ · **Postconditions:** Local State
- **Error Handling:** —
- **Dependencies:** `GAP-007`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน
- **Source Evidence:** `views/Collections.tsx`

### FR-SYNC-018 — อัปโหลดไฟล์และ Photo Sync จาก Collection
- **รายละเอียด:** ปุ่ม Upload และเมนู Choose upload method (Upload photos manually / Photo Sync)
- **Actor:** Photographer · **Trigger:** กด Upload / Photo Sync · **Preconditions:** —
- **Input:** ไฟล์ / โฟลเดอร์
- **Processing Rules:** Upload เปิด `<input type=file accept="image/*" multiple>` ที่ **ไม่มี onChange** → ไฟล์ไม่ถูกใช้; Photo Sync Modal ใช้ `showDirectoryPicker` หรือ `webkitdirectory` เก็บเฉพาะชื่อโฟลเดอร์/จำนวนไฟล์; Continue → ไปเมนู Photo Sync (PEEP SYNC) หรือปิด Modal (Set Event); ชื่อโฟลเดอร์ถูกทิ้ง
- **Output:** ไม่มีการอัปโหลด · **Postconditions:** —
- **Error Handling:** ยกเลิก Picker → เงียบ
- **Dependencies:** Upload API, Sync Agent — `GAP-006`, `GAP-010`
- **Priority:** เสนอ: Must
- **Implementation Status:** ยังไม่ได้พัฒนา
- **Source Evidence:** `views/Collections.tsx` (`PhotoSyncModal`)

### FR-SYNC-019 — หน้า Photo Sync (Photo Management)
- **รายละเอียด:** เลือก Event และดูสถานะการอัปโหลดรูป
- **Actor:** Photographer · **Trigger:** เมนู Photo Sync · **Preconditions:** —
- **Input:** Event (Dropdown ทุก Event รวม Draft, ค่าเริ่ม id 1)
- **Processing Rules:** Completed/Processing/Failed คำนวณจากสัดส่วน 0.99/0.007/ส่วนที่เหลือ; Upload Progress = 94% คงที่เมื่อ photos > 0; Workflow 7 ขั้นเป็นภาพนิ่ง (4 ขั้นแรกแสดงเสร็จเสมอ); Recent Upload Sessions 4 แถว Hardcode ไม่กรองตาม Event; ข้อความ "Supports JPEG, PNG, RAW · Max 50GB per batch" ไม่มีการบังคับ
- **Output:** การ์ดและตาราง · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** `GAP-010`
- **Priority:** เสนอ: Must
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน — ปุ่ม View Gallery, Retry Failed, Select Folder, Drop zone, Retry, Details ไม่มี Handler — ดู `ISS-029`
- **Source Evidence:** `views/PhotoManagement.tsx`

---

## EVENT — Set Event: รายการ วงจรสถานะ และ Workspace

### FR-EVENT-001 — แท็บสถานะและจำนวน
- **รายละเอียด:** รายการ Event ต้องแบ่งแท็บ All, Mine, Published, Draft, Private, Trash พร้อมจำนวนต่อแท็บ
- **Actor:** ผู้ดูแล Event · **Trigger:** เปิด Set Event / คลิกแท็บ · **Preconditions:** —
- **Input:** `events` (State เริ่มจาก `setEventsSeed` 100 รายการ)
- **Processing Rules:** Trash แสดงเฉพาะแท็บ Trash; All = ทุกสถานะยกเว้น Trash; Mine = `author === CURRENT_AUTHOR ('Suchadas')`; แท็บอื่นเทียบสถานะตรงตัว; จำนวนคำนวณจากทุก Event (ไม่ขึ้นกับการค้นหา/ตัวกรอง); เปลี่ยนแท็บ → หน้า 1; **ไม่มีแท็บ Pending และ Scheduled**
- **Output:** แท็บพร้อม Badge จำนวน · **Postconditions:** แท็บ/ตัวกรองคงอยู่ขณะเปิด Event แต่หายเมื่อเปลี่ยนเมนูหลัก
- **Error Handling:** —
- **Dependencies:** ผู้ใช้ปัจจุบันจาก Auth — `GAP-001`; `Q-009`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (Mine ผูก Hardcode `ISS-011`)
- **Source Evidence:** `data/setEvents.ts` (`EVENT_TABS`, `matchesTab`, `countByTab`), `views/set-event/SetEventList.tsx`

### FR-EVENT-002 — ค้นหา Event
- **รายละเอียด:** ค้นหาจาก ID, ชื่อ, Author, Category
- **Actor / Trigger:** พิมพ์ในช่องค้นหา · **Preconditions:** —
- **Input:** `query` · **Processing Rules:** Trim + lowercase; Substring บน `"${id} ${name} ${author} ${category}"` (Category เป็นรหัส MONO/JAS/HR/LXL/other); เปลี่ยน → หน้า 1; มีปุ่มล้าง (×)
- **Output:** รายการที่ตรง · **Postconditions:** —
- **Error Handling:** "No events match your filters" + Clear filters
- **Dependencies:** API Search — `GAP-005`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `data/setEvents.ts`, `components/ui/SearchInput.tsx`

### FR-EVENT-003 — กรอง Event
- **รายละเอียด:** ตัวกรอง Ticket type (All/Free/Paid), Status (All/Draft/Pending/Private/Scheduled/Published) และช่วงวันที่
- **Actor / Trigger:** ผู้ใช้เลือกตัวกรอง · **Preconditions:** —
- **Input:** `ticketType`, `status`, `startDate`, `endDate`
- **Processing Rules:** Ticket type/Status เทียบค่าตรงตัว; ช่วงวันที่: แสดง Event ที่ช่วงเวลา **ซ้อนทับ** ช่วงที่เลือก (รวมขอบ เปรียบเทียบ `YYYY-MM-DD`); Start max = End, End min = Start; ปุ่ม Filter by ซ่อน/แสดง (ค่าเริ่มแสดง) โดยไม่ล้างค่า และแสดง Badge จำนวนตัวกรอง; Clear ล้างตัวกรอง+คำค้น (ไม่ล้างแท็บ/Sort) Disable เมื่อไม่มีเงื่อนไข; ในแท็บ Trash การกรอง Status ใดๆ ให้ผลว่าง
- **Output:** รายการที่ตรง · **Postconditions:** —
- **Error Handling:** "No events match your filters"
- **Dependencies:** `GAP-005`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/SetEventList.tsx`, `data/setEvents.ts`, `components/ui/DateRangePicker.tsx`, `components/ui/FilterButton.tsx`

### FR-EVENT-004 — เรียงลำดับ Event
- **รายละเอียด:** คลิกหัวคอลัมน์ Event ID, Event Name, Author, Category, Registrants, Status Event, Event Start Time, Event End Time
- **Actor / Trigger:** คลิกหัวคอลัมน์ · **Preconditions:** —
- **Input:** `sort {key, dir} | null`
- **Processing Rules:** วนรอบ ไม่เรียง → asc → desc → ไม่เรียง; ID/Registrants เทียบตัวเลข อื่นๆ `localeCompare` (Status เรียงตามตัวอักษร, วันที่ตาม ISO String); เปลี่ยน → หน้า 1; ค่าเริ่มต้นคงลำดับใน Array (Event ใหม่อยู่บนสุด, สำเนาอยู่ต่อจากต้นฉบับ)
- **Output:** ตารางเรียงแล้ว · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** `GAP-005`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `data/setEvents.ts`, `components/set-event/EventTable.tsx`

### FR-EVENT-005 — แบ่งหน้าและแสดงผลตาราง Event
- **รายละเอียด:** 10 รายการ/หน้า; แสดง Pagination เสมอ; ตารางกว้างขั้นต่ำ 1120 px เลื่อนแนวนอน; คอลัมน์ Actions ติดขวา
- **Actor / Trigger:** คลิกหน้า · **Preconditions:** —
- **Input:** `page` · **Processing Rules:** หน้าปัจจุบันถูกจำกัดไม่เกินจำนวนหน้า; ชื่อว่าง → "Untitled"; Category ว่าง → "—"; วันที่ `DD-MM-YYYY at HH:mm`; Status Badge: Published เขียว, Pending น้ำเงิน, Scheduled ม่วง, Draft เหลือง, Private เทา, Trash แดง
- **Output:** ตาราง · **Postconditions:** —
- **Error Handling:** Empty state ตามแท็บ: "Trash is empty", "No events yet", "No {status} events yet"
- **Dependencies:** `GAP-005`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (ไม่มี Layout การ์ดสำหรับมือถือ)
- **Source Evidence:** `views/set-event/SetEventList.tsx`, `components/set-event/EventTable.tsx`, `components/ui/StatusBadge.tsx`, `data/setEvents.ts` (`formatEventDateTime`)

### FR-EVENT-006 — ทำซ้ำ Event
- **รายละเอียด:** สร้างสำเนา Event สถานะ Draft
- **Actor / Trigger:** ผู้ดูแล Event กดไอคอน Duplicate · **Preconditions:** สถานะไม่ใช่ Trash
- **Input:** Event ต้นฉบับ
- **Processing Rules:** `structuredClone`; `id = max(id)+1`; `name = "{name || 'Untitled'} (Copy)"`; `author = 'Suchadas'`; `status = 'Draft'`; `registrants = 0`; ล้าง `qrLinks`, `scheduledAt`, `password`; แทรกต่อจากต้นฉบับ; บันทึก Activity "Created"; ถ้าสำเนาถูกตัวกรองซ่อน → สลับแท็บ All และล้างตัวกรอง/คำค้น (ไม่ล้าง Sort), ไปหน้าที่มีสำเนา, เลื่อนไปแถว, ป้าย NEW 4 วินาที
- **Output:** Toast "“{copy name}” created as a draft" · **Postconditions:** Session State
- **Error Handling:** —
- **Dependencies:** Duplicate API — `GAP-005`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/SetEventApp.tsx` (`duplicateEvent`), `views/set-event/SetEventList.tsx`

### FR-EVENT-007 — ย้าย Event ไปถังขยะ
- **รายละเอียด:** เปลี่ยนสถานะเป็น Trash หลังยืนยัน
- **Actor:** ผู้ดูแล Event · **Trigger:** ไอคอน Delete ในตาราง หรือ Move to Trash ใน Status Panel · **Preconditions:** สถานะไม่ใช่ Trash
- **Input:** Event
- **Processing Rules:** Modal "Move event to Trash?" ข้อความ "{name} ({id}) will be moved to Trash. You can restore it later by editing it from the Trash tab."; ยืนยัน → `status='Trash'`, บันทึก Activity "Moved to Trash"; จาก Status Panel → ล้าง Dirty flag, กลับ Event List แล้วเปิด Modal
- **Output:** Event อยู่ในแท็บ Trash · **Postconditions:** Session State
- **Error Handling:** **ไม่มี Toast** (`ISS-012`)
- **Dependencies:** `GAP-005`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/SetEventApp.tsx` (`handleConfirmDelete`, `onMoveToTrash`)

### FR-EVENT-008 — ลบ Event ถาวร
- **รายละเอียด:** ลบ Event ที่อยู่ใน Trash ออกจากระบบ
- **Actor / Trigger:** กด Delete ในแท็บ Trash → Delete Permanently · **Preconditions:** สถานะ Trash
- **Input:** Event
- **Processing Rules:** Modal "Delete event permanently?" "...cannot be undone."; ลบออกจาก Array; **ไม่บันทึก Activity** (มี Action "Deleted" ใน Type แต่ไม่ถูกใช้)
- **Output:** Event หาย · **Postconditions:** —
- **Error Handling:** ไม่มี Toast
- **Dependencies:** `GAP-005`; นโยบายการเก็บข้อมูลถาวร/Audit — `Q-015`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/SetEventApp.tsx`

### FR-EVENT-009 — การนำทางใน Event Workspace
- **รายละเอียด:** เมื่อเปิด Event ต้องแสดง Workspace Sidebar (Rail เมนู Service + Panel 6 Section)
- **Actor / Trigger:** คลิกชื่อ Event (Overview) หรือ Edit (Event Detail) · **Preconditions:** Event มีอยู่
- **Input:** `view = {kind:'event', id, section}`
- **Processing Rules:** Section: Overview, Event Detail, Collection, QR Code / Scanner, User management, Activity logs; Back และ Breadcrumb "Event List" กลับรายการ; Rail ปุ่ม Service ไปเมนูหลัก; ทุกการนำทางผ่าน `guarded()`; Desktop ย่อ Panel ได้, มือถือเป็น Drawer; Scroll ไปบนสุดเมื่อเปลี่ยน View (ยกเว้น highlightPublish)
- **Output:** Section ที่เลือก · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** —
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `components/set-event/EventWorkspaceSidebar.tsx`, `views/set-event/workspace/SectionShell.tsx`, `data/navigation.tsx` (`eventWorkspaceSections`)

### FR-EVENT-010 — Overview ของ Event
- **รายละเอียด:** สรุปการตั้งค่า Event แบบอ่านอย่างเดียว
- **Actor / Trigger:** เปิด Section Overview · **Preconditions:** —
- **Input:** `SetEvent`
- **Processing Rules:** การ์ด: Registrants (ค่า Seed), Registration forms = `registrationForms.length + (eventForm.enabled ? 1 : 0)`, QR links (คลิกไป Section QR), Collection files; รายละเอียด 15 แถว; Capacity: มี max → "{n} people", มี registrationType → "Unlimited", อื่นๆ "—"; Automated messages: "{n} active" หรือ "Off"; ช่วงวันที่วันเดียวแสดงเฉพาะเวลาสิ้นสุด; ปุ่ม Edit event → Event Detail; CopyIdButton คัดลอก ID (ล้มเหลวเงียบ)
- **Output:** หน้า Overview · **Postconditions:** —
- **Error Handling:** ค่าว่างแสดง "—"
- **Dependencies:** Registrants จริงจาก Registration — `GAP-003`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend — ดู `ISS-022`
- **Source Evidence:** `views/set-event/workspace/EventOverview.tsx`, `components/set-event/CopyIdButton.tsx`

### FR-EVENT-011 — เชื่อม/ยกเลิก Collection ของ Event
- **รายละเอียด:** เลือก Collection หนึ่งรายการให้ Event
- **Actor / Trigger:** Link collection / Change collection / Unlink · **Preconditions:** —
- **Input:** `collectionId`
- **Processing Rules:** Picker "Select Collection" ค้นหา (ไม่สนตัวพิมพ์บน label+description), Confirm Disable จนกว่าจะเลือก; รายการจาก `mockCollections` (6) เท่านั้น; บันทึกทันทีผ่าน `updateEvent` + Activity "Edited" ฟิลด์ Collection; Unlink ไม่มีการยืนยัน; ไม่อัปเดต `linkedEvent` ของ Collection
- **Output:** Toast "“{name}” linked to “{event}”" / "Collection unlinked from “{event}”" · **Postconditions:** Session State
- **Error Handling:** "No results"; Empty "No collection linked"
- **Dependencies:** `GAP-007`; ความสัมพันธ์ 1 Event : 1 Collection ขัดกับ `Design.md` §18 ("An Event can have multiple Collections") — `Q-016`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (`ISS-013`)
- **Source Evidence:** `views/set-event/workspace/EventCollection.tsx`, `components/set-event/OptionPickerModal.tsx`

### FR-EVENT-012 — สร้าง QR Link
- **รายละเอียด:** สร้างลิงก์พร้อม QR Code สำหรับ Event
- **Actor / Trigger:** New link → Create link · **Preconditions:** —
- **Input:** `name`, `url` (ค่าเริ่ม `https://peepshare.com/e/{eventId}/`)
- **Processing Rules:** ชื่อบังคับ (Trim) และไม่ซ้ำแบบไม่สนตัวพิมพ์; URL ต้อง Parse ได้และเป็น `https:` หรือ `http:`; Error แสดงหลังกดครั้งแรก; Enter ส่งฟอร์ม; QR Preview เมื่อ URL ถูกต้อง; บันทึก `id = qr-{eventId}-{Date.now()}`, `createdAt` = เวลาท้องถิ่น, แทรกบนสุด
- **Output:** Toast "Link “{name}” created" · **Postconditions:** Session State; **ไม่บันทึก Activity**
- **Error Handling:** "Enter a link name." / "A link with this name already exists." / "Enter a full URL starting with https://" (แต่ยอมรับ http — `ISS-021`)
- **Dependencies:** QR Link API และ Endpoint ปลายทาง — `GAP-011`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `components/set-event/NewLinkModal.tsx`, `views/set-event/workspace/EventQrLinks.tsx`

### FR-EVENT-013 — ใช้งาน QR Link (เปิด คัดลอก ดาวน์โหลด ลบ)
- **รายละเอียด:** ตาราง Link name, URL, QR Code, Date added, Actions
- **Actor / Trigger:** ผู้ใช้กดปุ่มในแถว · **Preconditions:** มีลิงก์
- **Input:** `QrLink`
- **Processing Rules:** URL เปิดแท็บใหม่; Copy ใช้ Clipboard + Fallback `execCommand` แสดง Copied 2 วินาที; QR สร้างด้วย `qrcode` (#1A1A1A บนขาว); Download PNG 1024 px ชื่อ `slugify("{eventName}-{linkName}")-qr.png` (อักขระที่ไม่ใช่ a–z0–9 เป็น "-" — **ชื่อภาษาไทยจะหาย**); Delete → ยืนยัน "Delete link?" → Toast "Link “{name}” deleted"; ไม่มี Edit/Search/Sort/Pagination; `qrExpiresAt` ไม่ถูกใช้ที่หน้านี้
- **Output:** ตามการกระทำ · **Postconditions:** Session State
- **Error Handling:** —
- **Dependencies:** `GAP-011`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend — ดู `ISS-027`
- **Source Evidence:** `views/set-event/workspace/EventQrLinks.tsx`, `components/set-event/qr.tsx`

### FR-EVENT-014 — บันทึก Activity เมื่อ Event เปลี่ยนแปลง
- **รายละเอียด:** ทุกการบันทึกต้องสร้างแถว Activity จาก Diff ของฟิลด์ที่ติดตาม
- **Actor:** ระบบ · **Trigger:** Save ฟอร์ม, `updateEvent` (Collection/QR), Duplicate, Move to Trash · **Preconditions:** —
- **Input:** `before`, `after`
- **Processing Rules:** ไม่มี before → 1 แถว "Created"; สถานะเปลี่ยน → "Moved to Trash" (เป็น Trash) หรือ "Status changed"; จากนั้น 1 แถว "Edited" ต่อฟิลด์ใน `TRACKED` (34 ฟิลด์: Event name, Event type, Organizer, Description (ตัด HTML), Banner ×2 (ชื่อไฟล์), Password ("Protected"), Scheduled publish, Registration opens/closes, Event start/end, QR code expires, Event format, Venue name, Address, Google Maps link, Online platform, Online link, Registration type, Allow join, Max participants, Registration fee, Payment methods, Collection, Event form, Form fields, Automated messages, PEEP OA ID, Community ID, Broadcast automations, Survey form, Survey questions, Survey sent at); User = 'Suchadas'; เวลา = เวลาท้องถิ่น; **ไม่ติดตาม qrLinks, latitude, longitude, ลบถาวร**
- **Output:** แถว Activity ใน State · **Postconditions:** Session State
- **Error Handling:** —
- **Dependencies:** Audit Log API — `GAP-012`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend (`ISS-014`)
- **Source Evidence:** `data/eventActivity.ts` (`diffActivity`, `TRACKED`), `views/set-event/SetEventApp.tsx` (`log`)

### FR-EVENT-015 — ดู Activity Log ของ Event
- **รายละเอียด:** ตาราง Activity ของ Event พร้อมค้นหาและกรอง
- **Actor / Trigger:** เปิด Section Activity logs · **Preconditions:** —
- **Input:** แถว Session + `sampleActivity(event)` (เฉพาะ Event ที่ไม่ได้สร้างใน Session นี้)
- **Processing Rules:** เรียงล่าสุดก่อน; "{shown} of {total} entries"; ค้นหา Trim ไม่สนตัวพิมพ์บน user/section/field/from/to (ค่าภาษาอังกฤษดิบ); กรอง Action (Created, Edited, Status changed, Moved to Trash, Deleted) และ User; ไม่มี Pagination; ค่าว่าง → "Not set"; ค่าเก่าขีดฆ่า
- **Output:** ตาราง (มือถือเป็นการ์ด) · **Postconditions:** —
- **Error Handling:** "No activity matches your filters" + Clear / "No activity yet"
- **Dependencies:** `GAP-012`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend (ประวัติตัวอย่างเป็น Mock)
- **Source Evidence:** `views/set-event/workspace/EventActivityLog.tsx`, `data/eventActivity.ts` (`sampleActivity`)

### FR-EVENT-016 — Activity Log ระดับระบบ
- **รายละเอียด:** เมนู SYSTEM → Activity Log
- **Actor:** ผู้ดูแลระบบ · **Trigger:** คลิกเมนู · **Preconditions:** —
- **Input:** `activityLog` (8 รายการ Mock ของ Event Dashboard)
- **Processing Rules:** ค้นหาไม่สนตัวพิมพ์บน action/details/user (ไม่ Trim); กรอง Event (7 Event จาก `mock.ts`) แบบตรงชื่อ; กรอง User ด้วย `includes` แบบ Case-sensitive; ไม่มี Pagination/Sort/Export
- **Output:** "{n} entries" + ตาราง/Timeline · **Postconditions:** —
- **Error Handling:** "No activity found."
- **Dependencies:** `GAP-012`
- **Priority:** เสนอ: Should
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน (`ISS-015`)
- **Source Evidence:** `views/ActivityLog.tsx`

### FR-EVENT-017 — ป้องกันการออกจากหน้าที่ยังไม่บันทึก (Set Event)
- **รายละเอียด:** แสดง "Discard changes?" ก่อนนำทางออกจากฟอร์มที่มีการแก้ไข
- **Actor:** ผู้ใช้ · **Trigger:** Sidebar, Rail, Section, Back, Breadcrumb · **Preconditions:** `formDirty = true`
- **Input:** การนำทางที่รอ (`pendingNav`)
- **Processing Rules:** `guarded(go)`; Discard → ล้าง flag และนำทาง; **ไม่ครอบคลุม** Header Switch Service / Log Out, `FormLibrary.onOpenEvent`, `beforeunload`
- **Output:** Modal · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** —
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน (`ISS-020`)
- **Source Evidence:** `views/set-event/SetEventApp.tsx`

### FR-EVENT-018 — Toast แจ้งผลการทำงาน
- **รายละเอียด:** แสดง Toast ด้านล่างกลางจอ 3 วินาที (ไอคอนสำเร็จสีเขียวเสมอ)
- **Actor:** ระบบ · **Trigger:** Save, Duplicate, Link/Unlink, QR create/delete, Template actions · **Preconditions:** —
- **Input:** ข้อความ · **Processing Rules:** Toast เดียว (ข้อความใหม่แทนที่); ไม่มี Toast ประเภท Error/Warning
- **Output:** Toast · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** —
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/SetEventApp.tsx`

### FR-EVENT-019 — User management ของ Event
- **รายละเอียด:** Section User management ใช้ `MembersAccess` (ดู FR-SYNC-004–007)
- **Actor / Trigger:** เปิด Section · **Preconditions:** —
- **Input:** ไม่มี Props (ไม่รับ eventId) · **Processing Rules:** Comment ในโค้ด "mock members, not yet per event"
- **Output:** ตารางสมาชิกชุดเดียวกันทุก Event · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** `GAP-009`
- **Priority:** เสนอ: Must
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน
- **Source Evidence:** `views/set-event/workspace/EventUsers.tsx`

### FR-EVENT-020 — System Settings
- **รายละเอียด:** หน้าตั้งค่าระบบ (General, Registration, Survey, Photos, Storage, Notifications)
- **Actor:** — · **Trigger:** — · **Preconditions:** —
- **Input:** — · **Processing Rules:** เมนูถูก Comment ออก ("hidden for now") ไม่มีทางเข้าถึง; หากเปิด: Toggle เป็น Local State, Save Changes/Reset Defaults ไม่มี Handler
- **Output:** — · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** `Q-017`
- **Priority:** TBD
- **Implementation Status:** ยังไม่ได้พัฒนา (เข้าถึงไม่ได้)
- **Source Evidence:** `data/navigation.tsx`, `views/SystemSettings.tsx`, `views/set-event/SetEventApp.tsx`

---

## EFORM — Set Event: ฟอร์มสร้าง/แก้ไข Event

### FR-EFORM-001 — ขั้นตอน (Steps) และ Stepper
- **รายละเอียด:** ฟอร์มแบ่ง 4 Step: (1) Event Info = Information + Schedule, (2) Venue & Registration = Location + Registration, (3) Attendee Experience = Collection + Event Form + Survey Form, (4) Communication
- **Actor:** ผู้ดูแล Event · **Trigger:** Next / Back / คลิก Step · **Preconditions:** เปิดฟอร์ม
- **Input:** `step`, `reached`
- **Processing Rules:** Create: `reached` เริ่ม 0 ปลดล็อกทีละ Step, Next Validate ด้วยกฎ Complete เฉพาะ Section ของ Step; Edit: `reached` = Step สุดท้าย, Next ไม่ Validate, แสดงสถานะราย Section (done/todo/error/ไม่ได้ตั้งค่า); คลิก Step ที่ปลดล็อกแล้วไม่ Validate; Back ไม่ Validate; มือถือแสดง "Step {n} of {total}"
- **Output:** Section ของ Step · **Postconditions:** —
- **Error Handling:** Next ไม่ผ่าน → ตั้ง Error, เปิดโหมด Re-validate, Scroll ไป Error แรก
- **Dependencies:** —
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/EventFormPage.tsx` (`STEPS`, `next`, `goToStep`), `components/set-event/form/FormStepper.tsx`, `formModel.ts` (`sectionStatuses`)

### FR-EFORM-002 — ปุ่มใน Sticky Action Bar
- **รายละเอียด:** ปุ่มเปลี่ยนตามโหมดและ Step
- **Actor / Trigger:** ผู้ใช้ · **Preconditions:** —
- **Input:** `isEdit`, `savedStatus`, `step`
- **Processing Rules:** `reviewFlow = !isEdit || savedStatus === 'Draft'`; ปุ่ม Tertiary: Step 1 = Cancel, อื่นๆ = Back; Save action: reviewFlow → "Save Draft" (form.status=Draft) หรือ "Save"; ไม่ใช่ reviewFlow → "Save" (Pending) หรือ "Save Changes"; Final action: reviewFlow → "Create Event" (Create) / "Submit to Review" (Edit Draft); Primary: Step สุดท้าย = Final action อื่นๆ = Next; ซ้ายแสดง "{n} fields need attention" (คลิกไป Error) หรือ "Required fields are marked with an asterisk (*)"
- **Output:** ปุ่ม · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** —
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/EventFormPage.tsx`, `components/set-event/form/StickyActionBar.tsx`

### FR-EFORM-003 — กำหนดสถานะผลลัพธ์เมื่อบันทึก
- **รายละเอียด:** สถานะที่บันทึกขึ้นกับ Action
- **Actor:** ระบบ · **Trigger:** `submit(action)` · **Preconditions:** —
- **Input:** `action` (`save`, `review`, `publish`; `draft` มีใน Type แต่ไม่มีปุ่มเรียก), `form.status`
- **Processing Rules:** review → Pending; publish → Scheduled หรือ Private ถ้า form.status เป็นค่านั้น มิฉะนั้น Published; save → form.status
- **Output:** สถานะ · **Postconditions:** หลังบันทึก: review → เปิด Event Detail + ไฮไลต์ Publish 3 วินาที; อื่นๆ → กลับรายการ; Toast ตามสถานะ (Draft "saved as draft", Pending "submitted for review — publish when ready", Published "published", Private "published privately", Scheduled "scheduled for {date}", save non-draft "updated")
- **Error Handling:** —
- **Dependencies:** Publish API — `GAP-005`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/EventFormPage.tsx` (`resultingStatus`), `views/set-event/SetEventApp.tsx` (`handleSave`)

### FR-EFORM-004 — Validation สองระดับ
- **รายละเอียด:** ใช้ `validate(form, complete)` — Draft ตรวจเฉพาะรูปแบบ, สถานะอื่นตรวจครบทุกฟิลด์บังคับ
- **Actor:** ระบบ · **Trigger:** Save/Create/Submit/Publish/Next(Create) · **Preconditions:** —
- **Input:** `FormState`
- **Processing Rules:** `complete = status !== 'Draft'`; กฎทั้งหมดดู `BR-EFORM-001` ถึง `BR-EFORM-004` ใน [05](05-business-rules-and-data.md); หลังพยายามบันทึกที่ไม่ผ่าน Validate ใหม่ทุกครั้งที่แก้ไข; ไม่ Validate on blur
- **Output:** `errors` · **Postconditions:** —
- **Error Handling:** ข้อความใต้ฟิลด์, ขอบแดง, จุดสถานะแดงที่ Step/Section
- **Dependencies:** Backend ต้อง Validate ซ้ำ — `GAP-005`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/event-form/formModel.ts` (`validate`, `validateFields`)

### FR-EFORM-005 — นำทางไปยังข้อผิดพลาด
- **รายละเอียด:** เมื่อบันทึกไม่ผ่าน ระบบพาไปยังจุดที่ผิด
- **Actor:** ระบบ · **Trigger:** submit ไม่ผ่าน · **Preconditions:** —
- **Input:** `errors`
- **Processing Rules:** Error `schedule`/`password` → เปิด Status Panel; อื่นๆ → ไป Step แรกที่มี Error แล้ว Scroll + Focus `[aria-invalid="true"]` แรก (หน่วง 50 ms ถ้าเปลี่ยน Step); Footer นับเฉพาะ Error ของ Step ปัจจุบัน
- **Output:** Focus ที่ฟิลด์ · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** —
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend (กรณี Password ผิดตอนกด Next ใน Create อาจไม่เปิด Panel — Unverified)
- **Source Evidence:** `views/set-event/EventFormPage.tsx`

### FR-EFORM-006 — Status & Visibility Panel
- **รายละเอียด:** เลือกสถานะ ตั้งเวลาเผยแพร่ ตั้งรหัสผ่าน และย้ายไปถังขยะ
- **Actor:** ผู้ดูแล Event · **Trigger:** คลิก Status Badge ที่หัวฟอร์ม · **Preconditions:** —
- **Input:** `status`, `scheduledDate/Time`, `passwordEnabled`, `password`
- **Processing Rules:** ตัวเลือก Draft, Pending, Private, Scheduled, Published (ไม่มี Trash); Scheduled และ Published ล็อก ("Available after Submit to Review.") เว้นแต่ `canPublish` หรือสถานะที่บันทึกเป็น Published; Scheduled แสดงวันเวลา; Password protected แสดงช่องรหัส + แสดง/ซ่อน; Move to Trash แสดงเฉพาะ Edit ที่ไม่ใช่ Trash; ปิดด้วย Escape/คลิกพื้นหลัง/X
- **Output:** ค่าในฟอร์ม (บันทึกเมื่อกด Save/Publish) · **Postconditions:** —
- **Error Handling:** "Choose the date and time to publish.", "Choose a date and time in the future.", "Use at least 4 characters."
- **Dependencies:** รหัสผ่านต้อง Hash ที่ Server (Comment: "Mock only — hash server-side in production.") — `GAP-005`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (Private/Pending ไม่ถูกล็อกใน Create — `Q-010`) — ดู `ISS-024`
- **Source Evidence:** `components/set-event/StatusVisibilityPanel.tsx`, `views/set-event/EventFormPage.tsx`

### FR-EFORM-007 — ปุ่ม Publish / Schedule
- **รายละเอียด:** ปุ่ม Publish ที่หัวฟอร์มในโหมด Edit
- **Actor / Trigger:** กด Publish/Schedule · **Preconditions:** `isEdit` และสถานะที่บันทึกไม่ใช่ Published/Trash
- **Input:** —
- **Processing Rules:** Enable เมื่อสถานะที่บันทึกเป็น Pending, Private หรือ Scheduled; Disable พร้อม Tooltip "Submit to Review before publishing"; ป้าย "Schedule" เมื่อ form.status = Scheduled มิฉะนั้น "Publish"; เรียก `submit('publish')`
- **Output:** สถานะใหม่ · **Postconditions:** กลับรายการ + Toast
- **Error Handling:** ตาม FR-EFORM-004/005
- **Dependencies:** Approval workflow — `Q-010`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/EventFormPage.tsx` (`canPublish`, `showPublish`)

### FR-EFORM-008 — Section Event Information
- **รายละเอียด:** ฟิลด์ Event Name*, Event Type*, Organizer* (`category`), Description (Rich Text), Banner in Event Detail (1200×1200, 1:1), Banner in Card Event (200×100, 2:1)
- **Actor / Trigger:** ผู้ใช้กรอก · **Preconditions:** —
- **Input:** `name`, `eventType` (13 ค่า: Concert, Festival, Conference, Seminar, Workshop, Sports, Competition, Exhibition, Casting / Audition, Community / Meetup, Campaign, Corporate Event, Other), `category` (MONO, JAS, HR, LXL, other), `description`, `banner`, `cardBanner`
- **Processing Rules:** ชื่อ Trim เมื่อบันทึก; Label ฟิลด์ `category` แสดงเป็น "Organizer"
- **Output:** ค่าใน FormState · **Postconditions:** —
- **Error Handling:** "Enter an event name.", "Select the event type.", "Select an organizer."
- **Dependencies:** Master Data ของ Event Type / Organizer — `Q-018`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/event-form/InformationSection.tsx`, `data/setEvents.ts` (`EVENT_TYPES`, `EVENT_CATEGORIES`)

### FR-EFORM-009 — Section Schedule
- **รายละเอียด:** Event Date & Time* (เริ่ม/สิ้นสุด), Registration Period (เปิด/ปิด), QR Code Expiry
- **Actor / Trigger:** ผู้ใช้กรอก · **Preconditions:** —
- **Input:** `eventStartDate/Time`, `eventEndDate/Time`, `regOpenDate/Time`, `regCloseDate/Time`, `qrDate/Time`
- **Processing Rules:** เลือกวันเริ่มเมื่อวันสิ้นสุดว่าง → เติมวันสิ้นสุด = วันเริ่ม (ครั้งเดียว); Date Picker: วันเริ่ม max = วันสิ้นสุด, วันสิ้นสุด min = วันเริ่ม; Registration max = วันสิ้นสุด Event; บันทึกเป็น `YYYY-MM-DDTHH:mm` เฉพาะเมื่อมีทั้งวันและเวลา (มิฉะนั้นค่าว่าง); Registration Period บันทึกทั้งฟิลด์ใหม่และ Legacy (`registrationStart/End`)
- **Output:** เวลาใน Event · **Postconditions:** —
- **Error Handling:** ดู `BR-EFORM-001`
- **Dependencies:** Timezone — `Q-019`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (`ISS-016`)
- **Source Evidence:** `views/set-event/event-form/ScheduleSection.tsx`, `formModel.ts` (`joinDateTime`, `fromForm`)

### FR-EFORM-010 — Section Location
- **รายละเอียด:** Event Format* (Offline/Online/Hybrid) และฟิลด์ตามรูปแบบ
- **Actor / Trigger:** ผู้ใช้เลือก/กรอก · **Preconditions:** —
- **Input:** `eventFormat`, `venueName`, `address`, `mapLink`, `latitude`, `longitude`, `onlinePlatform` (Zoom, Google Meet, Microsoft Teams, YouTube Live, Facebook Live, Other), `onlineUrl`, `accessInstructions`
- **Processing Rules:** Physical (Offline/Hybrid): Venue Name*; Online (Online/Hybrid): Meeting / Event URL*; Hybrid แสดงหัวข้อแยก; ยังไม่เลือก → ข้อความแนะนำ; Event เก่าที่มีพิกัด/mapLink → ค่าเริ่ม Offline; เมื่อบันทึก ล้างฟิลด์ของรูปแบบที่ไม่ได้ใช้และ Trim; ปุ่มเปิด Map Link ในแท็บใหม่ (Disable เมื่อ URL ไม่ถูกต้อง); Map Preview เป็น Google Maps iframe เมื่อพิกัดถูกต้อง
- **Output:** ข้อมูลสถานที่ · **Postconditions:** —
- **Error Handling:** "Select the event format.", "Enter the venue name.", "Enter the link attendees use to join.", URL/Lat/Lng ดู `BR-EFORM-001`
- **Dependencies:** Google Maps Embed (ภายนอก) — `GAP-013`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/event-form/LocationSection.tsx`, `formModel.ts`

### FR-EFORM-011 — ดึงพิกัดจาก Google Maps Link
- **รายละเอียด:** เติม Latitude/Longitude อัตโนมัติจากลิงก์
- **Actor:** ระบบ · **Trigger:** แก้ไขช่อง Google Maps Link · **Preconditions:** Format เป็น Offline/Hybrid
- **Input:** `mapLink`
- **Processing Rules:** รองรับรูปแบบ `!3dLAT!4dLNG`, `@LAT,LNG`, และ `?q=` / `query=` / `ll=` / `destination=LAT,LNG`
- **Output:** `latitude`, `longitude` · **Postconditions:** —
- **Error Handling:** ไม่พบพิกัด → ไม่เปลี่ยนค่า
- **Dependencies:** — (ลิงก์ย่อ เช่น `maps.app.goo.gl` ไม่มีพิกัดใน URL — Unverified)
- **Priority:** เสนอ: Could
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `formModel.ts` (`coordsFromMapLink`)

### FR-EFORM-012 — Section Registration
- **รายละเอียด:** Registration Type* (Free/Paid), Registration Fee (THB)*, Payment Methods*, Capacity (Unlimited/Limited + Maximum Participants*), Allow join
- **Actor / Trigger:** ผู้ใช้เลือก/กรอก · **Preconditions:** —
- **Input:** `registrationType`, `ticketPrice`, `paymentMethods` (PromptPay, Credit / Debit Card, Bank Transfer; ค่าเริ่ม PromptPay), `capacityLimited`, `maxParticipants`, `allowJoin` (ค่าเริ่ม true)
- **Processing Rules:** ฟิลด์ Paid แสดงเมื่อ Paid; Capacity แสดงเมื่อเลือกประเภทแล้ว; Max Participants ตัดอักขระที่ไม่ใช่ตัวเลข; Allow join ป้าย "Active join"/"Closed" แสดงเสมอ; บันทึก: `ticketType` = Paid/Free (สำหรับตัวกรองรายการ), ticketPrice/paymentMethods เฉพาะ Paid, maxParticipants เฉพาะ Limited
- **Output:** การตั้งค่าลงทะเบียน · **Postconditions:** —
- **Error Handling:** ดู `BR-EFORM-001/002`
- **Dependencies:** Payment Gateway — `GAP-014`; ไม่มี Ticket Tier, Approval, Waitlist (`Q-020`)
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/event-form/RegistrationSection.tsx`

### FR-EFORM-013 — เลือก Collection ในฟอร์ม
- **รายละเอียด:** Section Collection (ไม่บังคับ) เลือก Collection หนึ่งรายการ
- **Actor / Trigger:** Select Collection / Change / Remove · **Preconditions:** —
- **Input:** `collectionId`
- **Processing Rules:** รายการจาก `mockCollections`; การ์ดแสดง "{count} files · {storageGb} GB"
- **Output:** `collectionId` · **Postconditions:** บันทึกพร้อมฟอร์ม
- **Error Handling:** Empty "No collection selected"
- **Dependencies:** `GAP-007`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend (Mock)
- **Source Evidence:** `components/set-event/form/CollectionSelector.tsx`

### FR-EFORM-014 — Form Builder (Event Form)
- **รายละเอียด:** "Require Event Form?" Yes/No และสร้างฟิลด์ฟอร์มลงทะเบียน
- **Actor / Trigger:** ผู้ใช้ · **Preconditions:** —
- **Input:** `requireForm`, `formName`, `formDescription`, `formFields[]`, `formTemplateId`
- **Processing Rules:** ประเภท: short-text, long-text, single-choice, multiple-choice, dropdown, rating (5 ดาว), heading; ฟิลด์ใหม่ Required ยกเว้น heading, Focus ที่ Label; เปลี่ยนเป็นประเภทตัวเลือกเมื่อไม่มีตัวเลือก → เติม "Option 1", "Option 2"; ตัวเลือก 1 บรรทัด 1 ค่า; เลื่อนขึ้น/ลง (ไม่มี Drag); ลบทันที; นับ "{n} fields · {n} sections"; Empty state แสดง Chip Template (เติมชื่อ/คำอธิบายเฉพาะเมื่อว่าง); เมื่อบันทึก: Trim, heading ไม่ Required, ตัดตัวเลือกว่าง, ประเภทอื่นตัวเลือก = []; เก็บแม้ปิด (`enabled:false`)
- **Output:** `details.eventForm` · **Postconditions:** —
- **Error Handling:** "Enter a form name.", "Add at least one field.", "Enter a label for this field.", "Enter a section title.", "Add at least one option."
- **Dependencies:** หน้าลงทะเบียนฝั่งผู้เข้าร่วม — `GAP-003`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/event-form/AttendeeFormSection.tsx`, `components/set-event/form/EventFormBuilder.tsx`, `formModel.ts` (`formConfig`)

### FR-EFORM-015 — Survey Form ในฟอร์ม Event
- **รายละเอียด:** "Send Survey Form?" Yes/No, Send Survey (วันเวลา)*, Survey Name*, Survey Description, Survey Questions
- **Actor / Trigger:** ผู้ใช้ · **Preconditions:** —
- **Input:** `requireSurvey`, `surveyDate/Time`, `surveyName`, `surveyFields`
- **Processing Rules:** Builder เดียวกับ FR-EFORM-014; วันส่ง min = วันเริ่ม Event; `surveySendTime` บันทึกเมื่อเปิดเท่านั้น
- **Output:** `details.surveyForm`, `details.surveySendTime` · **Postconditions:** —
- **Error Handling:** "Enter a survey name.", "Add at least one question.", "Set when the survey is sent."
- **Dependencies:** การส่งแบบสำรวจจริง — `GAP-015`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend (ไม่มีการส่งจริง)
- **Source Evidence:** `views/set-event/event-form/SurveyFormSection.tsx`

### FR-EFORM-016 — ใช้ Template ในฟอร์ม
- **รายละเอียด:** Use Template / Change Template จากคลัง Template ตามประเภท
- **Actor / Trigger:** ผู้ใช้กดปุ่ม · **Preconditions:** มี Template (ไม่เช่นนั้นปุ่ม Disable)
- **Input:** Template ที่เลือก
- **Processing Rules:** มีฟิลด์อยู่แล้ว → ยืนยัน "Replace current form?"; แทนที่ชื่อ คำอธิบาย ฟิลด์ (Clone ID ใหม่) และตั้ง `templateId`; ไม่แก้ Template ต้นฉบับ
- **Output:** ฟอร์มที่เติมแล้ว · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** FR-TPL-*
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `components/set-event/form/TemplatePicker.tsx`, `data/formTemplates.ts` (`cloneFields`)

### FR-EFORM-017 — อัปโหลดรูป Banner
- **รายละเอียด:** Dropzone รับ JPEG/PNG ไม่เกิน 50 MB
- **Actor / Trigger:** ลากวาง / Browse File · **Preconditions:** —
- **Input:** ไฟล์ (ใช้ไฟล์แรกเท่านั้น)
- **Processing Rules:** ตรวจ MIME `image/jpeg`, `image/png` และขนาด ≤ 50 MB; ไม่ตรวจขนาดภาพ (Pixel); ในฟอร์ม Event ไม่มี `onUpload` → เก็บเป็น `URL.createObjectURL` (ไม่อัปโหลด, ไม่ Revoke); แสดงตัวอย่าง ชื่อไฟล์ Replace/Remove
- **Output:** `{url, name}` · **Postconditions:** URL ใช้ได้เฉพาะ Session
- **Error Handling:** "Only JPEG and PNG images are supported.", "The file is larger than 50MB."
- **Dependencies:** File Upload API — `GAP-006`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน (ไม่มีการอัปโหลดจริง)
- **Source Evidence:** `components/set-event/BannerDropzone.tsx`

### FR-EFORM-018 — Rich Text Editor สำหรับ Description
- **รายละเอียด:** Editor แบบ `contentEditable` + `document.execCommand`
- **Actor / Trigger:** ผู้ใช้พิมพ์/ใช้ Toolbar · **Preconditions:** —
- **Input:** HTML
- **Processing Rules:** Bold/Italic/Underline/Strikethrough, สีตัวอักษร 8 สี, Highlight 6 แบบ, Emoji 20 ตัว, Paragraph/Heading 1/Heading 2/Quote, จัดแนว 4 แบบ, List, Indent, รูป (`image/*`), ลิงก์ (เติม `https://`, อนุญาต http/https/mailto), ไฟล์แนบ, วิดีโอ, Undo/Redo; สื่อเป็น Object URL; ไม่จำกัดความยาว; **HTML ไม่ถูก Sanitize**
- **Output:** `description` (HTML) · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** Media Upload — `GAP-006`; Sanitization ฝั่ง Server — `GAP-016`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (`execCommand` เป็น API ที่ถูก Deprecate) — ดู `ISS-023`
- **Source Evidence:** `components/set-event/RichTextEditor.tsx`

### FR-EFORM-019 — Preview Event
- **รายละเอียด:** Preview ใน Modal และในแท็บใหม่
- **Actor / Trigger:** ไอคอน Preview / Open preview in new tab · **Preconditions:** —
- **Input:** name, category, status, banner, description, start, end
- **Processing Rules:** Modal: Banner หรือ Placeholder, ชื่อหรือ "Untitled", ช่วงเวลาหรือ "Date not set"; แท็บใหม่: HTML Blob มีแถบ "Preview — ... Not visible to attendees yet." Escape ข้อความ แต่ Description แทรกตรง, Revoke URL หลัง 60 วินาที; ปุ่ม Full screen ใช้ Fullscreen API
- **Output:** หน้าตัวอย่าง · **Postconditions:** —
- **Error Handling:** "No description yet."
- **Dependencies:** หน้า Event ฝั่งผู้ใช้จริง — `Q-021`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend — ดู `ISS-023`
- **Source Evidence:** `components/set-event/EventPreviewModal.tsx`

### FR-EFORM-020 — ตรวจจับการแก้ไขที่ยังไม่บันทึก
- **รายละเอียด:** ฟอร์มรายงานสถานะ Dirty และยืนยันก่อนทิ้ง
- **Actor:** ระบบ · **Trigger:** Cancel (Step 1) หรือการนำทางที่ถูก guard · **Preconditions:** —
- **Input:** `form`, `initial`
- **Processing Rules:** `isDirty = JSON.stringify(form) !== JSON.stringify(initial)`; ส่งขึ้นไปยัง SetEventApp; Modal "Discard changes?" / "Your unsaved changes to this event will be lost."; Back ระหว่าง Step ไม่เตือน
- **Output:** Modal · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** FR-EVENT-017
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/EventFormPage.tsx`

### FR-EFORM-021 — แปลงข้อมูลฟอร์มเป็น Event
- **รายละเอียด:** `fromForm` แปลง FormState เป็น `SetEvent`
- **Actor:** ระบบ · **Trigger:** บันทึกสำเร็จ · **Preconditions:** ผ่าน Validation
- **Input:** FormState, Event เดิม, id, status
- **Processing Rules:** id = เดิมหรือ `max+1`; author = เดิมหรือ 'Suchadas'; registrants = เดิมหรือ 0; คงฟิลด์ใน `details` ที่ฟอร์มไม่แก้ (เช่น `qrLinks`); `scheduledAt` เฉพาะ Scheduled; `password` เฉพาะเมื่อเปิด (Plain text); `communication` เก็บแม้ปิด, OA ID เติม `#`; Event ใหม่แทรกบนสุดของรายการ
- **Output:** `SetEvent` · **Postconditions:** Session State
- **Error Handling:** —
- **Dependencies:** Event API Contract — `GAP-005`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/event-form/formModel.ts` (`toForm`, `fromForm`)

---

## COMM — Communication / Broadcast Automation

### FR-COMM-001 — เปิดใช้ Communication และระบุ OA
- **รายละเอียด:** Toggle "Enable automated messages", PEEP OA ID*, Community ID
- **Actor / Trigger:** ผู้ใช้ · **Preconditions:** Step 4
- **Input:** `communicationEnabled` (ค่าเริ่ม false), `peepOaId`, `communityId`
- **Processing Rules:** ปิด → Empty state + ปุ่ม Enable Communication; Blur → เติม `#` นำหน้า; รูปแบบ `/^#?[a-z0-9][a-z0-9-]*$/`; Community ID ใช้ Hint เดียวกับ OA ID (น่าจะคัดลอกผิด)
- **Output:** ค่าใน `details.communication` · **Postconditions:** —
- **Error Handling:** "Enter the PEEP OA ID that sends these messages.", "Use lowercase letters, numbers and hyphens, e.g. #oa-mono-max-official-account."
- **Dependencies:** PEEP OA API ตรวจสอบ ID — `GAP-015`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend — ดู `ISS-026`
- **Source Evidence:** `views/set-event/event-form/CommunicationSection.tsx`, `data/automations.ts`

### FR-COMM-002 — Automation เริ่มต้นสำหรับ Event ใหม่
- **รายละเอียด:** Event ใหม่ได้ 3 Automation: Registration Confirmation (หลังลงทะเบียน ทันที), Check-in Welcome (หลัง Check-in ทันที), Special Event Promotion (1 ชั่วโมงหลัง Check-in)
- **Actor:** ระบบ · **Trigger:** Create Event · **Preconditions:** Event ใหม่
- **Input:** — · **Processing Rules:** ทั้งสามเปิด (`enabled:true`) แต่อยู่ใต้ Communication ที่ปิด
- **Output:** รายการเริ่มต้น · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** —
- **Priority:** เสนอ: Could
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `data/automations.ts` (`defaultAutomations`), `formModel.ts`

### FR-COMM-003 — Trigger และ Timing ของ Automation
- **รายละเอียด:** เลือกเหตุการณ์และเวลาส่ง
- **Actor / Trigger:** ผู้ใช้ใน Drawer · **Preconditions:** —
- **Input:** Trigger: After Registration, Before Event, After Check-in, After Event, Specific Date & Time; Timing: Immediately / After a delay / Before / วันเวลา; หน่วย Minutes, Hours, Days
- **Processing Rules:** ยังไม่เลือก Trigger → "Choose a trigger first."; Before Event ไม่มีค่า → 1 day; After a delay ไม่มีค่า → 1; จำนวนตัวเลขไม่เกิน 3 หลัก; หน่วยเริ่มต้น hours; Immediately บันทึก `{value:0, unit:'minutes'}`; ไม่ตรวจว่า Specific Date อยู่ในอนาคต
- **Output:** `trigger`, `timing` · **Postconditions:** —
- **Error Handling:** "Select when this message is sent.", "Choose the date and time to send.", "Enter a delay greater than 0."
- **Dependencies:** Scheduler — `GAP-015`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `components/set-event/automation/TimingSelector.tsx`, `AutomationEditor.tsx`, `data/automations.ts` (`TRIGGERS`)

### FR-COMM-004 — ข้อความและประเภทข้อความ
- **รายละเอียด:** ข้อความ 1–5 ข้อความต่อ Automation ผ่าน Channel PEEP OA
- **Actor / Trigger:** ผู้ใช้ · **Preconditions:** —
- **Input:** ประเภท Text (≤1000 ตัวอักษร), Image (1040×1040 แนะนำ, JPEG/PNG ≤50MB), Claim Gift (Giveaway Image, Claimed Image, Link URL, Message After Claiming ≤1000); Event Card / Coupon / Link = "Coming soon" (Disable)
- **Processing Rules:** เพิ่ม/ลบ (เมื่อ >1)/เลื่อนขึ้นลง; ครบ 5 → "You’ve reached the maximum of 5 messages."; บันทึกเฉพาะ Payload ของประเภทที่เลือก
- **Output:** `messages[]` · **Postconditions:** —
- **Error Handling:** "Write the message.", "Upload an image.", "Upload the giveaway image.", "Enter a valid link, starting with https://" (`^https?:\/\/\S+$`), "Upload the claimed image.", "Write the message sent after claiming."
- **Dependencies:** `GAP-006`, `GAP-015`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (3 ประเภทยังไม่ได้พัฒนา)
- **Source Evidence:** `components/set-event/automation/MessageEditor.tsx`, `data/automations.ts` (`MAX_MESSAGES`, message types)

### FR-COMM-005 — ตัวแปรในข้อความและ Preview
- **รายละเอียด:** แทรกตัวแปรและแสดงตัวอย่างแชท PEEP OA
- **Actor / Trigger:** ผู้ใช้ใช้เมนู Insert variable · **Preconditions:** —
- **Input:** `{{user_name}}`, `{{event_name}}`, `{{event_date}}`, `{{event_time}}`, `{{event_location}}`, `{{qr_code}}`, `{{registration_id}}`
- **Processing Rules:** แทรกที่ตำแหน่ง Cursor, ปฏิเสธถ้าเกินขีดจำกัด; Preview ใช้ชื่อ/วันที่/เวลา/สถานที่ของ Event (หรือ Platform ออนไลน์) และค่าตัวอย่างเมื่อว่าง; ตัวแปรที่ไม่รู้จักคงข้อความเดิม; คำบรรยาย เช่น "Sent 1 hour after check-in"
- **Output:** Preview · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** Server-side Template Rendering — `GAP-015`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `MessageEditor.tsx`, `MessagePreview.tsx`, `data/automations.ts`

### FR-COMM-006 — Validation ของ Automation
- **รายละเอียด:** `validateDraft` เมื่อกด Save Automation แล้ว Re-validate ทุกการแก้ไข
- **Actor:** ระบบ · **Trigger:** Save Automation · **Preconditions:** —
- **Input:** Draft
- **Processing Rules:** Name บังคับ ("Enter an automation name."), Trigger, Timing, Channel ("Select a channel."), ข้อความตามประเภท; ไม่ถูกตรวจโดย Validation ระดับฟอร์ม Event; ปิด Drawer (Cancel/Escape/พื้นหลัง) ไม่เตือนการแก้ไข
- **Output:** Error ใน Drawer · **Postconditions:** —
- **Error Handling:** ตามข้อความข้างต้น
- **Dependencies:** —
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `components/set-event/automation/AutomationEditor.tsx` (`validateDraft`)

### FR-COMM-007 — จัดการรายการ Automation และ Journey
- **รายละเอียด:** รายการ "Broadcast Automations" และ Journey 5 Stage
- **Actor / Trigger:** ผู้ใช้ · **Preconditions:** Communication เปิด
- **Input:** `automations[]`
- **Processing Rules:** "{count} automations · {active} active"; เรียงตามลำดับ Trigger; การ์ดแสดง WHEN/WAIT/THEN; Edit, Duplicate (แทรกต่อจากต้นฉบับ "(Copy)"), Delete (ยืนยัน "This automated message will no longer be sent to attendees."), Toggle; Journey: Registers, Gets QR code ("Sent by PEEP SHARE"), Event day nears, Checks in, Event ends นับเฉพาะที่เปิด; Specific date แสดง "Plus {count} message(s)..."
- **Output:** รายการ · **Postconditions:** บันทึกพร้อมฟอร์ม Event
- **Error Handling:** Empty "No automated messages yet" + Add Broadcast
- **Dependencies:** —
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `CommunicationSection.tsx`, `AutomationCard.tsx`, `AutomationJourney.tsx`

### FR-COMM-008 — ส่งข้อความตาม Automation
- **รายละเอียด:** ระบบควรส่งข้อความให้ผู้เข้าร่วมตาม Trigger/Timing
- **Actor:** ระบบ (Backend) · **Trigger:** เหตุการณ์ของผู้เข้าร่วม/เวลา · **Preconditions:** TBD
- **Input:** TBD · **Processing Rules:** TBD · **Output:** TBD · **Postconditions:** TBD
- **Error Handling:** TBD
- **Dependencies:** `GAP-015`, `Q-011`
- **Priority:** TBD
- **Implementation Status:** ยังไม่ได้พัฒนา
- **Source Evidence:** ไม่มี

---

## TPL — Template Library

### FR-TPL-001 — รายการ Template และการใช้งาน
- **รายละเอียด:** Regis Form / Survey Form แสดง Template ตามประเภท พร้อมจำนวน Event ที่ใช้
- **Actor / Trigger:** เมนู FORMS · **Preconditions:** —
- **Input:** `formTemplates` (Session State จาก `formTemplatesSeed`: Registration 6, Survey 4), `events`
- **Processing Rules:** "Used in" = จำนวน Event (ไม่ใช่ Trash) ที่ฟอร์มประเภทนั้นมีชื่อหรือฟิลด์ และ `templateId` ตรง (**นับรวมฟอร์มที่ปิด**); คอลัมน์ Template, Fields ("{n} · {n} required" ไม่นับ heading), Used in ("{n} event(s)"/"Not used yet"), Last updated (วันที่ · ผู้แก้), Actions (View, Edit, Duplicate, Delete); มือถือเป็นการ์ด; เปลี่ยนเมนูระหว่าง Regis/Survey → Remount
- **Output:** ตาราง · **Postconditions:** —
- **Error Handling:** "No registration form templates yet" / "No survey form templates yet"
- **Dependencies:** Template API — `GAP-017`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/FormLibrary.tsx`, `data/formTemplates.ts`

### FR-TPL-002 — ค้นหาและแบ่งหน้า Template
- **รายละเอียด:** ค้นหาบนชื่อ+คำอธิบาย (Trim ไม่สนตัวพิมพ์), 10 รายการ/หน้า
- **Actor / Trigger:** พิมพ์ค้นหา · **Preconditions:** —
- **Input:** `query` · **Processing Rules:** เปลี่ยน → หน้า 1; Pagination แสดงเมื่อ > 1 หน้า
- **Output:** รายการ · **Postconditions:** —
- **Error Handling:** "No templates match your search."
- **Dependencies:** —
- **Priority:** เสนอ: Could
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/FormLibrary.tsx`

### FR-TPL-003 — สร้าง/แก้ไข Template
- **รายละเอียด:** Drawer โหมด Edit/Create ใช้ `EventFormBuilder`
- **Actor / Trigger:** Create Template / Edit Template → Save · **Preconditions:** —
- **Input:** Template Name*, Template Description, Fields
- **Processing Rules:** Validation: ชื่อบังคับ, ≥ 1 ฟิลด์ที่ไม่ใช่ heading, ทุกฟิลด์มี Label, ประเภทตัวเลือกมี ≥ 1 ตัวเลือก; Re-validate หลังกดครั้งแรก; บันทึกผ่าน `formConfig` (Trim ฯลฯ), `updatedAt` = ตอนนี้, `updatedBy` = 'Suchadas', ID ใหม่ `tpl-{base36}-{n}`; คำเตือน "The {n} event(s) already using it keep their copy."; Cancel: Create → ปิด, Edit → กลับ View; **ไม่มีการเตือนเมื่อปิด Drawer ที่ยังไม่บันทึก**
- **Output:** Toast "“{name}” created" / "“{name}” saved" · **Postconditions:** Session State
- **Error Handling:** "Enter a template name.", "Add at least one field.", "Enter a label for this field.", "Enter a section title.", "Add at least one option."
- **Dependencies:** `GAP-017`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/FormLibrary.tsx` (`TemplateDrawer`)

### FR-TPL-004 — ทำซ้ำ Template
- **รายละเอียด:** สำเนา "{name} (Copy)" ID ใหม่ Field ID ใหม่ แทรกต่อจากต้นฉบับ เปิดในโหมด Edit
- **Actor / Trigger:** Duplicate · **Preconditions:** — · **Input:** Template
- **Processing Rules:** `cloneFields` · **Output:** Toast "“{name}” created" · **Postconditions:** Session State
- **Error Handling:** — · **Dependencies:** `GAP-017`
- **Priority:** เสนอ: Could
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/FormLibrary.tsx`

### FR-TPL-005 — ลบ Template
- **รายละเอียด:** ยืนยัน "Delete this template?" "...Events that already use it keep their own copy."
- **Actor / Trigger:** Delete → ยืนยัน · **Preconditions:** — · **Input:** Template
- **Processing Rules:** อนุญาตแม้ถูกใช้อยู่; ถ้า Drawer เปิด Template นั้นอยู่ → ปิด
- **Output:** Toast "“{name}” deleted" · **Postconditions:** Session State
- **Error Handling:** — · **Dependencies:** `GAP-017`
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/FormLibrary.tsx`

### FR-TPL-006 — เปิด Event จาก Template
- **รายละเอียด:** โหมด View แสดง "Used in events" เป็น Chip "#id name" คลิกเพื่อเปิด Event ที่ Section Event Detail
- **Actor / Trigger:** คลิก Chip · **Preconditions:** Template ถูกใช้ · **Input:** eventId
- **Processing Rules:** สลับเมนูเป็น Event List และเปิด Workspace (**ไม่ผ่าน guarded**)
- **Output:** Event Detail · **Postconditions:** —
- **Error Handling:** ไม่ถูกใช้ → "Not used yet. Choose it with Use Template in an event’s ..." · **Dependencies:** —
- **Priority:** เสนอ: Could
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/FormLibrary.tsx`, `views/set-event/SetEventApp.tsx`

---

## MEDIA — Media Ads

### FR-MEDIA-001 — Placement สามประเภท
- **รายละเอียด:** เมนู Set Banner in App → Home page / Community page และ Set Cover Page in App ใช้ Component ชุดเดียวกัน
- **Actor:** ผู้ดูแลการตลาด · **Trigger:** คลิกเมนู · **Preconditions:** เปิด Media Ads
- **Input:** `BANNER_PLACEMENT`, `COMMUNITY_BANNER_PLACEMENT`, `COVER_PLACEMENT`
- **Processing Rules:** Banner: ขนาดแนะนำ 1432 × 480, อัตราส่วน 1432/480, ไม่มี Show Frequency; Community ต่างจาก Home เฉพาะข้อความและ Store; Cover: 1080 × 1440 (สมมติฐาน 3:4), มี Show Frequency; เปลี่ยนเมนู → Remount กลับหน้า List; ไม่จำกัดจำนวนรายการ
- **Output:** หน้า List ของ Placement · **Postconditions:** ข้อมูลคงอยู่ระดับ Module จน Refresh
- **Error Handling:** —
- **Dependencies:** Spec Cover Page — `Q-022`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/MediaAdsApp.tsx`, `views/set-event/promo/placements.ts`, `data/appBanners.ts`

### FR-MEDIA-002 — รายการ Banner/Cover และสรุปที่แสดงอยู่
- **รายละเอียด:** ตารางเรียงตาม Priority และข้อความ "{live} of {total} ... showing in the app now"
- **Actor / Trigger:** เปิดเมนู · **Preconditions:** —
- **Input:** `api.list()` (450 ms)
- **Processing Rules:** live = จำนวนที่ Display Status = Active; คอลัมน์ {noun} (ลำดับ+ภาพย่อ), Name (คลิกเปิด Edit), Click Action, Display Period ("Always" หรือ "DD Mon YYYY - DD Mon YYYY" + เวลา), Show Frequency (Cover), Status, Actions; มือถือเป็นการ์ด; ไม่มี Pagination; แถวที่กำลังทำงานจะจางและกดไม่ได้; ปุ่ม Sort Disable เมื่อ < 2 รายการ
- **Output:** ตาราง · **Postconditions:** —
- **Error Handling:** Loading Skeleton 4 แถว; "Couldn't load banners/cover pages" + Retry; Empty "No banners yet" + Create
- **Dependencies:** Banner API — `GAP-018`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (Error State เกิดไม่ได้กับ Mock)
- **Source Evidence:** `views/set-event/promo/PromoList.tsx`, `PromoManager.tsx`

### FR-MEDIA-003 — ค้นหาและกรอง Banner/Cover
- **รายละเอียด:** ค้นหาและตัวกรอง Status, Click Action, Show Frequency (Cover), Display period
- **Actor / Trigger:** ผู้ใช้ · **Preconditions:** —
- **Input:** `query`, `status`, `clickAction`, `frequency`, `from`, `to`
- **Processing Rules:** ค้นหาไม่สนตัวพิมพ์บน `name` + คำอธิบาย Click Action (**ภาษาอังกฤษเสมอ**); Status: Active, Scheduled, Draft, Inactive, Expired; Click Action: No Action, External URL, App Page, Content, Coupon; Frequency: Every app open, Once per day, Once only; ช่วงวันที่: Always ผ่านเสมอ, Schedule ผ่านเมื่อซ้อนทับ; Clear all แสดงเมื่อมีเงื่อนไข
- **Output:** รายการที่ตรง · **Postconditions:** —
- **Error Handling:** ไม่พบ → ข้อความ + Clear filters
- **Dependencies:** —
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend — ดู `ISS-025`
- **Source Evidence:** `views/set-event/promo/PromoList.tsx`, `data/appBanners.ts` (`overlapsPeriod`)

### FR-MEDIA-004 — คำนวณสถานะการแสดงผล
- **รายละเอียด:** สถานะแสดงผลคำนวณจากสถานะที่ตั้งค่าและช่วงเวลา
- **Actor:** ระบบ · **Trigger:** ทุกครั้งที่ Render · **Preconditions:** —
- **Input:** `status` (active/inactive/draft), `displayMode`, `startAt`, `endAt`, เวลาเบราว์เซอร์
- **Processing Rules:** ดู `BR-MEDIA-001`; เปรียบเทียบ String `YYYY-MM-DDTHH:mm` ระดับนาที ไม่มี Timezone; ไม่เก็บสถานะที่คำนวณ
- **Output:** Badge (จุดสี + ข้อความ) · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** สถานะที่แอปใช้จริงต้องคำนวณฝั่ง Server — `GAP-018`, `Q-019`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `data/appBanners.ts` (`displayStatus`, `nowLocal`), `views/set-event/promo/PromoStatusBadge.tsx`

### FR-MEDIA-005 — ฟอร์มสร้าง/แก้ไข Banner/Cover
- **รายละเอียด:** Section Information, Display Settings, Show Frequency (Cover), Click Action และ Live Preview
- **Actor / Trigger:** Create / Edit · **Preconditions:** —
- **Input:** Name* (≤80), Image*, Status (Active ค่าเริ่ม/Inactive/Draft), Display Period (Always ค่าเริ่ม/Schedule + Start*/End*), Show Frequency (ค่าเริ่ม Once per day), Click Action (ค่าเริ่ม No Action)
- **Processing Rules:** Hint สถานะแบบ Dynamic ("Drafts are saved but never shown in the app." ฯลฯ); Always → ล้าง startAt/endAt เมื่อบันทึก; Date Picker start max = end, end min = start (ไม่บล็อกอดีต)
- **Output:** PromoItem · **Postconditions:** —
- **Error Handling:** ดู FR-MEDIA-006
- **Dependencies:** `GAP-018`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/promo/PromoForm.tsx`

### FR-MEDIA-006 — Validation ของ Banner/Cover
- **รายละเอียด:** ตรวจเมื่อกด Save แล้ว Re-validate ทุกการแก้ไข
- **Actor:** ระบบ · **Trigger:** Save · **Preconditions:** —
- **Input:** Draft
- **Processing Rules:** ดู `BR-MEDIA-002`; Scroll + Focus ฟิลด์แรกที่ผิด; Footer "{n} fields need attention"; ไม่ตรวจชื่อซ้ำ
- **Output:** Error · **Postconditions:** —
- **Error Handling:** ข้อความตาม `BR-MEDIA-002`
- **Dependencies:** Backend Validation — `GAP-018`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/promo/PromoForm.tsx` (`validate`)

### FR-MEDIA-007 — Click Action
- **รายละเอียด:** กำหนดสิ่งที่เกิดเมื่อผู้ใช้แตะ Banner/Cover
- **Actor / Trigger:** เลือกการ์ด Click Action · **Preconditions:** —
- **Input:** No Action / External URL (`destinationUrl`) / App Page (Community, My Cloud, Shop, Event, Coupon Wallet) / Content (Type: Event, Post, Community + ID ข้อความอิสระ) / Coupon (ค้นหาจาก `couponApi` 4 รายการ, Debounce 250 ms)
- **Processing Rules:** บันทึกเฉพาะ Destination ของ Action ที่เลือก; Content Label = เดิมถ้า ID ไม่เปลี่ยน มิฉะนั้น "ID: {id}"; **เปลี่ยน Content Type ไม่ล้าง ID**; ไม่ตรวจว่า Content ID มีอยู่จริง (`contentApi.search` มีแต่ไม่ถูกใช้); รายการ App Page มี Comment "No route list exists in this project yet"
- **Output:** ค่า Destination · **Postconditions:** —
- **Error Handling:** "Enter the URL to open.", "Choose the page to open.", "Choose a content type.", "Enter the content ID.", "Select the coupon to open."; Coupon search Error "Couldn't load results. Try again." (เกิดไม่ได้กับ Mock)
- **Dependencies:** Deep Link list, Content/Coupon API — `GAP-019`, `Q-023`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน (`ISS-017`)
- **Source Evidence:** `views/set-event/promo/PromoForm.tsx`, `data/appBanners.ts`, `data/mock/promoApi.ts`, `components/set-event/form/SearchSelect.tsx`

### FR-MEDIA-008 — บันทึกและลำดับ Priority
- **รายละเอียด:** บันทึกผ่าน `api.save` (600 ms)
- **Actor:** ระบบ · **Trigger:** Save · **Preconditions:** ผ่าน Validation
- **Input:** PromoItem
- **Processing Rules:** รายการใหม่: ID `{prefix}-{base36 time}-{n}`, `priority = จำนวน + 1` (ท้ายสุด); แก้ไข: แทนที่ทั้งรายการ คง Priority; ตั้ง `createdAt`/`updatedAt` (ไม่แสดงใน UI); ปุ่ม "Saving…" Disable ระหว่างบันทึก
- **Output:** Toast "{noun} created successfully." / "{noun} updated successfully." และกลับรายการ
- **Postconditions:** In-memory Store
- **Error Handling:** "Couldn't save the {noun}. Check your connection and try again." (เกิดไม่ได้กับ Mock)
- **Dependencies:** `GAP-018`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (Mock API)
- **Source Evidence:** `data/mock/promoApi.ts`, `views/set-event/promo/PromoManager.tsx`

### FR-MEDIA-009 — Activate / Deactivate
- **รายละเอียด:** เปลี่ยนสถานะที่ตั้งค่าจากเมนูแถว
- **Actor / Trigger:** ⋮ → Activate / Deactivate · **Preconditions:** —
- **Input:** PromoItem
- **Processing Rules:** Deactivate แสดงเมื่อ `status='active'`: ถ้า Display = Active/Scheduled → ยืนยัน "Deactivate {noun}?"; Expired → ทันที; Activate แสดงเมื่อ inactive/draft → ทันที (Draft → active)
- **Output:** Toast "{noun} activated." / "{noun} deactivated." · **Postconditions:** โหลดรายการใหม่
- **Error Handling:** "Couldn't change the {noun} status. Try again."
- **Dependencies:** `GAP-018`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/promo/PromoList.tsx`, `PromoManager.tsx`

### FR-MEDIA-010 — ทำซ้ำ Banner/Cover
- **รายละเอียด:** สำเนา ID ใหม่ ชื่อ "{name} (Copy)" สถานะ draft ต่อท้ายลำดับ แล้วเปิด Edit
- **Actor / Trigger:** ⋮ → Duplicate · **Preconditions:** — · **Input:** PromoItem
- **Processing Rules:** คัดลอกฟิลด์อื่นทั้งหมด · **Output:** Toast "{noun} duplicated. It's saved as a draft."
- **Postconditions:** In-memory Store · **Error Handling:** "Couldn't duplicate the {noun}. Try again."
- **Dependencies:** `GAP-018`
- **Priority:** เสนอ: Could
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/promo/PromoManager.tsx`

### FR-MEDIA-011 — จัดลำดับการแสดงผล
- **รายละเอียด:** หน้า Sort ลาก/ลูกศรเพื่อเปลี่ยน Priority
- **Actor / Trigger:** Sort {noun} / Change Priority → Save Order · **Preconditions:** ≥ 2 รายการ
- **Input:** ลำดับ ID ทั้งหมด
- **Processing Rules:** รวมทุกสถานะ ("Inactive, draft and expired items keep their place..."); ลาก HTML5 (ไม่ทำงานบนจอสัมผัส) หรือปุ่มขึ้น/ลง (Disable ที่ขอบ); Change Priority ไฮไลต์แถวและ Scroll; Save Order Disable จนกว่าลำดับเปลี่ยน; `reorder` ตั้ง priority = index + 1 (500 ms); **ไม่มีการเตือนเมื่อออกโดยไม่บันทึก**
- **Output:** Toast "{noun} order saved." · **Postconditions:** In-memory Store
- **Error Handling:** "Couldn't save the order. Check your connection and try again."
- **Dependencies:** `GAP-018`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/promo/PromoSort.tsx`, `data/mock/promoApi.ts` (`reorder`)

### FR-MEDIA-012 — ลบ Banner/Cover
- **รายละเอียด:** ลบถาวรหลังยืนยัน
- **Actor / Trigger:** ⋮ → Delete → Delete · **Preconditions:** — · **Input:** PromoItem
- **Processing Rules:** Modal "Delete {noun}?" "...It will be removed from the app and can't be restored."; ปุ่ม Cancel Autofocus; `remove` จัด Priority ใหม่ 1..n (450 ms)
- **Output:** Toast "{noun} deleted." · **Postconditions:** In-memory Store
- **Error Handling:** "Couldn't delete the {noun}. Try again."
- **Dependencies:** `GAP-018`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/promo/PromoList.tsx`, `data/mock/promoApi.ts` (`remove`)

### FR-MEDIA-013 — อัปโหลดรูป Banner/Cover
- **รายละเอียด:** BannerDropzone พร้อม `onUpload = api.uploadImage`
- **Actor / Trigger:** ลากวาง/Browse · **Preconditions:** —
- **Input:** ไฟล์ JPEG/PNG ≤ 50 MB
- **Processing Rules:** แสดง "Uploading image…" ระหว่างรอ (900 ms); Mock คืนค่า Blob URL; ไม่ตรวจขนาด Pixel/อัตราส่วน
- **Output:** `{url, name}` · **Postconditions:** Blob URL ใช้ได้เฉพาะ Session
- **Error Handling:** "Only JPEG and PNG images are supported.", "The file is larger than 50MB.", "Upload failed. Check your connection and try again."
- **Dependencies:** `GAP-006`
- **Priority:** เสนอ: Must
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน
- **Source Evidence:** `components/set-event/BannerDropzone.tsx`, `data/mock/promoApi.ts` (`uploadImage`)

### FR-MEDIA-014 — Live Preview
- **รายละเอียด:** ตัวอย่างการแสดงผลในแอปข้างฟอร์ม
- **Actor:** ระบบ · **Trigger:** แก้ไขฟอร์ม · **Preconditions:** —
- **Input:** Draft
- **Processing Rules:** Banner: Header จำลอง + Carousel + Tiles; Cover: กรอบมือถือ + Overlay 55% + ปุ่มปิด; รายละเอียด On click, Shown, Frequency, Status, Priority "#{n} in the display order"
- **Output:** Preview · **Postconditions:** —
- **Error Handling:** ไม่มีรูป → Placeholder ขนาดแนะนำ
- **Dependencies:** —
- **Priority:** เสนอ: Should
- **Implementation Status:** พัฒนาแล้วใน Frontend
- **Source Evidence:** `views/set-event/promo/PromoPreview.tsx`

### FR-MEDIA-015 — ป้องกันการทิ้งการแก้ไข (Media Ads)
- **รายละเอียด:** "Discard changes?" เมื่อฟอร์มมีการแก้ไข
- **Actor:** ผู้ใช้ · **Trigger:** Back, Cancel, เปลี่ยนเมนู Sidebar · **Preconditions:** Dirty (JSON เทียบค่าเริ่มต้น)
- **Input:** — · **Processing Rules:** ไม่ครอบคลุม Header Switch Service/Log Out, หน้า Sort, Refresh
- **Output:** Modal "Your unsaved changes to this {noun} will be lost." · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** —
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน (`ISS-020`)
- **Source Evidence:** `views/MediaAdsApp.tsx`, `views/set-event/promo/PromoForm.tsx`

---

## ADMIN — User Management

### FR-ADMIN-001 — รายชื่อผู้ใช้
- **รายละเอียด:** ตาราง User (Avatar, ชื่อ, Email), PEEP SHARE ID, Assigned Events, Role, Status, Last Active, Actions
- **Actor:** Super Admin (ไม่บังคับใช้) · **Trigger:** Profile → User management · **Preconditions:** อยู่หน้า Select Service
- **Input:** `users` (7 รายการ)
- **Processing Rules:** "{count} users in the system" นับทั้งหมด; ค้นหาไม่สนตัวพิมพ์บน name/peepId/email; กรอง Role: All Roles, Event Admin, Event Staff, Photographer, Viewer (ไม่มี Super Admin/Data Viewer); ไม่มี Status filter/Sort/Pagination; มือถือเป็นการ์ด
- **Output:** ตาราง · **Postconditions:** —
- **Error Handling:** "No users found."
- **Dependencies:** User API — `GAP-020`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วใน Frontend (Mock)
- **Source Evidence:** `views/UserManagement.tsx`, `views/AccountAdminPage.tsx`

### FR-ADMIN-002 — Suspend / Reactivate ผู้ใช้
- **รายละเอียด:** สลับสถานะ Active ↔ Suspended
- **Actor / Trigger:** กดปุ่มในแถว · **Preconditions:** — · **Input:** userId
- **Processing Rules:** ไม่มีการยืนยัน เหตุผล หรือ Toast; Local State หายเมื่อ Remount (เลือกเมนู Users ซ้ำ หรือไป Roles แล้วกลับ)
- **Output:** สถานะใหม่ · **Postconditions:** ชั่วคราว
- **Error Handling:** —
- **Dependencies:** `GAP-020`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน (`ISS-018`)
- **Source Evidence:** `views/UserManagement.tsx`

### FR-ADMIN-003 — รายละเอียดผู้ใช้
- **รายละเอียด:** โปรไฟล์ Assigned Events และ Recent Activity
- **Actor / Trigger:** View · **Preconditions:** — · **Input:** User (Snapshot ตอนกด)
- **Processing Rules:** Assigned Events = 3 Event Hardcode ตัดตาม `assignedEvents` (สูงสุด 3); Role ในตาราง = Role ระดับระบบ; Recent Activity 3 รายการเดียวกันทุกคน; ไม่มี Action
- **Output:** หน้า Detail · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** `GAP-020`, `GAP-012`
- **Priority:** เสนอ: Should
- **Implementation Status:** ใช้ Mock Data / จำลองการทำงาน
- **Source Evidence:** `views/UserManagement.tsx` (`UserDetail`)

### FR-ADMIN-004 — รายการ Role
- **รายละเอียด:** ตาราง Role Name, Description, Users, Permissions ("{n} permissions"), Status
- **Actor / Trigger:** เมนู Roles & Permissions · **Preconditions:** — · **Input:** `roles` (6)
- **Processing Rules:** จำนวนผู้ใช้เป็นค่า Hardcode (5, 12, 28, 8, 45, 32) ไม่ได้นับจาก `users`; Edit/คลิกชื่อ → Role Detail; **View Users ไม่มี Handler**; ไม่มี Search/Filter/Pagination
- **Output:** ตาราง · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** Role API — `GAP-020`
- **Priority:** เสนอ: Must
- **Implementation Status:** พัฒนาแล้วบางส่วน (`ISS-019`)
- **Source Evidence:** `views/RoleManagement.tsx`, `data/mock.ts` (`roles`)

### FR-ADMIN-005 — สร้าง Role
- **รายละเอียด:** Modal Role Name, Description, Permission Checkboxes ตามหมวด
- **Actor / Trigger:** Create Role → Create Role · **Preconditions:** —
- **Input:** ชื่อ, คำอธิบาย, Permissions
- **Processing Rules:** **ปุ่ม Create Role เรียก `onClose` เท่านั้น ไม่บันทึก**; ไม่มี Validation; ปิดด้วย Cancel/X (ไม่รองรับ Escape/พื้นหลัง)
- **Output:** ไม่มี · **Postconditions:** —
- **Error Handling:** —
- **Dependencies:** `GAP-020`
- **Priority:** เสนอ: Must
- **Implementation Status:** ยังไม่ได้พัฒนา (มีเฉพาะ UI)
- **Source Evidence:** `views/RoleManagement.tsx` (`CreateRoleModal`)

### FR-ADMIN-006 — Permission Matrix ของ Role
- **รายละเอียด:** แสดงและแก้ Permission 7 หมวด: EVENT (View/Create/Edit/Delete Event), REGISTRATION (View/Export Registration Data), SURVEY (View Survey, Export Survey Data), REPORT (View Event Report, Export Report), PHOTOS (View/Upload/Sync/Delete Photos), MEMBERS (View/Manage Members), SYSTEM (Manage System Settings, View Activity Log)
- **Actor / Trigger:** Edit Role → ติ๊ก → Save Changes · **Preconditions:** —
- **Input:** `permissions`
- **Processing Rules:** ติ๊กเปลี่ยน Local State (คลิกที่กล่องเท่านั้น — Label ไม่ผูกกับ Input); **Save Changes ไม่มี Handler**; Cancel กลับรายการ; แก้ชื่อ/คำอธิบาย/สถานะไม่ได้
- **Output:** — · **Postconditions:** การแก้ไขหายเมื่อออก
- **Error Handling:** —
- **Dependencies:** `GAP-020`
- **Priority:** เสนอ: Must
- **Implementation Status:** ยังไม่ได้พัฒนา (`ISS-019`) — ดู `ISS-030`
- **Source Evidence:** `views/RoleManagement.tsx` (`RoleDetail`), `data/mock.ts` (`allPermissions`)

### FR-ADMIN-007 — บังคับใช้สิทธิ์ตาม Role
- **รายละเอียด:** ระบบควรจำกัดการเข้าถึง Service/Feature ตาม Role และ Permission
- **Actor:** ระบบ · **Trigger:** ทุกการเข้าถึง · **Preconditions:** TBD
- **Input:** TBD · **Processing Rules:** ปัจจุบันไม่มี — `roles`/`allPermissions` ถูกอ้างอิงเฉพาะใน `RoleManagement.tsx`; Header รองรับ `roleSwitcher` ("Preview as") แต่ไม่มีผู้ใช้งาน; Role ที่แสดงเป็นข้อความ Hardcode
- **Output:** TBD · **Postconditions:** TBD
- **Error Handling:** TBD (ไม่มีหน้า 403)
- **Dependencies:** `GAP-001`, `GAP-020`, `Q-002`, `Q-003`
- **Priority:** เสนอ: Must
- **Implementation Status:** ยังไม่ได้พัฒนา
- **Source Evidence:** `App.tsx`, `components/Header.tsx` (`roleSwitcher`), `views/EventDashboardApp.tsx` (`EVENT_TABS`)

### FR-ADMIN-008 — เพิ่ม/แก้ไข/ลบผู้ใช้
- **รายละเอียด:** ไม่มีปุ่ม Add User / Delete User; ปุ่ม Edit ไม่มี Handler
- **Actor / Trigger / Preconditions / Input / Processing Rules / Output / Postconditions / Error Handling:** TBD
- **Dependencies:** `GAP-020`, `Q-012`
- **Priority:** TBD
- **Implementation Status:** ยังไม่ได้พัฒนา
- **Source Evidence:** `views/UserManagement.tsx`
