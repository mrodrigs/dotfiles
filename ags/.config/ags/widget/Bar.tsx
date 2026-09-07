import app from "ags/gtk4/app"
import { Astal, Gdk } from "ags/gtk4"
import { createBinding, For } from "ags"
import { createPoll } from "ags/time"
import GLib from "gi://GLib"
import Hyprland from "gi://AstalHyprland"
import AudioButton from "./Audio"

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const hypr = Hyprland.get_default()
  const workspaces = createBinding(hypr, "workspaces")
  const focusedId = createBinding(hypr, "focusedWorkspace")((ws) => ws?.id)

  const time = createPoll("", 1000, () =>
    GLib.DateTime.new_now_local().format("%H:%M:%S")!,
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
          <For each={workspaces((list) => [...list].sort((a, b) => a.id - b.id))}>
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
        <label $type="center" class="clock" label={time} />
        <box $type="end">
          <AudioButton />
        </box>
      </centerbox>
    </window>
  )
}
