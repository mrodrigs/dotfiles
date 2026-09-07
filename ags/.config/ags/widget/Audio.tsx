import { Gtk } from "ags/gtk4"
import { createBinding, For, With, type Accessor } from "ags"
import AstalWp from "gi://AstalWp"
import Pango from "gi://Pango"

type Endpoint = InstanceType<typeof AstalWp.Endpoint>

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
        <image
          iconName={mute((m) =>
            m ? "audio-volume-muted-symbolic" : "audio-volume-high-symbolic",
          )}
        />
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
        {(spk) => (
          <image
            pixelSize={14}
            iconName={spk ? createBinding(spk, "volumeIcon") : "audio-volume-high-symbolic"}
          />
        )}
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
