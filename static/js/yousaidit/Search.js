define(['dojo', 'yousaidit/Log', 'dojo/topic', 'dojo/on'], function(dojo, Log,
            topic, on) {

    /**
    * @class Search
    */
    var Search = function(opts) {
        this.resultsNode = opts.resultsNode;
        this.searchNode = opts.searchNode;
        this.searchNode.addEventListener('search', dojo.hitch(this,
                this.handleSearchEvent), false);
    };

    Search.prototype.handleSearchEvent = function(e) {
        if (e.target.value) {
            var fx = dojo.hitch(this, this.addResults);
            this.doSearch(e.target.value).then(fx);
        }
        else {
            this.clearSearch();
        }
    };

    Search.prototype.clearSearch = function() {
        // dojo.byId('foo').focus();
        dojo.removeClass(dojo.body(), 'search-results');
        this.searchNode.value = '';
    };

    Search.prototype.doSearch = function(term) {
        return dojo.xhrGet({
            url: '/api/search?q=' + term,
            handleAs: 'json'
        });
    };

    Search.prototype.addResults = function(data) {
        var listNode = Log.themeEntries(data,
            this.searchNode.value);
        dojo.empty(this.resultsNode);
        dojo.create('label', {innerHTML: data.length + ' results:'},
            this.resultsNode);
        dojo.place(listNode, this.resultsNode);
        dojo.addClass(dojo.body(), 'search-results');
        dojo.query('dd', listNode).on('focusin', this.selectResult);
    };

    Search.prototype.selectResult = function(e) {
        topic.publish('Search/resultSelected', dojo.attr(e.target, 'title'));
    };

    return Search;

});
