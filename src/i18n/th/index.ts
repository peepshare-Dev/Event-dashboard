import common from './common';
import shell from './shell';
import dashboard from './dashboard';
import setEvent from './setEvent';
import automation from './automation';
import media from './media';

// Area dictionaries first, so a shared word in `common` always wins.
export const th: Record<string, string> = { ...shell, ...dashboard, ...setEvent, ...automation, ...media, ...common };
