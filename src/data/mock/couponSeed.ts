// MOCK ONLY — seed data for couponApi. Dates are relative to page load so the dashboard's
// last-30-days view always has data; a fixed random seed keeps the numbers the same on every load.

import type { Banner, Coupon, CouponUser, CouponView, Phase, Redemption, Brand } from '../coupons';

const DAY = 86_400_000;
const NOW = Date.now();
const at = (offsetDays: number, hour = 10) => {
  const d = new Date(NOW + offsetDays * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

/** mulberry32 — small seeded PRNG. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = rng(20261123);
const randInt = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));
const randCode = (len: number) => Array.from({ length: len }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[randInt(0, 31)]).join('');

const svgUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

function logo(label: string, bg: string, fg = '#fff') {
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
<rect width="240" height="240" rx="48" fill="${bg}"/>
<text x="120" y="138" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="52" font-weight="700" fill="${fg}">${label}</text>
</svg>`);
}

/** Flat artwork at the recommended size (coupon 1080 × 1080, banner 1432 × 480). */
function artwork(title: string, subtitle: string, from: string, to: string, shape: 'coupon' | 'banner') {
  const [w, h] = shape === 'coupon' ? [1080, 1080] : [1432, 480];
  const [x, anchor, y1, y2] = shape === 'coupon' ? [540, 'middle', 560, 650] : [96, 'start', 230, 310];
  return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<circle cx="${w * 0.85}" cy="${h * 0.2}" r="${Math.min(w, h) * 0.4}" fill="#fff" opacity="0.12"/>
<text x="${x}" y="${y1}" text-anchor="${anchor}" font-family="Inter,Arial,sans-serif" font-size="84" font-weight="700" fill="#fff">${title}</text>
<text x="${x}" y="${y2}" text-anchor="${anchor}" font-family="Inter,Arial,sans-serif" font-size="40" fill="#fff" opacity="0.85">${subtitle}</text>
</svg>`);
}

const mockDocUrl = (fileName: string) => `data:text/plain;charset=utf-8,${encodeURIComponent(`Mock document: ${fileName}`)}`;

const conditions = (brand: string, extra: string[] = []) =>
  `<ul>${[
    `ใช้ได้ที่ร้าน ${brand} ทุกสาขา ยกเว้นสาขาในสนามบินและสาขาพิเศษ`,
    ...extra,
    'จำกัด 1 สิทธิ์ต่อ 1 บัญชี PEEP SHARE',
    'แสดงบาร์โค้ดจากแอปให้พนักงานสแกนก่อนชำระเงิน',
    'ไม่สามารถใช้ร่วมกับส่วนลดหรือโปรโมชั่นอื่น และไม่สามารถแลกเปลี่ยนเป็นเงินสด',
  ]
    .map((li) => `<li>${li}</li>`)
    .join('')}</ul>`;

// --- Users (back-office accounts that author notes / documents) ---

export const couponUsers = {
  suchada: { id: 'u-admin-suchada', name: 'Suchada T.', role: 'admin' },
  krit: { id: 'u-admin-krit', name: 'Krit S.', role: 'admin' },
  nattapong: { id: 'u-bd-nattapong', name: 'Nattapong K.', role: 'bd' },
  ploy: { id: 'u-bd-ploy', name: 'Ploy W.', role: 'bd' },
} satisfies Record<string, CouponUser>;

/** Who the dev role switcher signs in as, per role. */
export const DEV_COUPON_USERS: Record<CouponUser['role'], CouponUser> = {
  admin: couponUsers.suchada,
  bd: couponUsers.nattapong,
};

// --- Phases ---

export const phasesSeed: Phase[] = [
  { id: 'ph-1', name: 'Campaign 1 · Back to School', startDate: at(-90, 0), endDate: at(-21, 23), status: 'ended', createdAt: at(-110) },
  { id: 'ph-2', name: 'Campaign 2 · Year-End Feast', startDate: at(-20, 0), endDate: at(40, 23), status: 'active', createdAt: at(-35) },
  { id: 'ph-3', name: 'Campaign 3 · Songkran 2027', startDate: at(41, 0), endDate: at(100, 23), status: 'scheduled', createdAt: at(-6) },
  { id: 'ph-4', name: 'Campaign 4 · Mid-Year (draft)', startDate: at(101, 0), endDate: at(160, 23), status: 'draft', createdAt: at(-2) },
];

// --- Brands ---

const { suchada, krit, nattapong, ploy } = couponUsers;

export const brandsSeed: Brand[] = [
  {
    id: 'br-pizza',
    name: 'The Pizza Company',
    logoUrl: logo('PIZZA', '#D7141A'),
    isPartnerActive: true,
    partnerStartDate: at(-120, 0),
    partnerEndDate: at(240, 23),
    contactName: 'คุณมาลี ศรีสุข',
    contactPhone: '081-234-5678',
    contactEmail: 'malee@pizza.example',
    ownerBdId: couponUsers.nattapong.id,
    defaultConditionsHtml: conditions('The Pizza Company'),
    displayOrder: 1,
    notes: [
      { id: 'n-1', brandId: 'br-pizza', authorId: nattapong.id, authorName: nattapong.name, body: 'คุณมาลี (Marketing) ยืนยันโควตาเฟส 2 เพิ่มเป็น 1,000 สิทธิ์ ส่งอีเมลยืนยันแล้ว', createdAt: at(-24, 14), updatedAt: at(-22, 9) },
      { id: 'n-2', brandId: 'br-pizza', authorId: suchada.id, authorName: suchada.name, body: 'บาร์โค้ด unique code ชุดใหม่ อัปโหลดเข้าระบบแล้ว ตรวจสอบกับ POS สาขาสยามเรียบร้อย', createdAt: at(-19, 11) },
    ],
    documents: [
      { id: 'd-1', brandId: 'br-pizza', fileName: 'MOU_ThePizzaCompany_2026.pdf', fileUrl: mockDocUrl('MOU_ThePizzaCompany_2026.pdf'), uploadedById: nattapong.id, uploadedBy: nattapong.name, uploadedAt: at(-60, 15) },
      { id: 'd-2', brandId: 'br-pizza', fileName: 'Phase2_unique_codes.csv', fileUrl: mockDocUrl('Phase2_unique_codes.csv'), uploadedById: suchada.id, uploadedBy: suchada.name, uploadedAt: at(-21, 10) },
    ],
  },
  {
    id: 'br-dq',
    name: 'Dairy Queen',
    logoUrl: logo('DQ', '#1B4D9B'),
    isPartnerActive: true,
    partnerStartDate: at(-200, 0),
    partnerEndDate: at(165, 23),
    contactName: 'คุณธนา วงศ์ใหญ่',
    contactPhone: '089-555-0142',
    contactEmail: 'thana@dq.example',
    ownerBdId: couponUsers.ploy.id,
    defaultConditionsHtml: conditions('Dairy Queen', ['เฉพาะขนาด Small และ Medium']),
    displayOrder: 2,
    notes: [
      { id: 'n-3', brandId: 'br-dq', authorId: ploy.id, authorName: ploy.name, body: 'คูปอง Dilly Bar หมดเร็วกว่าที่คาด ร้านพร้อมเพิ่มอีก 300 สิทธิ์ รอ Admin สร้างคูปองรอบใหม่', createdAt: at(-4, 16) },
      { id: 'n-4', brandId: 'br-dq', authorId: krit.id, authorName: krit.name, body: 'แจ้งร้านแล้วว่าต้องใช้บาร์โค้ด Code 128 เท่านั้น', createdAt: at(-15, 10) },
    ],
    documents: [
      { id: 'd-3', brandId: 'br-dq', fileName: 'DQ_Partnership_Agreement.pdf', fileUrl: mockDocUrl('DQ_Partnership_Agreement.pdf'), uploadedById: ploy.id, uploadedBy: ploy.name, uploadedAt: at(-50, 13) },
    ],
  },
  {
    id: 'br-swensens',
    name: "Swensen's",
    logoUrl: logo("SW", '#E4007C'),
    isPartnerActive: true,
    partnerStartDate: at(-60, 0),
    partnerEndDate: at(300, 23),
    contactName: 'คุณปริม แก้วใส',
    contactPhone: '062-411-7788',
    contactEmail: 'prim@swensens.example',
    ownerBdId: couponUsers.nattapong.id,
    notes: [
      { id: 'n-5', brandId: 'br-swensens', authorId: nattapong.id, authorName: nattapong.name, body: 'ร้านขอให้แสดงโลโก้ในหน้าแรกของเฟส 3 ด้วย กำลังคุยเรื่องตำแหน่ง', createdAt: at(-8, 15) },
    ],
    documents: [],
  },
  {
    id: 'br-bonchon',
    name: 'Bonchon',
    logoUrl: logo('BC', '#1A1A1A'),
    isPartnerActive: true,
    partnerStartDate: at(-150, 0),
    partnerEndDate: at(210, 23),
    contactName: 'คุณกิตติ ทองดี',
    contactPhone: '085-300-9911',
    contactEmail: 'kitti@bonchon.example',
    ownerBdId: couponUsers.ploy.id,
    displayOrder: 3,
    notes: [
      { id: 'n-6', brandId: 'br-bonchon', authorId: suchada.id, authorName: suchada.name, body: 'ปิดคูปองปีกไก่ 6 ชิ้นชั่วคราว ร้านแจ้งวัตถุดิบไม่พอในบางสาขา', createdAt: at(-5, 9) },
    ],
    documents: [
      { id: 'd-4', brandId: 'br-bonchon', fileName: 'Bonchon_branch_list.xlsx', fileUrl: mockDocUrl('Bonchon_branch_list.xlsx'), uploadedById: ploy.id, uploadedBy: ploy.name, uploadedAt: at(-30, 11) },
    ],
  },
  {
    id: 'br-barbq',
    name: 'Bar B Q Plaza',
    logoUrl: logo('BBQ', '#F58220'),
    isPartnerActive: true,
    partnerStartDate: at(-400, 0),
    partnerEndDate: at(-10, 23),
    contactName: 'คุณสมชาย ใจดี',
    contactPhone: '081-777-2020',
    contactEmail: 'somchai@barbq.example',
    ownerBdId: couponUsers.ploy.id,
    notes: [
      { id: 'n-7', brandId: 'br-barbq', authorId: ploy.id, authorName: ploy.name, body: 'รอสรุปเงื่อนไขเฟส 2 จากฝ่ายการตลาดของร้าน คาดว่าได้ภายในสิ้นเดือน', createdAt: at(-12, 14) },
    ],
    documents: [],
  },
  {
    id: 'br-afteryou',
    name: 'After You',
    logoUrl: logo('AY', '#8B5E3C'),
    isPartnerActive: false,
    partnerStartDate: at(-380, 0),
    ownerBdId: couponUsers.nattapong.id,
    displayOrder: 4,
    notes: [
      { id: 'n-8', brandId: 'br-afteryou', authorId: krit.id, authorName: krit.name, body: 'สัญญาหมดอายุ ระงับการแสดงโลโก้ไว้ก่อนจนกว่าจะต่อสัญญา', createdAt: at(-3, 17) },
    ],
    documents: [
      { id: 'd-5', brandId: 'br-afteryou', fileName: 'AfterYou_MOU_2025.pdf', fileUrl: mockDocUrl('AfterYou_MOU_2025.pdf'), uploadedById: nattapong.id, uploadedBy: nattapong.name, uploadedAt: at(-200, 10) },
    ],
  },
];

// --- Coupons (counts filled in from the redemptions below) ---

type CouponDraft = Omit<Coupon, 'claimedCount' | 'redeemedCount' | 'viewCount' | 'viewerCount' | 'barcode' | 'uniqueCodes'> & {
  weight: number;
  /** Share of claims that get redeemed (default 0.62). */
  redeemRate?: number;
};

const coupon = (d: Omit<CouponDraft, 'createdAt' | 'updatedAt'> & { createdDay: number; updatedDay?: number }): CouponDraft => {
  const { createdDay, updatedDay, ...rest } = d;
  return { ...rest, createdAt: at(createdDay), updatedAt: at(updatedDay ?? createdDay) };
};

const couponDrafts: CouponDraft[] = [
  // Phase 1 — ended
  coupon({ id: 'cp-01', phaseId: 'ph-1', brandId: 'br-pizza', title: 'ซื้อ 1 แถม 1 พิซซ่าถาดกลาง', conditionsHtml: conditions('The Pizza Company', ['เฉพาะพิซซ่าหน้ามาตรฐาน ถาดกลาง', 'ทานที่ร้านหรือซื้อกลับบ้านเท่านั้น']), couponImageUrl: artwork('1 FREE 1', 'The Pizza Company · Medium', '#B91C1C', '#EF4444', 'coupon'), codeType: 'single', totalQuantity: 500, expiresAt: at(-21, 23), isActive: true, createdDay: -92, weight: 3 }),
  coupon({ id: 'cp-02', phaseId: 'ph-1', brandId: 'br-barbq', title: 'ลด 20% เมื่อสั่งชุดหมูกระทะ', conditionsHtml: conditions('Bar B Q Plaza', ['ขั้นต่ำ 2 ท่านขึ้นไป']), couponImageUrl: artwork('20% OFF', 'Bar B Q Plaza · Set menu', '#C2410C', '#F59E0B', 'coupon'), codeType: 'unique', totalQuantity: 300, expiresAt: at(-21, 23), isActive: true, createdDay: -92, weight: 2 }),
  coupon({ id: 'cp-03', phaseId: 'ph-1', brandId: 'br-dq', title: 'ฟรีท็อปปิ้ง 1 อย่าง สำหรับ Blizzard', conditionsHtml: conditions('Dairy Queen'), couponImageUrl: artwork('FREE TOPPING', 'Dairy Queen · Blizzard', '#1E3A8A', '#3B82F6', 'coupon'), codeType: 'single', totalQuantity: 400, expiresAt: at(-21, 23), isActive: true, createdDay: -91, weight: 2 }),
  coupon({ id: 'cp-04', phaseId: 'ph-1', brandId: 'br-bonchon', title: 'ลด 100 บาท เมื่อสั่งครบ 500 บาท', conditionsHtml: conditions('Bonchon', ['ยอดสั่งซื้อขั้นต่ำ 500 บาท ต่อใบเสร็จ']), couponImageUrl: artwork('฿100 OFF', 'Bonchon · min ฿500', '#111827', '#4B5563', 'coupon'), codeType: 'unique', totalQuantity: 200, expiresAt: at(-21, 23), isActive: true, createdDay: -90, weight: 1 }),
  // Phase 2 — active
  coupon({ id: 'cp-05', phaseId: 'ph-2', brandId: 'br-pizza', title: 'ลด 50% พิซซ่าถาดใหญ่', conditionsHtml: conditions('The Pizza Company', ['เฉพาะพิซซ่าถาดใหญ่ทุกหน้า ยกเว้นหน้าพรีเมียม']), couponImageUrl: artwork('50% OFF', 'The Pizza Company · Large', '#991B1B', '#F97316', 'coupon'), codeType: 'unique', totalQuantity: 1000, expiresAt: at(40, 23), isActive: true, createdDay: -22, weight: 6 }),
  coupon({ id: 'cp-06', phaseId: 'ph-2', brandId: 'br-pizza', title: 'ฟรีขนมปังกระเทียม เมื่อสั่งพิซซ่า 1 ถาด', conditionsHtml: conditions('The Pizza Company'), couponImageUrl: artwork('FREE BREAD', 'The Pizza Company · Garlic bread', '#B91C1C', '#FB923C', 'coupon'), codeType: 'single', totalQuantity: 800, expiresAt: at(5, 23), isActive: true, createdDay: -22, weight: 4 }),
  coupon({ id: 'cp-07', phaseId: 'ph-2', brandId: 'br-dq', title: 'Blizzard ซื้อ 1 แถม 1', conditionsHtml: conditions('Dairy Queen', ['เฉพาะขนาด Small และ Medium']), couponImageUrl: artwork('1 FREE 1', 'Dairy Queen · Blizzard', '#1E40AF', '#60A5FA', 'coupon'), codeType: 'single', totalQuantity: 600, expiresAt: at(40, 23), isActive: true, createdDay: -21, weight: 5 }),
  coupon({ id: 'cp-08', phaseId: 'ph-2', brandId: 'br-dq', title: 'ลด 30 บาท Dilly Bar', conditionsHtml: conditions('Dairy Queen'), couponImageUrl: artwork('฿30 OFF', 'Dairy Queen · Dilly Bar', '#1D4ED8', '#93C5FD', 'coupon'), codeType: 'single', totalQuantity: 0 /* sold out: set to claims below */, expiresAt: at(40, 23), isActive: true, createdDay: -21, weight: 2 }),
  coupon({ id: 'cp-09', phaseId: 'ph-2', brandId: 'br-swensens', title: 'ซันเดย์ราคาพิเศษ 99 บาท', conditionsHtml: conditions("Swensen's", ['เฉพาะเมนูซันเดย์ที่ร่วมรายการ']), couponImageUrl: artwork('฿99 SUNDAE', "Swensen's", '#BE185D', '#F472B6', 'coupon'), codeType: 'unique', totalQuantity: 0 /* sold out: set to claims below */, expiresAt: at(40, 23), isActive: true, createdDay: -20, weight: 3, redeemRate: 0.05 }),
  coupon({ id: 'cp-10', phaseId: 'ph-2', brandId: 'br-bonchon', title: 'ฟรีปีกไก่ 6 ชิ้น เมื่อสั่งครบ 399 บาท', conditionsHtml: conditions('Bonchon', ['ยอดสั่งซื้อขั้นต่ำ 399 บาท ต่อใบเสร็จ']), couponImageUrl: artwork('FREE 6 WINGS', 'Bonchon · min ฿399', '#1F2937', '#6B7280', 'coupon'), codeType: 'single', totalQuantity: 400, expiresAt: at(40, 23), isActive: false, createdDay: -20, updatedDay: -5, weight: 2 }),
  coupon({ id: 'cp-11', phaseId: 'ph-2', brandId: 'br-bonchon', title: 'ลด 15% ทุกเมนู (Flash)', conditionsHtml: conditions('Bonchon'), couponImageUrl: artwork('15% OFF', 'Bonchon · Flash deal', '#111827', '#374151', 'coupon'), codeType: 'unique', totalQuantity: 300, expiresAt: at(-3, 23), isActive: true, createdDay: -18, weight: 2 }),
  coupon({ id: 'cp-12', phaseId: 'ph-2', brandId: 'br-afteryou', title: 'ลด 20% ชิบูย่าฮันนี่โทสต์', conditionsHtml: conditions('After You'), couponImageUrl: artwork('20% OFF', 'After You · Shibuya toast', '#78350F', '#D97706', 'coupon'), codeType: 'single', totalQuantity: 250, expiresAt: at(40, 23), isActive: true, createdDay: -20, weight: 2 }),
  // Not in a phase yet — waiting to be added on the Phases page
  coupon({ id: 'cp-13', brandId: 'br-pizza', title: 'ลด 100 บาท พิซซ่าถาดใหญ่', conditionsHtml: conditions('The Pizza Company'), couponImageUrl: artwork('฿100 OFF', 'The Pizza Company · Large', '#7F1D1D', '#DC2626', 'coupon'), codeType: 'single', totalQuantity: 500, expiresAt: at(120, 23), isActive: true, createdDay: -2, weight: 0 }),
  coupon({ id: 'cp-14', brandId: 'br-swensens', title: 'ไอศกรีม 1 สกู๊ป ฟรี', conditionsHtml: conditions("Swensen's"), couponImageUrl: artwork('FREE SCOOP', "Swensen's", '#9D174D', '#EC4899', 'coupon'), codeType: 'unique', totalQuantity: 200, expiresAt: at(120, 23), isActive: true, createdDay: -1, weight: 0 }),
];

// --- Redemptions: ~300 claims over the last 30 days, ~60% redeemed ---

const phaseById = new Map(phasesSeed.map((p) => [p.id, p]));
// Only coupons in a phase can be claimed.
const claimable = couponDrafts.filter((c) => c.phaseId);
const totalWeight = claimable.reduce((sum, c) => sum + c.weight, 0);

function pickCoupon(): CouponDraft {
  let r = random() * totalWeight;
  for (const c of claimable) if ((r -= c.weight) < 0) return c;
  return claimable[claimable.length - 1];
}

/** When a coupon could be claimed, inside the last 30 days. */
function claimWindow(c: CouponDraft): [number, number] {
  const phase = phaseById.get(c.phaseId!)!;
  const start = Math.max(NOW - 30 * DAY, Date.parse(phase.startDate), Date.parse(c.createdAt));
  const end = Math.min(NOW, Date.parse(phase.endDate), Date.parse(c.expiresAt), c.isActive ? NOW : Date.parse(c.updatedAt));
  return [start, end];
}

export const redemptionsSeed: Redemption[] = [];
for (let i = 0; redemptionsSeed.length < 300 && i < 1000; i++) {
  const c = pickCoupon();
  const [start, end] = claimWindow(c);
  if (end <= start) continue;
  const claimed = start + random() * (end - start);
  const redeemed = claimed + randInt(10, 72 * 60) * 60_000;
  redemptionsSeed.push({
    id: `rd-${String(redemptionsSeed.length + 1).padStart(4, '0')}`,
    couponId: c.id,
    userId: `PPS${String(randInt(1, 2400)).padStart(5, '0')}`,
    claimedAt: new Date(claimed).toISOString(),
    redeemedAt: random() < (c.redeemRate ?? 0.62) && redeemed < Math.min(NOW, Date.parse(c.expiresAt)) ? new Date(redeemed).toISOString() : undefined,
  });
}
redemptionsSeed.sort((a, b) => a.claimedAt.localeCompare(b.claimedAt));

// --- Coupon Detail views: everyone who claimed looked first, plus about as many again who only looked ---

export const couponViewsSeed: CouponView[] = [];
const addView = (couponId: string, userId: string, viewedAt: number) =>
  couponViewsSeed.push({ id: `vw-${String(couponViewsSeed.length + 1).padStart(4, '0')}`, couponId, userId, viewedAt: new Date(viewedAt).toISOString() });
for (const r of redemptionsSeed) addView(r.couponId, r.userId, Date.parse(r.claimedAt) - randInt(1, 30) * 60_000);
for (let i = 0; i < redemptionsSeed.length * 1.2; i++) {
  const c = pickCoupon();
  const [start, end] = claimWindow(c);
  if (end > start) addView(c.id, `PPS${String(randInt(1, 2400)).padStart(5, '0')}`, start + random() * (end - start));
}
couponViewsSeed.sort((a, b) => a.viewedAt.localeCompare(b.viewedAt));

export const couponsSeed: Coupon[] = couponDrafts.map(({ weight: _weight, redeemRate: _rate, ...c }) => {
  const rows = redemptionsSeed.filter((r) => r.couponId === c.id);
  const seen = couponViewsSeed.filter((v) => v.couponId === c.id);
  const claimedCount = rows.length;
  const totalQuantity = c.totalQuantity || claimedCount;
  return {
    ...c,
    totalQuantity,
    claimedCount,
    redeemedCount: rows.filter((r) => r.redeemedAt).length,
    viewCount: seen.length,
    viewerCount: new Set(seen.map((v) => v.userId)).size,
    ...(c.codeType === 'single'
      ? { barcode: `885${String(randInt(0, 9_999_999_999)).padStart(10, '0')}` }
      : { uniqueCodes: Array.from({ length: totalQuantity }, () => `${c.id.toUpperCase().replace('-', '')}-${randCode(8)}`) }),
  };
});

// --- Coupon landing screen banners ---

export const bannersSeed: Banner[] = [
  { id: 'bn-1', title: 'Year-End Feast — ลดสูงสุด 50%', imageUrl: artwork('Year-End Feast', 'ลดสูงสุด 50% ร้านดังทั่วไทย', '#C2410C', '#FB923C', 'banner'), linkUrl: 'https://peepshare.ai/coupon/year-end', sortOrder: 1, isActive: true, startDate: at(-20, 0), endDate: at(40, 23) },
  { id: 'bn-2', title: 'The Pizza Company 50% OFF', imageUrl: artwork('Pizza 50% OFF', 'เฉพาะถาดใหญ่ · วันนี้ – สิ้นเฟส', '#991B1B', '#EF4444', 'banner'), sortOrder: 2, isActive: true, startDate: at(-20, 0), endDate: at(40, 23) },
  { id: 'bn-3', title: 'Dairy Queen Blizzard 1 แถม 1', imageUrl: artwork('Blizzard 1 FREE 1', 'Dairy Queen', '#1E40AF', '#60A5FA', 'banner'), sortOrder: 3, isActive: true },
  { id: 'bn-4', title: 'Songkran 2027 — Coming soon', imageUrl: artwork('Songkran 2027', 'คูปองใหม่ เร็ว ๆ นี้', '#0E7490', '#22D3EE', 'banner'), sortOrder: 4, isActive: true, startDate: at(30, 0), endDate: at(100, 23) },
  { id: 'bn-5', title: 'Back to School (ended)', imageUrl: artwork('Back to School', 'Campaign 1', '#4B5563', '#9CA3AF', 'banner'), sortOrder: 5, isActive: false, startDate: at(-90, 0), endDate: at(-21, 23) },
];
