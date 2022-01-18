const fs = require('fs');
const md5 = require('md5');
const qiniu = require('qiniu')
const path = require('path')
const http = require('./http');
const ytdl = require('ytdl-core')
const download = require('./ytd')

module.exports.upload = async function (
    singer, name, url,
    accessKey, secretKey,
     bucket, end_point,
    qiniu_point, user, 
    password, ffmpegPath) {

    let outputPath = path.resolve(__dirname, "ytb2mp3")

    let isNameEmpty = (name == null || name == "" || name == "N")
    let isSingerEmpty = (singer == null || singer == "" || singer == "N")

    if (isSingerEmpty || isNameEmpty) {
        let vi = await ytdl.getBasicInfo(url)
        if (isNameEmpty) {
            name = vi.videoDetails.title.replace("/", "")
        }
        if (isSingerEmpty) {
            singer = vi.videoDetails.author.name
        }
    }

    console.log("Channel:" + singer)
    console.log("Name:" + name)
    console.log("Url:" + url)

    await download(url, `${name}`, outputPath, ffmpegPath)

    let sessionManager = new http.SessionManager(
        new http.SessionConfig(end_point, null, [http.ResponseStatusHook])
    )

    let options = {
        scope: bucket,
    };

    let putPolicy = new qiniu.rs.PutPolicy(options);
    let localFile = path.resolve(outputPath, `${name}.mp3`)
    let mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    let config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z2;
    config.useHttpsDomain = false;
    config.useCdnDomain = true;

    let formUploader = new qiniu.form_up.FormUploader(config);

    let uploadToken = putPolicy.uploadToken(mac)

    let putExtra = new qiniu.form_up.PutExtra();
    let date = new Date()
    let key = `${date.getFullYear()}/${date.getMonth()+1}/${md5(url)}.mp3`;
    formUploader.putFile(uploadToken, key, localFile, putExtra, async function (respErr, respBody, respInfo) {
        if (respErr) {
            throw respErr;
        }
        if (respInfo.statusCode == 200) {
            console.log(respBody);

            let music = qiniu_point + '/' + key
            let token = await login(sessionManager, user, password)
            http.SharedConfig.token = token
            await pushNewSong(sessionManager, singer, name, music, user, password)

        } else {
            console.log(respInfo.statusCode);
            console.log(respBody);
        }
    });
}

async function pushNewSong(sessionManager, singer, song, url) {

    try {
        await sessionManager.R('POST', '/api/v2/music/singer/', {
            name: singer,
            avatar: 'https://bkimg.cdn.bcebos.com/pic/023b5bb5c9ea15ce36d31c76c04c2df33a87e9501435?x-bce-process=image/resize,m_lfit,w_268,limit_1/format,f_jpg',
            country: '大陆'
        })
    } catch (error) {

    }

    let singeres = await sessionManager.R('GET', '/api/v2/music/singer/', {
        title: singer
    })

    await sessionManager.R('POST', '/api/v2/music/song/', {
        sid: singeres.data.data[0].id,
        name: song,
        lyric: '',
        url: url
    })

    await sessionManager.R('POST', '/api/v2/push/', {
        uids: [1],
        content: `${song} 下载完成`,
        type: 2,
        data: null
    })
}

async function login(sessionManager, user, password) {
    let res = await sessionManager.R('POST', '/login/', {
        email: user,
        pass: password
    })
    let token = res.data.data.token
    return token
}

module.exports.pushNewSong = pushNewSong