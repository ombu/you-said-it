if [ -d static/js/dist ]; then
    echo "+ Removing static/js/dist directory"
    rm -rf static/js/dist
fi

node static/js/dt/dojo/dojo.js load=build \
    --require static/js/yousaidit/boot.js \
    --profile static/js/yousaidit/yousaidit.profile.js \
    --releaseDir dist

