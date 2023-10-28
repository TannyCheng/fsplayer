import { SettingItem } from "@/parts/Controller/items/setting";
import { AUTOPLAY, I18n } from "..";

export const autoPlaySettingItem = (): SettingItem => ({
  id: "autoplay",
  type: "switch",
  html: I18n.t(AUTOPLAY),
  init(player, item) {
    item.checked = player.autoplay;
  },
  change(value, player, item) {
    item.checked = value;
    player.autoplay = item.checked!;
  },
});
