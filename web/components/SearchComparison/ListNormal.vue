<template>
  <div class="listVuexSearch">
    <button @click="fetchItems">generate</button>
    <input v-model="searchText" @keyup="searchChange"/>
    <virtual-scroller class="scroller" :items="searchText ? results : items"
      item-height="70" v-if="items.length">
      <template slot-scope="props">
        <contact-detail
          :key="props.itemKey"
          :name="props.item.name"
          :address="props.item.address"
          :avatar="props.item.avatar">
        </contact-detail>
      </template>
    </virtual-scroller>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import ContactDetail from '@/components/ContactDetail';

export default {
  components: {
    ContactDetail,
  },
  data() {
    return {
      searchText: '',
    };
  },
  vuexsearch: [{
    name: 'searchIndex',
    states: { contactsIndex: 'contacts' },
    actions: { contactsActions: 'contacts' },
  }],
  computed: {
    ...mapGetters({
      itemsMap: 'currentContacts',
    }),
    items() {
      return Object.values(this.itemsMap);
    },
    results() {
      return this.vuexsearch.contactsIndex.result.map(id => this.itemsMap[id]);
    },
  },
  methods: {
    ...mapActions({
      fetchItems: 'fetchContacts',
    }),
    searchChange() {
      this.vuexsearch.contactsActions.search(this.searchText);
    },
  },
};
</script>

<style lang="scss" scoped>
.listVuexSearch {
  width: 400px;
  .scroller {
    height: 500px;
    width: 100%;
  }
}
</style>
