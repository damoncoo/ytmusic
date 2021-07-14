const {
    program
} = require('commander');
const ytdl = require('ytdl-core');
const yt = require('./lib/yt')

program
    .option('-n, --name <value>', 'name input')
    .option('-s, --singer <value>', 'singer')
    .option('-u, --url <value>', 'url of origin youtube')
    .option('-a, --access_key <value>', 'access key of qiniu')
    .option('-S, --secret <value>', 'secret of qiniu')
    .option('-b, --bucket <value>', 'bucket of qiniu')
    .option('-e, --end_point <value>', 'end point to call')
    .option('-q, --qiniu_point <value>', 'qiniu end point')
    .option('-U, --user <value>', 'user')
    .option('-P, --password <value>', 'password')

program.parse(process.argv);

const options = program.opts();
console.log("url:" + options.url)
console.log("singer:" + options.singer)
console.log("name:" + options.name)

if (ytdl.validateURL(options.url) == false) {
    throw new Error("链接错误")
}

yt.upload(options.singer,
    options.name,
    options.url,
    options.access_key,
    options.secret,
    options.bucket,
    options.end_point,
    options.qiniu_point,
    options.user,
    options.password
)
