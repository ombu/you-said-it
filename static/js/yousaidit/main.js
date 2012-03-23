define(['dojo', 'dojo/has', 'require', 'dojo/date/locale'], function(dojo, has,
            require, locale) {
    var app = {};

    /**
     *  Find the node that's in the middle of the viewport
     */
    getCenterNode = function(nodeList) {

        var cn = getCenterNode;

        if (typeof cn.nodeList !== 'undefined' && cn.nodeList != nodeList) {
            cn.positions = dojo.map(nodeList.position(false),
                    function(item) { return item.y});
        }
        cn.nodeList = nodeList;

        for (var i = 0, l = nodeList.length; i < l; i++) {
            if (get_ratio(nodeList[i]) === 0.5) { return nodeList[i]; }
        }
        return false;

        function get_ratio(domNode) {
            var vs, st, ey;
            vs = dojo.window.getBox().h;
            ey = dojo.position(domNode, false).y;
            return (Math.round(ey / vs * 10)) / 10;
        }
    };

    require(['./Search', './InfinitePaginator', './Log', 'dojo/domReady!'],
            function(Search, Paginator, Log) {
        var search = new Search({
            resultsNode: dojo.byId('search-results'),
            searchNode: dojo.byId('search-box')
        });

        var log = new Log({
            container: dojo.byId('entries'),
            paginator: Paginator,
            search: search,
            storeUrl: '/api/log',
            app: app
        });

        log.load({callback: handle_viewport_resize});

        function handle_viewport_resize() {
            var viewport_size, entries_height;
            viewport_size = dojo.window.getBox().h;
            entries_height = dojo.position(dojo.byId('entries'), false).h;
        }
    });

    app.formatDate = function(date) {
        return locale.format(date, {datePattern: 'EEE MMM d,', timePattern: 'H:mm'});
    }

    return app;
});
