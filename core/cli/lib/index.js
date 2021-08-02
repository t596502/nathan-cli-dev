'use strict';
const path = require('path')
const semver = require('semver') // 对比版本号
const colors = require('colors/safe') // 提示颜色
const userHome = require('user-home') // 判断用户主目录
const pathExists = require('path-exists').sync // 文件是否存在
const constant = require('./const')
const pkg = require('../package.json')
const log = require('@nathan-cli-dev/log')
module.exports = core;

let args
async function core() {
    try{
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        checkInputArgs();
        checkEnv()
        await checkGlobalUpdate()
    }catch (error) {
        log.error(error.message);
    }

}
async function checkGlobalUpdate() {
    // 1.获取当前版本号和模块名
    const currentVersion = pkg.version
    const npmName = pkg.name
    const {getNpmSemverVersion} = require('@nathan-cli-dev/get-npm-info')
    // 2.调用npm API,获取所有版本号
    const lastVersion = await getNpmSemverVersion(currentVersion,npmName)
    // 3.提取所有版本号，对比哪些版本号是大于当前版本号
    // 4.获取最新的版本号，提示用户更新到该版本
    if(lastVersion && semver.lt(currentVersion,lastVersion)){
        log.warn(colors.yellow(`请手动更新${npmName},当前版本：${currentVersion},最新版本${lastVersion}
        更新命令 npm install -g ${npmName}`))
    }

}
// 检查环境变量.ENV文件变量
function checkEnv() {
    const dotenv = require('dotenv')
    const dotenvPath = path.resolve(userHome,'.env')
    if(pathExists(dotenvPath)){
        dotenv.config({
            path:dotenvPath
        })
    }
    createDefaultConfig()
    log.verbose('环境变量',process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
    const cliConfig = {
        home:userHome
    }
    if(process.env.CLI_HOME){
        cliConfig['cliHome'] = path.join(userHome,process.env.CLI_HOME)
    }else {
        cliConfig['cliHome'] = path.join(userHome,constant.DEFAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH = cliConfig['cliHome']
}
// 获取commander参数
function checkInputArgs() {
    args = require('minimist')(process.argv.slice(2));
    checkArgs()
}

function checkArgs() {
    if(args.debug){
        process.env.LOG_LEVEL = 'verbose'
    }else {
        process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
}

function checkUserHome() {
    if(!userHome || !pathExists(userHome)){
        throw new Error('当前登录用户主目录不存在!')
    }
}

// root权限 是管理权权限时进行用户降级
function checkRoot() {
    const rootCheck = require('root-check')
    rootCheck()
}
function checkNodeVersion() {
    // 第一步，获取当前Node版本号
    const currentVersion = process.version
    const lowestVersion = constant.LOWEST_NODE_VERSION
    // 第二步，对比最低版本号
    if(!semver.gt(currentVersion,lowestVersion)){
        throw new Error(colors.red(`nathcn-cli要要安装${lowestVersion}以上的Node.js`))
    }

}

function checkPkgVersion() {
    log.info('cli',pkg.version)
}
