import actionsWithSearch, { composeApiActionsToDispatch } from './actions';
import mutations from './mutations';
import getters from './getters';
import { modulePathToNamespace } from './utils';

const DEFAULT_VUEX_SEARCH_MODULE_NAME = 'vuexSearch';

/* eslint-disable no-console */
export default class VuexSearch {
  static _store;
  static installed = false;
  static _instancesMap = {};
  static moduleName = DEFAULT_VUEX_SEARCH_MODULE_NAME;

  static install(Vue) {
    if (VuexSearch.installed) return;
    VuexSearch.installed = true;

    Object.defineProperty(Vue.prototype, '$vuexsearch', {
      get() {
        const { vuexsearch } = this.$options;
        if (vuexsearch) return [];
        return undefined;
      },
    });

    Vue.mixin({
      created() {
        const { vuexsearch } = this.$options;
        if (vuexsearch) {
          const configs = normalizeConfigs(vuexsearch); // eslint-disable-line

          configs.forEach(({
            name,
            states,
            actions,
          }) => {
            if (states) setReactiveProperties.bind(this)(name, states); // eslint-disable-line
            if (actions) setReactiveActions.bind(this)(name, actions); // eslint-disable-line
          });
        }
      },
    });
  }

  constructor(store, name, searchApi) {
    if (!VuexSearch._store) {
      VuexSearch._store = store;
      store.registerModule(VuexSearch.moduleName, {
        state: {},
        namespaced: true,
      });
    }
    const actions = actionsWithSearch(searchApi);
    const modulePath = [VuexSearch.moduleName, name];

    store.registerModule(modulePath, {
      namespaced: true,
      mutations,
      actions,
      getters,
      state: {},
    });

    this._sharedStore = store;
    this._name = name;
    this._namespace = store._modules.getNamespace(modulePath);
    VuexSearch._instancesMap[name] = this;
  }

  getGetter(getterName) {
    return this._sharedStore.getters[`${this._namespace}${getterName}`];
  }

  dispatch(actionType, payload) {
    this._sharedStore.dispatch(`${this._namespace}${actionType}`, payload);
  }

  watch(getter, cb) {
    this._sharedStore.watch(getter, cb);
  }
}

function setReactiveProperties(name, bindStates) {
  if (name) {
    const state = VuexSearch._store.state[VuexSearch.moduleName][name];

    const vuexSearchInstance = VuexSearch._instancesMap[name];
    this.$vuexsearch.push(vuexSearchInstance);

    if (Array.isArray(bindStates)) {
      bindStates.forEach((resourceName) => {
        this[resourceName] = state[resourceName];
      });
    } else if (typeof bindStates === 'object') {
      Object.entries(bindStates).forEach(([target, resourceName]) => {
        this[target] = state[resourceName];
      });
    }
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn('`states` in VuexSearch requires `name` option.');
  }
}

function setReactiveActions(name, bindActions) {
  if (name) {
    const namespace = modulePathToNamespace([VuexSearch.moduleName, name]);
    const { dispatch } = VuexSearch._store;

    if (Array.isArray(bindActions)) {
      bindActions.forEach((resourceName) => {
        this[resourceName] = composeApiActionsToDispatch(
          dispatch,
          namespace,
          resourceName,
        );
      });
    } else if (typeof bindActions === 'object') {
      Object.entries(bindActions).forEach(([target, resourceName]) => {
        this[target] = composeApiActionsToDispatch(
          dispatch,
          namespace,
          resourceName,
        );
      });
    }
  } else if (process.env.NODE_ENV !== 'production') {
    console.warn('`actions` in VuexSearch requires `name` option.');
  }
}

function normalizeConfigs(configs) {
  const results = [];
  if (Array.isArray(configs)) {
    configs.forEach((config) => {
      if (typeof config.name !== 'string') {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('$option.vuexsearch as an [Object] requires `name` option.');
        }
      } else {
        results.push(config);
      }
    });
  } else {
    Object.entries(configs).forEach(([key, value]) => {
      results.push({ ...value, name: key });
    });
  }

  return results;
}
