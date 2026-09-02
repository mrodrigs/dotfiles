#!/usr/bin/env bash
# hypr-kill-focused.sh
# Mata instantaneamente (SIGKILL) o processo da janela focada no Hyprland.
# Diferente do "killactive" nativo que envia SIGTERM (fecha normalmente),
# este script envia SIGKILL — o processo não tem chance de resistir.

# Pega o PID do processo da janela ativa via hyprctl
FOCUSED_PID=$(hyprctl activewindow -j | jq -r '.pid')

if [[ -z "$FOCUSED_PID" || "$FOCUSED_PID" == "null" || "$FOCUSED_PID" -le 0 ]]; then
    notify-send "hypr-kill" "Nenhuma janela focada encontrada." --urgency=low
    exit 1
fi

# Pega o nome do processo para notificação (opcional)
PROC_NAME=$(ps -p "$FOCUSED_PID" -o comm= 2>/dev/null || echo "desconhecido")

# Envia SIGKILL para toda a árvore de processos (processo pai + filhos)
kill -9 "$FOCUSED_PID" 2>/dev/null

# Notificação visual (requer libnotify / um daemon como dunst, mako, etc.)
notify-send "⚡ Processo eliminado" "PID $FOCUSED_PID ($PROC_NAME) foi morto." \
    --urgency=normal \
    --expire-time=2000
