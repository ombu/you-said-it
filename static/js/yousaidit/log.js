define(['dojo', 'dojo/window',
        'dojo/store/JsonRest', 'dojo/topic'],
        function(dojo, win, store, topic) {

    /**
    * @class Log
    * TODO doc better
    * opts.storeUrl
    * opts.container
    *      container node for the log entries
    * opts.paginator
    *      the paginator object
    */
    var Log = function(opts) {
        this.store = new dojo.store.JsonRest({target: opts.storeUrl});
        this.container = opts.container;
        this.paginator = new opts.paginator(this.container, this.loadDayBefore,
                this.loadDayBefore);
        this.search = opts.search;
        this.search.log = this;
        this.entries = [];
        this.listeners = [];
        this.currentDay = typeof opts.currentDay === 'object' ?
            // opts.currentDay : new Date();
            opts.currentDay : new Date('2012-03-21');
        topic.subscribe('Search/resultSelected', dojo.hitch(this,
                    this.handleSearchResultSelect));
    }

    Log.themeEntries = function(data, hilight) {
        var str = '', i = 0;
        for (l = data.length; i < l; i++) {
            //data[i][2] = new Date(data[i][2] * 1000);
            if (typeof hilight !== 'undefined') {
                data[i][4] = data[i][4].replace(hilight,
                    '<span class="hilight">' + hilight + '</span>');
            }
            str += dojo.replace("<dt title='{2}'>{3}</dt>" +
                "<dd id='{0}' tabindex='1' title='{2}'>{4}</dd>",
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
        this.listeners.push(dojo.connect(this.paginator, 'onReachStart', this,
                    this.loadDayBefore));
        this.listeners.push(dojo.connect(this.paginator, 'onReachEnd', this,
                    this.loadDayAfter));
        // console.log(this.listeners, 'Log: connected listeners');
    };

    Log.prototype.disconnectListeners = function() {
        if (!this.listeners.length) return;
        while (this.listeners.length) {
            dojo.disconnect(this.listeners.pop());
        }
        // console.log(this.listeners, 'Log: disconnecting listeners');
    };

    Log.prototype.loadDayBefore = function() {
        this.disconnectListeners();
        this.currentDay.setDate(this.currentDay.getDate() - 1);
        this.load({pos: 'first'});
    };

    Log.prototype.loadDayAfter = function() {
        this.disconnectListeners();
        if ((new Date()).toDateString() == this.currentDay.toDateString()) {
            alert("Can't load a more recent date");
            return false;
        }
        this.currentDay.setDate(this.currentDay.getDate() + 1);
        this.load({pos: 'last'});
    };

    Log.prototype.handleSearchResultSelect = function(date) {
        var fx = function() {
            var el = dojo.query('dd[title=' + date + ']', dojo.byId('entries'))[0];
            console.log(el, 'foo');
            dojo.addClass(el, 'hilight');
            dojo.window.scrollIntoView(el);
        };
        this.loadDay(date, fx);
    };

    Log.prototype.loadDay = function(date, callback) {
        this.currentDay = new Date(date * 1000);
        dojo.empty(this.container);
        return this.load({ 'callback': callback });
    };

    Log.prototype.load = function(kwargs) {
        kwargs = kwargs || {};
        if (!kwargs.hasOwnProperty('pos')) {
            kwargs.pos = 'last';
        }
        var fx, timestamp, opts = dojo.mixin(opts, kwargs);
        this.disconnectListeners();
        fx = dojo.hitch(this, function(data) {
            this.handle_loaded(data, kwargs.pos);
        });
        timestamp = Math.ceil(this.currentDay.getTime() / 1000);
        console.log(this.currentDay, 'querying date');
        this.store.query({day: timestamp}).then(fx).then(function() {
            if (typeof kwargs.callback === 'function') {
                kwargs.callback();
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
        this.entries = dojo.query('dt', dojo.byId('entries'));
        this.updateMarker();
        this.paginator.refresh();
        this.connectListeners();
    };

    Log.prototype.handle_scroll = function() {
        var center_el, date;
        center_el = getCenterNode(dojo.query('dt', this.container));
        if (center_el) {
            // dojo.query('dt', this.container).removeClass('current');
            this.entries.removeClass('current');
            dojo.addClass(center_el, 'current');
            date = dojo.attr(center_el, 'title');
            this.markerNode.innerHTML = date;
        }
    };

    Log.prototype.updateMarker = function(data) {
        if (dojo.query('#marker').length == 0) {
            this.markerNode = dojo.create('div', {id: 'marker'}, dojo.body(),
                    'last');
        }
    };

    return Log;

});
