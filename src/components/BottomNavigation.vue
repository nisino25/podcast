<template>
  
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
    
  },
};
</script>

<style>
/* Add custom styles here if needed */
</style>
