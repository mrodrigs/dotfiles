import { Gtk } from "ags/gtk4"
import { For, With } from "ags"
import {
  history,
  unreadCount,
  dontDisturb,
  setDontDisturb,
  removeFromHistory,
  clearHistory,
  markAllRead,
} from "./store"
import NotificationCard from "./NotificationCard"

export default function NotificationCenter() {
  return (
    <menubutton class="NotificationCenter" hasFrame={false} alwaysShowArrow={false}>
      <overlay>
        <image
          pixelSize={14}
          class={dontDisturb((d) => (d ? "muted" : ""))}
          iconName={dontDisturb((d) => (d ? "notification-bell-off-symbolic" : "notification-bell-symbolic"))}
        />
        <box
          $type="overlay"
          class="badge"
          halign={Gtk.Align.END}
          valign={Gtk.Align.START}
          visible={unreadCount((c) => c > 0)}
        >
          <label label={unreadCount((c) => (c > 9 ? "9+" : String(c)))} />
        </box>
      </overlay>
      <popover
        class="NotificationPopover"
        onNotifyVisible={(self) => {
          if (self.visible) markAllRead()
        }}
      >
        <box orientation={Gtk.Orientation.VERTICAL} class="notification-popover" spacing={8}>
          <box class="popover-header" spacing={4}>
            <label class="section-title" label="Notifications" hexpand xalign={0} />
            <button
              class={dontDisturb((d) => (d ? "mute-toggle active" : "mute-toggle"))}
              tooltipText="Mute notifications"
              onClicked={() => setDontDisturb(!dontDisturb.get())}
            >
              <image
                iconName={dontDisturb((d) =>
                  d ? "notification-bell-off-symbolic" : "notification-bell-symbolic",
                )}
                pixelSize={12}
              />
            </button>
            <button class="clear-all" tooltipText="Clear all" onClicked={() => clearHistory()}>
              <image iconName="edit-clear-all-symbolic" pixelSize={12} />
            </button>
          </box>
          <With value={history((list) => list.length === 0)}>
            {(empty) =>
              empty ? (
                <label class="empty" label="No notifications" />
              ) : (
                <scrolledwindow
                  vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                  hscrollbarPolicy={Gtk.PolicyType.NEVER}
                  maxContentHeight={420}
                  propagateNaturalHeight
                >
                  <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                    <For each={history} id={(r) => `${r.id}:${r.rev}`}>
                      {(record) => (
                        <NotificationCard
                          record={record}
                          variant="list"
                          onDismiss={() => removeFromHistory(record.id)}
                        />
                      )}
                    </For>
                  </box>
                </scrolledwindow>
              )
            }
          </With>
        </box>
      </popover>
    </menubutton>
  )
}
