import { $, useNameSpace } from "@/utils";
import { ControlItem } from "..";

const { b } = useNameSpace("spacer");

export const spacerControlItem = (): ControlItem => ({
  el: $(`.${b()}`),
  id: "spacer",
});
