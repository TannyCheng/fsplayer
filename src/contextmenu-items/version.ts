import { ContextMenuItem } from "@/parts/Contextmenu";

export const versionContextMenuItem = (): ContextMenuItem => ({
  id: "version",
  html: `FSPlayer v${__VERSION__}`,
  click(player, item) {
    const a = document.createElement("a");
    a.target = "_blank";
    a.href = "https://github.com/TannyCheng/fsplayer";
    a.style.display = "none";
    const click = (e: MouseEvent) => e.stopPropagation();
    a.addEventListener("click", click);
    player.el.appendChild(a);
    a.click();
    a.removeEventListener("click", click);
    a.remove();
  },
});
