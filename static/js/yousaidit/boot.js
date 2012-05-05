require({
    baseUrl: '/static/js',
    packages: [
        { name: 'dojo', location: './dt/dojo' },
        { name: 'dijit', location: './dt/dijit' },
        { name: 'InfiniteScroll' },
        { name: 'yousaidit'}
    ]
// Require yousadit (loads yousaidit/main.js)
}, ['yousaidit']);
