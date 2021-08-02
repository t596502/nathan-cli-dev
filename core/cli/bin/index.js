#! /usr/bin/env node

const importLocal = require('import-local');
if (importLocal(__filename)) {
    require('npmlog').info('cli','正在使用本地版本')
} else {
    // Code for both global and local version here…
    require('../lib')(process.argv.slice(2));
}
