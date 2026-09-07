local function apply()
	local ok, oxocarbon = pcall(require, "oxocarbon")
	if not ok then
		return
	end
	local c = oxocarbon.oxocarbon
	vim.api.nvim_set_hl(0, "@module", { fg = c.base07 })
	vim.api.nvim_set_hl(0, "@module.builtin", { fg = c.base07 })
	vim.api.nvim_set_hl(0, "@string.regexp", { fg = c.base07 })
end

vim.api.nvim_create_autocmd("ColorScheme", {
	pattern = "oxocarbon",
	group = vim.api.nvim_create_augroup("oxocarbon-fixes", { clear = true }),
	callback = apply,
})

if vim.g.colors_name == "oxocarbon" then
	apply()
end
