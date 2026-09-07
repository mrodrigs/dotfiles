import { Gtk } from "ags/gtk4"
import { createBinding, createComputed, For, With, type Accessor } from "ags"
import AstalWp from "gi://AstalWp"
import Pango from "gi://Pango"

type Endpoint = InstanceType<typeof AstalWp.Endpoint>

function volumeIconName(muted: boolean, volume: number) {
  if (muted || volume <= 0) return "sound-muted-symbolic"
  if (volume < 0.33) return "sound-low-symbolic"
  if (volume < 0.66) return "sound-medium-symbolic"
  return "sound-high-symbolic"
}

function DeviceRow({
  endpoint,
  isDefault,
}: {
  endpoint: Endpoint
  isDefault: Accessor<boolean>
}) {
  const volume = createBinding(endpoint, "volume")
  const mute = createBinding(endpoint, "mute")
  const description = createBinding(endpoint, "description")
  const inUse = createBinding(endpoint, "state")((s) => s === AstalWp.NodeState.RUNNING)

  return (
    <box class="device-row" spacing={8} valign={Gtk.Align.CENTER}>
      <button
        class={isDefault((d) => (d ? "device-name active" : "device-name"))}
        hexpand
        onClicked={() => endpoint.set_is_default(true)}
      >
        <box spacing={6}>
          <box class="in-use-dot" visible={inUse} />
          <label
            label={description}
            xalign={0}
            hexpand
            maxWidthChars={20}
            ellipsize={Pango.EllipsizeMode.END}
          />
        </box>
      </button>
      <button class="mute-toggle" onClicked={() => endpoint.set_mute(!endpoint.mute)}>
        <image iconName={mute((m) => (m ? "sound-muted-symbolic" : "sound-high-symbolic"))} />
      </button>
      <slider
        class="volume-slider"
        hexpand
        min={0}
        max={1}
        value={volume}
        onChangeValue={(_self, _scroll, value: number) => {
          endpoint.set_volume(value)
        }}
      />
    </box>
  )
}

function DeviceSection({
  title,
  devices,
  defaultDevice,
}: {
  title: string
  devices: Accessor<Endpoint[]>
  defaultDevice: Accessor<Endpoint | null>
}) {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} class="device-section" spacing={4}>
      <label class="section-title" label={title} xalign={0} />
      <For each={devices}>
        {(endpoint) => (
          <DeviceRow endpoint={endpoint} isDefault={defaultDevice((d) => d?.id === endpoint.id)} />
        )}
      </For>
    </box>
  )
}

export default function AudioButton() {
  const wp = AstalWp.get_default()!
  const audio = wp.audio

  const speaker = createBinding(audio, "defaultSpeaker")
  const microphone = createBinding(audio, "defaultMicrophone")
  const speakers = createBinding(audio, "speakers")
  const microphones = createBinding(audio, "microphones")

  return (
    <menubutton class="AudioButton" hasFrame={false} alwaysShowArrow={false}>
      <With value={speaker}>
        {(spk) => {
          if (!spk) {
            return (
              <box spacing={4}>
                <image pixelSize={14} iconName="sound-muted-symbolic" />
                <label class="volume-percent" label="0%" />
              </box>
            )
          }

          const volume = createBinding(spk, "volume")
          const mute = createBinding(spk, "mute")
          const icon = createComputed(() => volumeIconName(mute(), volume()))

          return (
            <box spacing={4}>
              <image pixelSize={14} iconName={icon} />
              <label class="volume-percent" label={volume((v) => `${Math.round(v * 100)}%`)} />
            </box>
          )
        }}
      </With>
      <popover class="AudioPopover">
        <box orientation={Gtk.Orientation.VERTICAL} class="audio-popover" spacing={12}>
          <DeviceSection title="Saída" devices={speakers} defaultDevice={speaker} />
          <DeviceSection title="Entrada" devices={microphones} defaultDevice={microphone} />
        </box>
      </popover>
    </menubutton>
  )
}
