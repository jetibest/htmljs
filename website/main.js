#!/usr/bin/env node
require('./nodejs-easywebserver').create('forcedir,html').then(s => s.listen(parseInt(process.argv[2])));
