dojo.provide('ombu.log');
dojo.require('dojo.store.JsonRest');
dojo.require('dojo.window');

dojo.addOnLoad(function() {

    var search = new Search({
        resultsNode: dojo.byId('search-results'),
        searchNode: dojo.byId('search-box')
    });

    var log = new Log({
        container: dojo.byId('entries'),
        paginator: InfinitePaginator,
        search: search,
        storeUrl: '/api/log'
    });

    log.load({callback: handle_viewport_resize});

    function handle_viewport_resize() {
        var viewport_size, entries_height;
        viewport_size = dojo.window.getBox().h;
        entries_height = dojo.coords(dojo.byId('entries'), false).h;
    }

});

/**
 *  Find the node that's in the middle of the viewport_height
 *  publishes scroll/top scroll/bottom
 *  @constructor
 */
InfinitePaginator = function(domNode, callbackTop, callbackBottom) {
    this.domNode = domNode;
    this.callbackTop = callbackTop;
    this.callbackBottom = callbackBottom;
    this.scrollListener = dojo.connect(window, 'onscroll', this,
            this.handle_scroll);
};

/**
 * Custom even to indicate paginator reached the start of the stack
 * Other classes can dojo.connect to this method
 * event
 */
InfinitePaginator.prototype.onReachStart = function() {
};

/**
 * Custom even to indicate paginator reached the end of the stack
 * Other classes can dojo.connect to this method
 * event
 */
InfinitePaginator.prototype.onReachEnd = function() {
};

InfinitePaginator.prototype.handle_scroll = function() {
    var reached_bottom, reached_top;
    reached_bottom = Boolean(window.pageYOffset + this.viewport_height -
            this.nodeHeight > 0);
    if (reached_bottom) {
        this.onReachedEnd();
    }

    reached_top = Boolean(window.pageYOffset == 0);
    if (reached_top) {
        this.onReachedStart();
    }
};

InfinitePaginator.prototype.refresh = function() {
    this.nodeHeight = dojo.coords(this.domNode, false).h;
    this.viewport_height = dojo.window.getBox().h;
};

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

/**
 * TODO: document me better
 * opts.storeUrl
 * opts.container
 *      container node for the log entries
 * opts.paginator
 *      the paginator object
 *  @constructor
 */
Log = function(opts) {
    this.store = new dojo.store.JsonRest({target: opts.storeUrl});
    this.container = opts.container;
    this.paginator = new opts.paginator(this.container, this.loadDayBefore,
            this.loadDayBefore);
    this.search = opts.search;
    this.search.log = this;
    this.entries = [];
    this.listeners = [];
    this.connectListeners();
};

Log.themeEntries = function(data) {
    var str = '', i = 0;
    for (l = data.length; i < l; i++) {
        data[i][2] = new Date(data[i][2] * 1000);
        str += dojo.replace("<dt title='{2}'>{3}</dt><dd tabindex='1'>{4}</dd>",
        data[i]);
    }
    return dojo.create('dl', {innerHTML: str});
};

Log.prototype.connectListeners = function() {
    if (this.listeners.length) {
        return;
    }
    this.listeners.push(dojo.connect(window, 'onscroll', this,
                this.handle_scroll));
    this.listeners.push(dojo.connect(this.paginator, 'onReachedStart', this,
                this.loadDayBefore));
    this.listeners.push(dojo.connect(this.paginator, 'onReachedEnd', this,
                this.loadDayAfter));
};

Log.prototype.disconnectListeners = function() {
    while (this.listeners.length) {
        dojo.disconnect(this.listeners.pop());
    }
};

Log.prototype.loadDayBefore = function() {
    this.load({pos: 'first'});
};

Log.prototype.loadDayAfter = function() {
    this.load({pos: 'last'});
};

Log.prototype.load = function(obj) {
    var opts = {}, fx;
    opts = dojo.mixin(opts, obj);
    fx = dojo.hitch(this, function(data) { this.handle_loaded(data, obj.pos) });
    this.disconnectListeners();
    this.store.query().then(fx).then(function() {
        if (typeof obj.callback === 'function') {
            obj.callback();
        }
    });
};

Log.prototype.handle_loaded = function(data, position) {
    var listNode;
    if (typeof position === 'undefined') {
        position = 'last';
    }
    if (position === 'replace') {
        dojo.empty(this.container);
        position = 'last';
    }
    listNode = Log.themeEntries(data);
    dojo.place(listNode, this.container, position);
    this.entries = dojo.query('dt', this.container);
    this.updateMarker();
    this.paginator.refresh();
    this.connectListeners();
};

Log.prototype.handle_scroll = function() {
    var center_el, date;
    center_el = getCenterNode(dojo.query('dt', this.container));
    if (center_el) {
        date = dojo.attr(center_el, 'title');
        this.markerNode.innerHTML = date;
    }
};

Log.prototype.updateMarker = function(data) {
    if (dojo.query('#marker').length == 0) {
        this.markerNode = dojo.create('div', {id: 'marker'}, dojo.body(),
                'first');
    }
};

Search = function(opts) {
    this.resultsNode = opts.resultsNode;
    this.searchNode = opts.searchNode;
    dojo.connect(this.searchNode, 'onkeypress', this, function(evt) {
        if (evt.keyCode === dojo.keys.ENTER) {
            var fx = dojo.hitch(this, function(data) {
                var listNode = Log.themeEntries(data);
                dojo.empty(this.resultsNode);
                dojo.place(listNode, this.resultsNode);
                dojo.create('label', {innerHTML: data.length + ' results:'},
                    this.resultsNode);
                dojo.addClass(dojo.body(), 'search-results');
            });
            this.doSearch(this.searchNode.value).then(fx);
        }
        if (evt.keyCode === dojo.keys.ESCAPE) {
            this.clearSearch();
        }
    });
};

Search.prototype.clearSearch = function() {
    dojo.byId('foo').focus();
    dojo.removeClass(dojo.body(), 'search-results');
    this.searchNode.value = '';
};

Search.prototype.doSearch = function(term) {
    return dojo.xhrGet({
        url: '/api/search?q=' + term,
        handleAs: 'json'
    });
};
