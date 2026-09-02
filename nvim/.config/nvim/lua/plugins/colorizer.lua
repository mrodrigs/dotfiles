-- nvim-colorizer.lua: highlight color codes (#RRGGBB, #RGB, rgb(), hsl(),
-- and named colors) inline with their actual color, right in the buffer.
-- https://github.com/catgoose/nvim-colorizer.lua
return {
  {
    "catgoose/nvim-colorizer.lua",
    event = "BufReadPre",
    opts = {
      filetypes = { "*" },
      user_default_options = {
        names = false, -- don't color words like "red"/"blue"
        RGB = true, -- #RGB
        RGBA = true, -- #RGBA
        RRGGBB = true, -- #RRGGBB
        RRGGBBAA = true, -- #RRGGBBAA
        rgb_fn = true, -- rgb()/rgba() functions
        hsl_fn = true, -- hsl()/hsla() functions
        css = true, -- enable all css-related features
        css_fn = true, -- enable all css *_fn features
        mode = "background", -- swatch shown as the text background
        tailwind = true, -- tailwind color names
        virtualtext = "■",
      },
    },
    keys = {
      { "<leader>uC", "<cmd>ColorizerToggle<cr>", desc = "Toggle colorizer" },
    },
  },
}
