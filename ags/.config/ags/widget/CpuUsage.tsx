import { createPoll } from "ags/time"
import GLib from "gi://GLib"

type CpuTimes = { idle: number; total: number }

function readCpuTimes(): CpuTimes | null {
  try {
    const [ok, bytes] = GLib.file_get_contents("/proc/stat")
    if (!ok) return null
    const line = new TextDecoder().decode(bytes).split("\n")[0]
    const fields = line.trim().split(/\s+/).slice(1).map(Number)
    const idle = fields[3] + (fields[4] ?? 0)
    const total = fields.reduce((sum, n) => sum + n, 0)
    return { idle, total }
  } catch {
    return null
  }
}

let previous: CpuTimes | null = null

function pollCpuPercent(): number {
  const current = readCpuTimes()
  if (!current) return 0
  if (!previous) {
    previous = current
    return 0
  }
  const idleDelta = current.idle - previous.idle
  const totalDelta = current.total - previous.total
  previous = current
  return totalDelta > 0 ? Math.round((1 - idleDelta / totalDelta) * 100) : 0
}

export default function CpuUsage() {
  const percent = createPoll(0, 2000, pollCpuPercent)

  return (
    <box class="CpuUsage" spacing={4} tooltipText={percent((p) => `CPU: ${p}%`)}>
      <image iconName="cpu-symbolic" pixelSize={14} />
      <label class="stat-percent" label={percent((p) => `${p}%`)} />
    </box>
  )
}
