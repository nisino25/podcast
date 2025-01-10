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
        class="border p-2 rounded bg-gray-100"
      >
        <!-- Episode Title -->
        <h3 class="text-lg font-semibold">{{ index + 1 }}. {{ episode.title }}</h3>

        <!-- Episode Details -->
        <div class="flex justify-between p-2 items-center pb-0">
          <small class="text-sm text-gray-600">{{ formatDate(episode.pubDate) }}</small>

          <small v-if="getHistory(episode.guid)" class="float-right">
            {{ getHistory(episode.guid) }}
          </small>

          <button @click="toggleFinished(episode)" class="transition">
            <i
              :class="episode.finished ? 'fa fa-check' : 'fa-solid fa-headphones-simple'"
              class="text-1xl"
            ></i>
          </button>
        </div>

        <!-- Audio Controls -->
        <div v-if="episode.showAudio" class="mt-5">
          <div class="flex gap-2 mb-2">
            <button
              @click="skipAudio(-15, index)"
              class="px-4 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition"
            >
              -15
            </button>
            <button
              @click="skipAudio(-5, index)"
              class="px-4 py-1 text-sm text-white bg-orange-500 rounded hover:bg-orange-600 transition"
            >
              -5
            </button>
            <button
              @click="skipAudio(5, index)"
              class="px-4 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition"
            >
              +5
            </button>
            <button
              @click="skipAudio(15, index)"
              class="px-4 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600 transition"
            >
              +15
            </button>
          </div>
          <audio
            ref="audioPlayer"
            :src="episode.audioUrl"
            controls
            class="w-full"
            @timeupdate="saveListeningProgress(episode.guid, $event)"
            @loadedmetadata="loadListeningProgress(episode.guid, $event)"
          ></audio>
        </div>
      </li>
    </ul>
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
      showFinished: false,
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
    skipAudio(seconds, index) {
      const audio = this.$refs.audioPlayer[index];
      if (audio) {
        audio.currentTime = Math.min(
          Math.max(audio.currentTime + seconds, 0),
          audio.duration
        );
      }
    },
    saveListeningProgress(guid, event) {
      const audio = event.target;
      this.$emit("save-progress", {
        guid,
        currentTime: audio.currentTime,
        duration: audio.duration,
      });
    },
    loadListeningProgress(guid, event) {
      const audio = event.target;
      this.$emit("load-progress", { guid, audio });
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
};
</script>

<style scoped>
/* Add specific styles if necessary */
</style>
