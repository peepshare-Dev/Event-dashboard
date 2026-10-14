// Thai for the "shell" area. English text (exactly as written in t('...')) → Thai.
const dict: Record<string, string> = {
  // Header / user menu
  'Open menu': 'เปิดเมนู',
  'Close menu': 'ปิดเมนู',
  'Preview as': 'ดูตัวอย่างในฐานะ',
  Language: 'ภาษา',
  'User menu': 'เมนูผู้ใช้',
  'Expand sidebar': 'ขยายแถบด้านข้าง',
  'Collapse sidebar': 'ย่อแถบด้านข้าง',

  // Roles
  'Event Admin': 'ผู้ดูแลอีเวนต์',
  'Event Staff': 'ทีมงานอีเวนต์',
  Suspended: 'ถูกระงับ',
  Completed: 'เสร็จสิ้น',

  // Navigation section titles
  'EVENT MANAGEMENT': 'จัดการอีเวนต์',
  EVENT: 'อีเวนต์',
  CLOUD: 'คลาวด์',
  PHOTOS: 'รูปภาพ',
  FORMS: 'ฟอร์ม',
  SYSTEM: 'ระบบ',
  'USER MANAGEMENT': 'จัดการผู้ใช้',

  // Navigation items
  'Photo Sync': 'ซิงค์รูปภาพ',
  'Regis Form': 'ฟอร์มลงทะเบียน',
  'Survey Form': 'ฟอร์มแบบสอบถาม',
  'System Settings': 'ตั้งค่าระบบ',
  'Set Banner in App': 'ตั้งค่าแบนเนอร์ในแอป',
  'Home page': 'หน้าแรก',
  'Community page': 'หน้าคอมมูนิตี้',
  'Set Cover Page in App': 'ตั้งค่าหน้าปกในแอป',
  Users: 'ผู้ใช้',
  'Roles & Permissions': 'บทบาทและสิทธิ์',

  // Event workspace sidebar
  Overview: 'ภาพรวม',
  'Event Detail': 'รายละเอียดอีเวนต์',
  'QR Code / Scanner': 'QR Code / สแกนเนอร์',
  'Activity logs': 'บันทึกกิจกรรม',
  'Event management': 'จัดการอีเวนต์',
  'Collapse event menu': 'ย่อเมนูอีเวนต์',
  'Expand event menu': 'ขยายเมนูอีเวนต์',

  // Services
  'Event Dashboard': 'Event Dashboard',
  'Set Event': 'Set Event',
  'Media Ads': 'Media Ads',
  Coupon: 'คูปอง',
  'Photographer Workspace': 'พื้นที่ทำงานช่างภาพ',
  'User Management': 'จัดการผู้ใช้',
  'Manage and monitor event activities, participants, and event performance.':
    'จัดการและติดตามกิจกรรม ผู้เข้าร่วม และผลลัพธ์ของอีเวนต์',
  'Configure and manage event settings, information, and event structure.':
    'ตั้งค่าและจัดการการตั้งค่า ข้อมูล และโครงสร้างของอีเวนต์',
  'Manage in-app banners and cover pages shown in the Peep Share app.':
    'จัดการแบนเนอร์และหน้าปกที่แสดงในแอป Peep Share',
  'Photographer workspace to view assigned events and upload, sync, and manage event photos in the cloud.':
    'พื้นที่ทำงานสำหรับช่างภาพ ดูอีเวนต์ที่ได้รับมอบหมาย อัปโหลด ซิงค์ และจัดการรูปภาพอีเวนต์บนคลาวด์',
  'Create, manage, and monitor coupons and promotional campaigns.':
    'สร้าง จัดการ และติดตามคูปองและแคมเปญโปรโมชัน',
  'Manage Official Account conversations, broadcasts, rich menus, and customer engagement.':
    'จัดการแชท Official Account บรอดแคสต์ ริชเมนู และการมีส่วนร่วมของลูกค้า',
  Staging: 'ทดสอบ',
  'Open Service': 'เปิดบริการ',
  'Select Service': 'เลือกบริการ',
  'Choose a service to continue.': 'เลือกบริการเพื่อดำเนินการต่อ',
  'Opening {name}...': 'กำลังเปิด {name}...',
  'You are now accessing {name}.': 'คุณกำลังเข้าใช้งาน {name}',

  // Login
  'Username Login': 'เข้าสู่ระบบด้วยชื่อผู้ใช้',
  'QR Code Login': 'เข้าสู่ระบบด้วย QR Code',
  Welcome: 'ยินดีต้อนรับ',
  'Please enter your phone number & password to log in.': 'กรุณากรอกเบอร์โทรศัพท์และรหัสผ่านเพื่อเข้าสู่ระบบ',
  'Phone number': 'เบอร์โทรศัพท์',
  'Country code': 'รหัสประเทศ',
  Password: 'รหัสผ่าน',
  'Enter your password': 'กรอกรหัสผ่าน',
  'Hide password': 'ซ่อนรหัสผ่าน',
  'Show password': 'แสดงรหัสผ่าน',
  'Remember me': 'จดจำฉันไว้',
  'Forgot Password?': 'ลืมรหัสผ่าน?',
  'Log In': 'เข้าสู่ระบบ',
  'Scan QR Code': 'สแกน QR Code',
  'Open PEEP SHARE on your smartphone and scan to continue.': 'เปิด PEEP SHARE บนสมาร์ทโฟนแล้วสแกนเพื่อดำเนินการต่อ',
  'Scan this QR code by opening PEEP SHARE on your smartphone, then tap the QR code scanner icon in the search bar to proceed.':
    'สแกน QR Code นี้โดยเปิด PEEP SHARE บนสมาร์ทโฟน แล้วแตะไอคอนสแกน QR Code ในแถบค้นหาเพื่อดำเนินการต่อ',
  'Simulate Scan': 'จำลองการสแกน',
  'Verification Required': 'ต้องยืนยันตัวตน',
  'Enter this code on your mobile device to sign in to PEEP SHARE Desktop.':
    'กรอกรหัสนี้บนอุปกรณ์มือถือของคุณเพื่อเข้าสู่ระบบ PEEP SHARE Desktop',
  'Verify & Continue': 'ยืนยันและดำเนินการต่อ',

  // User management
  '{count} users in the system': 'มีผู้ใช้ในระบบ {count} คน',
  'Search by name, ID, or email...': 'ค้นหาด้วยชื่อ, ID หรือ Email...',
  'All Roles': 'ทุกบทบาท',
  User: 'ผู้ใช้',
  'PEEP SHARE ID': 'PEEP SHARE ID',
  'Assigned Events': 'อีเวนต์ที่ได้รับมอบหมาย',
  Role: 'บทบาท',
  'Last Active': 'ใช้งานล่าสุด',
  Actions: 'การดำเนินการ',
  'No users found.': 'ไม่พบผู้ใช้',
  '{count} event': '{count} อีเวนต์',
  '{count} events': '{count} อีเวนต์',
  Suspend: 'ระงับ',
  Reactivate: 'เปิดใช้งานอีกครั้ง',
  'Recent Activity': 'กิจกรรมล่าสุด',

  // Role management
  'Role Management': 'จัดการบทบาท',
  'Manage roles and permissions for all users': 'จัดการบทบาทและสิทธิ์ของผู้ใช้ทั้งหมด',
  'Create Role': 'สร้างบทบาท',
  'Role Name': 'ชื่อบทบาท',
  Description: 'คำอธิบาย',
  Permissions: 'สิทธิ์',
  '{count} permission': '{count} สิทธิ์',
  '{count} permissions': '{count} สิทธิ์',
  'View Users': 'ดูผู้ใช้',
  'Create Custom Role': 'สร้างบทบาทกำหนดเอง',
  'e.g. Content Manager': 'เช่น ผู้จัดการคอนเทนต์',
  'Describe this role...': 'อธิบายบทบาทนี้...',
  '{count} users with this role': 'มีผู้ใช้ {count} คนในบทบาทนี้',
  'Permission Matrix': 'ตารางสิทธิ์',
  'Full system access across all events and features.': 'เข้าถึงระบบได้ทั้งหมดในทุกอีเวนต์และทุกฟีเจอร์',
  'Manage assigned events and their data.': 'จัดการอีเวนต์ที่ได้รับมอบหมายและข้อมูลของอีเวนต์',
  'View event data and reports for assigned events.': 'ดูข้อมูลและรายงานของอีเวนต์ที่ได้รับมอบหมาย',
  'View event list and all registration/survey data for assigned events. No access to photos, cloud, or system settings.':
    'ดูรายการอีเวนต์และข้อมูลลงทะเบียน/แบบสอบถามทั้งหมดของอีเวนต์ที่ได้รับมอบหมาย ไม่สามารถเข้าถึงรูปภาพ คลาวด์ หรือการตั้งค่าระบบ',
  'Can access assigned events and manage event photos.': 'เข้าถึงอีเวนต์ที่ได้รับมอบหมายและจัดการรูปภาพอีเวนต์ได้',

  // Permission categories
  REGISTRATION: 'การลงทะเบียน',
  SURVEY: 'แบบสอบถาม',
  REPORT: 'รายงาน',
  MEMBERS: 'สมาชิก',

  // Permissions
  'View Event': 'ดูอีเวนต์',
  'Create Event': 'สร้างอีเวนต์',
  'Edit Event': 'แก้ไขอีเวนต์',
  'Delete Event': 'ลบอีเวนต์',
  'View Registration Data': 'ดูข้อมูลลงทะเบียน',
  'View Survey': 'ดูแบบสอบถาม',
  'Export Survey Data': 'ส่งออกข้อมูลแบบสอบถาม',
  'View Event Report': 'ดูรายงานอีเวนต์',
  'Export Report': 'ส่งออกรายงาน',
  'View Photos': 'ดูรูปภาพ',
  'Upload Photos': 'อัปโหลดรูปภาพ',
  'Sync Photos': 'ซิงค์รูปภาพ',
  'Delete Photos': 'ลบรูปภาพ',
  'View Members': 'ดูสมาชิก',
  'Manage Members': 'จัดการสมาชิก',
  'Manage System Settings': 'จัดการการตั้งค่าระบบ',
  'View Activity Log': 'ดูบันทึกกิจกรรม',
  'View Registration': 'ดูการลงทะเบียน',
  'View Reports': 'ดูรายงาน',
  'Export Data': 'ส่งออกข้อมูล',

  // Members & access
  '{count} members with access to this event': 'มีสมาชิก {count} คนที่เข้าถึงอีเวนต์นี้ได้',
  'Add Member': 'เพิ่มสมาชิก',
  Name: 'ชื่อ',
  'Added Date': 'วันที่เพิ่ม',
  'Added {date}': 'เพิ่มเมื่อ {date}',
  'Add Event Member': 'เพิ่มสมาชิกอีเวนต์',
  'Search PEEP SHARE ID...': 'ค้นหา PEEP SHARE ID...',
  Found: 'พบผู้ใช้',
  'Edit Access — {name}': 'แก้ไขสิทธิ์ — {name}',

  // Media Ads
  'Your unsaved changes will be lost.': 'การเปลี่ยนแปลงที่ยังไม่ได้บันทึกจะหายไป',

  // Shared UI components
  'More actions': 'การดำเนินการเพิ่มเติม',
  'Back to top': 'กลับขึ้นด้านบน',
  'Start Date': 'วันที่เริ่มต้น',
  'End Date': 'วันที่สิ้นสุด',
  Pagination: 'การแบ่งหน้า',
  'Previous page': 'หน้าก่อนหน้า',
  'Next page': 'หน้าถัดไป',
  'Page {page} of {total}': 'หน้า {page} จาก {total}',
  'Clear search': 'ล้างการค้นหา',
};

export default dict;
