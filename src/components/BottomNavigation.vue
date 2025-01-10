<template>
  <div class="fixed bottom-0 w-full bg-gray-800 text-white flex justify-around py-3 shadow-lg">
    <button
      v-for="item in navItems"
      :key="item.id"
      @click="selectItem(item.id)"
      :class="selected === item.id ? item.activeColor : 'text-gray-400'"
      class="flex flex-col items-center"
    >
      <i :class="`fa ${item.icon} text-2xl`"></i>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    // Accept default selected item (optional)
    defaultSelected: {
      type: String,
    },
  },
  data() {
    return {
      selected: this.defaultSelected, 
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
    };
  },
  methods: {
    selectItem(id) {
      this.selected = id;
      this.$emit('update:selected', id); // Emit selected event for parent to handle
    },
  },
};
</script>

<style>
/* Add custom styles here if needed */
</style>
