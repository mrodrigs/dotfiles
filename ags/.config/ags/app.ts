import app from "ags/gtk4/app"
import style from "./style.scss"
import Bar from "./widget/Bar"
import Launcher from "./widget/Launcher"
import Popups from "./widget/notifications/Popups"

app.start({
  css: style,
  icons: `${SRC}/icons`,
  main() {
    const monitors = app.get_monitors()
    monitors.map(Bar)
    Launcher()
    if (monitors[0]) Popups(monitors[0])
  },
})
