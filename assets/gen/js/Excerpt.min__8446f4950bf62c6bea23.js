webpackJsonpCoveo__temporary([64],{173:function(t,e,n){"use strict";var o=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])};return function(e,n){function o(){this.constructor=e}t(e,n),e.prototype=null===n?Object.create(n):(o.prototype=n.prototype,new o)}}();Object.defineProperty(e,"__esModule",{value:!0});var r=n(6),i=n(7),s=n(5),p=n(49),l=n(1),u=n(3);n(372);var c=function(t){function e(n,o,r,l){var u=t.call(this,n,e.ID,r)||this;return u.element=n,u.options=o,u.bindings=r,u.result=l,u.options=i.ComponentOptions.initComponentOptions(n,e,o),u.result=u.result||u.resolveResult(),s.Assert.exists(u.result),u.element.innerHTML=p.HighlightUtils.highlightString(u.result.excerpt,u.result.excerptHighlights,null,"coveo-highlight"),u}return o(e,t),e.ID="Excerpt",e.doExport=function(){u.exportGlobally({Excerpt:e})},e}(r.Component);e.Excerpt=c,l.Initialization.registerAutoCreateComponent(c)},372:function(t,e){}});