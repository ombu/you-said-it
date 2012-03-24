require({
    baseUrl: '/static/js',
    packages: [
        { name: 'dojo', location: './dt/dojo' },
        { name: 'yousaidit'}
    ]
// Require yousadit (loads yousaidit/main.js)
}, ['yousaidit']);
