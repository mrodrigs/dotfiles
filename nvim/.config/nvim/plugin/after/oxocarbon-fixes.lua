local function apply()
	local ok, oxocarbon = pcall(require, "oxocarbon")
	if not ok then
		return
	end
	local c = oxocarbon.oxocarbon
	vim.api.nvim_set_hl(0, "@module", { fg = c.base07 })
	vim.api.nvim_set_hl(0, "@module.builtin", { fg = c.base07 })
	vim.api.nvim_set_hl(0, "@string.regexp", { fg = c.base07 })

	vim.api.nvim_set_hl(0, "NeoTreeDirectoryIcon", { fg = c.base12 })
	vim.api.nvim_set_hl(0, "NeoTreeDirectoryName", { fg = c.base09 })
	vim.api.nvim_set_hl(0, "NeoTreeGitAdded", { fg = c.base07 })
	vim.api.nvim_set_hl(0, "NeoTreeGitModified", { fg = c.base09 })
	vim.api.nvim_set_hl(0, "NeoTreeGitDeleted", { fg = c.base10 })
	vim.api.nvim_set_hl(0, "NeoTreeGitUntracked", { fg = c.base14 })
	vim.api.nvim_set_hl(0, "NeoTreeGitConflict", { fg = c.base10 })
	vim.api.nvim_set_hl(0, "NeoTreeDimText", { fg = c.base02 })
	vim.api.nvim_set_hl(0, "NeoTreeTabInactive", { fg = c.base03, bg = c.base01 })
end

vim.api.nvim_create_autocmd("ColorScheme", {
	pattern = "oxocarbon",
	group = vim.api.nvim_create_augroup("oxocarbon-fixes", { clear = true }),
	callback = apply,
})

if vim.g.colors_name == "oxocarbon" then
	apply()
end
