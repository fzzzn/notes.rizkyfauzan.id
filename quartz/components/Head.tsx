import { i18n } from "../i18n"
import {
  FullSlug,
  getFileExtension,
  joinSegments,
  pathToRoot,
  simplifySlug,
} from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { googleFontHref, googleFontSubsetHref } from "../util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
export default (() => {
  const Head: QuartzComponent = ({
    cfg,
    fileData,
    externalResources,
    ctx,
  }: QuartzComponentProps) => {
    const slug = fileData.slug!
    const titleSuffix = cfg.pageTitleSuffix ?? ""
    const title =
      (fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title) + titleSuffix

    const listingDescription = slug.startsWith("tags/")
      ? slug === "tags/index"
        ? `All tags on ${cfg.pageTitle}.`
        : `Notes tagged ${slug.slice("tags/".length)}.`
      : slug !== "index" && slug.endsWith("/index")
        ? `Notes filed under ${slug.slice(0, -"/index".length)}.`
        : i18n(cfg.locale).propertyDefaults.description
    const description =
      fileData.frontmatter?.socialDescription ??
      fileData.frontmatter?.description ??
      unescapeHTML(fileData.description?.trim() || listingDescription)

    const { css, js, additionalHead } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)
    const iconPath = joinSegments(baseDir, "static/icon.png")

    const isArticle =
      slug !== "index" && slug !== "404" && !slug.startsWith("tags/") && !slug.endsWith("/index")

    // Canonical URL: strip /index and add the trailing slash for folder pages
    // so /notes/index and /notes/ do not compete as separate pages.
    const simpleSlug = simplifySlug(slug).replace(/\/+$/, "")
    const canonicalUrl =
      slug === "404"
        ? undefined
        : simpleSlug === ""
          ? `${url.origin}/`
          : `${url.origin}/${simpleSlug}${slug.endsWith("/index") ? "/" : ""}`

    const usesCustomOgImage = ctx.cfg.plugins.emitters.some((e) => e.name === "CustomOgImages")
    const ogImageDefaultPath = `https://${cfg.baseUrl}/static/og-image.png`

    const coreStylesheet = css[0]?.content
    const coreScript = js.find(
      (r) => r.loadTime === "beforeDOMReady" && r.contentType === "external",
    )

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {coreStylesheet && <link rel="preload" href={coreStylesheet} as="style" />}
        {coreScript && coreScript.contentType === "external" && (
          <link rel="preload" href={coreScript.src} as="script" />
        )}
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
            {cfg.theme.typography.title && (
              <link rel="stylesheet" href={googleFontSubsetHref(cfg.theme, cfg.pageTitle)} />
            )}
          </>
        )}
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {cfg.baseUrl && canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
        {slug === "404" && <meta name="robots" content="noindex" />}
        <meta name="author" content="Rizky Fauzan Hanif" />

        <meta name="og:site_name" content={cfg.pageTitle}></meta>
        <meta property="og:title" content={title} />
        <meta property="og:type" content={isArticle ? "article" : "website"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta property="og:description" content={description} />
        <meta property="og:image:alt" content={description} />

        {!usesCustomOgImage && (
          <>
            <meta property="og:image" content={ogImageDefaultPath} />
            <meta property="og:image:url" content={ogImageDefaultPath} />
            <meta name="twitter:image" content={ogImageDefaultPath} />
            <meta
              property="og:image:type"
              content={`image/${getFileExtension(ogImageDefaultPath) ?? "png"}`}
            />
          </>
        )}

        {cfg.baseUrl && canonicalUrl && (
          <>
            <meta property="twitter:domain" content={cfg.baseUrl}></meta>
            <meta property="og:url" content={canonicalUrl}></meta>
            <meta property="twitter:url" content={canonicalUrl}></meta>
          </>
        )}

        {isArticle && fileData.dates?.created && (
          <meta property="article:published_time" content={fileData.dates.created.toISOString()} />
        )}
        {isArticle && fileData.dates?.modified && (
          <meta property="article:modified_time" content={fileData.dates.modified.toISOString()} />
        )}

        {cfg.baseUrl && (
          <>
            <link
              rel="alternate"
              type="application/rss+xml"
              title={cfg.pageTitle}
              href={`https://${cfg.baseUrl}/index.xml`}
            />
            <link
              rel="sitemap"
              type="application/xml"
              href={`https://${cfg.baseUrl}/sitemap.xml`}
            />
          </>
        )}

        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => {
          if (typeof resource === "function") {
            return resource(fileData)
          } else {
            return resource
          }
        })}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
