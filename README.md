You Said It
===========

## Setup

- Place the bubot logs in the `logs` directory
- Downalod or symlink the Dojo Toolkit version 1.7 in `static/js/dt` (e.g.
  `static/js/dt/dojo`, `static/js/dt/dijit`, etc.).

## Build Javascript

To compile the Javascript into a single file for production use, run `build.sh`
from the root of the repo, then change the refernce to `boot.js` in
`templates/log.html` from: `/static/js/yousaidit/boot.js` to
`/static/js/dist/yousaidit/boot.js`.

*In progress*

## License

Copyright 2011 OMBU <martin@ombuweb.com>, except where otherwise
noted.

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
