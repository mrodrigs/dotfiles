import { Gtk } from "ags/gtk4"
import { With, type Accessor } from "ags"
import { createPoll } from "ags/time"
import GLib from "gi://GLib"

type RateWindow = { used_percentage: number; resets_at: number; updated_at: number } | null
type UsageCache = { five_hour: RateWindow; seven_day: RateWindow } | null

const CACHE_PATH = `${GLib.get_home_dir()}/.cache/ags/claude-usage.json`

function readCache(): UsageCache {
  try {
    const [ok, bytes] = GLib.file_get_contents(CACHE_PATH)
    if (!ok) return null
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return null
  }
}

function formatTime(epoch: number) {
  return GLib.DateTime.new_from_unix_local(epoch).format("%a %H:%M")!
}

function formatWindow(label: string, win: RateWindow) {
  if (!win) return `${label}: indisponível`
  return (
    `${label}: ${Math.round(win.used_percentage)}% · reinicia ${formatTime(win.resets_at)}` +
    ` (atualizado ${formatTime(win.updated_at)})`
  )
}

function tooltipFor(cache: UsageCache) {
  if (!cache || (!cache.five_hour && !cache.seven_day)) {
    return "Claude Code\nSem dados ainda — abra uma sessão do Claude Code"
  }

  return [formatWindow("Sessão (5h)", cache.five_hour), formatWindow("Semana (7d)", cache.seven_day)].join("\n")
}

function WindowRow({ label, win }: { label: string; win: Accessor<RateWindow> }) {
  return (
    <box class="usage-row" spacing={8}>
      <label class="usage-label" label={label} hexpand xalign={0} />
      <With value={win}>
        {(w) =>
          w ? (
            <box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.END}>
              <label class="usage-value" label={`${Math.round(w.used_percentage)}%`} xalign={1} />
              <label class="usage-meta" label={`reinicia ${formatTime(w.resets_at)}`} xalign={1} />
            </box>
          ) : (
            <label class="usage-meta" label="indisponível" />
          )
        }
      </With>
    </box>
  )
}

export default function ClaudeUsage() {
  const cache = createPoll<UsageCache>(null, 15000, readCache)
  const fiveHourPercent = cache((c) => (c?.five_hour ? `${Math.round(c.five_hour.used_percentage)}%` : "—"))

  return (
    <menubutton class="ClaudeUsage" hasFrame={false} alwaysShowArrow={false} tooltipText={cache((c) => tooltipFor(c))}>
      <box spacing={4}>
        <image iconName="claude-symbolic" pixelSize={14} />
        <label class="usage-percent" label={fiveHourPercent} />
      </box>
      <popover class="ClaudeUsagePopover">
        <box orientation={Gtk.Orientation.VERTICAL} class="claude-usage-popover" spacing={8}>
          <label class="section-title" label="Uso do Claude Code" xalign={0} />
          <WindowRow label="Sessão (5h)" win={cache((c) => c?.five_hour ?? null)} />
          <WindowRow label="Semana (7d)" win={cache((c) => c?.seven_day ?? null)} />
        </box>
      </popover>
    </menubutton>
  )
}
