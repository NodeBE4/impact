let { Octokit } = require('@octokit/rest')
let { loadWikipedia, generateArticle, googlePhoto } = require('./lib')
const crypto = require('crypto');
let fs = require('fs')

require('dotenv').config()

let TOKEN = process.env.TOKEN
let REPOSITORY = process.env.REPOSITORY
let [OWNER, REPO] = REPOSITORY.split('/')

let octokit = new Octokit({
  auth: TOKEN
})

const FILE = '100644'; // commit mode
const encoding = 'utf-8';
const ref = 'heads/master';

let committer = {
  name: 'NodeBE4',
  email: 'you@example.com'
}


async function performTasks() {
  let { data } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'open'
  })

  let promises = data.map(async (issue) => {
    try {
      if (issue.title.substring(0,11)=='add_request'){
        let repo = issue.body.split('\n')[0]
        let desc = issue.body.split('---描述---\n')[1].trim()
        let match = /^https:\/\/(github|gitlab).com\//
        if (match.test(repo)){
            // let rawfile = await octokit.repos.getContent({
            //                 owner: OWNER,
            //                 repo: REPO,
            //                 path: `index.json`,
            //                 ref: ref
            //             })
            // let buff = new Buffer.from(rawfile.data.content, 'base64')
            // let text = buff.toString('utf-8')
            let text = fs.readFileSync('./index.json', {encoding:'utf8', flag:'r'})
            let json = JSON.parse(text)
            let text2 = fs.readFileSync('./blacklist.json', {encoding:'utf8', flag:'r'})
            let bjson = JSON.parse(text2)
            var topleader = bjson.filter(function (item) {
                return item.repo == repo ;
            }); 
            if (topleader.length > 0){
              throw Error('這個項目在黑名單上。');
            }
            let hash = crypto.createHash('md5').update(repo).digest("hex")
            var thisperson = json.filter(function (item) {
                return item.repo == repo ;
            }); 
            if (thisperson.length > 0){
              let votefile = `_data/votes/vote_${thisperson[0].hash}`
              let count = 2
              if (fs.existsSync(votefile)) {
                text = fs.readFileSync(votefile)
                count = parseInt(text)+1
              }
              thisperson[0].vote = count
              fs.writeFileSync(votefile, count.toString())

              json.map(item =>{
                let votefile = `_data/votes/vote_${item.hash}`;
                if (fs.existsSync(votefile)) {
                  text = fs.readFileSync(votefile)
                  item.vote = parseInt(text)
                }
              })
              let content = JSON.stringify(json, undefined, 4);
              fs.writeFileSync(`./index.json`, content)

              await octokit.issues.createComment({
                owner: OWNER,
                repo: REPO,
                issue_number: issue.number,
                body: `${thisperson[0].repo} 已经榜上有名了，你对TA赞了一次，试试在网页上的搜索TA的名字`
              })
              await octokit.issues.update({
                owner: OWNER,
                repo: REPO,
                issue_number: issue.number,
                state: 'closed',
                title: issue.title,
                labels: ['duplicate']
              })
            }else{

              let newhero = {
                repo: repo,
                desc: desc,
                vote: 1,
                hash: hash
              }
              json.push({
                ...newhero
              });
              console.log(json);
              json.map(item =>{
                let votefile = `_data/votes/vote_${item.hash}`;
                if (fs.existsSync(votefile)) {
                  text = fs.readFileSync(votefile)
                  item.vote = parseInt(text)
                }
              })
              let content = JSON.stringify(json, undefined, 4);

              let prTitle = `添加新項目-${repo}`

              fs.writeFileSync(`./index.json`, content)

              await octokit.issues.createComment({
                owner: OWNER,
                repo: REPO,
                issue_number: issue.number,
                body: `已成功添加 ${repo}`
              })
              await octokit.issues.update({
                owner: OWNER,
                repo: REPO,
                issue_number: issue.number,
                state: 'closed',
                title: prTitle,
                labels: ['success']
              })
            }
           }
          }
        } catch(error) {
          await octokit.issues.createComment({
            owner: OWNER,
            repo: REPO,
            issue_number: issue.number,
            body: `错误 ${error.toString()}`
          })
          await octokit.issues.update({
            owner: OWNER,
            repo: REPO,
            issue_number: issue.number,
            state: 'closed',
            labels: ['error']
          })
          throw error
        }

  })

  await Promise.all(promises)
}

performTasks()