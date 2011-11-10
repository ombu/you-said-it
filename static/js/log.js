dojo.provide('ombu.log');
dojo.require('dojo.store.JsonRest');
dojo.require('dojo.window');

dojo.addOnLoad(function() {

    var log, store, viewport_size, entries_height;

    log = new Log({
        container: dojo.byId('entries'),
        paginator: InfinitePaginator
    });

    log.load({callback: handle_viewport_resize});

    function handle_viewport_resize() {
        viewport_size = dojo.window.getBox().h;
        entries_height = dojo.coords(dojo.byId('entries'), false).h;
        //handle_scroll();
    }

});

/**
 *  Find the node that's in the middle of the viewport_height
 *  publishes scroll/top scroll/bottom
 */
InfinitePaginator = function(domNode, callbackTop, callbackBottom) {
    this.domNode = domNode;
    this.callbackTop = callbackTop;
    this.callbackBottom = callbackBottom;
    dojo.connect(window, 'onscroll', this, this.handle_scroll);
}

/**
 * Custom even to indicate paginator reached the start of the stack
 * Other classes can dojo.connect to this method
 * @event
 */
InfinitePaginator.prototype.onReachStart = function() {
}

/**
 * Custom even to indicate paginator reached the end of the stack
 * Other classes can dojo.connect to this method
 * @event
 */
InfinitePaginator.prototype.onReachEnd = function() {
}

InfinitePaginator.prototype.handle_scroll = function() {
    // did we reach the bottom?
    reached_bottom = (window.pageYOffset + this.viewport_height -
            this.nodeHeight > 0);
    if (reached_bottom) {
        this.onReachedEnd();
    }

    // did we reach the top?
    reached_top = (window.pageYOffset == 0);
    if (reached_top) {
        this.onReachedStart();
    }
}

InfinitePaginator.prototype.refresh = function() {
    this.nodeHeight = dojo.coords(this.domNode, false).h;
    this.viewport_height = dojo.window.getBox().h;
}

/**
 *  Find the node that's in the middle of the viewport
 */
getCenterNode = function(nodeList) {

    var cn = getCenterNode,
        center_element; //, reached_bottom, reached_top;

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
 * TODO: document me
 * opts.container
 *      container node for the log entries
 * opts.paginator
 *      the paginator object 
 */
Log = function(opts) {
    this.store = new dojo.store.JsonRest({target: '/api/log/'});
    this.container = opts.container;
    this.paginator = new opts.paginator(this.container, this.loadDayBefore, this.loadDayBefore);
    this.entries = [];
    dojo.connect(window, 'onscroll', this, this.handle_scroll);
    dojo.connect(this.paginator, 'onReachedStart', this, this.loadDayBefore);
    dojo.connect(this.paginator, 'onReachedEnd', this, this.loadDayAfter);
};

Log.prototype.loadDayBefore = function() {
    console.log(arguments);
    this.load({pos: 'before'});
};

Log.prototype.loadDayAfter = function() {
    console.log(arguments);
    this.load({pos: 'after'});
}

Log.prototype.load = function(obj) {
    date = 'foo';
    var th = this;
    this.store.query({date: date})
    .then(dojo.hitch(this, this.handle_loaded))
    .then(function() {
        if (typeof obj.callback === 'function') {
            obj.callback();
        }
    });
};

Log.prototype.handle_loaded = function(data) {
    var str = '';
    for (var i = 0, l = data.length; i < l; i++) {
        data[i][2] = new Date(data[i][2] * 1000);
        str += dojo.replace("<dt title='{2}'>{3}</dt><dd>{4}</dd>",
        data[i]);
    }
    dojo.create('dl', {className: 'day', innerHTML: str}, this.container, 'last');
    this.entries = dojo.query('dt', this.container);
    this.updateMarker();
    this.paginator.refresh();
};

Log.prototype.handle_scroll = function() {
    //window.onscroll = handle_scroll;
    //window.onresize = handle_viewport_resize;

    var center_el = getCenterNode(dojo.query('dt', this.container));
    if (center_el) {
        //dojo.query('#entries dt').style('border', 'none');
        //dojo.style(center_el, 'border', '1px solid green');
        var date = dojo.attr(center_el, 'title');
        this.markerNode.innerHTML = date;
    }
}

Log.prototype.updateMarker = function(data) {
    if (dojo.query('#marker').length == 0) {
        this.markerNode = dojo.create('div', {id: 'marker'}, dojo.body(), 'first');
    }
};
