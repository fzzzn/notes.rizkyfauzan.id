import type { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/fzzzn/rizkyfauzan.id",
      LinkedIn: "https://linkedin.com/in/rizky-fauzan-hanif",
      Status: "https://status.rizkyfauzan.id",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
    Component.DesktopOnly(
      Component.Flex({
        direction: "column",
        components: [
          {
            Component: Component.RecentNotes({
              limit: 3,
              title: "ls -lah /var/tutorials",
              filter: (f) => f.slug?.startsWith("tutorials") ?? false,
            }),
            align: "start",
          },
          {
            Component: Component.RecentNotes({
              limit: 3,
              title: "ls -lah /var/log/public",
              filter: (f) => f.slug?.startsWith("log") ?? false,
            }),
            align: "start",
          },
        ],
      }),
    ),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.DesktopOnly(
      Component.Flex({
        direction: "column",
        components: [
          {
            Component: Component.RecentNotes({
              limit: 3,
              title: "ls -lah /var/tutorials",
              filter: (f) => f.slug?.startsWith("tutorials") ?? false,
            }),
            align: "start",
          },
          {
            Component: Component.RecentNotes({
              limit: 3,
              title: "ls -lah /var/log/public",
              filter: (f) => f.slug?.startsWith("log") ?? false,
            }),
            align: "start",
          },
        ],
      }),
    ),
  ],
  right: [],
}
