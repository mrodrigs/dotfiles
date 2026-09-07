import { Gtk } from "ags/gtk4"
import { createBinding, createComputed, createState, For, With, type Accessor } from "ags"
import AstalNetwork from "gi://AstalNetwork"
import Pango from "gi://Pango"

type Wifi = InstanceType<typeof AstalNetwork.Wifi>
type AccessPoint = InstanceType<typeof AstalNetwork.AccessPoint>

function wifiIconName(enabled: boolean, connected: boolean) {
  return enabled && connected ? "wifi-symbolic" : "wifi-off-symbolic"
}

function AccessPointRow({ ap, active }: { ap: AccessPoint; active: Accessor<boolean> }) {
  const ssid = createBinding(ap, "ssid")
  const requiresPassword = ap.requiresPassword
  const [expanded, setExpanded] = createState(false)
  const [password, setPassword] = createState("")

  const connect = (pw: string | null) => {
    ap.activate(pw, (self, res) => {
      try {
        self?.activate_finish(res)
        setExpanded(false)
        setPassword("")
      } catch (e) {
        logError(e as Error, "wifi activate")
      }
    })
  }

  const handleClick = () => {
    if (active()) return
    if (ap.get_connections().length > 0) {
      connect(null)
      return
    }
    if (requiresPassword) setExpanded((v) => !v)
    else connect(null)
  }

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
      <button class={active((a) => (a ? "menu-row active" : "menu-row"))} onClicked={handleClick}>
        <box spacing={8}>
          <label label={ssid} xalign={0} hexpand maxWidthChars={18} ellipsize={Pango.EllipsizeMode.END} />
          <box class="in-use-dot" visible={active} />
        </box>
      </button>
      <revealer revealChild={expanded} transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
        <box class="ap-password" spacing={4}>
          <entry
            class="menu-search"
            hexpand
            placeholderText="Password"
            visibility={false}
            text={password}
            onNotifyText={(self) => setPassword(self.text)}
            onActivate={() => connect(password())}
          />
          <button class="ap-connect" onClicked={() => connect(password())}>
            <label label="Connect" />
          </button>
        </box>
      </revealer>
    </box>
  )
}

function WifiPanel({ wifi }: { wifi: Wifi }) {
  const enabled = createBinding(wifi, "enabled")
  const scanning = createBinding(wifi, "scanning")
  const accessPoints = createBinding(wifi, "accessPoints")
  const activeAp = createBinding(wifi, "activeAccessPoint")

  const sortedAps = createComputed(() => {
    const seen = new Map<string, AccessPoint>()
    for (const ap of accessPoints()) {
      const ssid = ap.ssid
      if (!ssid) continue
      const existing = seen.get(ssid)
      if (!existing || ap.strength > existing.strength) seen.set(ssid, ap)
    }
    return [...seen.values()].sort((a, b) => b.strength - a.strength)
  })

  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="network-popover" spacing={8}>
      <box spacing={8}>
        <label class="section-title" label="Wi-Fi" hexpand xalign={0} />
        <button class="scan-toggle" onClicked={() => wifi.scan()}>
          <label label={scanning((s) => (s ? "Scanning…" : "Refresh"))} />
        </button>
        <button
          class={enabled((e) => (e ? "power-toggle active" : "power-toggle"))}
          onClicked={() => wifi.set_enabled(!wifi.enabled)}
        >
          <label label={enabled((e) => (e ? "On" : "Off"))} />
        </button>
      </box>
      <With value={enabled}>
        {(en) =>
          en ? (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
              <With value={sortedAps}>
                {(list) =>
                  list.length === 0 ? (
                    <label class="menu-empty" label="No networks found" />
                  ) : null
                }
              </With>
              <For each={sortedAps} id={(ap) => ap.ssid ?? ap.bssid}>
                {(ap) => <AccessPointRow ap={ap} active={activeAp((a) => a?.ssid === ap.ssid)} />}
              </For>
            </box>
          ) : (
            <label class="menu-empty" label="Wi-Fi off" />
          )
        }
      </With>
    </box>
  )
}

export default function NetworkButton() {
  const network = AstalNetwork.Network.get_default()
  const wifi = createBinding(network, "wifi")

  return (
    <menubutton class="NetworkButton" hasFrame={false} alwaysShowArrow={false}>
      <With value={wifi}>
        {(wf) => {
          if (!wf) {
            return (
              <box spacing={4}>
                <image pixelSize={14} iconName="wifi-off-symbolic" />
              </box>
            )
          }

          const enabled = createBinding(wf, "enabled")
          const ssid = createBinding(wf, "ssid")
          const icon = createComputed(() => wifiIconName(enabled(), !!ssid()))
          const label = createComputed(() => (enabled() ? (ssid() ?? "Disconnected") : "Off"))

          return (
            <box spacing={4}>
              <image pixelSize={14} iconName={icon} />
              <label class="network-label" label={label} maxWidthChars={12} ellipsize={Pango.EllipsizeMode.END} />
            </box>
          )
        }}
      </With>
      <popover class="NetworkPopover">
        <With value={wifi}>
          {(wf) =>
            wf ? (
              <WifiPanel wifi={wf} />
            ) : (
              <box class="network-popover">
                <label class="menu-empty" label="No Wi-Fi device" />
              </box>
            )
          }
        </With>
      </popover>
    </menubutton>
  )
}
