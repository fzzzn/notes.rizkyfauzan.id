import { h } from 'preact';
import {
  formatDate,
  getDate,
  byDateAndAlphabetical,
  resolveRelative,
  isFolderPath,
} from '@quartz-community/utils';

let toggleIdCounter = 0;

export function GroupedRecentNotes(userOpts) {
  const opts = userOpts || {};
  const groups = opts.groups || [];

  const Component = ({ allFiles, fileData, cfg }) => {
    const slug = fileData.slug;
    const locale = cfg?.locale || 'en-US';
    const toggleId = `grn-toggle-${toggleIdCounter++}`;

    const sortFn = byDateAndAlphabetical();

    const withDate = (page) => {
      const dt = page.defaultDateType || cfg.defaultDateType;
      if (dt) return { ...page, defaultDateType: dt };
      return page;
    };

    const filterByPrefix = (prefix) => {
      return allFiles
        .filter((p) => !p.unlisted)
        .filter((p) => {
          if (!p.slug) return false;
          if (p.slug === 'tags' || p.slug === 'tags/index' || p.slug.startsWith('tags/')) return false;
          if (isFolderPath(p.slug)) return false;
          if (p.slug === '404') return false;
          if (prefix === '') {
            return !p.slug.includes('/');
          }
          return p.slug.startsWith(prefix);
        })
        .sort((a, b) => sortFn(withDate(a), withDate(b)));
    };

    if (!groups.length) {
      return h('div', { class: 'grouped-recent-notes' },
        h('p', { style: 'color: var(--darkgray); font-size: 0.85rem;' }, 'No groups configured')
      );
    }

    const renderGroups = () =>
      groups.map((group) => {
        const title = group.title || 'Recent Notes';
        const limit = group.limit || 5;
        const showTags = group.showTags !== false;
        const pages = filterByPrefix(group.filterPrefix || '');
        const remaining = Math.max(0, pages.length - limit);

        return h('div', { class: 'recent-group', key: title },
          h('h3', { class: 'group-title' }, title),
          h('ul', { class: 'recent-ul' },
            pages.slice(0, limit).map((page) => {
              const pageTitle = page.frontmatter?.title || 'Untitled';
              const tags = page.frontmatter?.tags || [];
              const date = getDate(withDate(page));
              const hideDate = page.slug === 'contact' || page.slug === 'now';

              return h('li', { class: 'recent-li', key: page.slug },
                h('div', { class: 'section' },
                  h('div', { class: 'desc' },
                    h('h3', null,
                      h('a', {
                        href: resolveRelative(slug, page.slug),
                        class: 'internal'
                      }, pageTitle)
                    )
                  ),
                  date && !hideDate && h('p', { class: 'meta' },
                    h('time', { datetime: date.toISOString() },
                      formatDate(date, locale)
                    )
                  ),
                  showTags && tags.length > 0 && h('ul', { class: 'tags' },
                    tags.map((tag) =>
                      h('li', { key: tag },
                        h('a', {
                          class: 'internal tag-link',
                          href: resolveRelative(slug, `tags/${tag}`)
                        }, tag)
                      )
                    )
                  )
                )
              );
            }),
            remaining > 0 // remaining items not rendered in sidebar; shown on filter page
          ),
          remaining > 0 && h('p', { class: 'more-link' },
            h('a', {
              href: resolveRelative(slug, group.filterPrefix || ''),
              class: 'grn-toggle-more'
            },
              `See ${remaining} more \u2192`
            )
          )
        );
      });

    return h('div', { class: 'grouped-recent-notes' },
      h('input', { type: 'checkbox', id: toggleId, class: 'grn-toggle-input' }),
      h('label', { for: toggleId, class: 'grn-toggle-label', 'aria-label': 'Menu' },
        h('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
          h('line', { x1: '4', y1: '6', x2: '20', y2: '6' }),
          h('line', { x1: '4', y1: '12', x2: '20', y2: '12' }),
          h('line', { x1: '4', y1: '18', x2: '20', y2: '18' })
        )
      ),
      h('div', { class: 'grn-panel' },
        h('label', { for: toggleId, class: 'grn-close', 'aria-label': 'Close menu' },
          h('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
            h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
            h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
          )
        ),
        h('div', { class: 'grn-panel-content' }, renderGroups())
      )
    );
  };

  Component.css = `
/* === DESKTOP: show inline, hide mobile toggle === */
@media all and (min-width: 801px) {
  .grn-toggle-input,
  .grn-toggle-label {
    display: none !important;
  }
  .grn-close {
    display: none !important;
  }
  .grn-panel {
    display: block !important;
    position: static !important;
    transform: none !important;
    visibility: visible !important;
    width: auto !important;
    height: auto !important;
    max-height: none !important;
    padding: 0 !important;
    background: transparent !important;
    z-index: auto !important;
    overflow: visible !important;
  }
  .grn-panel-content {
    padding: 0 !important;
  }
}

/* === MOBILE: hamburger + slide-in panel === */
@media all and (max-width: 800px) {
  .grn-toggle-input {
    display: none !important;
  }

  .grn-toggle-label {
    display: flex !important;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 5px;
    color: var(--darkgray);
  }
  .grn-toggle-label:hover {
    background: var(--highlight);
    color: var(--dark);
  }

  /* Put hamburger container first in toolbar */
  .grouped-recent-notes {
    order: -1 !important;
  }

  .grn-panel {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    background: var(--light) !important;
    z-index: 100 !important;
    padding: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    transform: translateX(-100%) !important;
    transition: transform 250ms ease, visibility 250ms ease !important;
    visibility: hidden !important;
    box-sizing: border-box !important;
  }

  .grn-toggle-input:checked ~ .grn-panel {
    transform: translateX(0) !important;
    visibility: visible !important;
  }

  .grn-close {
    position: sticky;
    top: 0;
    display: flex !important;
    align-items: center;
    justify-content: flex-start;
    padding: 2rem 1.5rem 0.5rem 1.5rem;
    cursor: pointer;
    color: var(--darkgray);
    background: var(--light);
    z-index: 102;
  }
  .grn-close:hover {
    color: var(--dark);
  }

  .grn-panel-content {
    padding: 0 1.5rem 3rem 1.5rem;
  }
}

/* === Shared styles === */
.grouped-recent-notes .recent-group {
  margin-bottom: 2rem;
}
.grouped-recent-notes .recent-group:last-child {
  margin-bottom: 0;
}
.grouped-recent-notes .group-title {
  margin: 0.75rem 0 0.5rem 0;
  font-size: 1rem;
}
.grouped-recent-notes .recent-ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.grouped-recent-notes .recent-li {
  margin-bottom: 0.85rem;
}
.grouped-recent-notes .section h3 {
  margin: 0;
}
.grouped-recent-notes .desc h3 a {
  text-decoration: none;
  color: var(--dark);
  line-height: 1.4;
}
.grouped-recent-notes .desc h3 a:hover {
  color: var(--secondary);
}
.grouped-recent-notes .meta {
  margin: 0.15rem 0 0 0;
  opacity: 0.6;
}
.grouped-recent-notes .tags {
  list-style: none;
  margin: 0.35rem 0 0 0;
  padding: 0;
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.grouped-recent-notes .tags li {
  display: inline;
}
.grouped-recent-notes .tags .tag-link {
  font-size: 0.8rem;
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  background: var(--highlight);
  color: var(--secondary);
  text-decoration: none;
}
/* === "See N more" expandable toggle === */
/* === "See N more →" link === */
.grn-toggle-more {
  color: var(--secondary);
  text-decoration: none;
  font-size: 0.88rem;
}
.grn-toggle-more:hover {
  color: var(--dark);
  text-decoration: underline;
}
  `;

  Component.afterDOMLoaded = `
    document.addEventListener('click', function(e) {
      var link = e.target.closest('.grn-panel a.internal');
      if (link) {
        var input = link.closest('.grouped-recent-notes').querySelector('.grn-toggle-input');
        if (input) input.checked = false;
      }
    });
  `;

  return Component;
}
