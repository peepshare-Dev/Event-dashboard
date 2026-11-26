import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { can, type CouponPermission, type CouponRole, type CouponUser } from '../../data/coupons';
import { DEV_COUPON_USERS } from '../../data/mock/couponSeed';
import { setCouponSession } from '../../data/mock/couponApi';

interface CouponRoleContextValue {
  user: CouponUser;
  /** Dev only: sign in as the seeded user for this role. */
  setRole: (role: CouponRole) => void;
}

const CouponRoleContext = createContext<CouponRoleContextValue | null>(null);

// Signed-in Coupon user. Until real auth exists, the dev role switcher picks the user.
export function CouponRoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CouponUser>(() => {
    setCouponSession(DEV_COUPON_USERS.admin);
    return DEV_COUPON_USERS.admin;
  });

  const setRole = useCallback((role: CouponRole) => {
    setCouponSession(DEV_COUPON_USERS[role]);
    setUser(DEV_COUPON_USERS[role]);
  }, []);

  const value = useMemo(() => ({ user, setRole }), [user, setRole]);
  return <CouponRoleContext.Provider value={value}>{children}</CouponRoleContext.Provider>;
}

export function useCouponUser() {
  const ctx = useContext(CouponRoleContext);
  if (!ctx) throw new Error('useCouponUser must be used inside <CouponRoleProvider>');
  return ctx;
}

/** `useCan('coupon.write')` — hide or disable write controls the role can't use. */
export function useCan(permission: CouponPermission): boolean {
  return can(useCouponUser().user, permission);
}
