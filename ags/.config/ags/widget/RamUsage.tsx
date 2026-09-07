import { createPoll } from "ags/time"
import GLib from "gi://GLib"

type MemInfo = { percent: number; usedGiB: number; totalGiB: number }

function readMemInfo(): MemInfo | null {
  try {
    const [ok, bytes] = GLib.file_get_contents("/proc/meminfo")
    if (!ok) return null
    const text = new TextDecoder().decode(bytes)
    const value = (key: string) => {
      const match = text.match(new RegExp(`^${key}:\\s+(\\d+)`, "m"))
      return match ? Number(match[1]) : 0
    }
    const totalKiB = value("MemTotal")
    const availableKiB = value("MemAvailable")
    if (totalKiB === 0) return null
    const usedKiB = totalKiB - availableKiB
    return {
      percent: Math.round((usedKiB / totalKiB) * 100),
      usedGiB: usedKiB / 1024 / 1024,
      totalGiB: totalKiB / 1024 / 1024,
    }
  } catch {
    return null
  }
}

export default function RamUsage() {
  const mem = createPoll<MemInfo | null>(null, 5000, readMemInfo)
  const percent = mem((m) => (m ? m.percent : 0))
  const tooltip = mem((m) =>
    m ? `RAM: ${m.usedGiB.toFixed(1)}G / ${m.totalGiB.toFixed(1)}G` : "RAM: indisponível",
  )

  return (
    <box class="RamUsage" spacing={4} tooltipText={tooltip}>
      <image iconName="memory-symbolic" pixelSize={14} />
      <label class="stat-percent" label={percent((p) => `${p}%`)} />
    </box>
  )
}
