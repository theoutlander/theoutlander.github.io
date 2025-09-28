import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Box, Image, Heading, Text, Link } from "@chakra-ui/react";
import { R as Route } from "../main.mjs";
import "react-dom/client";
import "@tanstack/react-router";
function RoutePost({ slug }) {
  const [post, setPost] = useState(null);
  useEffect(() => {
    fetch("/data/hashnode.json").then((r) => r.json()).then((all) => setPost(all.find((p) => p.slug === slug) ?? null)).catch(() => setPost(null));
  }, [slug]);
  if (!post) return /* @__PURE__ */ jsx(Box, { p: 6, children: "Loading…" });
  return /* @__PURE__ */ jsxs(
    Box,
    {
      maxW: "3xl",
      mx: "auto",
      p: 6,
      children: [
        /* @__PURE__ */ jsxs("head", { children: [
          /* @__PURE__ */ jsx("title", { children: post.title }),
          /* @__PURE__ */ jsx(
            "link",
            {
              rel: "canonical",
              href: post.url
            }
          ),
          post.excerpt ? /* @__PURE__ */ jsx(
            "meta",
            {
              name: "description",
              content: post.excerpt
            }
          ) : null,
          post.cover ? /* @__PURE__ */ jsx(
            "meta",
            {
              property: "og:image",
              content: post.cover
            }
          ) : null
        ] }),
        post.cover ? /* @__PURE__ */ jsx(
          Image,
          {
            src: post.cover,
            alt: "",
            mb: 4,
            borderRadius: "xl"
          }
        ) : null,
        /* @__PURE__ */ jsx(Heading, { size: "lg", children: post.title }),
        /* @__PURE__ */ jsx(
          Text,
          {
            opacity: 0.7,
            mt: 1,
            children: post.date ? new Date(post.date).toDateString() : ""
          }
        ),
        /* @__PURE__ */ jsx(Text, { mt: 4, children: post.excerpt }),
        /* @__PURE__ */ jsxs(Text, { mt: 6, children: [
          "Full post on Hashnode:",
          " ",
          /* @__PURE__ */ jsx(
            Link,
            {
              href: post.url,
              isExternal: true,
              children: post.url
            }
          )
        ] })
      ]
    }
  );
}
function BlogPostComponent() {
  const {
    slug
  } = Route.useParams();
  return /* @__PURE__ */ jsx(RoutePost, { slug });
}
export {
  BlogPostComponent as component
};
