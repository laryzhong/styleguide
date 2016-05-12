(function(){
var opts={"version":1,"apiEndpoint":"https://api.trello.com","authEndpoint":"https://trello.com","intentEndpoint":"https://trello.com","key":"8eaaa12831af734bbe969ac953e7650b"};
var deferred,isFunction,isReady,ready,waitUntil,wrapper,slice=[].slice;
wrapper=function(a,e,b){var h,f,p,x,z,m,A,q,k,s,t,r,B,y,u,g,v,w;k=b.key;g=b.token;f=b.apiEndpoint;p=b.authEndpoint;A=b.intentEndpoint;v=b.version;z=f+"/"+v+"/";r=a.location;h={version:function(){return v},key:function(){return k},setKey:function(d){k=d},token:function(){return g},setToken:function(d){g=d},rest:function(){var d,a,n,c;a=arguments[0];d=2<=arguments.length?slice.call(arguments,1):[];c=B(d);n=c[0];d=c[1];b={url:""+z+n,type:a,data:{},dataType:"json",success:c[2],error:c[3]};e.support.cors||
(b.dataType="jsonp","GET"!==a&&(b.type="GET",e.extend(b.data,{_method:a})));k&&(b.data.key=k);g&&(b.data.token=g);null!=d&&e.extend(b.data,d);return e.ajax(b)},authorized:function(){return null!=g},deauthorize:function(){g=null;w("token",g)},authorize:function(d){var l,n,c,f,k;b=e.extend(!0,{type:"redirect",persist:!0,interactive:!0,scope:{read:!0,write:!1,account:!1},expiration:"30days"},d);d=/[&#]?token=([0-9a-f]{64})/;n=function(){if(b.persist&&null!=g)return w("token",g)};b.persist&&null==g&&
(g=y("token"));null==g&&(g=null!=(c=d.exec(r.hash))?c[1]:void 0);if(this.authorized())return n(),r.hash=r.hash.replace(d,""),"function"===typeof b.success?b.success():void 0;if(!b.interactive)return"function"===typeof b.error?b.error():void 0;f=function(){var a,d;a=b.scope;d=[];for(l in a)(k=a[l])&&d.push(l);return d}().join(",");switch(b.type){case "popup":(function(){var d,c,l,e,k,m;waitUntil("authorized",function(a){return function(a){return a?(n(),"function"===typeof b.success?b.success():void 0):
"function"===typeof b.error?b.error():void 0}}(this));c=a.screenX+(a.innerWidth-420)/2;m=a.screenY+(a.innerHeight-470)/2;l=null!=(k=/^[a-z]+:\/\/[^\/]*/.exec(r))?k[0]:void 0;d=a.open(x({return_url:l,callback_method:"postMessage",scope:f,expiration:b.expiration,name:b.name}),"trello","width=420,height=470,left="+c+",top="+m);e=function(b){var c;b.origin===p&&b.source===d&&(null!=(c=b.source)&&c.close(),g=null!=b.data&&/[0-9a-f]{64}/.test(b.data)?b.data:null,"function"===typeof a.removeEventListener&&
a.removeEventListener("message",e,!1),isReady("authorized",h.authorized()))};return"function"===typeof a.addEventListener?a.addEventListener("message",e,!1):void 0})();break;default:a.location=x({redirect_uri:r.href,callback_method:"fragment",scope:f,expiration:b.expiration,name:b.name})}},addCard:function(d,b){var n,c;n={mode:"popup",source:k||a.location.host};c=function(b){var c,l,f;l=function(d){var c;a.removeEventListener("message",l);try{return c=JSON.parse(d.data),c.success?b(null,c.card):b(Error(c.error))}catch(e){}};
"function"===typeof a.addEventListener&&a.addEventListener("message",l,!1);c=a.screenX+(a.outerWidth-500)/2;f=a.screenY+(a.outerHeight-600)/2;return a.open(A+"/add-card?"+e.param(e.extend(n,d)),"trello","width=500,height=600,left="+c+",top="+f)};return null!=b?c(b):a.Promise?new Promise(function(a,b){return c(function(d,c){return d?b(d):a(c)})}):c(function(){})}};s=["GET","PUT","POST","DELETE"];f=function(a){return h[a.toLowerCase()]=function(){return this.rest.apply(this,[a].concat(slice.call(arguments)))}};
m=0;for(q=s.length;m<q;m++)u=s[m],f(u);h.del=h["delete"];u="actions cards checklists boards lists members organizations lists".split(" ");m=function(a){return h[a]={get:function(b,e,c,f){return h.get(a+"/"+b,e,c,f)}}};q=0;for(s=u.length;q<s;q++)f=u[q],m(f);a.Trello=h;x=function(a){return p+"/"+v+"/authorize?"+e.param(e.extend({response_type:"token",key:k},a))};B=function(a){var b,e,c;e=a[0];b=a[1];c=a[2];a=a[3];isFunction(b)&&(a=c,c=b,b={});e=e.replace(/^\/*/,"");return[e,b,c,a]};t=a.localStorage;
null!=t?(y=function(a){return t["trello_"+a]},w=function(a,b){return null===b?delete t["trello_"+a]:t["trello_"+a]=b}):y=w=function(){}};deferred={};ready={};waitUntil=function(a,e){return null!=ready[a]?e(ready[a]):(null!=deferred[a]?deferred[a]:deferred[a]=[]).push(e)};isReady=function(a,e){var b,h,f,p;ready[a]=e;if(deferred[a])for(h=deferred[a],delete deferred[a],f=0,p=h.length;f<p;f++)b=h[f],b(e)};isFunction=function(a){return"function"===typeof a};wrapper(window,jQuery,opts);
})()