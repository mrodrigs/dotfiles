import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createState, createComputed, For, With } from "ags"
import Gio from "gi://Gio"
import GLib from "gi://GLib"
import Pango from "gi://Pango"

const HISTORY_FILE = `${GLib.get_home_dir()}/.cache/ags/clipboard-history.json`

type ClipboardEntry = {
  id: string
  type: "text" | "image"
  text?: string
  image_path?: string
  preview: string
  mime: string
  timestamp: number
}

function readHistory(): ClipboardEntry[] {
  try {
    const [ok, bytes] = GLib.file_get_contents(HISTORY_FILE)
    if (!ok) return []
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return []
  }
}

function formatTime(epoch: number) {
  return GLib.DateTime.new_from_unix_local(epoch).format("%H:%M")!
}

function copyEntry(item: ClipboardEntry) {
  if (item.type === "text") {
    Gio.Subprocess.new(["wl-copy", "--", item.text ?? ""], Gio.SubprocessFlags.NONE)
    return
  }
  if (!item.image_path) return
  const [ok, bytes] = GLib.file_get_contents(item.image_path)
  if (!ok) return
  const proc = Gio.Subprocess.new(["wl-copy", "--type", item.mime], Gio.SubprocessFlags.STDIN_PIPE)
  proc.communicate(new GLib.Bytes(bytes), null)
}

export default function ClipboardHistory() {
  const [query, setQuery] = createState("")
  const [selected, setSelected] = createState(0)
  const [history, setHistory] = createState<ClipboardEntry[]>([])

  const results = createComputed(() => {
    const q = query().trim().toLowerCase()
    if (!q) return history()
    return history().filter((item) => item.preview.toLowerCase().includes(q))
  })
  const isEmpty = createComputed(() => results().length === 0)

  let win: Astal.Window
  let entry: Gtk.Entry

  function select(item?: ClipboardEntry) {
    const target = item ?? results.get()[selected.get()]
    if (!target) return
    copyEntry(target)
    win.set_visible(false)
  }

  function move(delta: number) {
    const max = Math.max(results.get().length - 1, 0)
    setSelected(Math.min(Math.max(selected.get() + delta, 0), max))
  }

  return (
    <window
      $={(self) => (win = self)}
      name="clipboard-history"
      namespace="ags-clipboard-history"
      class="ClipboardHistory"
      application={app}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      exclusivity={Astal.Exclusivity.IGNORE}
      onNotifyVisible={(self) => {
        if (!self.visible) return
        setHistory(readHistory())
        setQuery("")
        setSelected(0)
        entry.set_text("")
        entry.grab_focus()
      }}
    >
      <Gtk.EventControllerKey
        onKeyPressed={(_self, keyval: number) => {
          if (keyval === Gdk.KEY_Escape) {
            win.set_visible(false)
            return true
          }
          if (keyval === Gdk.KEY_Down) {
            move(1)
            return true
          }
          if (keyval === Gdk.KEY_Up) {
            move(-1)
            return true
          }
          return false
        }}
      />
      <box class="clipboard-history-box" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
        <entry
          $={(self) => (entry = self)}
          class="menu-search"
          placeholderText="Filter history..."
          onNotifyText={(self) => {
            setQuery(self.text)
            setSelected(0)
          }}
          onActivate={() => select()}
        />
        <With value={isEmpty}>
          {(empty) =>
            empty ? (
              <label class="menu-empty" label="History empty" />
            ) : (
              <scrolledwindow
                class="results"
                vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
                hscrollbarPolicy={Gtk.PolicyType.NEVER}
                maxContentHeight={420}
                propagateNaturalHeight
              >
                <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
                  <For each={results}>
                    {(item, index) => (
                      <button
                        class={createComputed(() =>
                          index() === selected() ? "menu-row selected" : "menu-row",
                        )}
                        onClicked={() => select(item)}
                      >
                        <box spacing={10}>
                          {item.type === "image" ? (
                            <image file={item.image_path} pixelSize={32} />
                          ) : (
                            <image iconName="edit-copy-symbolic" pixelSize={20} />
                          )}
                          <box orientation={Gtk.Orientation.VERTICAL} hexpand valign={Gtk.Align.CENTER}>
                            <label
                              label={item.type === "image" ? "Image" : item.preview}
                              xalign={0}
                              maxWidthChars={48}
                              ellipsize={Pango.EllipsizeMode.END}
                            />
                            <label class="menu-row-time" label={formatTime(item.timestamp)} xalign={0} />
                          </box>
                        </box>
                      </button>
                    )}
                  </For>
                </box>
              </scrolledwindow>
            )
          }
        </With>
      </box>
    </window>
  )
}
