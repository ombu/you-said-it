define(['dojo', 'dojo/window',
        'dojo/store/JsonRest', 'dojo/topic', 'dojo/date/locale'],
        function(dojo, win, store, topic, locale) {

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
        this.app = opts.app;
        this.store = new dojo.store.JsonRest({target: opts.storeUrl});
        this.container = opts.container;
        this.entries = [];
        this.listeners = [];
        this.search = opts.search;
        this.search.log = this;
        this.currentDay = typeof opts.currentDay === 'object' ?
            // opts.currentDay : new Date();
            opts.currentDay : new Date('2012-03-21');
        topic.subscribe('Search/resultSelected', dojo.hitch(this,
                    this.handleSearchResultSelect));
        this.paginator = new opts.paginator({
            id: 'entries',
            domNode: this.container,
            onReachStart: dojo.hitch(this, this.loadDayBefore),
            onReachEnd: dojo.hitch(this, this.loadDayAfter),
            onScroll: dojo.hitch(this, this.handleScroll)
        });
    }

    Log.themeEntries = function(data, hilight) {
        var str = '', i = 0, date;
        date = this.currentDay;
        if (data.length) {
            for (l = data.length; i < l; i++) {
                if (typeof hilight !== 'undefined') {
                    data[i][4] = data[i][4].replace(hilight,
                        '<span class="hilight">' + hilight + '</span>');
                }
                str += dojo.replace("<dt title='{2}'>{3}</dt>" +
                    "<dd id='{0}' tabindex='1' title='{2}'>{4}</dd>",
                data[i]);
            }
        }
        else {
            str = '<p>Not much chatter today.</p>';
        }
        return dojo.create('dl', {innerHTML: str});
    };

    Log.prototype.loadDayBefore = function() {
        this.currentDay.setDate(this.currentDay.getDate() - 1);
        this.load({pos: 'first'});
    };

    Log.prototype.loadDayAfter = function() {
        if ((new Date()).toDateString() == this.currentDay.toDateString()) {
            alert("Can't load a more recent date");
            return false;
        }
        this.currentDay.setDate(this.currentDay.getDate() + 1);
        this.load({pos: 'last'});
    };

    Log.prototype.handleSearchResultSelect = function(date) {
        var fx = function() {
            var el = dojo.query('dd[title=' + date + ']',
                    dojo.byId('entries'))[0];
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
        var listNode = Log.themeEntries(data);
        if (typeof position === 'undefined') {
            position = 'last';
        }
        if (position === 'replace') {
            dojo.empty(this.container);
            position = 'last';
        }
        this.paginator.refresh();
        if (position === 'last') {
            this.paginator.append(listNode);
        }
        else {
            this.paginator.prepend(listNode);
        }
        //dojo.place(listNode, this.container, position);
        this.entries = dojo.query('dt', dojo.byId('entries'));
        this.updateMarker();
        this.paginator.refresh();
    };

    Log.prototype.handleScroll = function() {
        var center_el, date;
        center_el = getCenterNode(dojo.query('dt', this.container));
        if (center_el) {
            // dojo.query('dt', this.container).removeClass('current');
            this.entries.removeClass('current');
            dojo.addClass(center_el, 'current');
            date = new Date(dojo.attr(center_el, 'title') * 1000);
            this.markerNode.innerHTML = locale.format(date, {datePattern: 'y',
                selector: 'date'}) + '<br/>';
            this.markerNode.innerHTML += locale.format(date, {datePattern:
                'EEE M/d,', timePattern: 'H:mm'});
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
