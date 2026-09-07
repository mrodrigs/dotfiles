import app from "ags/gtk4/app"
import { Astal, Gdk } from "ags/gtk4"
import type { Accessor } from "ags"
import NotificationCard from "./NotificationCard"
import { dismissPopup, type NotificationRecord } from "./store"

const BASE_MARGIN = 32
const SLOT_HEIGHT = 140

export default function Popup({
  record,
  index,
  gdkmonitor,
}: {
  record: NotificationRecord
  index: Accessor<number>
  gdkmonitor: Gdk.Monitor
}) {
  const { TOP, RIGHT } = Astal.WindowAnchor

  return (
    <window
      visible
      name={`notification-popup-${record.id}`}
      namespace="ags-notifications"
      class="Popups"
      gdkmonitor={gdkmonitor}
      layer={Astal.Layer.OVERLAY}
      anchor={TOP | RIGHT}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.NONE}
      marginTop={index((i) => BASE_MARGIN + i * SLOT_HEIGHT)}
      marginRight={8}
      application={app}
    >
      <NotificationCard
        record={record}
        variant="toast"
        onDismiss={() => dismissPopup(record.id)}
      />
    </window>
  )
}
