import { createState, createComputed, createBinding } from "ags"
import { timeout, type Timer } from "ags/time"
import Notifd from "gi://AstalNotifd"

export type NotificationRecord = {
  id: number
  rev: number
  appName: string
  appIcon: string
  summary: string
  body: string
  time: number
  urgency: Notifd.Urgency
  image: string
  read: boolean
}

const POPUP_TIMEOUT = 6000
const POPUP_TIMEOUT_CRITICAL = 20000

export const notifd = Notifd.get_default()

export const dontDisturb = createBinding(notifd, "dontDisturb")

export function setDontDisturb(value: boolean) {
  notifd.set_dont_disturb(value)
}

const [history, setHistory] = createState<NotificationRecord[]>([])
const [popups, setPopups] = createState<NotificationRecord[]>([])

export { history, popups }

export const unreadCount = createComputed(() => history().filter((r) => !r.read).length)

const revisions = new Map<number, number>()

function nextRevision(id: number) {
  const rev = (revisions.get(id) ?? 0) + 1
  revisions.set(id, rev)
  return rev
}

function toRecord(n: InstanceType<typeof Notifd.Notification>): NotificationRecord {
  return {
    id: n.id,
    rev: nextRevision(n.id),
    appName: n.appName || "Notificação",
    appIcon: n.appIcon,
    summary: n.summary,
    body: n.body,
    time: n.time,
    urgency: n.urgency,
    image: n.image,
    read: false,
  }
}

const popupTimers = new Map<number, Timer>()

function schedulePopupDismiss(id: number, urgency: Notifd.Urgency) {
  popupTimers.get(id)?.cancel()
  const ms = urgency === Notifd.Urgency.CRITICAL ? POPUP_TIMEOUT_CRITICAL : POPUP_TIMEOUT
  popupTimers.set(
    id,
    timeout(ms, () => dismissPopup(id)),
  )
}

export function dismissPopup(id: number) {
  popupTimers.get(id)?.cancel()
  popupTimers.delete(id)
  setPopups((list) => list.filter((r) => r.id !== id))
}

notifd.connect("notified", (_source, id: number) => {
  const n = notifd.get_notification(id)
  if (!n) return
  const record = toRecord(n)

  setHistory((list) => [record, ...list.filter((r) => r.id !== id)])

  if (!notifd.dontDisturb) {
    setPopups((list) => [record, ...list.filter((r) => r.id !== id)])
    schedulePopupDismiss(id, record.urgency)
  }
})

notifd.connect("resolved", (_source, id: number) => {
  dismissPopup(id)
})

export function removeFromHistory(id: number) {
  setHistory((list) => list.filter((r) => r.id !== id))
  notifd.get_notification(id)?.dismiss()
  dismissPopup(id)
  revisions.delete(id)
}

export function clearHistory() {
  const ids = history.get().map((r) => r.id)
  setHistory([])
  for (const id of ids) {
    notifd.get_notification(id)?.dismiss()
    dismissPopup(id)
    revisions.delete(id)
  }
}

export function markAllRead() {
  setHistory((list) => (list.some((r) => !r.read) ? list.map((r) => ({ ...r, read: true })) : list))
}
