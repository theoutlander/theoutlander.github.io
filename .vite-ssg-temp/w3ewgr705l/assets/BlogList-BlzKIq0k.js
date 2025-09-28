import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Box, Heading, VStack, Card, Image, Link, Text } from "@chakra-ui/react";
function BlogList() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch("/data/hashnode.json").then((r) => r.json()).then(setPosts).catch(() => setPosts([]));
  }, []);
  return /* @__PURE__ */ jsxs(
    Box,
    {
      maxW: "4xl",
      mx: "auto",
      p: 6,
      children: [
        /* @__PURE__ */ jsx(
          Heading,
          {
            size: "lg",
            mb: 4,
            children: "Blog"
          }
        ),
        /* @__PURE__ */ jsx(
          VStack,
          {
            spacing: 4,
            align: "stretch",
            children: posts.map((p) => /* @__PURE__ */ jsxs(
              Card,
              {
                p: 4,
                children: [
                  p.cover ? /* @__PURE__ */ jsx(
                    Image,
                    {
                      src: p.cover,
                      alt: "",
                      mb: 3,
                      borderRadius: "lg"
                    }
                  ) : null,
                  /* @__PURE__ */ jsx(
                    Link,
                    {
                      href: `/blog/${p.slug}`,
                      fontWeight: "semibold",
                      textDecoration: "underline",
                      children: p.title
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Text,
                    {
                      fontSize: "sm",
                      opacity: 0.7,
                      children: p.date ? new Date(p.date).toDateString() : ""
                    }
                  ),
                  /* @__PURE__ */ jsx(Text, { mt: 2, children: p.excerpt })
                ]
              },
              p.slug
            ))
          }
        )
      ]
    }
  );
}
export {
  BlogList as B
};
