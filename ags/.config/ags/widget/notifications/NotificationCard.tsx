import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib"
import Pango from "gi://Pango"
import Notifd from "gi://AstalNotifd"
import type { NotificationRecord } from "./store"

function urgencyClass(urgency: Notifd.Urgency) {
  switch (urgency) {
    case Notifd.Urgency.CRITICAL:
      return "critical"
    case Notifd.Urgency.LOW:
      return "low"
    default:
      return "normal"
  }
}

export default function NotificationCard({
  record,
  variant,
  onDismiss,
}: {
  record: NotificationRecord
  variant: "toast" | "list"
  onDismiss: () => void
}) {
  const time = GLib.DateTime.new_from_unix_local(record.time).format("%H:%M")!

  return (
    <box
      class={`NotificationCard ${variant} ${urgencyClass(record.urgency)}`}
      orientation={Gtk.Orientation.VERTICAL}
      spacing={4}
    >
      <box class="header" spacing={6}>
        {record.image ? (
          <image class="app-icon" file={record.image} pixelSize={16} />
        ) : (
          <image
            class="app-icon"
            iconName={record.appIcon || "dialog-information-symbolic"}
            pixelSize={16}
          />
        )}
        <label class="app-name" label={record.appName} xalign={0} hexpand ellipsize={Pango.EllipsizeMode.END} />
        <label class="time" label={time} />
        <button class="dismiss" onClicked={onDismiss}>
          <image iconName="window-close-symbolic" pixelSize={10} />
        </button>
      </box>
      <label
        class="summary"
        label={record.summary}
        xalign={0}
        wrap
        lines={2}
        maxWidthChars={32}
        ellipsize={Pango.EllipsizeMode.END}
      />
      {record.body && (
        <label
          class="body"
          label={record.body}
          xalign={0}
          wrap
          lines={3}
          maxWidthChars={32}
          ellipsize={Pango.EllipsizeMode.END}
        />
      )}
    </box>
  )
}
