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

async function performDoubleCheck() {
  let { data } = await octokit.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: 'closed'
  })

  let promises = data.map(async (issue) => {
    try {
      let responses = await octokit.issues.listLabelsOnIssue({
        owner: OWNER,
        repo: REPO,
        issue_number: issue.number
      });
      var labels = responses.data.map(function (item) {
        return item.name ;
      }); 
      if (!(labels.includes('double_checked'))){
        let repo = issue.body.split('\n')[0]
        let desc = issue.body.split('---描述---\n')[1].trim()
        let match = /^https:\/\/(github|gitlab).com\//
        let text = fs.readFileSync('./index.json', {encoding:'utf8', flag:'r'})
        let json = JSON.parse(text)

        let hash = crypto.createHash('md5').update(repo).digest("hex")
        var thisperson = json.filter(function (item) {
            return item.repo == repo ;
        }); 
        if (thisperson.length == 0){
          await octokit.issues.update({
            owner: OWNER,
            repo: REPO,
            issue_number: issue.number,
            state: 'open',
            title: `add_request`,
            labels: ['missing']
          })
        }else{
          await octokit.issues.update({
            owner: OWNER,
            repo: REPO,
            issue_number: issue.number,
            state: 'closed',
            title: issue.title,
            labels: labels.concat(['double_checked'])
          })
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

performDoubleCheck()
