import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createState, createComputed } from "ags"
import Gio from "gi://Gio"

type Action = {
  label: string
  icon: string
  run: () => void
}

function spawn(cmd: string[]) {
  Gio.Subprocess.new(cmd, Gio.SubprocessFlags.NONE)
}

export default function PowerMenu() {
  const [selected, setSelected] = createState(0)

  let win: Astal.Window

  const actions: Action[] = [
    { label: "Lock", icon: "system-lock-screen-symbolic", run: () => spawn(["hyprlock"]) },
    { label: "Log Out", icon: "system-log-out-symbolic", run: () => spawn(["uwsm", "stop"]) },
    { label: "Shut Down", icon: "system-shutdown-symbolic", run: () => spawn(["systemctl", "poweroff"]) },
  ]

  function trigger(action?: Action) {
    const target = action ?? actions[selected.get()]
    if (!target) return
    win.set_visible(false)
    target.run()
  }

  function move(delta: number) {
    const max = actions.length - 1
    setSelected(Math.min(Math.max(selected.get() + delta, 0), max))
  }

  return (
    <window
      $={(self) => (win = self)}
      name="power-menu"
      namespace="ags-power-menu"
      class="PowerMenu"
      application={app}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      exclusivity={Astal.Exclusivity.IGNORE}
      onNotifyVisible={(self) => {
        if (!self.visible) return
        setSelected(0)
      }}
    >
      <Gtk.EventControllerKey
        onKeyPressed={(_self, keyval: number) => {
          if (keyval === Gdk.KEY_Escape) {
            win.set_visible(false)
            return true
          }
          if (keyval === Gdk.KEY_Left) {
            move(-1)
            return true
          }
          if (keyval === Gdk.KEY_Right) {
            move(1)
            return true
          }
          if (keyval === Gdk.KEY_Return) {
            trigger()
            return true
          }
          return false
        }}
      />
      <box class="power-menu-box" spacing={8}>
        {actions.map((action, index) => (
          <button
            class={createComputed(() =>
              index === selected() ? "power-menu-row selected" : "power-menu-row",
            )}
            onClicked={() => trigger(action)}
          >
            <box orientation={Gtk.Orientation.VERTICAL} spacing={8} halign={Gtk.Align.CENTER}>
              <image iconName={action.icon} pixelSize={32} />
              <label label={action.label} />
            </box>
          </button>
        ))}
      </box>
    </window>
  )
}
