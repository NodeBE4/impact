let fs = require('fs')
let querystring = require('querystring')
let urlMod = require('url')
const crypto = require('crypto')
const https = require('https')
const fetch = require('node-fetch')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let { loadRefSites, loadWikipedia, generateArticle, googlePhoto, updateReadme } = require('./lib')
let URL = urlMod.URL

let db_news_url = 'https://nodebe4.github.io/waimei/search.json'
let db_oped_url = 'https://nodebe4.github.io/opinion/search.json'
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

let settings = { method: "Get" }

async function perform() {
  let rawdata = fs.readFileSync('./index.json', {encoding:'utf8', flag:'r'})
  let heroes = JSON.parse(rawdata)
  // console.log(heroes)

  await Promise.all(heroes.map(async (item) =>{
    let hash = crypto.createHash('md5').update(item.repo).digest("hex")
    if (item.hash){
      console.log(item)
    }else{
      item['hash'] = hash
    }
    let votefile = `_data/votes/vote_${item.hash}`;
    if (fs.existsSync(votefile)) {
      text = fs.readFileSync(votefile)
      item.vote = parseInt(text)
    }else{
      item['vote'] = 1
    }
  }))
  let content = JSON.stringify(heroes, undefined, 4)
  fs.writeFileSync(`./index.json`, content)
  
  tablehtml = updateReadme(heroes)
  let readme = fs.readFileSync('./README.md', {encoding:'utf8', flag:'r'})
  let readmeParts = readme.split("##")
  let maintable = "# 開源社會影響力項目榜單\n\n"
  readmeParts[0] = maintable + tablehtml + '\n\n'
  readme = readmeParts.join("##")
  fs.writeFileSync(`./README.md`, readme)

}

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  return a
}

perform()

