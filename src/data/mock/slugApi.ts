// MOCK ONLY — stands in for the Slug Value API, which doesn't exist in this project yet.
// Replace each function with the real request; the signatures are the contract.

import { nowLocal } from '../appBanners';

export interface SlugValue {
  id: string;
  /** What the slug is for, so admins can tell them apart. */
  title: string;
  /** Key the app looks up, e.g. "Event PIM" or "0orj35al". */
  slug: string;
  /** Raw JSON text, stored exactly as entered. */
  value: string;
  updatedAt: string;
}

const wait = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T,>(v: T): T => structuredClone(v);
let nextId = 0;
const uid = () => `slug-${Date.now().toString(36)}-${(nextId++).toString(36)}`;

let store: SlugValue[] = [
  { id: uid(), title: 'PIM event – community link', slug: 'Event PIM', value: '{\n  "community": "https://open.peepshare.ai/Yxf0/rjxkvopy"\n}', updatedAt: '2026-10-28T14:20' },
  { id: uid(), title: 'Event 1202 – QR landing', slug: '0orj35al', value: '{\n  "evid": 1202\n}', updatedAt: '2026-10-21T09:05' },
  { id: uid(), title: 'Test slug', slug: 'dnq7gajy', value: '"{\\n  \\"evid\\": xxx\\n}"', updatedAt: '2026-10-02T16:48' },
];

export const slugApi = {
  async list(): Promise<SlugValue[]> {
    await wait();
    return clone(store);
  },
  /** Creates (no id match) or updates. */
  async save(input: Omit<SlugValue, 'id' | 'updatedAt'> & { id?: string }): Promise<SlugValue> {
    await wait(600);
    const saved: SlugValue = { ...input, id: input.id || uid(), updatedAt: nowLocal() };
    store = store.some((s) => s.id === saved.id) ? store.map((s) => (s.id === saved.id ? saved : s)) : [saved, ...store];
    return clone(saved);
  },
  async remove(id: string): Promise<void> {
    await wait();
    store = store.filter((s) => s.id !== id);
  },
};
