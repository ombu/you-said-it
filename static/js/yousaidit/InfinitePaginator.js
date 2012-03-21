define(['dojo', 'dojo/window'], function(dojo, win) {

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
        // console.log('Reached top!');
    };

    /**
    * Custom even to indicate paginator reached the end of the stack
    * Other classes can dojo.connect to this method
    * event
    */
    InfinitePaginator.prototype.onReachEnd = function() {
        // console.log('Reached bottom!');
    };

    InfinitePaginator.prototype.handle_scroll = function() {
        var reached_bottom, reached_top;
        reached_bottom = Boolean(window.pageYOffset + this.viewport_height -
                this.nodeHeight > 0);
        if (reached_bottom) {
            this.onReachEnd();
        }

        reached_top = Boolean(window.pageYOffset == 0);
        if (reached_top) {
            this.onReachStart();
        }
    };

    InfinitePaginator.prototype.refresh = function() {
        this.nodeHeight = dojo.position(this.domNode, false).h;
        this.viewport_height = win.getBox().h;
    };

    return InfinitePaginator;

});
