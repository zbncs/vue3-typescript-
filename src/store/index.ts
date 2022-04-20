import { createStore } from 'vuex';
import type { Store } from 'vuex';

const store: Store<unknown> = createStore({
    state() {
        return {
            name: 'zsser'
        };
    }
});

export default store;
