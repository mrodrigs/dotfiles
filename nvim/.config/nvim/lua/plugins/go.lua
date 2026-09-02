-- Let gopls advertise its own semanticTokensProvider (with its real legend)
-- instead of fabricating one. The old LazyVim Go-extra workaround forced a
-- provider built from Neovim's client-default modifier list, which is shorter
-- than gopls's actual modifier legend. Decoding a token whose modifier index
-- fell outside that short list crashed with
--   semantic_tokens.lua:66: table index is nil
-- gopls (>= ~0.11) advertises the provider natively when semanticTokens is on,
-- so we just enable it and remove the workaround.
return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        gopls = {
          settings = {
            gopls = {
              semanticTokens = true,
            },
          },
        },
      },
      -- Neutralize LazyVim's Go-extra setup.gopls workaround, which fabricated a
      -- semanticTokensProvider with a wrong legend. Returning nil lets lspconfig
      -- set gopls up normally; Neovim 0.12 auto-starts semantic tokens from the
      -- real provider gopls advertises once semanticTokens is enabled above.
      setup = {
        gopls = function() end,
      },
    },
  },
}
