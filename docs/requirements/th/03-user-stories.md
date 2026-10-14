# 03 — User Stories และ Acceptance Criteria

> **วิธีอ่าน:** Acceptance Criteria (AC) เขียนตาม **พฤติกรรมปัจจุบันของโค้ด** เพื่อให้ QA ทดสอบได้ทันที
> หากพฤติกรรมปัจจุบันเป็นข้อบกพร่องหรือยังไม่สมบูรณ์ จะมีหมายเหตุ ⚠️ และอ้างถึง Known Issue (`ISS-xxx`) หรือคำถาม (`Q-xxx`) ใน [07-dev-qa-handoff.md](07-dev-qa-handoff.md)
> Story ที่ติดป้าย **[ยังไม่ยืนยัน]** คือความต้องการที่อนุมานจาก UI/Comment/เอกสารเดิม แต่ไม่มี Logic รองรับในโค้ด

---

# AUTH — Login และ App Shell

### US-AUTH-001 — เข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่าน
**ในฐานะ:** ผู้ดูแลระบบ **ฉันต้องการ:** เข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่าน **เพื่อให้:** เข้าถึง Service ต่างๆ ได้

**เงื่อนไขก่อนเริ่มใช้งาน:** ยังไม่ได้เข้าสู่ระบบ (`isAuthenticated=false`)

**ขั้นตอนการทำงานหลัก**
1. ผู้ใช้เลือกแท็บ "Username Login" (ค่าเริ่มต้น) เลือกรหัสประเทศ (+66 เท่านั้น) กรอกเบอร์โทรและรหัสผ่าน
2. ผู้ใช้กด "Log In"
3. ระบบเปลี่ยนไปหน้า Select Service

**กรณีทางเลือกและข้อผิดพลาด**
- ช่องว่าง → Browser แสดงข้อความ `required` (ไม่มีข้อความ Custom)
- Credential ผิด → **ไม่มีการตรวจสอบ** ทุกค่าเข้าสู่ระบบได้ ⚠️ `ISS-001`
- ปุ่มแสดง/ซ่อนรหัสผ่านสลับ `type` ของ Input
- "Remember me" และ "Forgot Password?" ไม่มีผล

**Acceptance Criteria**
- **AC-AUTH-001** Given อยู่หน้า Login, When เว้นเบอร์โทรหรือรหัสผ่านว่างแล้วกด Log In, Then ฟอร์มไม่ถูกส่งและ Browser แจ้งช่องที่ต้องกรอก
- **AC-AUTH-002** Given กรอกเบอร์โทรและรหัสผ่านค่าใดก็ได้, When กด Log In, Then แสดงหน้า "Select Service"
- **AC-AUTH-003** Given กดไอคอนรูปตา, When ไอคอนเปลี่ยน, Then รหัสผ่านแสดงเป็นข้อความ/ซ่อนตามลำดับ

**สถานะการพัฒนา:** ใช้ Mock Data / จำลองการทำงาน (ไม่มี Authentication จริง)
**หลักฐานอ้างอิง:** `src/views/LoginPage.tsx` (`UsernameLoginForm`), `src/App.tsx` (`handleLogin`)

---

### US-AUTH-002 — เข้าสู่ระบบด้วย QR Code
**ในฐานะ:** ผู้ดูแลระบบ **ฉันต้องการ:** สแกน QR ด้วยแอป PEEP SHARE **เพื่อให้:** เข้าสู่ระบบโดยไม่ต้องพิมพ์รหัสผ่าน

**เงื่อนไขก่อนเริ่มใช้งาน:** ยังไม่ได้เข้าสู่ระบบ

**ขั้นตอนการทำงานหลัก**
1. เลือกแท็บ "QR Code Login" → ระบบแสดงไอคอน QR (ไม่ใช่ QR จริง)
2. กด "Simulate Scan" → แสดง Modal "Verification Required" พร้อมรหัส `831106` (คงที่)
3. กด "Verify & Continue" → เข้าหน้า Select Service

**กรณีทางเลือกและข้อผิดพลาด:** กด Cancel, Escape หรือคลิกนอก Modal → ปิด Modal; ไม่มีกรณี QR หมดอายุ/สแกนล้มเหลว

**Acceptance Criteria**
- **AC-AUTH-004** Given อยู่แท็บ QR Code Login, When กด Simulate Scan, Then แสดง Modal พร้อมรหัส 6 หลัก
- **AC-AUTH-005** Given Modal เปิดอยู่, When กด Verify & Continue, Then เข้าสู่หน้า Select Service; When กด Escape, Then Modal ปิดและยังอยู่หน้า Login

**สถานะการพัฒนา:** ใช้ Mock Data / จำลองการทำงาน
**หลักฐานอ้างอิง:** `src/views/LoginPage.tsx` (`QRLogin`, `VerificationModal`)

---

### US-AUTH-003 — เลือก Service
**ในฐานะ:** ผู้ใช้ที่เข้าสู่ระบบแล้ว **ฉันต้องการ:** เลือก Service ที่จะใช้งาน **เพื่อให้:** ไปยังพื้นที่ทำงานที่เกี่ยวข้อง

**ขั้นตอนการทำงานหลัก**
1. ระบบแสดงการ์ด 6 Service: Event Dashboard, Set Event, Media Ads, PEEP SYNC, Coupon, PEEP OA
2. ผู้ใช้กด "Open Service" → ระบบแสดงหน้า Loading "Opening {name}..." 1.2 วินาที
3. ระบบเปิด Service; Coupon และ PEEP OA แสดงหน้า Placeholder "You are now accessing {name}."

**กรณีทางเลือก:** ไม่มีการตรวจสิทธิ์ต่อ Service — ผู้ใช้ทุกคนเห็นและเปิดได้ทุก Service ⚠️ `Q-003`

**Acceptance Criteria**
- **AC-AUTH-006** Given อยู่หน้า Select Service, When โหลดหน้า, Then แสดงการ์ด 6 รายการตามลำดับใน `services`
- **AC-AUTH-007** Given กด Open Service ของ Set Event, When ผ่านไปประมาณ 1.2 วินาที, Then แสดง Set Event พร้อม Sidebar "Set Event"
- **AC-AUTH-008** Given กด Open Service ของ Coupon, When Loading เสร็จ, Then แสดงหน้า Placeholder พร้อมปุ่ม Switch Service

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (Coupon/PEEP OA ยังไม่ได้พัฒนา)
**หลักฐานอ้างอิง:** `src/views/ServiceSelection.tsx`, `src/components/ServiceCard.tsx`, `src/views/ServiceLoading.tsx`, `src/views/ServicePlaceholder.tsx`, `src/data/mock.ts` (`services`)

---

### US-AUTH-004 — เปลี่ยนภาษา EN/TH
**ในฐานะ:** ผู้ใช้ **ฉันต้องการ:** สลับภาษาอังกฤษ/ไทย **เพื่อให้:** ใช้งานในภาษาที่ถนัด

**ขั้นตอนการทำงานหลัก:** เลือกภาษาจากปุ่มหน้า Login หรือ Dropdown ใน Header → ข้อความเปลี่ยนทันที → ค่าเก็บใน `localStorage` (`peepshare.lang`)

**กรณีทางเลือก:** `localStorage` ถูกบล็อก → ใช้ภาษาที่เลือกได้เฉพาะครั้งนั้น; ข้อความที่ไม่มีคำแปลแสดงภาษาอังกฤษ

**Acceptance Criteria**
- **AC-AUTH-009** Given ภาษาปัจจุบันเป็น EN, When เลือก TH, Then ข้อความที่มีคำแปลแสดงเป็นภาษาไทยและ `<html lang="th">`
- **AC-AUTH-010** Given เลือก TH แล้ว, When Refresh หน้า, Then ยังคงเป็นภาษาไทย

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/i18n/index.tsx`, `src/components/Header.tsx`, `src/views/LoginPage.tsx` (`LanguageSwitch`)

---

### US-AUTH-005 — สลับ Service และออกจากระบบ
**ในฐานะ:** ผู้ใช้ **ฉันต้องการ:** ใช้เมนูโปรไฟล์ **เพื่อให้:** สลับ Service หรือออกจากระบบ

**ขั้นตอนการทำงานหลัก:** คลิกชื่อผู้ใช้ที่ Header → เมนู User Profile / (User management) / Switch Service / Log Out

**กรณีทางเลือก**
- "User Profile" ไม่มีการทำงานในทุก Service ⚠️ `ISS-002`
- "User management" แสดงเฉพาะหน้า Select Service และหน้า Account Admin
- Switch Service / Log Out ใน Set Event และ Media Ads **ไม่ผ่าน** การยืนยัน Discard changes แม้ฟอร์มมีการแก้ไข ⚠️ `ISS-020`

**Acceptance Criteria**
- **AC-AUTH-011** Given อยู่ใน Service ใดก็ได้, When เลือก Switch Service, Then กลับหน้า Select Service และ State ของ Service เดิมถูกล้าง
- **AC-AUTH-012** Given อยู่ใน Service ใดก็ได้, When เลือก Log Out, Then กลับหน้า Login
- **AC-AUTH-013** Given อยู่ใน Service ใดก็ได้, When เลือก User Profile, Then เมนูปิดและไม่มีการเปลี่ยนหน้า (พฤติกรรมปัจจุบัน)

**สถานะการพัฒนา:** พัฒนาแล้วบางส่วน
**หลักฐานอ้างอิง:** `src/components/Header.tsx` (`menuItems`), `src/App.tsx`

---

# DASH — Event Dashboard

### US-DASH-001 — ดูรายการ Event (Data Viewer)
**ในฐานะ:** Data Viewer **ฉันต้องการ:** ดู ค้นหา และกรองรายการ Event **เพื่อให้:** เลือก Event ที่ต้องการดูข้อมูล

**เงื่อนไขก่อนเริ่มใช้งาน:** เปิด Service Event Dashboard

**ขั้นตอนการทำงานหลัก**
1. ระบบแสดง Event ทุกสถานะยกเว้น Draft (6 รายการจาก Mock) คอลัมน์ #, Event Name (+Location), Date, Status, Registrants, Check-ins, Members
2. ผู้ใช้ค้นหาชื่อ / เลือกชิปสถานะ (All, Upcoming, Ongoing, Completed, Archived) / คลิกหัวคอลัมน์เพื่อ Sort
3. ผู้ใช้คลิกชื่อ Event เพื่อเปิด Event Detail

**กรณีทางเลือก:** ไม่พบผลลัพธ์ → "No events found."; ไม่มี Loading/Error State

**Acceptance Criteria**
- **AC-DASH-001** Given เปิด Event List, When โหลดเสร็จ, Then ไม่มี Event สถานะ Draft และหัวตารางแสดง "6 events total"
- **AC-DASH-002** Given พิมพ์ "sport" ในช่องค้นหา, When ผลกรอง, Then แสดงเฉพาะ Event ที่ชื่อมีคำนี้ (ไม่สนตัวพิมพ์) และกลับไปหน้า 1
- **AC-DASH-003** Given คลิกหัวคอลัมน์ Registrants, When คลิกซ้ำ, Then สลับเรียงน้อยไปมาก/มากไปน้อย
- **AC-DASH-004** Given คลิกหัวคอลัมน์ Date, When ตารางเรียง, Then ⚠️ ลำดับไม่เปลี่ยน (ไม่มี Logic Sort วันที่) `ISS-003`
- **AC-DASH-005** Given ผลลัพธ์มากกว่า 10 รายการ, When ดูท้ายตาราง, Then แสดง Pagination 10 รายการต่อหน้า

**สถานะการพัฒนา:** พัฒนาแล้วบางส่วน (Sort วันที่ไม่ทำงาน)
**หลักฐานอ้างอิง:** `src/views/EventList.tsx` (prop `dashboard`), `src/views/EventDashboardApp.tsx`

---

### US-DASH-002 — ดูสรุป Event และข้อมูลผู้ลงทะเบียน
**ในฐานะ:** Data Viewer **ฉันต้องการ:** ดูตัวเลขสรุปและรายชื่อผู้ลงทะเบียน **เพื่อให้:** ติดตามการลงทะเบียนและ Check-in

**ขั้นตอนการทำงานหลัก**
1. Event Detail แสดง Summary Cards: Registered, Checked-in (+% attendance), Survey Responses, Photos, Members
2. แท็บ Registration (ค่าเริ่มต้น) แสดงตาราง #, Name, Phone, Email, PEEP SHARE Username, Event Date, Check-in (In/Out)
3. ผู้ใช้ค้นหา (Name, Email, Username) และกรอง All / Checked In / Not Checked In

**กรณีทางเลือก**
- ไม่มีข้อมูล → "No registrants found." (ข้อความเดียวกันทั้งกรณีไม่มีข้อมูลและไม่ตรงเงื่อนไข)
- ปุ่ม CSV / Excel ไม่มีการทำงาน ⚠️ `ISS-004`
- Data Viewer ยังเห็นการ์ด Photos และ Members แม้คำอธิบาย Role ระบุว่าไม่มีสิทธิ์ดูรูป `Q-004`

**Acceptance Criteria**
- **AC-DASH-006** Given Event มี registrants > 0, When เปิด Event Detail, Then การ์ด Checked-in แสดง "{pct}% attendance" = round(checkedIn/registrants×100)
- **AC-DASH-007** Given อยู่แท็บ Registration ของ MONOMAX Event, When เลือก "Not Checked In", Then แสดงเฉพาะแถวที่ Check-in = Out
- **AC-DASH-008** Given ค้นหาด้วยเบอร์โทร, When ผลกรอง, Then ไม่พบผลลัพธ์ (Phone ไม่อยู่ในฟิลด์ค้นหา)
- **AC-DASH-009** Given กดปุ่ม CSV, When คลิก, Then ⚠️ ไม่มีการดาวน์โหลด (พฤติกรรมปัจจุบัน)

**สถานะการพัฒนา:** พัฒนาแล้วบางส่วน
**หลักฐานอ้างอิง:** `src/views/EventDetail.tsx`, `src/views/RegistrationData.tsx` (`EventRegistrationDetail`), `src/data/mock.ts` (`registrationData`)

---

### US-DASH-003 — ดูผลแบบสำรวจ
**ในฐานะ:** Data Viewer **ฉันต้องการ:** ดูคำตอบและสถิติแบบสำรวจของ Event **เพื่อให้:** วิเคราะห์ Feedback

**ขั้นตอนการทำงานหลัก**
1. แท็บ Survey แสดงการ์ดฟอร์ม: Form #id, Enabled/Disabled, จำนวนผู้ตอบ, จำนวนคำถาม, คะแนนเฉลี่ยดาว (ถ้ามีคำถาม rating และมีคำตอบ)
2. คลิกการ์ด → แสดงสถิติหัวฟอร์ม และแท็บย่อย "Submissions" (ค่าเริ่มต้น) / "Overview Statistics"
3. Submissions: ตาราง #, IP Address, Peepshare ID, คอลัมน์ต่อคำถาม, Submitted at
4. Overview Statistics: Radio = จำนวนและ % ต่อตัวเลือก; Rating = ค่าเฉลี่ยและการกระจาย 5→1; Text = รายการคำตอบ

**กรณีทางเลือก:** ไม่มีฟอร์ม → "No surveys yet"; ไม่มีคำตอบ → "No responses yet" / "No responses to summarize yet"

**Acceptance Criteria**
- **AC-DASH-010** Given Event ไม่มีแบบสำรวจ, When เปิดแท็บ Survey, Then แสดง "No surveys yet"
- **AC-DASH-011** Given เปิดฟอร์มที่มีคำตอบ, When ดู Submissions, Then คำตอบประเภท rating แสดงเป็นดาว 5 ดวงพร้อม (n) และคำตอบที่ขาดแสดง "—"
- **AC-DASH-012** Given เปิด Overview Statistics, When มีคำถาม rating, Then ค่าเฉลี่ยคำนวณเฉพาะค่าที่ > 0
- **AC-DASH-013** Given เปลี่ยนไปแท็บ Registration แล้วกลับมา Survey, When แท็บแสดง, Then กลับไปที่รายการฟอร์ม (ไม่จำฟอร์มที่เลือก)

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (ข้อมูล Mock)
**หลักฐานอ้างอิง:** `src/views/SurveyFeedback.tsx`, `src/data/mock.ts` (`surveyForms`)

---

### US-DASH-004 — Export ผลแบบสำรวจ
**ในฐานะ:** Data Viewer **ฉันต้องการ:** ดาวน์โหลดคำตอบเป็นไฟล์ **เพื่อให้:** นำไปวิเคราะห์ต่อ

**ขั้นตอนการทำงานหลัก:** ในแท็บ Submissions กด CSV หรือ Excel → ระบบสร้างไฟล์ฝั่ง Client และดาวน์โหลด

**Acceptance Criteria**
- **AC-DASH-014** Given ฟอร์มมีคำตอบ, When กด CSV, Then ดาวน์โหลด `survey-{formId}-responses.csv` (UTF-8 BOM, ทุกช่องครอบด้วย ", CRLF) คอลัมน์ #, IP, Peepshare ID, คำถามทั้งหมด, Submitted at
- **AC-DASH-015** Given ฟอร์มไม่มีคำตอบ, When ดูปุ่ม CSV/Excel, Then ปุ่มถูก Disable

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (ข้อมูล Mock; Excel เป็น HTML Table บันทึกเป็น `.xls`)
**หลักฐานอ้างอิง:** `src/views/SurveyFeedback.tsx` (ฟังก์ชัน Export)

---

# SYNC — PEEP SYNC

### US-SYNC-001 — ดู Event และรายละเอียด (Photographer)
**ในฐานะ:** Photographer **ฉันต้องการ:** ดูรายการ Event และรายละเอียด **เพื่อให้:** ทราบข้อมูล Event ที่ทำงาน

**ขั้นตอนการทำงานหลัก**
1. Event List แสดงทุก Event รวม Draft (7 รายการ) คอลัมน์ Photos แทน Check-ins และมีคอลัมน์ Actions
2. กด View หรือชื่อ → Event Detail แท็บ Overview (ค่าเริ่มต้น), Registration, Survey, Collections, Members & Access

**กรณีทางเลือก:** ปุ่ม Edit, Access, ⋯ ไม่มีการทำงาน ⚠️ `ISS-005`; ไม่มีการกรองเฉพาะ Event ที่ได้รับมอบหมาย `Q-005`

**Acceptance Criteria**
- **AC-SYNC-001** Given เปิด PEEP SYNC, When ดู Event List, Then แสดง "7 events total" และชิปสถานะมี Draft
- **AC-SYNC-002** Given เปิด Event Detail, When ดูแท็บ Overview, Then แสดงการ์ด Registration (General/VIP), Survey, Photo Activity, Event Team ที่คำนวณจากตัวเลข Event (สัดส่วน Hardcode)
- **AC-SYNC-003** Given เปิดแท็บ Collections ของ MONOMAX Event, When แสดงผล, Then แสดง 3 Collection ที่ `linkedEvent` ตรงกับชื่อ Event (อ่านอย่างเดียว)

**สถานะการพัฒนา:** พัฒนาแล้วบางส่วน (Overview เป็นค่าจำลอง)
**หลักฐานอ้างอิง:** `src/views/PeepSyncApp.tsx`, `src/views/EventList.tsx`, `src/views/EventDetail.tsx` (`OverviewTab`, `CollectionsTab`)

---

### US-SYNC-002 — จัดการสมาชิกและสิทธิ์ใน Event
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** เพิ่ม แก้ไข และลบสมาชิก Event พร้อมกำหนด Role/Permission **เพื่อให้:** ควบคุมผู้เข้าถึง Event

**ขั้นตอนการทำงานหลัก**
1. แท็บ Members & Access แสดงตาราง PEEP SHARE ID, Name, Role, Permissions, Status, Added Date, Actions
2. Add Member → กรอก PEEP SHARE ID → Search → ระบบแสดงผู้ใช้ "Kanya Srisuwan" (คงที่) → เลือก Role (Event Admin/Event Staff/Photographer/Viewer, ค่าเริ่มต้น Viewer) และ Permission 9 รายการ (ค่าเริ่มต้น View Event) → Add Member
3. Edit → แก้ Role/Permission → Save Changes
4. Remove → ลบทันที

**กรณีทางเลือก**
- ช่อง ID ว่าง → Search ไม่ทำงาน, ปุ่ม Add Member Disable จนกว่าจะค้นหา
- ไม่มีกรณี "ไม่พบผู้ใช้" ⚠️ `ISS-006`; ไม่ตรวจ ID ซ้ำ; อนุญาตไม่เลือก Permission
- ปุ่ม "Role" ไม่มีการทำงาน; Remove ไม่มีการยืนยัน
- รายชื่อสมาชิกเป็นชุดเดียวกันทุก Event และหายเมื่อเปลี่ยนแท็บ/หน้า ⚠️ `ISS-007`

**Acceptance Criteria**
- **AC-SYNC-004** Given เปิด Add Member และช่อง ID ว่าง, When ดูปุ่ม Add Member, Then ปุ่มถูก Disable
- **AC-SYNC-005** Given กรอก ID ใดๆ แล้วกด Search, When ผลแสดง, Then แสดง "Kanya Srisuwan" พร้อมป้าย "Found" และแสดงช่อง Role/Permissions
- **AC-SYNC-006** Given ค้นหาแล้ว, When กด Add Member, Then เพิ่มแถวใหม่สถานะ Active วันที่เพิ่ม = วันที่ปัจจุบัน (UTC, YYYY-MM-DD)
- **AC-SYNC-007** Given แก้ไข Permission ใน Edit Access, When กด Save Changes, Then แถวสมาชิกแสดง Permission ใหม่
- **AC-SYNC-008** Given กด Remove, When คลิก, Then แถวหายทันทีโดยไม่มีการยืนยัน

**สถานะการพัฒนา:** พัฒนาแล้วบางส่วน (Local State, ค้นหาผู้ใช้จำลอง)
**หลักฐานอ้างอิง:** `src/views/MembersAccess.tsx` (`AddMemberModal`, `EditMemberModal`), `src/data/mock.ts` (`eventMembers`)

---

### US-SYNC-003 — ดูการใช้พื้นที่ Cloud
**ในฐานะ:** Photographer / Admin **ฉันต้องการ:** ดูพื้นที่จัดเก็บ แพ็กเกจ และการใช้งานต่อ Event **เพื่อให้:** วางแผนพื้นที่

**ขั้นตอนการทำงานหลัก:** หน้า Cloud Management แสดง Cloud Storage (28.5/100 GB), Storage Usage ตามประเภทไฟล์, Current Plan, Upgrade Storage (200 GB ฿199, 500 GB ฿449, 1 TB ฿849), ตาราง Storage Usage by Event พร้อมช่องค้นหา

**กรณีทางเลือก:** สถานะ warning (≥80%) มี Banner สีเหลือง; สถานะ full (≥100%) ไม่มี UI แยก; ปุ่ม Upgrade/Manage ทั้งหมดไม่ทำงาน ⚠️ `ISS-008`; ค้นหาไม่พบไม่มี Empty State

**Acceptance Criteria**
- **AC-SYNC-009** Given เปิด Cloud Management, When แสดงผล, Then แสดง 71.5 GB available และ Progress Bar ปกติ (ไม่มี Banner เตือน)
- **AC-SYNC-010** Given พิมพ์ชื่อ Collection ในช่องค้นหาตาราง, When ผลกรอง, Then แสดงแถวที่ Event หรือ Collection ตรงคำค้น

**สถานะการพัฒนา:** ใช้ Mock Data / จำลองการทำงาน
**หลักฐานอ้างอิง:** `src/views/CloudManagement.tsx`

---

### US-SYNC-004 — สร้าง Collection
**ในฐานะ:** Photographer / Admin **ฉันต้องการ:** สร้าง Collection และเชื่อมกับ Event **เพื่อให้:** จัดเก็บไฟล์ของ Event

**ขั้นตอนการทำงานหลัก:** กด Create Collection → กรอก Collection Name (บังคับ), Description, Owner, Link to Event → Create → Collection ใหม่อยู่บนสุด สถานะ Private, 0 files

**กรณีทางเลือก:** ชื่อว่าง/มีแต่ช่องว่าง → ปุ่ม Create Disable; ไม่ตรวจชื่อซ้ำ; Avatar Owner เป็น "ST" เสมอ

**Acceptance Criteria**
- **AC-SYNC-011** Given Modal Create Collection, When ชื่อว่าง, Then ปุ่ม Create ถูก Disable
- **AC-SYNC-012** Given กรอกชื่อแล้วกด Create, When Modal ปิด, Then Collection ใหม่อยู่แถวแรก Sharing = Private, Last Updated = "Just now"

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (Local State — หายเมื่อเปลี่ยนเมนู)
**หลักฐานอ้างอิง:** `src/views/Collections.tsx` (`CreateCollectionModal`)

---

### US-SYNC-005 — เรียกดูไฟล์ใน Collection
**ในฐานะ:** Photographer **ฉันต้องการ:** ดู ค้นหา และกรองไฟล์ใน Collection **เพื่อให้:** ตรวจสอบสถานะการอัปโหลด

**ขั้นตอนการทำงานหลัก:** เปิด Collection → File Browser (Gallery/List) → ค้นหาชื่อไฟล์, กรอง File type และ Status, แบ่งหน้า 24 ไฟล์ → เลือกไฟล์ (รายไฟล์ / ทั้งหน้า)

**กรณีทางเลือก:** ไม่มีไฟล์ → "No files in this collection yet"; ไม่ตรงเงื่อนไข → "No files match your search"; Bulk Download/Delete ไม่ทำงาน ⚠️ `ISS-009`

**Acceptance Criteria**
- **AC-SYNC-013** Given Collection มีไฟล์มากกว่า 24, When เปิด, Then แสดง Pagination และ 24 ไฟล์ต่อหน้า
- **AC-SYNC-014** Given เลือก Status = Failed, When ผลกรอง, Then แสดงเฉพาะไฟล์ Failed และกลับหน้า 1
- **AC-SYNC-015** Given เลือกไฟล์ในหลายหน้า, When ดูแถบ Bulk, Then จำนวน "{n} selected" นับรวมทุกหน้า
- **AC-SYNC-016** Given มีตัวกรองใช้งานอยู่, When กด Clear, Then ล้างคำค้นและตัวกรองทั้งหมด

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (รายการไฟล์สร้างจาก Mock Generator)
**หลักฐานอ้างอิง:** `src/views/Collections.tsx` (`CollectionDetail`, `mockFiles`), `src/components/ui/Pagination.tsx`, `src/components/ui/FilterSelect.tsx`

---

### US-SYNC-006 — แชร์ Collection
**ในฐานะ:** เจ้าของ Collection **ฉันต้องการ:** แชร์ Collection ผ่านลิงก์ QR หรือระบุบุคคล **เพื่อให้:** ผู้เข้าร่วมเข้าถึงไฟล์ได้

**ขั้นตอนการทำงานหลัก**
1. กด Share → เลือก "Anyone with the link" หรือ "Private access"
2. เลือกบุคคล/กลุ่ม (Groups 3 กลุ่ม Hardcode, Friends 7 คนจาก `users`) และ Role Viewer/Editor
3. Copy Link / Download QR Code / กด Share เพื่อบันทึก

**กรณีทางเลือก**
- ตัวเลือก "Collection access permission" (Viewer/Editor) เมื่อเลือก Anyone with the link **ไม่ถูกบันทึก** ⚠️ `ISS-010`
- Copy Link แสดง "Copied" แม้คัดลอกไม่สำเร็จ
- เปิด Modal ใหม่ทุกครั้งรายการเลือกว่างเปล่า → บันทึก Private access โดยไม่เลือกใครจะตั้ง Sharing = Private แม้ยังมีผู้มีสิทธิ์อยู่

**Acceptance Criteria**
- **AC-SYNC-017** Given เลือก Anyone with the link, When กด Share, Then Sharing = Public Link และ Collection ย้ายไปบนสุด
- **AC-SYNC-018** Given เลือก Private access และเลือกผู้ใช้ 1 คน, When กด Share, Then Sharing = Restricted และผู้ใช้ปรากฏใน People with access
- **AC-SYNC-019** Given กด Download QR Code, When สร้างเสร็จ, Then ดาวน์โหลด `{slug}-qr.png` ขนาด 1024 px
- **AC-SYNC-020** Given กด Copy Link, When คลิก, Then Clipboard มี `https://peepshare.com/c/{slug}` และปุ่มแสดง Copied 2 วินาที

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (Local State; ลิงก์ไม่มีปลายทางจริง)
**หลักฐานอ้างอิง:** `src/views/Collections.tsx` (`ShareModal`, `saveSharing`), `src/components/set-event/qr.tsx`

---

### US-SYNC-007 — จัดการผู้มีสิทธิ์และลบ Collection
**ในฐานะ:** เจ้าของ Collection **ฉันต้องการ:** แก้ Role/ถอนสิทธิ์ผู้ใช้ และลบ Collection **เพื่อให้:** ควบคุมการเข้าถึง

**ขั้นตอนการทำงานหลัก:** ⋮ → People with access → ขยายรายชื่อ → เลือก Viewer/Edit หรือ Remove (มีผลทันที); ⋮ → Delete Collection → ยืนยัน → กลับรายการ

**กรณีทางเลือก:** ลบคนสุดท้ายขณะ Restricted → Sharing เปลี่ยนเป็น Private; ปุ่ม Delete ในหน้ารายการและ Download Collection ไม่ทำงาน ⚠️ `ISS-009`

**Acceptance Criteria**
- **AC-SYNC-021** Given Collection Restricted มีผู้มีสิทธิ์ 1 คน, When Remove คนนั้น, Then Sharing = Private
- **AC-SYNC-022** Given เลือก Delete Collection, When ยืนยัน, Then Collection หายจากรายการและกลับหน้ารายการ
- **AC-SYNC-023** Given อยู่หน้ารายการ, When กด Delete ในแถว, Then ⚠️ ไม่มีการทำงาน (พฤติกรรมปัจจุบัน)

**สถานะการพัฒนา:** พัฒนาแล้วบางส่วน
**หลักฐานอ้างอิง:** `src/views/Collections.tsx` (`PeopleAccessModal`, `DeleteConfirmationModal`)

---

### US-SYNC-008 — อัปโหลดและซิงก์รูปภาพ **[ยังไม่ยืนยัน]**
**ในฐานะ:** Photographer **ฉันต้องการ:** อัปโหลดหรือซิงก์รูปจากโฟลเดอร์ **เพื่อให้:** รูปเข้าสู่ Collection ของ Event

**พฤติกรรมปัจจุบัน**
- Collection Detail: ปุ่ม Upload เปิด File Picker แต่ไม่ประมวลผลไฟล์; Photo Sync Modal ให้เลือกโฟลเดอร์แล้ว Continue ไปเมนู Photo Sync (PEEP SYNC) หรือปิด Modal (Set Event)
- หน้า Photo Sync: แสดงตัวเลขจำลอง Progress 94% และ Workflow ภาพนิ่ง ปุ่ม Select Folder, View Gallery, Retry, Details ไม่ทำงาน

**Acceptance Criteria**
- **AC-SYNC-024** Given เปิด Photo Sync และเลือก Event ที่มี photos > 0, When แสดงผล, Then แสดงการ์ด Total/Completed/Processing/Failed และ Progress 94%
- **AC-SYNC-025** Given ใน PEEP SYNC เลือกโฟลเดอร์ใน Photo Sync Modal, When กด Continue, Then ไปยังเมนู Photo Sync (ไม่มีการอัปโหลด)

**สถานะการพัฒนา:** ยังไม่ได้พัฒนา (UI จำลอง) — Flow ที่ต้องการอ้างอิง `Design.md` §21 รอยืนยันจาก PM/Dev `Q-006`
**หลักฐานอ้างอิง:** `src/views/PhotoManagement.tsx`, `src/views/Collections.tsx` (`PhotoSyncModal`)

---

# EVENT — Set Event: รายการ วงจรสถานะ และ Workspace

### US-EVENT-001 — ดูและค้นหารายการ Event
**ในฐานะ:** ผู้ดูแล Event (Set Event) **ฉันต้องการ:** ดูรายการ Event ตามแท็บสถานะ ค้นหา กรอง และเรียงลำดับ **เพื่อให้:** หา Event ที่ต้องจัดการได้เร็ว

**ขั้นตอนการทำงานหลัก**
1. ระบบแสดงแท็บ All, Mine, Published, Draft, Private, Trash พร้อมจำนวน
2. ผู้ใช้ค้นหา (ID, Name, Author, Category), กรอง Ticket type / Status / ช่วงวันที่, คลิกหัวคอลัมน์เพื่อ Sort (ไม่เรียง → น้อยไปมาก → มากไปน้อย → ไม่เรียง)
3. ตารางแสดง 10 รายการต่อหน้า คอลัมน์ Event ID, Event Name, Author, Category, Registrants, Status Event, Event Start Time, Event End Time, Actions

**กรณีทางเลือก**
- ไม่ตรงเงื่อนไข → "No events match your filters" + Clear filters; Trash ว่าง → "Trash is empty"
- ไม่มีแท็บ Pending/Scheduled — ดูได้ผ่าน All หรือ Filter Status ⚠️ `Q-009`
- แท็บ Mine ผูกกับ Author "Suchadas" แบบ Hardcode ⚠️ `ISS-011`

**Acceptance Criteria**
- **AC-EVENT-001** Given เปิด Set Event, When ดูแท็บ, Then จำนวน All = 100, Published = 61, Draft = 19, Private = 20, Trash = 0, Mine = 36 (ข้อมูล Seed)
- **AC-EVENT-002** Given Event สถานะ Trash, When อยู่แท็บ All, Then ไม่แสดง Event นั้น
- **AC-EVENT-003** Given พิมพ์ "  JAS " (มีช่องว่าง), When ผลกรอง, Then ค้นหาแบบตัดช่องว่างและไม่สนตัวพิมพ์ใน ID/Name/Author/Category
- **AC-EVENT-004** Given เลือกช่วงวันที่, When ผลกรอง, Then แสดง Event ที่ช่วงเวลาซ้อนทับกับช่วงที่เลือก (รวมขอบ)
- **AC-EVENT-005** Given คลิกหัวคอลัมน์ Registrants 3 ครั้ง, When คลิกครั้งที่ 3, Then กลับเป็นลำดับเดิม (ไม่เรียง)
- **AC-EVENT-006** Given มีตัวกรอง, When กด Clear, Then ล้าง Filter และคำค้น แต่คงแท็บและ Sort ไว้

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (Seed Data)
**หลักฐานอ้างอิง:** `src/views/set-event/SetEventList.tsx`, `src/components/set-event/EventTable.tsx`, `src/data/setEvents.ts` (`matchesTab`, `countByTab`, `EVENT_TABS`)

---

### US-EVENT-002 — ทำซ้ำ Event (Duplicate)
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** สร้างสำเนา Event **เพื่อให้:** สร้าง Event ใหม่จากของเดิมได้เร็ว

**ขั้นตอนการทำงานหลัก:** กดไอคอน Duplicate → ระบบสร้างสำเนา ID ใหม่ (max+1), ชื่อ "{name} (Copy)", สถานะ Draft, Author = Suchadas, registrants 0 และล้าง QR links, scheduled publish, password → แทรกต่อจากต้นฉบับ → ไฮไลต์ "NEW" 4 วินาที → Toast

**กรณีทางเลือก:** Event สถานะ Trash ไม่มีปุ่ม Duplicate; หากสำเนาถูกตัวกรองซ่อน ระบบสลับไปแท็บ All และล้างตัวกรอง

**Acceptance Criteria**
- **AC-EVENT-007** Given Event Published ที่มี QR links, When Duplicate, Then สำเนามีสถานะ Draft, ไม่มี QR links และ Registrants = 0
- **AC-EVENT-008** Given อยู่แท็บ Published, When Duplicate, Then ระบบสลับไปแท็บ All, เลื่อนไปที่แถวสำเนา และแสดงป้าย NEW

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/views/set-event/SetEventApp.tsx` (`duplicateEvent`), `src/views/set-event/SetEventList.tsx`

---

### US-EVENT-003 — ย้ายไปถังขยะและลบถาวร
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** ย้าย Event ไป Trash และลบถาวร **เพื่อให้:** จัดการ Event ที่ไม่ใช้

**ขั้นตอนการทำงานหลัก**
1. กดไอคอน Delete (Event ที่ไม่ใช่ Trash) → Modal "Move event to Trash?" → Move to Trash → สถานะ Trash
2. ในแท็บ Trash กด Delete → Modal "Delete event permanently?" → Delete Permanently → ลบออกจากรายการ
3. Move to Trash จาก Status Panel ในฟอร์ม → กลับ Event List และเปิด Modal เดียวกัน

**กรณีทางเลือก:** ไม่มี Toast ทั้งสองกรณี ⚠️ `ISS-012`; ลบถาวรไม่บันทึก Activity; การกู้คืน = แก้ไข Event จากแท็บ Trash แล้วเลือกสถานะใหม่ (Unverified ที่ Runtime)

**Acceptance Criteria**
- **AC-EVENT-009** Given Event Published, When ยืนยัน Move to Trash, Then Event อยู่ในแท็บ Trash เท่านั้น และ Activity log ของ Event มีแถว "Moved to Trash"
- **AC-EVENT-010** Given Event ใน Trash, When ยืนยัน Delete Permanently, Then Event หายจากทุกแท็บ
- **AC-EVENT-011** Given เปิด Modal ลบ, When กด Cancel, Then ไม่มีการเปลี่ยนแปลง

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/views/set-event/SetEventApp.tsx` (`handleConfirmDelete`)

---

### US-EVENT-004 — ดูภาพรวม Event (Overview)
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** ดูสรุปการตั้งค่า Event ในหน้าเดียว **เพื่อให้:** ตรวจทานก่อนเผยแพร่

**ขั้นตอนการทำงานหลัก:** คลิกชื่อ Event → Workspace แสดง Overview: การ์ด Registrants, Registration forms, QR links (คลิกได้), Collection files และรายการรายละเอียด 15 แถว (วันที่, ช่วงลงทะเบียน, ประเภท, Organizer, Registration, Capacity, Author, Allow join, Send survey, QR expiry, Format, Location, Online, Collection, Automated messages)

**Acceptance Criteria**
- **AC-EVENT-012** Given Event ไม่มี `maxParticipants` แต่มี registrationType, When ดู Overview, Then Capacity แสดง "Unlimited"
- **AC-EVENT-013** Given คลิกการ์ด QR links, When คลิก, Then ไปยัง Section QR Code / Scanner

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (Registrants เป็นค่า Seed ไม่เปลี่ยนแปลง)
**หลักฐานอ้างอิง:** `src/views/set-event/workspace/EventOverview.tsx`

---

### US-EVENT-005 — เชื่อม Collection กับ Event
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** เลือก Collection ที่ใช้เก็บรูปของ Event **เพื่อให้:** ผู้เข้าร่วมเห็นรูปในที่เดียวกัน

**ขั้นตอนการทำงานหลัก:** Section Collection → Link collection → ค้นหาและเลือกใน Modal → Confirm → Toast "linked"; Unlink → ยกเลิกทันที → Toast

**กรณีทางเลือก:** ปุ่ม Confirm Disable จนกว่าจะเลือก; รายการมาจาก `mockCollections` 6 รายการเท่านั้น (Collection ที่สร้างในเมนู Collections ไม่ปรากฏ) ⚠️ `ISS-013`; Unlink ไม่มีการยืนยัน

**Acceptance Criteria**
- **AC-EVENT-014** Given ยังไม่ได้ลิงก์, When เลือก Collection แล้ว Confirm, Then แสดงการ์ด Collection และ Activity log มีแถว Edited ฟิลด์ Collection
- **AC-EVENT-015** Given ลิงก์อยู่, When กด Unlink, Then แสดง Empty State "No collection linked" ทันที

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (Mock Collections)
**หลักฐานอ้างอิง:** `src/views/set-event/workspace/EventCollection.tsx`, `src/components/set-event/OptionPickerModal.tsx`

---

### US-EVENT-006 — จัดการ QR Link ของ Event
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** สร้างลิงก์และ QR Code สำหรับลงทะเบียน/Check-in/Survey **เพื่อให้:** นำไปพิมพ์หรือแชร์

**ขั้นตอนการทำงานหลัก**
1. Section QR Code / Scanner → New link → กรอก Link name และ URL (ค่าเริ่มต้น `https://peepshare.com/e/{eventId}/`) → ดู QR Preview → Create link
2. ในตาราง: เปิด URL, Copy, Download QR PNG, Delete (ยืนยัน)

**กรณีทางเลือก:** ชื่อว่าง/ซ้ำ (ไม่สนตัวพิมพ์) หรือ URL ไม่ถูกต้อง → แสดง Error หลังกด Create ครั้งแรก; ไม่มีการแก้ไขลิงก์; การเปลี่ยนแปลงไม่ถูกบันทึกใน Activity log ⚠️ `ISS-014`

**Acceptance Criteria**
- **AC-EVENT-016** Given มีลิงก์ชื่อ "Register" อยู่แล้ว, When สร้างลิงก์ชื่อ "register", Then แสดง "A link with this name already exists."
- **AC-EVENT-017** Given URL = "ftp://x", When กด Create link, Then แสดง "Enter a full URL starting with https://"
- **AC-EVENT-018** Given กรอกถูกต้อง, When กด Create link, Then ลิงก์ใหม่อยู่แถวแรกและแสดง Toast "Link “{name}” created"
- **AC-EVENT-019** Given กด Download ที่แถว, When คลิก, Then ดาวน์โหลด PNG 1024 px ชื่อ `{slug(eventName-linkName)}-qr.png`

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (QR สร้างจริงฝั่ง Client; ลิงก์ปลายทางยังไม่มีจริง)
**หลักฐานอ้างอิง:** `src/views/set-event/workspace/EventQrLinks.tsx`, `src/components/set-event/NewLinkModal.tsx`, `src/components/set-event/qr.tsx`

---

### US-EVENT-007 — ดู Activity Log ของ Event
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** ดูประวัติการเปลี่ยนแปลง Event **เพื่อให้:** ตรวจสอบย้อนหลังได้ว่าใครแก้อะไร

**ขั้นตอนการทำงานหลัก:** Section Activity logs → ตาราง Date & Time, User, Action, Field (Section), Old value, New value เรียงล่าสุดก่อน → ค้นหา, กรอง Action, กรอง User

**กรณีทางเลือก:** ไม่มีรายการ → "No activity yet"; Event ที่สร้างในรอบนี้แสดงเฉพาะรายการจริง; Event Seed แสดงประวัติตัวอย่าง (Mock) + รายการจริง

**Acceptance Criteria**
- **AC-EVENT-020** Given แก้ไข Venue Name แล้วบันทึก, When เปิด Activity logs, Then มีแถว Edited Section Location ฟิลด์ Venue name พร้อมค่าเก่า/ใหม่ ผู้ใช้ "Suchadas"
- **AC-EVENT-021** Given เปลี่ยนสถานะจาก Draft เป็น Pending, When เปิด Activity logs, Then มีแถว "Status changed"
- **AC-EVENT-022** Given เปิดใช้รหัสผ่าน, When ดู Activity log, Then ค่าแสดงเป็น "Protected" ไม่แสดงรหัสจริง

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (ประวัติก่อนหน้าเป็น Mock)
**หลักฐานอ้างอิง:** `src/views/set-event/workspace/EventActivityLog.tsx`, `src/data/eventActivity.ts` (`diffActivity`, `TRACKED`, `sampleActivity`)

---

### US-EVENT-008 — ดู Activity Log ระดับระบบ
**ในฐานะ:** ผู้ดูแลระบบ **ฉันต้องการ:** ดู Activity ทั้งระบบ **เพื่อให้:** ตรวจสอบการใช้งาน

**พฤติกรรมปัจจุบัน:** เมนู SYSTEM → Activity Log แสดง 8 รายการ Mock ของ **Event Dashboard** (ไม่ใช่ Set Event) ค้นหา (Action, Details, User), กรอง Event และ User

**กรณีทางเลือก:** การกระทำใน Set Event ไม่ปรากฏ ⚠️ `ISS-015`; ตัวกรอง User เทียบแบบ Case-sensitive และไม่มีตัวเลือก "Admin (Suchada)"

**Acceptance Criteria**
- **AC-EVENT-023** Given เปิด Activity Log, When แสดงผล, Then แสดง "8 entries"
- **AC-EVENT-024** Given ไม่ตรงเงื่อนไข, When กรอง, Then แสดง "No activity found."

**สถานะการพัฒนา:** ใช้ Mock Data / จำลองการทำงาน
**หลักฐานอ้างอิง:** `src/views/ActivityLog.tsx`, `src/data/mock.ts` (`activityLog`)

---

### US-EVENT-009 — ป้องกันการออกจากฟอร์มโดยไม่บันทึก
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** ได้รับคำเตือนเมื่อออกจากฟอร์มที่ยังไม่บันทึก **เพื่อให้:** ไม่สูญเสียข้อมูล

**ขั้นตอนการทำงานหลัก:** แก้ไขฟอร์ม → คลิกเมนู Sidebar / Section ใน Workspace / Back / Breadcrumb → Modal "Discard changes?" → Discard หรือ Cancel

**กรณีทางเลือก:** Header Switch Service, Log Out, Refresh/ปิดแท็บ **ไม่มีการเตือน** ⚠️ `ISS-020`

**Acceptance Criteria**
- **AC-EVENT-025** Given ฟอร์มมีการแก้ไข, When คลิกเมนู Collections ใน Sidebar, Then แสดง Modal "Discard changes?" และไม่เปลี่ยนหน้าจนกว่าจะกด Discard

**สถานะการพัฒนา:** พัฒนาแล้วบางส่วน
**หลักฐานอ้างอิง:** `src/views/set-event/SetEventApp.tsx` (`guarded`, `pendingNav`)

---

# EFORM — Set Event: ฟอร์มสร้าง/แก้ไข Event

### US-EFORM-001 — สร้าง Event ทีละขั้นตอน
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** กรอกข้อมูล Event ทีละ Step **เพื่อให้:** ไม่พลาดข้อมูลที่จำเป็น

**ขั้นตอนการทำงานหลัก**
1. กด Create Event → Step 1 Event Info (Information, Schedule)
2. กด Next → ระบบ Validate เฉพาะ Section ของ Step ปัจจุบันด้วยกฎ Complete → ผ่านจึงไป Step 2 Venue & Registration → Step 3 Attendee Experience (Collection, Event Form, Survey Form) → Step 4 Communication
3. Step ที่ยังไม่ถึงจะกดไม่ได้; ย้อน Step ที่ผ่านแล้วได้โดยไม่ Validate

**Acceptance Criteria**
- **AC-EFORM-001** Given Create Event Step 1 ว่างทั้งหมด, When กด Next, Then แสดง Error ที่ Event Name, Event Type, Organizer, Event Date & Time และไม่ไป Step 2
- **AC-EFORM-002** Given อยู่ Step 1 ของ Create, When ดู Stepper, Then Step 2–4 ถูก Disable
- **AC-EFORM-003** Given กรอก Step 1 ครบ, When กด Next, Then ไป Step 2 และ Error ถูกล้าง
- **AC-EFORM-004** Given โหมด Edit, When กด Next หรือคลิก Step ใดก็ได้, Then เปลี่ยน Step ได้โดยไม่ Validate และ Stepper แสดงสถานะราย Section (Filled in / Missing required info / Needs attention / Not set)

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/views/set-event/EventFormPage.tsx` (`STEPS`, `next`, `goToStep`), `src/components/set-event/form/FormStepper.tsx`

---

### US-EFORM-002 — บันทึกแบบร่าง (Save Draft)
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** บันทึก Event ที่ยังไม่ครบเป็น Draft **เพื่อให้:** กลับมาทำต่อภายหลัง

**ขั้นตอนการทำงานหลัก:** กด Save Draft ใน Step ใดก็ได้ → ระบบตรวจเฉพาะรูปแบบข้อมูล (เช่น วันสิ้นสุดต้องหลังวันเริ่ม, URL, Lat/Lng) → บันทึกสถานะ Draft → กลับ Event List → Toast "“{name}” saved as draft"

**กรณีทางเลือก:** ข้อมูลรูปแบบผิดยังบล็อกการบันทึก Draft; วันที่ที่ไม่มีเวลาจะถูกบันทึกเป็นค่าว่าง ⚠️ `ISS-016`

**Acceptance Criteria**
- **AC-EFORM-005** Given กรอกเฉพาะ Event Name, When กด Save Draft, Then บันทึกสำเร็จ Event อยู่บนสุดของรายการสถานะ Draft
- **AC-EFORM-006** Given วันสิ้นสุดก่อนวันเริ่ม, When กด Save Draft, Then แสดง "The event must end after it starts." และไม่บันทึก

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/views/set-event/EventFormPage.tsx` (`submit`), `src/views/set-event/event-form/formModel.ts` (`validate`, `fromForm`)

---

### US-EFORM-003 — ส่งตรวจและเผยแพร่ Event
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** ส่ง Event เข้า Review แล้วจึงเผยแพร่/ตั้งเวลา/เผยแพร่แบบ Private **เพื่อให้:** ควบคุมคุณภาพก่อนเผยแพร่

**ขั้นตอนการทำงานหลัก**
1. Create Event (Step 4) หรือ Submit to Review (Edit ของ Draft) → Validate Complete → สถานะ Pending → เปิด Event Detail และไฮไลต์ปุ่ม Publish
2. Status Panel: เลือก Published / Scheduled (+วันเวลา) / Private, ตั้ง Password (≥ 4 ตัวอักษร)
3. กด Publish/Schedule → Validate Complete → สถานะตามที่เลือก → Toast

**กรณีทางเลือก**
- สถานะที่บันทึกไม่ใช่ Pending/Private/Scheduled → ปุ่ม Publish Disable พร้อม Tooltip "Submit to Review before publishing"
- Scheduled และ Published ใน Panel ถูกล็อกจนกว่าจะผ่าน Review
- เวลา Scheduled ต้องอยู่ในอนาคต
- ในโหมด Create เลือก Private แล้วกด Save ได้โดยไม่ผ่าน Review `Q-010`

**Acceptance Criteria**
- **AC-EFORM-007** Given ฟอร์มครบถ้วนใน Create, When กด Create Event, Then สถานะ = Pending, เปิด Workspace Section Event Detail และ Toast "submitted for review"
- **AC-EFORM-008** Given Event สถานะ Draft (Edit), When ดูปุ่ม Publish, Then ปุ่ม Disable
- **AC-EFORM-009** Given Event Pending, When กด Publish (สถานะใน Panel = Pending), Then สถานะ = Published
- **AC-EFORM-010** Given เลือก Scheduled และเวลาในอดีต, When กด Schedule, Then แสดง "Choose a date and time in the future." และ Status Panel เปิดขึ้น
- **AC-EFORM-011** Given เปิด Password protected และกรอก 3 ตัว, When บันทึก, Then แสดง "Use at least 4 characters."

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (ไม่มีการเผยแพร่จริงและไม่มี Auto-publish)
**หลักฐานอ้างอิง:** `src/views/set-event/EventFormPage.tsx` (`resultingStatus`, `canPublish`, `showPublish`, `reviewFlow`), `src/components/set-event/StatusVisibilityPanel.tsx`

---

### US-EFORM-004 — ตั้งค่าสถานที่ (Location)
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** ระบุรูปแบบ Event และสถานที่/ลิงก์ออนไลน์ **เพื่อให้:** ผู้เข้าร่วมรู้วิธีเข้าร่วม

**ขั้นตอนการทำงานหลัก:** เลือก Event Format (Offline / Online / Hybrid) → Offline/Hybrid: Venue Name*, Address, Google Maps Link, Latitude, Longitude, Map Preview → Online/Hybrid: Online Platform, Meeting / Event URL*, Access Instructions

**กรณีทางเลือก:** วาง Google Maps Link ที่มีพิกัด → เติม Lat/Lng อัตโนมัติ; พิกัดถูกต้อง → แสดง Google Maps Embed; ข้อมูลส่วนที่ไม่ตรง Format จะถูกล้างเมื่อบันทึก

**Acceptance Criteria**
- **AC-EFORM-012** Given เลือก Hybrid, When ดู Section, Then แสดงทั้ง "Physical Location" และ "Online Event Information"
- **AC-EFORM-013** Given วางลิงก์ที่มี `@13.7466,100.5393`, When ลิงก์เปลี่ยน, Then Latitude = 13.7466, Longitude = 100.5393 และแสดง Map Preview
- **AC-EFORM-014** Given Latitude = 95, When บันทึก, Then แสดง "Latitude must be a number between -90 and 90."

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/views/set-event/event-form/LocationSection.tsx`, `formModel.ts` (`coordsFromMapLink`, `hasPhysicalLocation`, `hasOnlineLocation`)

---

### US-EFORM-005 — ตั้งค่าการลงทะเบียน
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** กำหนดประเภทการลงทะเบียน ค่าธรรมเนียม และจำนวนผู้เข้าร่วม **เพื่อให้:** ควบคุมการรับผู้เข้าร่วม

**ขั้นตอนการทำงานหลัก:** เลือก Registration Type (Free / Paid) → Paid: Registration Fee (THB)*, Payment Methods* (PromptPay, Credit / Debit Card, Bank Transfer) → Capacity Unlimited/Limited (+Maximum Participants*) → Allow join (Active join / Closed)

**Acceptance Criteria**
- **AC-EFORM-015** Given เลือก Paid และไม่เลือก Payment Method, When บันทึกแบบ Complete, Then แสดง "Select at least one payment method."
- **AC-EFORM-016** Given Limited และกรอก "abc", When พิมพ์, Then ช่องตัดอักขระที่ไม่ใช่ตัวเลขออก
- **AC-EFORM-017** Given Fee = 0, When บันทึก, Then แสดง "Enter a fee greater than 0."

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (ไม่มีระบบชำระเงินจริง)
**หลักฐานอ้างอิง:** `src/views/set-event/event-form/RegistrationSection.tsx`, `formModel.ts`

---

### US-EFORM-006 — สร้างฟอร์มลงทะเบียน (Event Form) และแบบสำรวจ (Survey Form)
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** สร้างคำถามสำหรับผู้ลงทะเบียนและแบบสำรวจหลังงาน **เพื่อให้:** เก็บข้อมูลที่ Event ต้องการ

**ขั้นตอนการทำงานหลัก**
1. "Require Event Form?" = Yes → Use Template (ถ้ามี) → กรอก Form Name*, Form Description → Add Form Field / Add section
2. ประเภทฟิลด์: Short Text, Long Text, Single Choice, Multiple Choice, Dropdown, Rating (Star), Section Heading; ตั้ง Required/Optional; เลื่อนขึ้น/ลง; ลบ
3. "Send Survey Form?" = Yes → Send Survey (วันเวลา)* → Survey Name*, Survey Questions

**กรณีทางเลือก:** Use Template เมื่อมีฟิลด์อยู่แล้ว → ยืนยัน "Replace current form?"; ลบฟิลด์ไม่มีการยืนยัน

**Acceptance Criteria**
- **AC-EFORM-018** Given เปิด Event Form แต่ไม่มีฟิลด์, When บันทึกแบบ Complete, Then แสดง "Add at least one field."
- **AC-EFORM-019** Given ฟิลด์ประเภท Dropdown ไม่มีตัวเลือก, When บันทึกแบบ Complete, Then แสดง "Add at least one option."
- **AC-EFORM-020** Given เปลี่ยนประเภทเป็น Single Choice และยังไม่มีตัวเลือก, When เปลี่ยน, Then ระบบเติม "Option 1", "Option 2"
- **AC-EFORM-021** Given ปิด Event Form (No) หลังกรอกแล้ว, When บันทึก, Then ข้อมูลฟอร์มถูกเก็บไว้ด้วย `enabled:false`

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (ไม่มีหน้าฝั่งผู้เข้าร่วมที่ใช้ฟอร์มนี้)
**หลักฐานอ้างอิง:** `src/views/set-event/event-form/AttendeeFormSection.tsx`, `SurveyFormSection.tsx`, `src/components/set-event/form/EventFormBuilder.tsx`, `TemplatePicker.tsx`

---

### US-EFORM-007 — ใส่ Banner และคำอธิบาย Event
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** อัปโหลดรูป Banner และเขียนคำอธิบายแบบ Rich Text **เพื่อให้:** หน้า Event สวยงามและครบถ้วน

**ขั้นตอนการทำงานหลัก:** Banner in Event Detail (แนะนำ 1200 × 1200, 1:1) และ Banner in Card Event (แนะนำ 200 × 100, 2:1) — ลากวางหรือ Browse; Description ใช้ Rich Text Editor (ตัวหนา, สี, Heading, List, ลิงก์, รูป, วิดีโอ, ไฟล์แนบ, Undo/Redo)

**Acceptance Criteria**
- **AC-EFORM-022** Given เลือกไฟล์ .gif, When อัปโหลด, Then แสดง "Only JPEG and PNG images are supported."
- **AC-EFORM-023** Given เลือกไฟล์ JPEG ขนาด 60 MB, When อัปโหลด, Then แสดง "The file is larger than 50MB."

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (ไฟล์เก็บเป็น Blob URL ในเบราว์เซอร์ ไม่อัปโหลดจริง ⚠️ `GAP-006`)
**หลักฐานอ้างอิง:** `src/components/set-event/BannerDropzone.tsx`, `src/components/set-event/RichTextEditor.tsx`, `InformationSection.tsx`

---

### US-EFORM-008 — ดูตัวอย่าง Event (Preview)
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** ดูตัวอย่างหน้า Event **เพื่อให้:** ตรวจสอบก่อนเผยแพร่

**ขั้นตอนการทำงานหลัก:** กดไอคอน Preview → Modal แสดง Banner, สถานะ, Category, ชื่อ, ช่วงเวลา, คำอธิบาย; หรือกด Open preview in new tab → เปิดแท็บใหม่ (Blob URL หมดอายุใน 60 วินาที)

**Acceptance Criteria**
- **AC-EFORM-024** Given ไม่มีคำอธิบาย, When เปิด Preview, Then แสดง "No description yet."

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/components/set-event/EventPreviewModal.tsx`

---

### US-EFORM-009 — ยกเลิกการแก้ไข
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** ยืนยันก่อนทิ้งข้อมูลที่แก้ไข **เพื่อให้:** ไม่เสียข้อมูลโดยไม่ตั้งใจ

**ขั้นตอนการทำงานหลัก:** Step 1 กด Cancel → มีการแก้ไข → Modal "Discard changes?" → Discard → กลับ Event List

**Acceptance Criteria**
- **AC-EFORM-025** Given ไม่มีการแก้ไข, When กด Cancel, Then กลับ Event List ทันทีโดยไม่มี Modal

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/views/set-event/EventFormPage.tsx` (`isDirty`, `leave`)

---

# COMM — Communication / Broadcast Automation

### US-COMM-001 — เปิดใช้ข้อความอัตโนมัติ
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** เปิดการสื่อสารอัตโนมัติและระบุ PEEP OA ที่ส่งข้อความ **เพื่อให้:** ผู้เข้าร่วมได้รับข้อความตาม Journey

**ขั้นตอนการทำงานหลัก:** Step 4 → เปิด "Enable automated messages" → กรอก PEEP OA ID* และ Community ID → ระบบเติม `#` นำหน้าเมื่อออกจากช่อง

**Acceptance Criteria**
- **AC-COMM-001** Given เปิด Communication และ PEEP OA ID ว่าง, When บันทึกแบบ Complete, Then แสดง "Enter the PEEP OA ID that sends these messages."
- **AC-COMM-002** Given กรอก "OA_Test", When บันทึก, Then แสดง "Use lowercase letters, numbers and hyphens, e.g. #oa-mono-max-official-account."

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (ไม่ตรวจสอบ OA ID กับระบบจริง)
**หลักฐานอ้างอิง:** `src/views/set-event/event-form/CommunicationSection.tsx`, `src/data/automations.ts` (`normalizeOaId`)

---

### US-COMM-002 — สร้างและแก้ไข Broadcast Automation
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** กำหนดข้อความที่ส่งตาม Trigger และเวลา **เพื่อให้:** สื่อสารกับผู้เข้าร่วมอัตโนมัติ

**ขั้นตอนการทำงานหลัก**
1. Add Broadcast → Drawer: Automation Name*, Trigger* (After Registration / Before Event / After Check-in / After Event / Specific Date & Time), Timing, Channel (PEEP OA เท่านั้น)
2. เพิ่มข้อความ 1–5 ข้อความ ประเภท Text (≤1000 ตัวอักษร), Image, Claim Gift; Event Card / Coupon / Link แสดง "Coming soon"
3. แทรกตัวแปร `{{user_name}}`, `{{event_name}}`, `{{event_date}}`, `{{event_time}}`, `{{event_location}}`, `{{qr_code}}`, `{{registration_id}}` → ดู Preview → Save Automation

**Acceptance Criteria**
- **AC-COMM-003** Given Trigger = Before Event และ Delay ว่าง, When เลือก Trigger, Then ระบบตั้งค่า 1 day
- **AC-COMM-004** Given มีข้อความ 5 ข้อความ, When ดูปุ่มเพิ่ม, Then แสดง "You’ve reached the maximum of 5 messages."
- **AC-COMM-005** Given ข้อความ Text ว่าง, When กด Save Automation, Then แสดง "Write the message."
- **AC-COMM-006** Given ข้อความมี `{{event_name}}`, When ดู Preview, Then แทนค่าด้วยชื่อ Event ปัจจุบัน (หรือค่าตัวอย่างหากว่าง)

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (เก็บค่าเท่านั้น)
**หลักฐานอ้างอิง:** `src/components/set-event/automation/AutomationEditor.tsx`, `MessageEditor.tsx`, `TimingSelector.tsx`, `MessagePreview.tsx`, `src/data/automations.ts`

---

### US-COMM-003 — จัดการรายการ Automation
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** เปิด/ปิด ทำซ้ำ และลบ Automation **เพื่อให้:** ปรับ Journey ได้

**ขั้นตอนการทำงานหลัก:** Event ใหม่มี 3 Automation เริ่มต้น (Registration Confirmation, Check-in Welcome, Special Event Promotion) → การ์ดแต่ละรายการ: Edit, Duplicate, Delete (ยืนยัน), Toggle On/Off; Journey แสดงจำนวน Automation ที่เปิดต่อ Stage

**Acceptance Criteria**
- **AC-COMM-007** Given Create Event ใหม่และเปิด Communication, When ดูรายการ, Then มี 3 Automation เริ่มต้น
- **AC-COMM-008** Given กด Duplicate, When สำเร็จ, Then มีการ์ด "{name} (Copy)" ต่อจากต้นฉบับ

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/views/set-event/event-form/CommunicationSection.tsx`, `src/components/set-event/automation/AutomationCard.tsx`, `AutomationJourney.tsx`

---

### US-COMM-004 — ส่งข้อความจริงตาม Automation **[ยังไม่ยืนยัน]**
**ในฐานะ:** ผู้เข้าร่วม Event **ฉันต้องการ:** ได้รับข้อความจาก PEEP OA ตามเหตุการณ์ **เพื่อให้:** ทราบข้อมูลสำคัญ

**พฤติกรรมปัจจุบัน:** ไม่มีโค้ดส่งข้อความ ตั้งเวลา หรือเรียก API — Automation ถูกเก็บใน `details.communication.automations` เท่านั้น

**Acceptance Criteria**
- **AC-COMM-009** TBD — รอยืนยันจาก PM/Dev (Scheduler, Delivery, Retry, Timezone) `Q-011`

**สถานะการพัฒนา:** ยังไม่ได้พัฒนา
**หลักฐานอ้างอิง:** ไม่มี (ค้นหาแล้วไม่พบ)

---

# TPL — Template Library

### US-TPL-001 — ดูและค้นหา Template
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** ดูคลัง Template ฟอร์มลงทะเบียนและแบบสำรวจ **เพื่อให้:** เลือก Template ที่เหมาะสม

**ขั้นตอนการทำงานหลัก:** เมนู FORMS → Regis Form (6 Template) หรือ Survey Form (4 Template) → ตาราง Template, Fields, Used in, Last updated, Actions → ค้นหาชื่อ/คำอธิบาย

**Acceptance Criteria**
- **AC-TPL-001** Given เปิด Regis Form, When แสดงผล, Then มี 6 Template และ Workshop Sign-up แสดง "16 events"
- **AC-TPL-002** Given ค้นหาไม่พบ, When กรอง, Then แสดง "No templates match your search."

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (Session State)
**หลักฐานอ้างอิง:** `src/views/set-event/FormLibrary.tsx`, `src/data/formTemplates.ts`

---

### US-TPL-002 — สร้างและแก้ไข Template
**ในฐานะ:** ผู้ดูแล Event **ฉันต้องการ:** สร้าง/แก้ไข Template **เพื่อให้:** ใช้ซ้ำในหลาย Event

**ขั้นตอนการทำงานหลัก:** Create Template หรือ Edit Template → กรอก Template Name*, Template Description, ฟิลด์ → Save → Toast "created"/"saved" → กลับโหมด View

**กรณีทางเลือก:** ปิด Drawer ระหว่างแก้ไขไม่มีการเตือน; แก้ Template ไม่กระทบ Event ที่ใช้อยู่ (Event เก็บสำเนา)

**Acceptance Criteria**
- **AC-TPL-003** Given ชื่อว่าง, When กด Save, Then แสดง "Enter a template name."
- **AC-TPL-004** Given มีเฉพาะ Section Heading, When กด Save, Then แสดง "Add at least one field."

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/views/set-event/FormLibrary.tsx` (`TemplateDrawer`)

---

### US-TPL-003 — ทำซ้ำและลบ Template
**ขั้นตอนการทำงานหลัก:** Duplicate → สำเนา "(Copy)" เปิดในโหมด Edit; Delete → ยืนยัน "Delete this template?" → ลบ (อนุญาตแม้ Template ถูกใช้อยู่)

**Acceptance Criteria**
- **AC-TPL-005** Given Template ถูกใช้ใน 16 Event, When ลบ, Then ลบสำเร็จและ Event เดิมยังคงมีฟอร์มของตัวเอง
- **AC-TPL-006** Given กด Duplicate, When สำเร็จ, Then Drawer เปิดสำเนาในโหมด Edit และ Toast "“{name} (Copy)” created"

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/views/set-event/FormLibrary.tsx`

---

### US-TPL-004 — ใช้ Template ในฟอร์ม Event
**ขั้นตอนการทำงานหลัก:** ในฟอร์ม Event → Use Template → เลือก → คัดลอกชื่อ คำอธิบาย และฟิลด์ (ID ใหม่) และจำ `templateId`; จาก Drawer View คลิก "#id ชื่อ Event" เพื่อเปิด Event นั้น

**Acceptance Criteria**
- **AC-TPL-007** Given สร้าง Template ใหม่ในเมนู Regis Form, When เปิดฟอร์ม Event → Use Template, Then Template ใหม่ปรากฏในรายการ
- **AC-TPL-008** Given คลิก Event ในส่วน "Used in events", When คลิก, Then เปิด Event นั้นที่ Section Event Detail

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/components/set-event/form/TemplatePicker.tsx`, `src/views/set-event/SetEventApp.tsx` (`onOpenEvent`)

---

# MEDIA — Media Ads

### US-MEDIA-001 — ดูรายการ Banner / Cover Page
**ในฐานะ:** ผู้ดูแลการตลาด **ฉันต้องการ:** ดูรายการ Banner/Cover Page พร้อมสถานะการแสดงผล **เพื่อให้:** รู้ว่าแอปแสดงอะไรอยู่

**ขั้นตอนการทำงานหลัก:** เลือกเมนู → Loading Skeleton (Mock 450 ms) → ตารางเรียงตาม Priority: ลำดับ+รูป, Name, Click Action, Display Period, (Show Frequency — Cover), Status, Actions → ข้อความ "{live} of {total} ... showing in the app now" → ค้นหาและกรอง Status / Click Action / Show Frequency / Display period

**กรณีทางเลือก:** ไม่มีข้อมูล → "No banners yet" + Create; ไม่ตรงเงื่อนไข → Clear filters; Error State "Couldn't load ..." + Retry มีใน UI แต่ Mock ไม่เคยเกิด Error

**Acceptance Criteria**
- **AC-MEDIA-001** Given เปิด Home page banner, When โหลดเสร็จ, Then แสดง 7 รายการเรียงตาม Priority
- **AC-MEDIA-002** Given กรอง Status = Scheduled, When ผลกรอง, Then แสดงเฉพาะรายการที่ `startAt` อยู่ในอนาคต
- **AC-MEDIA-003** Given กรองช่วงวันที่, When ผลกรอง, Then รายการแบบ Always ผ่านตัวกรองเสมอ
- **AC-MEDIA-004** Given มีตัวกรอง, When กด Clear all, Then ล้างการค้นหาและตัวกรองทั้งหมด

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (Mock API)
**หลักฐานอ้างอิง:** `src/views/set-event/promo/PromoList.tsx`, `PromoManager.tsx`, `src/data/appBanners.ts` (`displayStatus`, `overlapsPeriod`)

---

### US-MEDIA-002 — สร้างและแก้ไข Banner / Cover Page
**ในฐานะ:** ผู้ดูแลการตลาด **ฉันต้องการ:** สร้าง/แก้ไขรายการพร้อมรูป ช่วงเวลา และ Click Action **เพื่อให้:** โปรโมตเนื้อหาในแอป

**ขั้นตอนการทำงานหลัก**
1. กรอก Name* (≤80), Image* (JPEG/PNG ≤50 MB), Status (Active/Inactive/Draft)
2. Display Period: Always หรือ Schedule (Start*/End*)
3. (Cover) Show Frequency: Every app open / Once per day / Once only
4. Click Action: No Action / External URL* / App Page* / Content (Type* + ID*) / Coupon* (ค้นหา)
5. ดู Live Preview → Save → Toast "created/updated successfully."

**Acceptance Criteria**
- **AC-MEDIA-005** Given ชื่อว่างและไม่มีรูป, When กด Save, Then แสดง "Enter a banner name." และ "Upload a banner image." และ Focus ช่องแรกที่ผิด
- **AC-MEDIA-006** Given Schedule และ End < Start, When Save, Then แสดง "The end can't be earlier than the start."
- **AC-MEDIA-007** Given External URL = "example.com", When Save, Then แสดง "Enter a valid link, starting with https://"
- **AC-MEDIA-008** Given บันทึกรายการใหม่, When กลับรายการ, Then รายการใหม่อยู่ลำดับสุดท้าย
- **AC-MEDIA-009** Given เปลี่ยน Click Action จาก URL เป็น No Action, When Save, Then ค่า URL ถูกล้าง

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (Mock API; Content ID เป็นข้อความอิสระไม่ตรวจสอบ ⚠️ `ISS-017`)
**หลักฐานอ้างอิง:** `src/views/set-event/promo/PromoForm.tsx` (`validate`), `src/data/appBanners.ts`, `src/data/mock/promoApi.ts`

---

### US-MEDIA-003 — เปิด/ปิดการแสดงผลและทำซ้ำ
**ขั้นตอนการทำงานหลัก:** เมนู ⋮ → Deactivate (Active/Scheduled → ยืนยัน; Expired → ทันที) / Activate (ทันที, Draft → Active) / Duplicate (สำเนา Draft "(Copy)" → เปิด Edit)

**Acceptance Criteria**
- **AC-MEDIA-010** Given รายการแสดงอยู่ (Active), When กด Deactivate, Then แสดง Modal ยืนยัน และหลังยืนยันสถานะ = Inactive + Toast "deactivated."
- **AC-MEDIA-011** Given รายการ Draft, When กด Activate, Then สถานะ configured = active ทันที
- **AC-MEDIA-012** Given กด Duplicate, When สำเร็จ, Then Toast "... duplicated. It's saved as a draft." และเปิดฟอร์ม Edit ของสำเนา

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/views/set-event/promo/PromoList.tsx`, `PromoManager.tsx`

---

### US-MEDIA-004 — จัดลำดับการแสดงผล
**ขั้นตอนการทำงานหลัก:** Sort {noun} (ต้องมี ≥2 รายการ) หรือ ⋮ → Change Priority → ลาก (Desktop) หรือกดลูกศร → Save Order

**Acceptance Criteria**
- **AC-MEDIA-013** Given ยังไม่เปลี่ยนลำดับ, When ดูปุ่ม Save Order, Then ปุ่ม Disable
- **AC-MEDIA-014** Given เลื่อนรายการลงหนึ่งลำดับแล้ว Save Order, When กลับรายการ, Then Priority อัปเดตและ Toast "order saved."

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (ไม่มีการเตือนเมื่อออกโดยไม่บันทึกลำดับ)
**หลักฐานอ้างอิง:** `src/views/set-event/promo/PromoSort.tsx`

---

### US-MEDIA-005 — ลบ Banner / Cover Page
**ขั้นตอนการทำงานหลัก:** ⋮ → Delete → Modal "Delete {noun}?" → Delete → ลบถาวรและจัดเรียง Priority ใหม่ → Toast "deleted."

**Acceptance Criteria**
- **AC-MEDIA-015** Given ลบรายการลำดับ 2 จาก 7, When สำเร็จ, Then เหลือ 6 รายการ Priority 1–6 ต่อเนื่อง

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend
**หลักฐานอ้างอิง:** `src/data/mock/promoApi.ts` (`remove`), `PromoList.tsx`

---

### US-MEDIA-006 — เตือนก่อนทิ้งการแก้ไข
**ขั้นตอนการทำงานหลัก:** ฟอร์มมีการแก้ไข → Back / Cancel / เปลี่ยนเมนู Sidebar → Modal "Discard changes?"

**Acceptance Criteria**
- **AC-MEDIA-016** Given ฟอร์มมีการแก้ไข, When คลิกเมนู Community page, Then แสดง "Discard changes?" และอยู่หน้าเดิมจนกว่าจะกด Discard

**สถานะการพัฒนา:** พัฒนาแล้วบางส่วน (Header Switch Service / Log Out / Refresh ไม่ถูกป้องกัน)
**หลักฐานอ้างอิง:** `src/views/MediaAdsApp.tsx`, `PromoForm.tsx`

---

# ADMIN — User Management

### US-ADMIN-001 — ดูรายชื่อผู้ใช้
**ขั้นตอนการทำงานหลัก:** Select Service → Profile → User management → ตาราง User, PEEP SHARE ID, Assigned Events, Role, Status, Last Active → ค้นหา (Name, ID, Email) → กรอง Role (Event Admin, Event Staff, Photographer, Viewer)

**Acceptance Criteria**
- **AC-ADMIN-001** Given เปิด Users, When แสดงผล, Then แสดง "7 users in the system"
- **AC-ADMIN-002** Given ค้นหา "pps004", When ผลกรอง, Then แสดง Nong Pattaraporn

**สถานะการพัฒนา:** พัฒนาแล้วใน Frontend (Mock Data; ตัวกรองไม่มี Super Admin/Data Viewer)
**หลักฐานอ้างอิง:** `src/views/UserManagement.tsx`, `src/views/AccountAdminPage.tsx`

---

### US-ADMIN-002 — ระงับและคืนสิทธิ์ผู้ใช้
**ขั้นตอนการทำงานหลัก:** กด Suspend / Reactivate → สถานะสลับทันที (ไม่มีการยืนยัน/เหตุผล/Toast)

**Acceptance Criteria**
- **AC-ADMIN-003** Given ผู้ใช้ Active, When กด Suspend, Then สถานะเป็น Suspended; When เปลี่ยนไปเมนู Roles แล้วกลับมา, Then ⚠️ สถานะกลับเป็นค่าเดิม `ISS-018`

**สถานะการพัฒนา:** พัฒนาแล้วบางส่วน (Local State ชั่วคราว)
**หลักฐานอ้างอิง:** `src/views/UserManagement.tsx`

---

### US-ADMIN-003 — ดูรายละเอียดผู้ใช้
**ขั้นตอนการทำงานหลัก:** กด View → โปรไฟล์ + Assigned Events + Recent Activity

**Acceptance Criteria**
- **AC-ADMIN-004** Given เปิดรายละเอียดผู้ใช้ใดก็ได้, When ดู Recent Activity, Then ⚠️ แสดง 3 รายการเดียวกันสำหรับทุกคน (Hardcode)

**สถานะการพัฒนา:** ใช้ Mock Data / จำลองการทำงาน
**หลักฐานอ้างอิง:** `src/views/UserManagement.tsx` (`UserDetail`)

---

### US-ADMIN-004 — จัดการ Role และ Permission
**ขั้นตอนการทำงานหลัก:** Roles & Permissions → ตาราง 6 Role → Edit → Permission Matrix 7 หมวด → ติ๊ก → Save Changes; Create Role → Modal (Name, Description, Permissions) → Create Role

**กรณีทางเลือก:** Save Changes ไม่มีการทำงาน, Create Role ปิด Modal โดยไม่บันทึก, View Users ไม่มีการทำงาน ⚠️ `ISS-019`; ไม่มี Validation

**Acceptance Criteria**
- **AC-ADMIN-005** Given เปิด Role Detail, When ติ๊ก Permission, Then Checkbox เปลี่ยนสถานะ
- **AC-ADMIN-006** Given ติ๊กแล้วกด Save Changes, When คลิก, Then ⚠️ ไม่มีการบันทึก (พฤติกรรมปัจจุบัน)
- **AC-ADMIN-007** Given กรอก Create Role แล้วกด Create Role, When Modal ปิด, Then ⚠️ ไม่มี Role ใหม่ในตาราง

**สถานะการพัฒนา:** ยังไม่ได้พัฒนา (มีเฉพาะ UI)
**หลักฐานอ้างอิง:** `src/views/RoleManagement.tsx` (`CreateRoleModal`, `RoleDetail`), `src/data/mock.ts` (`roles`, `allPermissions`)

---

### US-ADMIN-005 — เพิ่ม แก้ไข และลบผู้ใช้ **[ยังไม่ยืนยัน]**
**พฤติกรรมปัจจุบัน:** ไม่มีปุ่ม Add User หรือ Delete User; ปุ่ม Edit ไม่มีการทำงาน

**Acceptance Criteria**
- **AC-ADMIN-008** TBD — รอยืนยันจาก PM/Dev (ผู้ใช้มาจากระบบ PEEP SHARE ID เดิมหรือสร้างใหม่) `Q-012`

**สถานะการพัฒนา:** ยังไม่ได้พัฒนา
**หลักฐานอ้างอิง:** `src/views/UserManagement.tsx`
