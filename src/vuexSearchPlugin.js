import * as actionTypes from './action-types';
import SubscribableSearchApi from './SearchApi';
import { getterNames } from './getters';
import VuexSearch from './VuexSearch';

import { resourceGetterWrapper } from './utils';

export default function vuexSearchPlugin({
  resourceIndexes = {},
  resourceGetter,
  searchApi = new SubscribableSearchApi(),
  name,
} = {}) {
  return (store) => {
    if (!name && process.env.NODE_ENV !== 'production') {
      console.warn('`name` attribute is required in `vuexSearchPlugin` creation'); // eslint-disable-line
      return;
    }

    const vuexSearch = new VuexSearch(store, name, searchApi);

    const resourceNames = Object.keys(resourceIndexes);
    vuexSearch.dispatch(actionTypes.INITIALIZE_RESOURCES, { resourceNames });

    searchApi.subscribe(({ result, resourceName, text }) => {
      vuexSearch.dispatch(actionTypes.RECEIVE_RESULT, { result, resourceName, text });
    }, (error) => {
      throw error;
    });

    if (resourceGetter) {
      resourceNames.forEach((resourceName) => {
        const _resourceGetter = resourceGetterWrapper(resourceName, resourceGetter);

        vuexSearch.watch(_resourceGetter, (data) => {
          const resourceIndex = resourceIndexes[resourceName];
          const searchString = vuexSearch
            .getGetter(getterNames.resourceIndexByName)(resourceName).text;

          vuexSearch.dispatch(actionTypes.searchApi.INDEX_RESOURCE, {
            fieldNamesOrIndexFunction: resourceIndex,
            resourceName,
            resources: data,
          });
          vuexSearch.dispatch(actionTypes.SEARCH, { resourceName, searchString });
        });
      });
    }
  };
}
