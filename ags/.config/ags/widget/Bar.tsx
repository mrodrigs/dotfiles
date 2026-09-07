import app from "ags/gtk4/app"
import { Astal, Gdk } from "ags/gtk4"
import { createBinding, createComputed, For, With } from "ags"
import { createPoll } from "ags/time"
import GLib from "gi://GLib"
import Hyprland from "gi://AstalHyprland"
import AudioButton from "./Audio"
import NotificationCenter from "./notifications/NotificationCenter"
import ClaudeUsage from "./ClaudeUsage"

type Monitor = InstanceType<typeof Hyprland.Monitor>

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const hypr = Hyprland.get_default()
  const workspaces = createBinding(hypr, "workspaces")
  const monitors = createBinding(hypr, "monitors")
  const focusedId = createBinding(hypr, "focusedWorkspace")((ws) => ws?.id)
  const focusedMonitorId = createBinding(hypr, "focusedMonitor")((m) => m?.id)

  const monitorIds = createComputed(() => {
    const list = workspaces()
    monitors()
    const monitorById = new Map<number, Monitor>()
    for (const ws of list) if (ws.id > 0 && ws.monitor) monitorById.set(ws.monitor.id, ws.monitor)
    return [...monitorById.entries()]
      .sort(([, a], [, b]) => a.x - b.x)
      .map(([id]) => id)
  })

  const workspacesFor = (monitorId: number) =>
    workspaces((list) =>
      [...list]
        .filter((ws) => ws.id > 0 && ws.monitor?.id === monitorId)
        .sort((a, b) => a.id - b.id),
    )

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
        <box $type="start" class="workspaces" spacing={6}>
          <For each={monitorIds} id={(id) => id}>
            {(monitorId, index) => (
              <box spacing={0}>
                <With value={index((i) => i > 0)}>
                  {(showDivider) => (showDivider ? <box class="workspace-divider" /> : null)}
                </With>
                <box
                  class={focusedMonitorId((id) =>
                    id === monitorId ? "workspace-group focused" : "workspace-group",
                  )}
                  spacing={4}
                >
                  <For each={workspacesFor(monitorId)} id={(ws) => ws.id}>
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
              </box>
            )}
          </For>
        </box>
        <box $type="center" spacing={6}>
          <label class="clock" label={time} />
          <label class="date" label={date} />
        </box>
        <box $type="end" spacing={10}>
          <ClaudeUsage />
          <AudioButton />
          <NotificationCenter />
        </box>
      </centerbox>
    </window>
  )
}
