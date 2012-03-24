var profile = {
    basePath: '../',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: 'closure',
    layerOptimize: 'closure',
    stripConsole: 'all',
    selectorEngine: 'acme',
    staticHasFeatures: {
        // The trace & log APIs are used for debugging the loader, so we don’t
        // need them in the build
        'dojo-trace-api': 0,
        'dojo-log-api': 0,

        // This causes normally private loader data to be exposed for debugging,
        // so we don’t need that either
        'dojo-publish-privates': 0,

        // We’re fully async, so get rid of the legacy loader
        'dojo-sync-loader': 0,

        // dojo-xhr-factory relies on dojo-sync-loader
        'dojo-xhr-factory': 0,

        // We aren’t loading tests in production
        'dojo-test-sniff': 0
    },
    layers: {
        // This is the main loader module. It is a little special because it is
        // treated like an AMD module even though it is actually just plain
        // JavaScript. There is some extra magic in the build system
        // specifically for this module ID.
        'yousaidit/app': {
            // In addition to the loader (dojo/dojo) and the loader
            // configuration file (app/run), we’re also including the main
            // application (app/main) and the dojo/i18n and dojo/domReady
            // modules because they are one of the conditional dependencies in
            // app/main (the other being app/Dialog) but we don’t want to have
            // to make extra HTTP requests for such tiny files.
            include: ['dojo/dojo', 'dojo/i18n', 'dojo/domReady',
            'dojo/cldr/nls/en/gregorian',
            'yousaidit/boot', 'yousaidit/main', 'yousaidit/Search',
            'yousaidit/InfinitePaginator'],

            // By default, the build system will try to include dojo/main in the
            // built dojo/dojo layer, which adds a bunch of stuff we don’t want
            // or need. We want the initial script load to be as small and quick
            // as possible, so we configure it as a custom, bootable base.
            boot: true,
            customBase: true
        }
    },
    resourceTags: {
        // Files that contain test code.
        test: function(filename, mid) {
            return false;
        },

        // Files that are AMD modules.
        amd: function(filename, mid) {
            return /\.js$/.test(filename);
        }

    }
};
