const execShPromise = require("exec-sh").promise;

// run interactive bash shell
const download = async (url, name, outputPath, ffmpegPath) => {

 let command = `yt-dlp -f 'ba' -x --audio-format mp3 --audio-quality 4 --embed-thumbnail --add-metadata -o "${outputPath}/${name}.mp3" ${url}`
 console.log(command)
 let out;
 try {
   out = await execShPromise(command, true);
 } catch (e) {
   console.log('Error: ', e);
   console.log('Stderr: ', e.stderr);
   console.log('Stdout: ', e.stdout);
   throw e
 }
 console.log('out: ', out.stdout, out.stderr);
}

module.exports = download
 