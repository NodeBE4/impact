let fs = require('fs')
let urlMod = require('url')
let URL = urlMod.URL
let request = require ('request')


function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  return a
}


async function cleanPosts() {
  let postFolder = `./_posts`
  let files = fs.readdirSync(postFolder)

  files.map(item => {
    let posttext = fs.readFileSync(`${postFolder}/${item}`, 'utf8')
    let postsplitted = posttext.split('---')
    let yamlheader = postsplitted[1]
    let timestamp = new Date()
    let placeholder = ' '+timestamp.toISOString()+' '
    let yamltemp = yamlheader.replace(/\n/g, placeholder)
    yamltemp = yamltemp.replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    yamltemp = yamltemp.replace(/[\xa0\t]/g, " ")
    let newyamlheader = yamltemp.split(placeholder).join('\n')
    postsplitted[1] = newyamlheader
    updatedpost = postsplitted.join('---')
    fs.writeFileSync(`${postFolder}/${item}`, updatedpost)
    console.log(item)
  })
  // performCDT()
  // performSite('自由亚洲电台')
}

async function clean(){
  // request ({
  //   url: 'https://nodebe4.github.io/opinion/search.json',
  //   json: true
  // }, (error, response, body) => {
  //   if(!error && response.statusCode === 200){
  //     console.log("search.json is healthy")
  //     console.log(body)
  //   }else{
  //     console.log(error)
  //     cleanPosts()
  //   }
  // })

  cleanPosts()
}


clean()
