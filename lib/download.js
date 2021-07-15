#!/usr/bin/env node

// Global modules
var path = require("path");
var mkdirp = require("mkdirp");
const Downloader = require('ytb2mp3/lib/downloader')

function findVideoId(url) {
    var temp = url.replace(/\\/g, "");
    var videoId = null;
    if (temp.indexOf("?") > -1) {
        var tempArray = temp.split("?");
        if (tempArray.length === 2) {
            var params = tempArray[1].split("&");
            if (params.length > 0) {
                params.forEach(function (param) {
                    var paramArray = param.split("=");
                    if (paramArray[0] === "v") {
                        videoId = paramArray[1];
                        return videoId;
                    }
                });
            }
        }
    }
    return videoId;
}

async function download(url, name, outputPath, ffmpegPath) {

    var videoConfig = {};

    // Check if video name is set, if so write it to video config
    if (name != null && name != "") {
        videoConfig.name = name + ".mp3";
    }

    // Create downloader configuration
    var downloaderConfig = {};
    if (outputPath != null && outputPath != "") downloaderConfig.outputPath = outputPath;
    if (ffmpegPath != null && ffmpegPath != "") downloaderConfig.ffmpegPath = ffmpegPath;

    // Instantiate Downloader
    var dl = new Downloader(downloaderConfig);

    // Find videoId
    var videoId = findVideoId(url);

    if (!videoId) {
        console.log("Couldn't find a valid video id from the given URL. Exiting!");
        process.exit(-1);
    } else {
        // Set videoId
        videoConfig.videoId = videoId;
        // Create output path if it doesn"t exist yet
        await mkdirp(outputPath)

        let promise = new Promise((resolve, reject) => {
            // Download video and create MP3
            dl.getMP3(videoConfig, function (err, res) {
                if (err) {
                    reject(err)
                } else {
                    resolve(1)
                    console.log("Song was downloaded: " + res.file);
                }
            });
        })
        return promise
    }

}

module.exports = download
