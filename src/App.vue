<template>
  <div class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="w-full max-w-4xl bg-white shadow-md rounded p-6">
      <h1 class="text-2xl font-bold mb-4 text-center">Podcast Search</h1>
      <div class="mb-6">
        <label for="query" class="block text-sm font-medium text-gray-700">Search for Podcasts:</label>
        <input
          v-model="query"
          @keyup.enter="searchPodcasts"
          type="text"
          id="query"
          placeholder="Enter keywords..."
          class="mt-2 p-2 w-full border rounded focus:ring focus:ring-blue-300"
        />
      </div>
      <button
        @click="searchPodcasts"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
      >
        Search
      </button>
      <button
        @click="showFinished = !showFinished"
         :style="{ filter: !showFinished ? 'brightness(50%)' : '' }"
        class="px-4 py-2 bg-rose-500 text-white rounded hover:bg-rose-600 transition float-right"
      >
        hide finsihed
      </button>

      <div v-if="loading" class="mt-4 text-center">
        <p class="text-gray-500">Loading...</p>
      </div>

      <div v-if="podcasts.length && !episodes.length" class="mt-6">
        <h2 class="text-lg font-semibold mb-4">Results:</h2>
        <div class="space-y-6">
          <div
            v-for="(podcast, index) in podcasts"
            :key="index"
            class="flex items-center space-x-4 border p-4 rounded"
          >
            <img
              :src="podcast.artworkUrl"
              alt="Podcast Thumbnail"
              class="w-20 h-20 rounded shadow"
            />
            <div>
              <h3 class="text-lg font-semibold">{{ podcast.collectionName }}</h3>
              <p class="text-sm text-gray-600">{{ podcast.artistName }}</p>
              <button
                @click="viewEpisodes(podcast.feedUrl)"
                class="mt-2 text-blue-500 hover:underline"
              >
                View Episodes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="episodes.length" class="mt-6">
        <h2 class="text-lg font-semibold mb-4">Episodes:</h2>
        <ul class="space-y-4">
          <template v-for="(episode, index) in episodes" :key="index">

            <li class="border p-4 rounded" v-if="!showFinished || !episode.finished">
              <h3 class="text-lg font-semibold">{{ index+1 }}. {{ episode.title }}</h3>
              <!-- <small class="text-sm text-gray-600">{{ episode.pubDate }}</small> -->
              <small class="text-sm text-gray-600">{{ formatDate(episode.pubDate) }}</small>
              <small class="float-right">{{getHistory(episode.guid) }}</small>
              <br>
  
              <button
                @click="episode.showAudio = !episode.showAudio"
                class="mt-4 text-blue-500 hover:underline text-sm mt-2"
              >
                {{ episode.showAudio ? 'Hide Player' : 'Show Player' }}
              </button>
  
              <button
                @click="episode.finished = !episode.finished"
                class="mt-2 px-4 py-2 text-sm rounded text-white float-right"
                :class="episode.finished ? 'bg-green-500' : 'bg-gray-500'"
              >
                {{ !episode.finished ? 'Mark as Unlistened' : 'Mark as Listened' }}
              </button>
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
                <!-- <audio ref="audioPlayer" :src="episode.audioUrl" controls class="w-full"></audio> -->
                <audio
                  ref="audioPlayer"
                  :src="episode.audioUrl"
                  controls
                  class="w-full"
                  @timeupdate="saveListeningProgress(episode.guid, $event)"
                  @loadedmetadata="loadListeningProgress(episode.guid, $event)"
                ></audio>
  
                <!-- <audio :src="episode.audioUrl" controls class="w-full"></audio><br> -->
              </div>
            </li>
          </template>
        </ul>
      </div>

      <div v-if="!loading && !podcasts.length && query" class="mt-6 text-center">
        <p class="text-gray-500">No results found. Try another search.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      query: 'Jordan B Peterson', // Default query
      podcasts: [],
      episodes: [],
      loading: false,
      listenedHistory: {}, // Tracks listened episodes
      showFinished: false,
    };
  },
  created() {
    this.loadListenedHistory();
  },
  methods: {
    skipAudio(seconds, index) {
    const audio = this.$refs.audioPlayer[index];
    if (audio) {
      audio.currentTime = Math.min(audio.currentTime + seconds, audio.duration);
    }
  },
  // Save progress during playback
  saveListeningProgress(guid, event) {
    const audio = event.target;
    if (audio.currentTime > 0) {
      this.listenedHistory[guid] = {
        ...this.listenedHistory[guid],
        currentTime: audio.currentTime,
        duration: audio.duration,
      };
      this.saveListenedHistory();
    }
  },
  calculateDuration(fileSize, bitrate = 96) {
    const bitsPerSecond = bitrate * 1000;
    const durationInSeconds = (fileSize * 8) / bitsPerSecond;
    return Math.floor(durationInSeconds); // Return duration in seconds
  },

  // Load progress when playback starts
  loadListeningProgress(guid, event) {
    const audio = event.target;
    const savedData = this.listenedHistory[guid];
    if (savedData && savedData.currentTime) {
      audio.currentTime = savedData.currentTime;
    }
  },

  getHistory(guid) {
    // const audio = event.target;
    if(!this.listenedHistory[guid]) return ``;
    const current = Math.floor(this.listenedHistory[guid].currentTime / 60);
    const duration = Math.floor(this.listenedHistory[guid].duration / 60);
    return `${current} / ${duration} mins`
    // if (savedData && savedData.currentTime) {
    //   audio.currentTime = savedData.currentTime;
    // }
  },

  // Save listening history to localStorage
  saveListenedHistory() {
    localStorage.setItem('listenedHistory', JSON.stringify(this.listenedHistory));
  },

  // Load listening history from localStorage
  loadListenedHistory() {
    const history = localStorage.getItem('listenedHistory');
    if (history) {
      this.listenedHistory = JSON.parse(history);
    }
  },
    formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    async searchPodcasts() {
      if (!this.query.trim()) return;

      this.loading = true;
      this.podcasts = [];
      this.episodes = [];

      try {
        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(
            this.query
          )}&media=podcast&entity=podcast&limit=10`
        );
        const data = await response.json();
        this.podcasts = data.results.map(result => ({
          collectionName: result.collectionName,
          artistName: result.artistName,
          artworkUrl: result.artworkUrl100,
          feedUrl: result.feedUrl, // Podcast RSS feed
        }));
      } catch (error) {
        console.error('Error fetching podcasts:', error);
      } finally {
        this.loading = false;
      }
    },
    async viewEpisodes(feedUrl) {
      this.loading = true;
      this.episodes = [];

      try {
        const response = await fetch(feedUrl);
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');

        const items = xml.querySelectorAll('item');
        
        this.episodes = Array.from(items)
  .map(item => {
    const fileSize = parseInt(item.querySelector('enclosure')?.getAttribute('length') || '0', 10);
    return {
      guid: item.querySelector('guid')?.textContent || 'No guid',
      title: item.querySelector('title')?.textContent || 'No Title',
      description:
        item.querySelector('description')?.textContent || 'No Description',
      pubDate: item.querySelector('pubDate')?.textContent || 'No pubDate',
      audioUrl: item.querySelector('enclosure')?.getAttribute('url'),
      fileSize, // Store the length attribute
      duration: this.calculateDuration(fileSize), // Calculate and store duration
      showAudio: false, // Tracks audio player visibility
    };
  })
  .reverse();
      } catch (error) {
        console.error('Error fetching episodes:', error);
      } finally {
        this.loading = false;
      }
    },
    toggleListened(guid) {
      if (this.listenedHistory[guid]) {
        delete this.listenedHistory[guid];
      } else {
        this.listenedHistory[guid] = true;
      }
      this.saveListenedHistory();
    },
    isListened(guid) {
      return !!this.listenedHistory[guid];
    },
  },
};
</script>

<style>
/* Add custom styles if needed */
</style>
