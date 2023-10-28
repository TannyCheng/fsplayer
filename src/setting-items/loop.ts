import { SettingItem } from "@/parts/Controller/items/setting";
import { I18n, LOOP } from "..";

export const loopSettingItem = (): SettingItem => ({
  id: "loop",
  type: "switch",
  html: I18n.t(LOOP),
  init(player, item) {
    item.checked = player.loop;
  },
  change(value, player, item) {
    item.checked = value;
    player.loop = item.checked!;
  },
});
