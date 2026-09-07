import app from "ags/gtk4/app"
import { Astal, Gtk, Gdk } from "ags/gtk4"
import { createState, createComputed, For, With } from "ags"
import AstalApps from "gi://AstalApps"

const MAX_RESULTS = 9

export default function Launcher() {
  const apps = new AstalApps.Apps()

  const [query, setQuery] = createState("")
  const [selected, setSelected] = createState(0)

  const results = createComputed(() =>
    [...apps.fuzzy_query(query())].slice(0, MAX_RESULTS),
  )
  const isEmpty = createComputed(() => results().length === 0)

  let win: Astal.Window
  let entry: Gtk.Entry

  function launch(target?: AstalApps.Application) {
    const app_ = target ?? results.get()[selected.get()]
    if (!app_) return
    app_.launch()
    win.set_visible(false)
  }

  function move(delta: number) {
    const max = Math.max(results.get().length - 1, 0)
    setSelected(Math.min(Math.max(selected.get() + delta, 0), max))
  }

  return (
    <window
      $={(self) => (win = self)}
      name="launcher"
      namespace="ags-launcher"
      class="Launcher"
      application={app}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.ON_DEMAND}
      exclusivity={Astal.Exclusivity.IGNORE}
      onNotifyVisible={(self) => {
        if (!self.visible) return
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
      <box class="launcher-box" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
        <entry
          $={(self) => (entry = self)}
          class="menu-search"
          placeholderText="Pesquisar apps..."
          onNotifyText={(self) => {
            setQuery(self.text)
            setSelected(0)
          }}
          onActivate={() => launch()}
        />
        <With value={isEmpty}>
          {(empty) =>
            empty ? (
              <label class="menu-empty" label="Nenhum app encontrado" />
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
                        onClicked={() => launch(item)}
                      >
                        <box spacing={10}>
                          <image gicon={item.app.get_icon()} pixelSize={32} />
                          <label label={item.name} xalign={0} hexpand />
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
