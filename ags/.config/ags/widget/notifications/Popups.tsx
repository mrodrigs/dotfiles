import { Gtk, Gdk } from "ags/gtk4"
import { For } from "ags"
import { popups } from "./store"
import Popup from "./Popup"

export default function Popups(gdkmonitor: Gdk.Monitor) {
  return (
    <For each={popups} id={(r) => `${r.id}:${r.rev}`} cleanup={(win) => (win as Gtk.Window).destroy()}>
      {(record, index) => <Popup record={record} index={index} gdkmonitor={gdkmonitor} />}
    </For>
  )
}
