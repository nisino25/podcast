<template>
  <div v-if="episodes.length" class="mt-6">
    <!-- Header -->
    <div class="flex justify-between p-2 items-center pb-2">
      <h2 class="text-lg font-semibold">Episodes: {{ episodes.length }}</h2>
      <button @click="toggleShowFinished">
        <i
          :class="!showFinished ? 'fa fa-eye' : 'fa-solid fa-eye-slash'"
          class="text-2xl"
        ></i>
      </button>
    </div>

    <!-- Episodes List -->
    <ul class="space-y-4 mb-20 pb-20">
      <li
        v-for="(episode, index) in filteredEpisodes"
        :key="index"
        class="border p-2 rounded bg-gray-100 cursor-pointer"
        @click="playAudio(episode)"
      >
        <!-- Episode Title -->
        <h3 class="text-lg font-semibold">
          {{ index + 1 }}. {{ episode.title }}
        </h3>

        <!-- Episode Details -->
        <div class="flex justify-between p-2 items-center pb-0">
          <small class="text-sm text-gray-600">
            {{ formatDate(episode.pubDate) }}
          </small>

          <small v-if="getHistory(episode.guid)" class="float-right">
            {{ getHistory(episode.guid) }}
          </small>

          <button @click.stop="toggleFinished(episode)" class="transition">
            <i
              :class="episode.finished ? 'fa fa-check' : 'fa-solid fa-headphones-simple'"
              class="text-1xl"
            ></i>
          </button>
        </div>
      </li>
    </ul>

    <!-- Audio Player -->
    <div
      v-if="currentAudio.src"
      class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex flex-col items-center px-4 py-2 shadow-md z-50"
    >
      <!-- Episode Title -->
      <div class="text-center">
        <h3 class="truncate text-sm">{{ currentAudio.title }}</h3>
        <br />
        <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
      </div>
      <br />

      <!-- Audio Controls -->
      <div class="flex items-center space-x-4">
        <!-- Backward 20 seconds -->
        <button @click="skipAudio(-20)">
          <i class="fa fa-backward text-lg"></i>
        </button>

        <!-- Backward 5 seconds -->
        <button @click="skipAudio(-5)">
          <i class="fa fa-step-backward text-lg"></i>
        </button>

        <!-- Play/Pause -->
        <button @click="togglePlay">
          <i :class="isPaused ? 'fa fa-play' : 'fa fa-pause'" class="text-lg"></i>
        </button>

        <!-- Forward 5 seconds -->
        <button @click="skipAudio(5)">
          <i class="fa fa-step-forward text-lg"></i>
        </button>

        <!-- Forward 20 seconds -->
        <button @click="skipAudio(20)">
          <i class="fa fa-forward text-lg"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    episodes: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      showFinished: true,
      currentAudio: {
        src: "",
        title: "",
      },
      audio: null,
      isPaused: true,
      currentTime: 0,
      duration: 0,
    };
  },
  computed: {
    filteredEpisodes() {
      return this.showFinished
        ? this.episodes
        : this.episodes.filter((episode) => !episode.finished);
    },
  },
  methods: {
    toggleShowFinished() {
      this.showFinished = !this.showFinished;
    },
    toggleFinished(episode) {
      episode.finished = !episode.finished;
    },
    playAudio(episode) {
      if (this.audio) {
        this.audio.pause();
      }
      this.currentAudio.src = episode.audioUrl;
      this.currentAudio.title = episode.title;
      this.audio = new Audio(this.currentAudio.src);

      this.audio.addEventListener("timeupdate", () => {
        this.currentTime = this.audio.currentTime;
        this.duration = this.audio.duration;
      });

      const savedData = this.getHistory(episode.guid);
      if (savedData) {
        this.audio.currentTime = savedData.currentTime || 0;
      }

      this.audio.play();
      this.isPaused = false;
    },
    togglePlay() {
      if (this.audio.paused) {
        this.audio.play();
        this.isPaused = false;
      } else {
        this.audio.pause();
        this.isPaused = true;
      }
    },
    skipAudio(seconds) {
      if (this.audio) {
        this.audio.currentTime = Math.max(
          0,
          Math.min(this.audio.currentTime + seconds, this.audio.duration)
        );
      }
    },
    formatTime(seconds) {
      if (!seconds) return "0:00";
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
      return `${minutes}:${remainingSeconds}`;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    getHistory(guid) {
      return this.$emit("get-history", guid);
    },
  },
  beforeUnmount() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  },
};
</script>

<style scoped>
/* Add any necessary styles */
</style>
