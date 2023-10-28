import { ContextMenuItem } from "@/parts/Contextmenu";
import { $, useNameSpace } from "@/utils";

export const statisticsContextMenuItem = (): ContextMenuItem => ({
  id: "statistics",
  html: "视频统计信息",
  click(player, item) {
    console.log("click:", "statistics");

    // const { b } = useNameSpace("statistics");
    // const statistics = $(`.${b()}`);
    // player.getVideoInfo();
  },
});
