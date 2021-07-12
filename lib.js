let fs = require('fs')
let querystring = require('querystring')
let urlMod = require('url')
const crypto = require('crypto')
const https = require('https')
const fetch = require('node-fetch')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let URL = urlMod.URL

let db_news_url = 'https://nodebe4.github.io/waimei/search.json'
let db_oped_url = 'https://nodebe4.github.io/opinion/search.json'
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/"

let settings = { method: "Get" }

let news = []
let oped = []

function getElementById(node, id) {    
    return node.querySelector("#" + id);
}

async function loadWikipedia(url, id){
  // var div = document.getElementById('submitText');
  // const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
  // var html = document.createElement("div");
  // html.id = "about";

  const response = await fetch(url, settings);
  const body = await response.text();

  const dom = new JSDOM(body)
  let content = dom.window.document.querySelector("#"+id);
  while (content.querySelector("table")){
    var tables = content.querySelector("table");
    tables.parentNode.removeChild(tables);
  }
  // for (i=0;i<tables.length;i++){
  //   tables[i].parentNode.removeChild(tables[i]);
  //   // tables[i].remove();
  // }
  var toc = content.querySelector("#toc");
  if (toc == null ){
    var toc = content.querySelector("h2");
  }
  if (toc){
    while(toc.nextSibling){
      var element = toc.nextSibling;
      element.parentNode.removeChild(element);
    }
    toc.parentNode.removeChild(toc);
  }
  // el.innerHTML = html.innerHTML;
  // html.appencChild(content)

  return content.innerHTML;

}

function loadNews(hero){
  const html = (new JSDOM(`<div><h3></h3><ul></ul></div>`)).window.document.querySelector("div")
  const ul = html.querySelector("ul")
  const h3 = html.querySelector("h3")
  html.id = "recent-news"
  h3.innerHTML = "最近动态"
  let relatednews = news.map(item => {
    if (item['title'].includes(hero) || item['desc'].includes(hero)){
      var baseurl = "https://nodebe4.github.io"
      ul.innerHTML += `<li><a href="${baseurl+item['url']}" title="${item['desc']}">${item['title']}</a><time>${item['date']}</time><a class="tag">${item['category']}</a></li>\n`
      return item
    }
  })
  return html.parentElement.innerHTML
}

function loadOped(hero){
  const html = (new JSDOM(`<div><h3></h3><ul></ul></div>`)).window.document.querySelector("div")
  const ul = html.querySelector("ul")
  const h3 = html.querySelector("h3")
  html.id = "open-opinion"
  h3.innerHTML = "相关言论"
  let relatednews = oped.map(item => {
    if (item['title'].includes(hero) || item['desc'].includes(hero)){
      var baseurl = "https://nodebe4.github.io"
      ul.innerHTML += `<li><a href="${baseurl+item['url']}" title="${item['desc']}">${item['title']}</a><time>${item['date']}</time><a class="tag">${item['category']}</a></li>\n`
      return item
    }
  })
  return html.parentElement.innerHTML
}

function generateArticle(item, intro) {
  let today = new Date()
  let openoped = loadOped(item['people'])
  let recentnews = loadNews(item['people'])
  let md = intro + recentnews + openoped
  let dateString = "1989-06-04"
  let titletext = item.people.toString().replace(/"/g, '\\"').replace("...", '')
  let articlelink = new URL(item.wiki).href
  let photourl = item.imgur || ''
  let header = `---
layout: post
title: "${titletext}"
date: ${dateString}
author: 维基百科
from: ${articlelink}
tags: [ ${titletext}, 维基百科 ]
categories: [ ${titletext} ]
photo: ${photourl}
comments: true
---
`
  md = header + md
  let filename = `${dateString.substring(0, 10)}-${titletext.substring(0, 50)}.md`.replace(/\//g, '--')
  fs.writeFileSync(`./_posts/${filename}`, md)
  console.log(`add ./_posts/${filename}`)
  // if (!fs.existsSync(`./_posts/${filename}`)) {
  //   fs.writeFileSync(`./_posts/${filename}`, md)
  //   console.log(`add ./_posts/${filename}`)
  // }
  return md
}

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  return a
}


function updateReadme(data){
  const table = (new JSDOM(`<table id="add-hero-form" class="table table-striped table-bordered table-sm" style="width:100%;">
    <thead><tr></tr></thead>
    <tbody></tbody>
    <tfoot></tfoot>
</table>`)).window.document.querySelector("table")

  const thead_format = {
    'vote': '贊',
    'repo': '倉庫',
    'author': '作者',
    'desc': '描述',
    'search': '搜索',
    'update': '更新',
    'star': 'star',
    'fork': 'fork',
    'contributors': '貢獻者',
  }

  herolist = data;

  var thead = table.querySelector('thead');
  var tbody = table.querySelector('tbody');
  var tfoot = table.querySelector('tfoot');
  var tr0 = thead.querySelector('tr');
  var thead_vals = Object.values(thead_format)
  var thead_keys = Object.keys(thead_format)
  thead_vals.map(item => {
    var th = `<th>${item}</th>`
    tr0.innerHTML += th
  });

  var lis = herolist.map(item => {
    let texts = item['repo'].split('/')
    let origin = texts[2]
    let author = texts[3]
    let reponame = texts[4]
    let authorlink = texts.slice(0,4).join('/')
    let host = origin.split('.')[0]

    let tr = ``;
    thead_keys.map(key => {
      let td1 = ``
      if (key == 'repo'){
        if (origin=='github.com'){
          td1 += `<a class="thumb-post" href="${item['repo']}"><i class="fa fa-github github"></i></a>`
        }else if (origin=='gitlab.com'){
          td1 += `<a class="thumb-post" href="${item['repo']}"><i class="fa fa-gitlab gitlab"></i></a>`
        }
        td1 += `<a href="${item['repo']}"><b style="font-size: 12px;">${reponame}</b></a>`;
      }else if(key=='vote'){
        let val = item[key] || 0
        td1 += val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        td1 += `<a id="vote-${item.hash}" onclick="vote_hero('${item.hash}')" style="color:#2980B9"> <i class="fa fa-thumbs-o-up"></i></a>`
      }else if (key == 'author'){
        td1 += `<a href="${authorlink}" style="font-size: 12px;">${author}</a>`
      }else if (key=='update'){
        let imglink = `https://img.shields.io/${host}/last-commit/${author}/${reponame}?label=%20`
        td1 += `<a href="${item['repo']}"><img src="${imglink}"></img></a>`
      }else if (key=='star'){
        let imglink = `https://img.shields.io/${host}/stars/${author}/${reponame}?label=%20`
        td1 += `<a href="${item['repo']}/stargazers"><img src="${imglink}"></img></a>`
      }else if (key=='fork'){
        let imglink = `https://img.shields.io/${host}/forks/${author}/${reponame}?label=%20`
        td1 += `<a href="${item['repo']}/network/members"><img src="${imglink}"></img></a>`
      }else if (key=='contributors'){
        let imglink = `https://img.shields.io/${host}/contributors/${author}/${reponame}?label=%20`
        td1 += `<a href="${item['repo']}/graphs/contributors"><img src="${imglink}"></img></a>`
      }else if (key=='search'){
        let searchlink = `https://github.com/search?q=${reponame}`
        td1 += `<a href="${searchlink}" target="_blank"><i class="fa fa-search" title="search on github"></i></a>`
      }else{
        let val = item[key] || 0
        td1 = `<i style="font-size: 12px;">${val}</i>`
      }
      tr += `<td>${td1}</td>`;
    });
    tbody.innerHTML += `<tr>${tr}</tr>`
  });

  var tr2 = ``;
  thead_vals.map(item => {
    var th = `<th data-field="${item}">${item}</th>`;
    tr2 += th
  });
  tfoot.innerHTML += `<tr>${tr2}</tr>`;
  // $('#add-hero-form').DataTable( {
  //     "order": [[ 0, "desc" ]],
  //     "language": {
  //         "url": "//cdn.datatables.net/plug-ins/1.10.21/i18n/Chinese.json"
  //     },
  //     "pageLength": 50
  // });
  console.log(table)
  return table.outerHTML
}


async function loadRefSites(){

  await fetch(db_news_url, settings)
    .then(res => res.json())
    .then((json) => {
      news = json
    });

  await fetch(db_oped_url, settings)
    .then(res => res.json())
    .then((json) => {
      oped = json
    });
}

let Scraper = require('images-scraper');

var options = {
  userAgent: 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36', // the user agent
  puppeteer: { headless: true }, // puppeteer options, for example, { headless: false }
  tbs: {  // every possible tbs search option, some examples and more info: http://jwebnet.net/advancedgooglesearch.html
    // isz: 'm', // options: l(arge), m(edium), i(cons), etc.
    itp: 'face' // options: clipart, face, lineart, news, photo
    // ic: 'color', // options: color, gray, trans
    // sur: 'fmc' // options: fmc (commercial reuse with modification), fc (commercial reuse), fm (noncommercial reuse with modification), f (noncommercial reuse)
  }, 
};
const google = new Scraper(options);

async function googlePhoto(query){
  const results = await google.scrape(query, 10);
  let i = between(0, 3)
  console.log('results', results[i]);
  return results[i].url 
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function between(min, max) {  
  return Math.floor(
    Math.random() * (max - min) + min
  )
}
module.exports = { loadRefSites, loadWikipedia, generateArticle, googlePhoto, updateReadme };

