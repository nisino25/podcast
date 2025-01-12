import { defineStore } from "pinia";

export const useAudioStore = defineStore("audio", {
  state: () => ({
    currentAudio: {
      src: "",
      title: "",
    },
  }),
  actions: {
    playAudio(src, title) {
      this.currentAudio.src = src;
      this.currentAudio.title = title;
      console.log("Updated currentAudio:", this.currentAudio);
    },
    stopAudio() {
      this.currentAudio.src = "";
      this.currentAudio.title = "";
    },
  },
});
