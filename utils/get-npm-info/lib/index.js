'use strict';
const axios = require('axios')
const semver = require('semver')
const urlJoin = require('url-join')


module.exports = {
    getNpmInfo,
    getNpmVersions,
    getNpmSemverVersion,
};

function getNpmInfo(npmName,registry) {
    if(!npmName){
        return null
    }
    const registryUrl = registry || getDefaultRegistry()
    // TODO
    const npnInfoUrl = urlJoin(registryUrl,npmName)
    return  axios.get(npnInfoUrl).then(response=>{
        if(response.status === 200){
            return response.data
        }
        return null
    }).catch(err=>{
        Promise.reject(err)
    })
}

function getDefaultRegistry(isOriginal = true) {
    return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

async function getNpmVersions(npmName,registry) {
    const data = await getNpmInfo(npmName,registry)
    if(data){
        return Object.keys(data.versions)
    }else {
        return []
    }
}

function getNpmSemverVersions(baseVersion,versions) {
    return versions.filter(version => semver.satisfies(version,`^${baseVersion}`))
        .sort((a, b) => semver.gt(b, a) ? 1 : -1)
}

async function getNpmSemverVersion(baseVersion,npmName,registry) {
    const versions = await getNpmVersions(npmName,registry)
    const semverVersion = getNpmSemverVersions(baseVersion,versions)
    if(semverVersion && semverVersion.length > 0){
        return semverVersion[0]
    }
}
