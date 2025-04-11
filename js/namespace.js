/**
 * @file namespace.js
 * @description Sistema di namespace centralizzato per l'applicazione filogenetica
 */
import './core/io/file-io.js';

export const PhylogeneticTree = {
    core: {
        io: {},
        parser: {},
        taxonomy: {}
    },

    ui: {
        components: {},
        interactions: {},
        visualization: {}
    }
};