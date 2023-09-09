import Player from "@/player";
import "./style.css";

window.onload = function () {
  let player = new Player({
    url: "http://localhost:3000/api/1.mp4",
    container: document.getElementById("video"),
    streamPlay: true,
  });
};
