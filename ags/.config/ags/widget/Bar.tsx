import app from "ags/gtk4/app"
import { Astal, Gdk } from "ags/gtk4"
import { createBinding, For } from "ags"
import { createPoll } from "ags/time"
import GLib from "gi://GLib"
import Hyprland from "gi://AstalHyprland"
import AudioButton from "./Audio"
import NotificationCenter from "./notifications/NotificationCenter"

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const hypr = Hyprland.get_default()
  const workspaces = createBinding(hypr, "workspaces")
  const focusedId = createBinding(hypr, "focusedWorkspace")((ws) => ws?.id)

  const time = createPoll("", 1000, () =>
    GLib.DateTime.new_now_local().format("%H:%M:%S")!,
  )

  const date = createPoll("", 60000, () =>
    GLib.DateTime.new_now_local().format("%a, %B %-e")!,
  )

  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name="bar"
      namespace="ags-bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP | LEFT | RIGHT}
      application={app}
    >
      <centerbox cssName="centerbox">
        <box $type="start" class="workspaces" spacing={4}>
          <For
            each={workspaces((list) =>
              [...list].filter((ws) => ws.id > 0).sort((a, b) => a.id - b.id),
            )}
          >
            {(ws) => (
              <button
                class={focusedId((id) => (id === ws.id ? "workspace focused" : "workspace"))}
                onClicked={() => ws.focus()}
              >
                <label label={String(ws.id)} />
              </button>
            )}
          </For>
        </box>
        <box $type="center" spacing={6}>
          <label class="clock" label={time} />
          <label class="date" label={date} />
        </box>
        <box $type="end" spacing={4}>
          <AudioButton />
          <NotificationCenter />
        </box>
      </centerbox>
    </window>
  )
}
