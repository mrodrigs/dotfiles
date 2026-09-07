import { Gtk } from "ags/gtk4"
import { createBinding } from "ags"
import Cava from "gi://AstalCava"

const BAR_COUNT = 28
const MAX_HEIGHT = 14
const MIN_HEIGHT = 2

const GRADIENT_STOPS = ["#78a9ff", "#3ddbd9", "#42be65", "#be95ff", "#ee5396"]

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(rgb: number[]) {
  return "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")
}

function gradientColor(t: number) {
  const segments = GRADIENT_STOPS.length - 1
  const pos = t * segments
  const i = Math.min(Math.floor(pos), segments - 1)
  const frac = pos - i
  const from = hexToRgb(GRADIENT_STOPS[i])
  const to = hexToRgb(GRADIENT_STOPS[i + 1])
  return rgbToHex(from.map((v, idx) => v + (to[idx] - v) * frac))
}

export default function AudioVisualizer() {
  const cava = Cava.get_default()
  cava.set_bars(BAR_COUNT)
  cava.set_active(true)

  const values = createBinding(cava, "values")

  return (
    <box class="AudioVisualizer" spacing={1} valign={Gtk.Align.CENTER} heightRequest={MAX_HEIGHT}>
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <box
          class="visualizer-bar"
          valign={Gtk.Align.END}
          css={`background-color: ${gradientColor(i / (BAR_COUNT - 1))};`}
          heightRequest={values((v) => Math.max(MIN_HEIGHT, Math.round((v?.[i] ?? 0) * MAX_HEIGHT)))}
        />
      ))}
    </box>
  )
}
