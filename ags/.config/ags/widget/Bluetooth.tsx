import { Gtk } from "ags/gtk4"
import { createBinding, createComputed, For, With } from "ags"
import AstalBluetooth from "gi://AstalBluetooth"
import GLib from "gi://GLib"
import Pango from "gi://Pango"

type Bluetooth = InstanceType<typeof AstalBluetooth.Bluetooth>
type Adapter = InstanceType<typeof AstalBluetooth.Adapter>
type BtDevice = InstanceType<typeof AstalBluetooth.Device>

function DeviceRow({ device }: { device: BtDevice }) {
  const alias = createBinding(device, "alias")
  const connected = createBinding(device, "connected")
  const connecting = createBinding(device, "connecting")

  const handleClick = () => {
    if (device.connected) {
      device.disconnect_device((self, res) => {
        try {
          self?.disconnect_device_finish(res)
        } catch (e) {
          logError(e as Error, "bt disconnect")
        }
      })
      return
    }
    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      if (!device.paired) {
        try {
          device.pair()
        } catch (e) {
          logError(e as Error, "bt pair")
          return GLib.SOURCE_REMOVE
        }
      }
      device.connect_device((self, res) => {
        try {
          self?.connect_device_finish(res)
        } catch (e) {
          logError(e as Error, "bt connect")
        }
      })
      return GLib.SOURCE_REMOVE
    })
  }

  return (
    <button class={connected((c) => (c ? "menu-row active" : "menu-row"))} onClicked={handleClick}>
      <box spacing={8}>
        <box class="in-use-dot" visible={connected} />
        <label label={alias} xalign={0} hexpand maxWidthChars={18} ellipsize={Pango.EllipsizeMode.END} />
        <label class="menu-row-time" label="conectando…" visible={connecting} />
      </box>
    </button>
  )
}

function AdapterScanButton({ adapter }: { adapter: Adapter }) {
  const discovering = createBinding(adapter, "discovering")

  return (
    <button
      class="scan-toggle"
      onClicked={() => {
        try {
          if (adapter.discovering) adapter.stop_discovery()
          else adapter.start_discovery()
        } catch (e) {
          logError(e as Error, "bt discovery")
        }
      }}
    >
      <label label={discovering((d) => (d ? "Buscando…" : "Buscar"))} />
    </button>
  )
}

function BluetoothPanel({ bluetooth }: { bluetooth: Bluetooth }) {
  const devices = createBinding(bluetooth, "devices")
  const powered = createBinding(bluetooth, "isPowered")
  const adapter = createBinding(bluetooth, "adapter")

  const knownDevices = createComputed(() =>
    devices()
      .filter((d) => d.paired || d.connected)
      .sort((a, b) => Number(b.connected) - Number(a.connected)),
  )

  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="bluetooth-popover" spacing={8}>
      <box spacing={8}>
        <label class="section-title" label="Bluetooth" hexpand xalign={0} />
        <With value={adapter}>{(ad) => (ad ? <AdapterScanButton adapter={ad} /> : null)}</With>
        <button
          class={powered((p) => (p ? "power-toggle active" : "power-toggle"))}
          onClicked={() => bluetooth.toggle()}
        >
          <label label={powered((p) => (p ? "Ativado" : "Desativado"))} />
        </button>
      </box>
      <With value={powered}>
        {(on) =>
          on ? (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
              <With value={knownDevices}>
                {(list) =>
                  list.length === 0 ? (
                    <label class="menu-empty" label="Nenhum dispositivo pareado" />
                  ) : null
                }
              </With>
              <For each={knownDevices} id={(d) => d.address}>
                {(device) => <DeviceRow device={device} />}
              </For>
            </box>
          ) : (
            <label class="menu-empty" label="Bluetooth desativado" />
          )
        }
      </With>
    </box>
  )
}

export default function BluetoothButton() {
  const bluetooth = AstalBluetooth.Bluetooth.get_default()
  const powered = createBinding(bluetooth, "isPowered")

  return (
    <menubutton class="BluetoothButton" hasFrame={false} alwaysShowArrow={false}>
      <box spacing={4}>
        <image
          pixelSize={14}
          iconName="bluetooth-symbolic"
          class={powered((p) => (p ? "" : "dim"))}
        />
      </box>
      <popover class="BluetoothPopover">
        <BluetoothPanel bluetooth={bluetooth} />
      </popover>
    </menubutton>
  )
}
