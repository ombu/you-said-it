define(['dojo/_base/kernel', 'require'],
        function(dojo, require) {
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

    require(['./Search', 'InfiniteScroll/InfiniteScroll', './Log',
            'dojo/domReady!'],
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

    });

    return app;
});
