import type { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      Website: "https://rizkyfauzan.id",
      GitHub: "https://github.com/fzzzn/rizkyfauzan.id",
      LinkedIn: "https://linkedin.com/in/rizky-fauzan-hanif",
      Status: "https://status.rizkyfauzan.id",
      NMS: "https://nms.rizkyfauzan.id",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) =>
        page.fileData.slug !== "index" &&
        page.fileData.slug !== "contact" &&
        page.fileData.slug !== "now",
    }),
    Component.ArticleTitle(),
    // Component.ConditionalRender({
    //   component: Component.ArticleTitle(),
    //   condition: (page) => page.fileData.slug !== "index",
    // }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) =>
        page.fileData.slug !== "index" &&
        page.fileData.slug !== "contact" &&
        page.fileData.slug !== "now",
    }),
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
        // { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(), // Hidden on Desktop
    Component.DesktopOnly(
      Component.Flex({
        direction: "column",
        components: [
          {
            Component: Component.RecentNotes({
              limit: 3,
              title: "ls -lah /home/fauzan/",
              filter: (f) => Boolean(f.slug && !f.slug.includes("/") && f.slug !== "index"),
              sort: (a, b) => {
                const titleA = a.frontmatter?.title || a.slug || ""
                const titleB = b.frontmatter?.title || b.slug || ""
                return titleA.localeCompare(titleB)
              },
            }),
            align: "start",
          },
          {
            Component: Component.RecentNotes({
              limit: 3,
              title: "ls -lah /var/notes/",
              filter: (f) => f.slug?.startsWith("notes") ?? false,
            }),
            align: "start",
          },
          {
            Component: Component.RecentNotes({
              limit: 3,
              title: "ls -lah /var/log/fauzan/",
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
    Component.ConditionalRender({
      component: Component.DesktopOnly(Component.TableOfContents()),
      condition: (page) =>
        page.fileData.slug !== "index" &&
        page.fileData.slug !== "contact" &&
        page.fileData.slug !== "now",
    }),
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
        // { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
    Component.DesktopOnly(
      Component.Flex({
        direction: "column",
        components: [
          {
            Component: Component.RecentNotes({
              limit: 10,
              title: "ls -lah /home/fauzan/",
              filter: (f) => Boolean(f.slug && !f.slug.includes("/") && f.slug !== "index"),
              sort: (a, b) => {
                const titleA = a.frontmatter?.title || a.slug || ""
                const titleB = b.frontmatter?.title || b.slug || ""
                return titleA.localeCompare(titleB)
              },
            }),
            align: "start",
          },
          {
            Component: Component.RecentNotes({
              limit: 3,
              title: "ls -lah /var/notes/",
              filter: (f) => f.slug?.startsWith("notes") ?? false,
            }),
            align: "start",
          },
          {
            Component: Component.RecentNotes({
              limit: 3,
              title: "ls -lah /var/log/fauzan/",
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
