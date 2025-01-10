<template>
  <div class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div v-if="selected == 'clips'" class="w-full max-w-4xl bg-white shadow-md rounded p-6">
      <h1 class="text-2xl font-bold mb-4 text-center">Showing your clips</h1>
      <p>Still working...</p>
    </div>
    <div v-if="selected == 'favorites'" class="w-full max-w-4xl bg-white shadow-md rounded p-6">
      <h1 class="text-2xl font-bold mb-4 text-center">Favorite List</h1>

      <!-- Empty Favorites Message -->
      <div v-if="favorites.length == 0" class="mt-6 text-center">
        <p class="text-gray-500">No favorite shows yet.</p>
      </div>

      <!-- Favorites Grid -->
      <div v-else class="mt-6">
        <div class="grid grid-cols-2 gap-4 mb-10">
          <div
            v-for="(podcast, index) in favorites"
            :key="index"
            class="flex flex-col items-center border rounded p-4 bg-gray-100 cursor-pointer transition hover:bg-gray-200"
            @click="viewEpisodes(podcast.feedUrl)" 
          >
            <!-- Thumbnail -->
            <img
              :src="podcast.artworkUrl"
              alt="Podcast Thumbnail"
              class="rounded shadow"
            />
            <!-- Title -->
            <h4
              class="font-semibold mt-2 text-center overflow-hidden text-ellipsis"
              style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.5rem; min-height: 3rem;"
            >
              {{ podcast.collectionName }}
            </h4>

            <!-- Icons -->
            <div
              class="flex justify-between space-x-4 mt-2 w-1/3"
              @click.stop
            >
              <!-- Star Icon -->
              <button
                @click="toggleFavorite(podcast, true)"
                class="text-yellow-500"
              >
                <i :class="!isFavorite(podcast) ? 'fa-regular fa-star' : 'fa-solid fa-star'"></i>
              </button>
              <!-- Headphones Icon -->
              <button class="text-gray-500 hover:text-blue-500 transition">
                <i class="fa-solid fa-headphones-simple"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <EpisodeList
        :episodes="episodes"
        @save-progress="saveListeningProgress"
        @load-progress="loadListeningProgress"
        @get-history="getHistory"
      />

    </div>

    <div v-if="selected == 'search'" class="w-full max-w-4xl bg-white shadow-md rounded p-6">
      <h1 class="text-2xl font-bold mb-4 text-center">Podcast Search</h1>
      <div class="mb-6">
        <div class="flex items-center space-x-2">
          <input
            v-model="query"
            @keyup.enter="searchPodcasts"
            type="text"
            id="query"
            placeholder="Enter keywords..."
            class="p-2 flex-grow border rounded focus:ring focus:ring-blue-300"
          />
          <button
            @click="searchPodcasts"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center justify-center"
          >
            <i class="fa fa-search"></i> <!-- Font Awesome Search Icon -->
          </button>
        </div>


      </div>

      <div v-if="loading" class="mt-4 text-center">
        <p class="text-gray-500">Loading...</p>
      </div>
      <div v-if="podcasts.length && !episodes.length" class="mt-6">
        <h2 class="text-lg font-semibold mb-4">Results: {{ podcasts.length }}</h2>
        <div class="space-y-6 mb-10">
          <div
            v-for="(podcast, index) in podcasts"
            :key="index"
            class="border p-4 rounded bg-gray-100"
          >

            <!-- Star Toggle (Favorite) -->
            <div class="text-right">
              

            </div>
          <div class="flex items-center space-x-4 ">
            <!-- Thumbnail -->
            <img
              :src="podcast.artworkUrl"
              alt="Podcast Thumbnail"
              class="w-20 h-20 rounded shadow"
            />
            <!-- Details -->
            <div style="width: 100%;">
              <h3 class="text-lg font-semibold">{{ podcast.collectionName }}</h3>
              <p class="text-sm text-gray-600">{{ podcast.artistName }}</p>
              <div class="flex justify-between p-2 items-center pb-2">
                <button
                  @click="viewEpisodes(podcast.feedUrl)"
                  class="text-blue-500 hover:underline"
                >
                  View Episodes
                </button>
                <button
                  @click="toggleFavorite(podcast)"
                  class="text-yellow-500"
                >
                  <i :class="!isFavorite(podcast) ? 'fa-regular fa-star' : 'fa-solid fa-star'"></i>
                </button>
              </div>
            </div>

            
          </div>
          </div>
        </div>
      </div>

      <EpisodeList
        :episodes="episodes"
        @save-progress="saveListeningProgress"
        @load-progress="loadListeningProgress"
        @get-history="getHistory"
      />



      <div v-if="!loading && !podcasts.length && query && hasSearched" class="mt-6 text-center">
        <p class="text-gray-500">No results found. Try another search.</p>
      </div>
    </div>
    
  </div>
  <BottomNavigation :default-selected="selected" @update:selected="handleSelection"/>
</template>

<script>
import BottomNavigation from './components/BottomNavigation.vue';
import EpisodeList from './components/EpisodeList.vue';
export default {
  data() {
    return {
      selected: 'favorites', 
      query: 'Jordan B Peterson', // Default query
      podcasts: [],
      episodes: [],
      favorites: [], // Favorite shows
      loading: false,
      listenedHistory: {}, // Tracks listened episodes
      showFinished: false,
      hasSearched: false,
    };
  },
  components: {
    BottomNavigation,
    EpisodeList,
  },
  created() {
    this.loadListenedHistory();
    this.loadFavorites();
  },
  methods: {
    
    // Toggle a podcast as favorite
    toggleFavorite(podcast, confirmRequired = false) {
      // If confirmation is required, ask the user
      if (confirmRequired) {
        const userConfirmed = window.confirm(`Are you sure you want to remove "${podcast.collectionName}" from your favorites?`);
        if (!userConfirmed) {
          return; // Exit if the user cancels
        }
      }

      // Toggle the favorite
      const index = this.favorites.findIndex(
        (fav) => fav.collectionName === podcast.collectionName
      );

      if (index === -1) {
        this.favorites.push(podcast); // Add to favorites
      } else {
        this.favorites.splice(index, 1); // Remove from favorites
      }

      // Save to localStorage
      this.saveFavorites();
    },
    // Check if a podcast is a favorite
    isFavorite(podcast) {
      return this.favorites.some(
        (fav) => fav.collectionName === podcast.collectionName
      );
    },
    // Save favorites to localStorage
    saveFavorites() {
      localStorage.setItem("favoritePodcasts", JSON.stringify(this.favorites));
    },
    // Load favorites from localStorage
    loadFavorites() {
      const savedFavorites = localStorage.getItem("favoritePodcasts");
      if (savedFavorites) {
        this.favorites = JSON.parse(savedFavorites);
        console.log(this.favorites)
        
      }else{
        this.selected = 'search'
      }
    },
    handleSelection(selectedItem) {
      this.selected = selectedItem; // Update App.vue's selected state
    },
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
      if(!this.listenedHistory[guid]) return false;
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

      this.hasSearched = true
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
        console.log(data.results)
        this.podcasts = data.results.map(result => ({
          collectionName: result.collectionName,
          artistName: result.artistName,
          artworkUrl: result.artworkUrl600,
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
  watch: {
  selected(newVal) {
    // Clear episodes on switching
    this.episodes = [];

    if (newVal === 'search') {
      // Reset the search state when switching to the search view
      this.hasSearched = false;
    }
  }
}

};
</script>

<style>
/* Add custom styles if needed */
</style>
