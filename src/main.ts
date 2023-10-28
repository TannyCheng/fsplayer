import { Player } from "@/player";
import "./style.scss";

window.onload = function () {
  let player = new Player({
    src: "http://localhost:3000/api/1.mp4",
    container: document.getElementById("video")!,
    stream: true,
    volumeVertical: false,
    posterEnable: true,
  });
  player.mount(document.getElementById("video")!);
};
