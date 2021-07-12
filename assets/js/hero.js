function loadWikipedia(url, id){
  // var div = document.getElementById('submitText');
  var el = document.getElementById( 'article' );
  const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
  var html = document.createElement("div");
  html.id = "temp";

  if (el){
    $("#article").load(CORS_PROXY+url+" #"+id, function(responseTxt, statusTxt, xhr){
      if (statusTxt == "success"){
        html.innerHTML=responseTxt;
        var tables = el.getElementsByTagName("table");
        for (i=0;i<tables.length;i++){
          tables[i].parentNode.removeChild(tables[i]);
          // tables[i].remove();
        }
        var toc = el.getElementsByClassName("toc");
        if (toc.length==0){
          toc = el.getElementsByTagName("h2");
        }
        while(toc[0].nextSibling){
          var element = toc[0].nextSibling;
          element.parentNode.removeChild(element);
        }
        toc[0].parentNode.removeChild(toc[0]);
        // el.innerHTML = html.innerHTML;
      }
    });
  }
}


function loadHeroes(url, id){
  var el = document.getElementById(id);
  $.getJSON(url, function(json) {
    herolist = json;
    var lis = herolist.map(item => {
      let li = document.createElement('li');
      let s1 = document.createElement('span');
      s1.innerHTML = `<a onclick="expandHero('${item['people']})','${item['wiki']}');">${item['people']}</a>`;
      li.appendChild(s1);
      let s2 = document.createElement('span');
      s2.innerHTML = '&#x1f44d;'+item['vote']+' ';
      let a1 = document.createElement('a');
      a1.href= item['wiki'];
      a1.innerText = 'wikipedia';
      li.appendChild(a1);
      el.appendChild(li);
    });
  })

}

function sendJSON(data, url){ 
  let result = document.getElementById('bot-message'); 
     
  // Creating a XHR object 
  let xhr = new XMLHttpRequest(); 

  // open a connection 
  xhr.open("POST", url, true); 

  // Set the request header i.e. which type of content you are sending 
  xhr.setRequestHeader("Content-Type", "application/json"); 

  // Create a state change callback 
  xhr.onreadystatechange = function () { 
      if (xhr.readyState === 4 && xhr.status === 200) { 

          // Print received data from server 
          result.innerHTML = this.responseText; 

      } 
  }; 

  // Sending data with the request 
  xhr.send(data); 
} 

function sendData(form) {
  const XHR = new XMLHttpRequest();

  // Bind the FormData object and the form element
  const FD = new FormData( form );

  // Define what happens on successful data submission
  XHR.addEventListener( "load", function(event) {
    alert( event.target.responseText );
  } );

  // Define what happens in case of error
  XHR.addEventListener( "error", function( event ) {
    alert( 'Oops! Something went wrong.' );
  } );

  // Set up our request
  XHR.open( "POST", "https://hero-form.vercel.app/api/submit" );

  // The data sent is what the user provided in the form
  XHR.send( FD );
}
