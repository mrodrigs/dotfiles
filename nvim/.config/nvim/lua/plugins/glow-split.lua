-- Local plugin: render the current Markdown file with `glow` in a right-hand
-- split. Maintained at ~/dev/glow-split.
return {
  {
    dir = "~/dev/glow-split",
    ft = { "markdown", "markdown.mdx" },
    opts = {},
    keys = {
      {
        "<leader>mp",
        function()
          require("glow-split").toggle()
        end,
        ft = { "markdown", "markdown.mdx" },
        desc = "Markdown preview (glow)",
      },
    },
  },
}
