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
module.exports = { loadRefSites, loadWikipedia, generateArticle, googlePhoto };

