import { SEARCH } from './action-types';

export { default as vuexSearchPlugin } from './vuexSearchPlugin';
export { getterNames as searchGetters } from './getters';
export const searchActionTypes = { SEARCH };

export { default as SearchApi } from './SearchApi';
export { INDEX_MODES } from 'js-worker-search';
export { default } from './VuexSearch';
