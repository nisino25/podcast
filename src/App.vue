<template>
  <div class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div v-if="selected == 'clips'" class="w-full max-w-4xl bg-white shadow-md rounded p-6">
      <h1 class="text-2xl font-bold mb-4 text-center">Showing your clips</h1>
      <p>Not released yet...</p>
    </div>
    <div v-if="selected == 'favorites' && episodes.length == 0" class="w-full max-w-4xl bg-white shadow-md rounded p-6">
      <h1 class="text-2xl font-bold mb-4 text-center">Favorite List</h1>

      <!-- Empty Favorites Message -->
      <div v-if="favorites.length == 0" class="mt-6 text-center">
        <p class="text-gray-500">No favorite shows yet.</p>
      </div>

      <!-- Favorites Grid -->
      <div v-if="favorites.length > 0 && episodes.length ==0" class="mt-6">
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

    </div>
    <div v-if="selected == 'search' && episodes.length == 0" class="w-full max-w-4xl bg-white shadow-md rounded p-6">
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

      
    </div>

    <div v-if="episodes.length > 0" class="w-full max-w-4xl p-6 pt-12 pd-12 bg-white">
      <!-- Header -->
      <div class="flex justify-between p-2 items-center pb-2 mb-2">
        <h2 class="text-md font-semibold">Episodes: {{ episodes.length }}</h2>
        <div class="text-lg flex justify-between items-center gap-3">
          <span @click="toggleSorting" class="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full">
            Sort
            <i
              :class="{
                'fa-solid fa-arrow-up': sorting === 'descending',
                'fa-solid fa-arrow-down': sorting === 'ascending'
              }"
              class="ml-1"
            ></i>
          </span>
          <i @click="episodes = []" class="fa-solid fa-delete-left text-red-1000"></i>
          <button @click="toggleShowFinished">
            <i
              :class="displayedFinishedEpisode ? 'fa fa-eye' : 'fa-solid fa-eye-slash'"
              class="text-base"></i>
          </button>
        </div>
      </div>

      <!-- Episodes List -->
      <div>
        <ul class="flex flex-wrap mb-20 pb-20 justify-between">
          <template v-for="(episode, index) in episodes" :key="index">
            <li
              v-if="!(!displayedFinishedEpisode && episode.finished)"
              class="episode border p-2 rounded bg-gray-100 cursor-pointer transition-all duration-750"
              :class="episode.finished ? 'mb-2 bg-gray-500 opacity-50 finishedEpisode text-sm p-1 w-[49%]' : 'text-lg w-full mb-3'"
              @click="clickEpisode(episode)"
            >
              <!-- Episode Title -->
              <h3 class=" font-semibold" :class="episode.finished ? 'truncate w-30' : ''">
                {{ sortedIndex(index) }}. {{ episode.title }}
              </h3>
  
              <!-- Episode Details -->
              <div class="flex justify-between p-2 items-center pb-0" v-if="!episode.finished">
                <small class="text-sm text-gray-600">
                  {{ formatDate(episode.pubDate) }}
                </small>
  
                <small v-if="getHistory(episode.guid)" class="float-right">
                  {{ getHistory(episode.guid) }}
                </small>
  
                <button v-if="getHistory(episode.guid)" @click.stop="toggleFavoriteEp(episode)" class="transition">
                  <i
                    :class="episode.isFavorite ? 'fa-solid fa-star text-yellow-500 font-bold' : 'fa-regular fa-star'"
                    class="text-1xl"
                  ></i>
                </button>
  
                <button @click.stop="toggleFinished(episode)" class="transition">
                  <i
                    :class="episode.finished ? 'fa fa-check text-green-800 font-bold' : 'fa-solid fa-headphones-simple'"
                    class="text-1xl"
                  ></i>
                </button>
              </div>
            </li>
          </template>
        </ul>
      </div>
  
    </div>
    <!-- <AudioPlayer v-if="currentAudio.src" :src="currentAudio.src" :title="currentAudio.title" /> -->

    <!-- <BottomNavigation :default-selected="selected" @update:selected="handleSelection"/> -->
    <div class="fixed bottom-0 w-full bg-gray-800 text-white flex justify-around py-4 shadow-lg pb-12">
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="selectItem(item.id)"
        :class="selected === item.id ? item.activeColor : 'text-gray-400'"
        class="flex flex-col items-center"
      >
        <i :class="`fa ${item.icon} text-3xl`"></i>
      </button>
    </div>


      <!-- Audio Player -->
      <!-- Audio Player (Using Browser's Default Controls) -->
      <div v-if="currentAudio?.src" class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex flex-col items-center px-4 py-4 pb-12 shadow-md z-50">
        <div class="text-center flex items-center gap-2 justify-center mb-3">
          <h3 class="text-sm text-left inline-block">{{ currentAudio.title }}</h3>


          <!-- Close Button -->
          <button @click="deleteAudioPlayer" class="text-red-500 hover:text-red-700 ml-2">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <div class="flex items-center gap-4 justify-center w-full">
  <!-- Skip -5s -->
  <button @click="skipAudio(-5)" class="text-gray-400 hover:text-white flex items-center gap-1">
    <i class="fa-solid fa-backward-step"></i> -5s
  </button>

  <!-- Audio Controls (50% width) -->
  <audio
    ref="audioPlayer"
    :src="currentAudio.src"
    controls
    autoplay
    @timeupdate="updateProgress"
    @ended="handleAudioEnd"
  ></audio>

  <!-- Skip +5s -->
  <button @click="skipAudio(5)" class="text-gray-400 hover:text-white flex items-center gap-1">
    +5s <i class="fa-solid fa-forward-step"></i>
  </button>
</div>





        
      </div>


      <!-- <div v-if="currentAudio?.src" class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white flex flex-col items-center px-4 py-4 pb-12 shadow-md z-50">
        <div class="text-center">
          <h3 class="text-sm text-left">{{ currentAudio.title }}</h3>
          <br />
          <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
        </div>
        <br />
        <div class="flex items-center space-x-6 text-2xl">
          <button @click="skipAudio(-20)"><i class="fa fa-backward"></i></button>
          <button @click="skipAudio(-5)"><i class="fa fa-step-backward"></i></button>
          <button @click="togglePlay">
            <i :class="isPaused ? 'fa fa-play' : 'fa fa-pause'"></i>
          </button>
          <button @click="skipAudio(5)"><i class="fa fa-step-forward"></i></button>
          <button @click="skipAudio(20)"><i class="fa fa-forward"></i></button>
          <button @click="deleteAudioPlayer()" class="ml-10"><i class="fa-solid fa-delete-left"></i></button>
        </div>
        




        <div v-if="!loading && !podcasts.length && query && hasSearched" class="mt-6 text-center">
          <p class="text-gray-500">No results found. Try another search.</p>
        </div>
      </div> -->
  </div>
</template>

<script>

// import AudioPlayer from './components/AudioPlayer.vue';
// import BottomNavigation from './components/BottomNavigation.vue';
// import EpisodeList from './components/EpisodeList.vue';

export default {
  data() {
    return {
      selected: 'favorites', 
      navItems: [
        {
          id: 'clips',
          label: 'Clips',
          icon: 'fa-scissors',
          activeColor: 'text-green-400',
        },
        {
          id: 'favorites',
          label: 'Favorites',
          icon: 'fa-star',
          activeColor: 'text-yellow-400',
        },
        {
          id: 'search',
          label: 'Search',
          icon: 'fa-search',
          activeColor: 'text-blue-400',
        },
      ],

      query: 'Jordan B Peterson', // Default query
      podcasts: [],
      episodes: [],
      currentAudio: {
        src: "",
        title: "",
      },
      isPaused: true,
      sorting: 'ascending',

      favorites: [], // Favorite shows
      loading: false,
      listenedHistory: {}, // Tracks listened episodes
      displayedFinishedEpisode: true,
      hasSearched: false,
    };
  },
  components: {
    // AudioPlayer,
    // BottomNavigation,
    // EpisodeList,
  },
  created() {
    console.clear();
    this.loadListenedHistory();
    this.loadFavorites();

    // Check if there's a previously played episode
    const recentEpisode = JSON.parse(localStorage.getItem("recentlyPlayedEpisode"));
    if (recentEpisode) {
        console.log('found the episode');
        this.playAudio(recentEpisode, true); // Set up without playing
    } else {
        console.log('couldn’t find it');
    }
},

  methods: {
    selectItem(id) {
      this.selected = id;
      this.$emit('update:selected', id); // Emit selected event for parent to handle
    },
    toggleSorting() {
          this.sorting = this.sorting === 'ascending' ? 'descending' : 'ascending';
          this.episodes.reverse();
        },
        sortedIndex(index) {
      // Compute the correct index based on sorting
      return this.sorting === "ascending"
        ? index + 1
        : this.episodes.length - index;
    },
    // playAudio(episode, startingUpApp) {
    //   if (this.audio) {
    //       this.audio.pause(); // Pause the current audio if it exists
    //   }

    //   // Set up the new audio
    //   this.currentAudio.src = episode.audioUrl;
    //   this.currentAudio.title = episode.title;
    //   this.audio = new Audio(this.currentAudio.src);

    //   // Load saved progress if available
    //   const savedData = this.listenedHistory[episode.guid];
    //   if (savedData && savedData.currentTime) {
    //     console.log('found the mins');
    //     this.audio.currentTime = savedData.currentTime;
    //     if(startingUpApp) this.currentTime = savedData.currentTime;
    //   }

    //   // Save the recently played episode to localStorage
    //   const recentEpisode = {
    //       guid: episode.guid,
    //       title: episode.title,
    //       audioUrl: episode.audioUrl,
    //       currentTime: this.audio.currentTime || 0,
    //   };
    //   localStorage.setItem("recentlyPlayedEpisode", JSON.stringify(recentEpisode));

    //   // Update currentTime and duration during playback
    //   this.audio.addEventListener("timeupdate", () => {
    //       this.currentTime = this.audio.currentTime;
    //       this.duration = this.audio.duration;

    //       // Save listening progress
    //       this.listenedHistory[episode.guid] = {
    //           currentTime: this.audio.currentTime,
    //           duration: this.audio.duration,
    //       };
    //       this.saveListenedHistory();

    //       // Update localStorage with the latest progress
    //       recentEpisode.currentTime = this.audio.currentTime;
    //       localStorage.setItem("recentlyPlayedEpisode", JSON.stringify(recentEpisode));
    //   });

    //   // Clear the history when the audio ends
    //   this.audio.addEventListener("ended", () => {
    //       delete this.listenedHistory[episode.guid];
    //       this.saveListenedHistory();
    //       localStorage.removeItem("recentlyPlayedEpisode");
    //   });

    //   // Listen for play and pause events to update isPaused state
    //   this.audio.addEventListener("play", () => {
    //       this.isPaused = false;
    //   });

    //   this.audio.addEventListener("pause", () => {
    //       this.isPaused = true;
    //   });

    //   // If not starting up the app, play the audio
    //   if (!startingUpApp) {
    //       this.audio.play();
    //       this.isPaused = false;
    //   }
    // },
    playAudio(episode, startingUpApp = false) {
        this.currentAudio = {
            src: episode.audioUrl,
            title: episode.title,
            guid: episode.guid,
        };

        this.$nextTick(() => {
            const audio = this.$refs.audioPlayer;
            if (!audio) return;

            // Load saved progress if available
            const savedData = this.listenedHistory[episode.guid];
            if (savedData?.currentTime) {
                console.log('Resuming from:', savedData.currentTime);
                audio.currentTime = savedData.currentTime;
            }

            if (!startingUpApp) {
                audio.play();
            }
        });
    },

    updateProgress() {
        const audio = this.$refs.audioPlayer;
        if (!audio || !this.currentAudio.guid) return;

        this.listenedHistory[this.currentAudio.guid] = {
            currentTime: audio.currentTime,
            duration: audio.duration,
        };
        this.saveListenedHistory();

        // Save progress in localStorage too
        localStorage.setItem(
            "recentlyPlayedEpisode",
            JSON.stringify({
                guid: this.currentAudio.guid,
                title: this.currentAudio.title,
                audioUrl: this.currentAudio.src,
                // Save 10 seconds earlier but ensure it's not negative
                currentTime: Math.max(audio.currentTime - 10, 0),
            })
        );
    },

    handleAudioEnd() {
      if (this.currentAudio?.guid) {
        delete this.listenedHistory[this.currentAudio.guid];
        this.saveListenedHistory();
        localStorage.removeItem("recentlyPlayedEpisode");
      }
    },
    deleteAudioPlayer() {
        const audio = this.$refs.audioPlayer;
        if (audio) {
            audio.pause(); // Pause the audio before removing it
        }
        this.isPaused = true;
        this.currentAudio = null;
    },
    async viewEpisodes(feedUrl) {
      this.loading = true;
      this.episodes = [];

      try {
        const response = await fetch(feedUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch episodes: ${response.statusText}`);
        }
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        if (xml.querySelector('parsererror')) {
          throw new Error('Error parsing XML');
        }

        const items = xml.querySelectorAll('item');
        this.episodes = Array.from(items).map((item) => {
          const guid = item.querySelector('guid')?.textContent || 'No guid';
          const fileSize = parseInt(
            item.querySelector('enclosure')?.getAttribute('length') || '0',
            10
          );

          // Load finished state from listenedHistory
          const finished = this.listenedHistory[guid]?.finished || false;
          const isFavorite = this.listenedHistory[guid]?.isFavorite || false;

          return {
            guid,
            title: item.querySelector('title')?.textContent || 'No Title',
            description:
              item.querySelector('description')?.textContent || 'No Description',
            pubDate: item.querySelector('pubDate')?.textContent || 'No pubDate',
            audioUrl: item.querySelector('enclosure')?.getAttribute('url') || '',
            fileSize,
            duration: this.calculateDuration(fileSize),
            finished, // Add finished state
            showAudio: false,
            isFavorite,
          };
        });
        this.episodes.reverse();
      } catch (error) {
        console.error('Error fetching episodes:', error.message);
        alert('Failed to fetch episodes. Please try again later.');
      } finally {
        this.loading = false;
      }
    },
    clickEpisode(episode){
      if(episode.finished) return this.toggleFinished(episode)

      return this.playAudio(episode);
    },
    togglePlay() {
      if (this.audio) {
        if (this.audio.paused) {
          this.audio.play();
          this.isPaused = false;
        } else {
          this.audio.pause();
          this.isPaused = true;
        }
      }
    },

    toggleShowFinished() {
      this.displayedFinishedEpisode = !this.displayedFinishedEpisode;
    },
    toggleFinished(episode) {
      console.log('hey00000');
      const guid = episode.guid;
      // Toggle finished state
      episode.finished = !episode.finished;

      // Save finished state to listenedHistory
      if (!this.listenedHistory[guid]) {
        this.listenedHistory[guid] = {};
      }

      this.listenedHistory[guid].finished = episode.finished;
      this.saveListenedHistory();

    },
    toggleFavoriteEp(episode) {
      const guid = episode.guid;
      // Toggle finished state
      episode.isFavorite = !episode.isFavorite;

      // Save finished state to listenedHistory
      if (!this.listenedHistory[guid]) {
        this.listenedHistory[guid] = {};
      }

      this.listenedHistory[guid].isFavorite = episode.isFavorite;
      this.saveListenedHistory();
    },
    // skipAudio(seconds) {
    //   if (this.audio) {
    //     const newTime = this.audio.currentTime + seconds;
    //     this.audio.currentTime = Math.max(0, Math.min(newTime, this.audio.duration));
    //   }
    // },
    saveListenedHistory() {
      localStorage.setItem("listenedHistory", JSON.stringify(this.listenedHistory));
    },
    loadListenedHistory() {
      const history = localStorage.getItem("listenedHistory");
      if (history) {
        this.listenedHistory = JSON.parse(history);
        console.log(this.listenedHistory)
      }
    },
    getHistory(guid) {
      const savedData = this.listenedHistory[guid];
      if (savedData && savedData.currentTime) {
        const current = Math.floor(savedData.currentTime / 60);
        const duration = Math.floor(savedData.duration / 60);
        return `${current} / ${duration} mins`;
      }
      return null;
    },

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
        
      }else{
        this.selected = 'search'
      }
    },
    handleSelection(selectedItem) {
      this.selected = selectedItem; // Update App.vue's selected state
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


    formatTime(seconds) {
      if (!seconds) return "0:00";
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
      return `${minutes}:${remainingSeconds}`;
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

      this.sorting = 'descending'

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


    skipAudio(seconds) {
        const audio = this.$refs.audioPlayer;
        if (audio) {
            let newTime = audio.currentTime + seconds;
            audio.currentTime = Math.max(0, Math.min(newTime, audio.duration));
        }
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
    },
    // isPaused(newValue) {
    //   if (this.audio) {
    //     if (newValue) {
    //       this.audio.pause();
    //     } else {
    //       this.audio.play();
    //     }
    //   }
    // },
    
  },
  beforeUnmount() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }, 

};
</script>

<style>
/* .finishedEpisode:nth-child(odd):has(+ .half) {
    display: inline-block !important;
} */
/* Add custom styles if needed */

</style>
