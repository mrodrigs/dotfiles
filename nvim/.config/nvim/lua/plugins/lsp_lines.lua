-- lsp_lines.nvim: render diagnostics as virtual lines below the offending code,
-- making multi-line / overlapping diagnostics readable.
-- https://github.com/ErichDonGubler/lsp_lines.nvim
return {
  {
    "ErichDonGubler/lsp_lines.nvim",
    event = "LspAttach",
    config = function()
      require("lsp_lines").setup()
      -- Disable the default inline virtual_text so diagnostics aren't shown twice.
      vim.diagnostic.config({
        virtual_text = false,
        virtual_lines = true,
      })
    end,
    keys = {
      {
        "<leader>ul",
        function()
          local new = not vim.diagnostic.config().virtual_lines
          vim.diagnostic.config({ virtual_lines = new, virtual_text = not new })
          vim.notify("lsp_lines " .. (new and "enabled" or "disabled"))
        end,
        desc = "Toggle lsp_lines",
      },
    },
  },
}
