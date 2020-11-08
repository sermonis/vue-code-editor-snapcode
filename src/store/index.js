import { createStore } from 'vuex';
import VuexORM from '@vuex-orm/core';
import VuexORMLocalForage from 'vuex-orm-localforage';
import { File, Folder } from '~/models';
import { auth } from '~/utils/firebase';

const database = new VuexORM.Database();

database.register(File);
database.register(Folder);

VuexORM.use(VuexORMLocalForage, {
  localforage: {
    name: 'snapcode',
  },
  database,
});

const store = createStore({
  plugins: [VuexORM.install(database)],
  state: () => ({
  	searchQuery: '',
    filterBy: 'all',
    showSidebar: false,
    user: null,
  }),
  mutations: {
  	updateState(state, { key, value }) {
    	state[key] = value;
  	},
  },
  actions: {
    async retrieveData({ commit }) {
      const isFirstTime = JSON.parse(localStorage.getItem('firstTime'));

      if (isFirstTime === null) {
        await Folder.$create({
          data: {
            name: 'My Folder',
            files: [
              { 
                name: 'First snippet',
                code: 'console.log(\'hello world\')',
              },
            ],
          },
        });

        localStorage.setItem('firstTime', false);
      } else {
        await Folder.$fetch();
        await File.$fetch();
      }

      commit('updateState', { key: 'user', value: auth.user });
      
      auth.listen((user) => {
        commit('updateState', { key: 'user', value: user });
      });
    },
  },
});

export default store;
