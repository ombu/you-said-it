require({
    baseUrl: '/static/js',
    packages: [
        { name: 'dojo', location: 'dt/dojo' },
        //{ name: 'dijit', location: 'dijit' },
        //{ name: 'dojox', location: 'dojox' },
        { name: 'yousaidit', location: 'yousaidit' },
    ]
// Require 'app'. This loads the main application file, app/main.js.
}, [ 'yousaidit' ]);

