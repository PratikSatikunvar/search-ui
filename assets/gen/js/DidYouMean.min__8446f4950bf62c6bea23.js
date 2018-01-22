webpackJsonpCoveo__temporary([66],{170:function(e,t,r){"use strict";var o=this&&this.__extends||function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])};return function(t,r){function o(){this.constructor=t}e(t,r),t.prototype=null===r?Object.create(r):(o.prototype=r.prototype,new o)}}();Object.defineProperty(t,"__esModule",{value:!0});var n=r(6),s=r(7),i=r(5),u=r(10),c=r(2),l=r(12),a=r(1),d=r(18),h=r(4),y=r(9),p=r(8),m=r(0),f=r(3);r(367);var v=function(e){function t(r,o,n){var l=e.call(this,r,t.ID,n)||this;return l.element=r,l.options=o,l.bindings=n,l.options=s.ComponentOptions.initComponentOptions(r,t,o),i.Assert.exists(r),i.Assert.exists(l.options),l.hideNext=!0,l.correctedTerm=null,l.bind.onRootElement(u.QueryEvents.buildingQuery,l.handlePrepareQueryBuilder),l.bind.onRootElement(u.QueryEvents.querySuccess,l.handleProcessNewQueryResults),l.bind.onRootElement(u.QueryEvents.noResults,l.handleNoResults),l.bind.onRootElement(u.QueryEvents.newQuery,l.handleNewQuery),c.$$(l.element).hide(),l}return o(t,e),t.prototype.doQueryWithCorrectedTerm=function(){var e=this;i.Assert.exists(this.correctedTerm),this.queryStateModel.set(l.QueryStateModel.attributesEnum.q,this.correctedTerm),this.queryController.deferExecuteQuery({beforeExecuteQuery:function(){return e.usageAnalytics.logSearchEvent(y.analyticsActionCauseList.didyoumeanClick,{})}})},t.prototype.handleNewQuery=function(){this.hideNext?(c.$$(this.element).empty(),c.$$(this.element).hide(),this.correctedTerm=null):this.hideNext=!0},t.prototype.handlePrepareQueryBuilder=function(e){i.Assert.exists(e),e.queryBuilder.enableDidYouMean=!0},t.prototype.handleNoResults=function(e){if(h.Utils.isNonEmptyArray(e.results.queryCorrections)&&!e.searchAsYouType&&this.options.enableAutoCorrection){var t=this.queryStateModel.get(l.QueryStateModel.attributesEnum.q);this.correctedTerm=e.results.queryCorrections[0].correctedQuery;var r=this.buildCorrectedSentence(e.results.queryCorrections[0]);this.queryStateModel.set(l.QueryStateModel.attributesEnum.q,e.results.queryCorrections[0].correctedQuery),e.retryTheQuery=!0,this.hideNext=!1;var o=c.$$("div",{className:"coveo-did-you-mean-no-results-for"}).el;o.innerHTML=p.l("noResultFor",'<span class="coveo-highlight coveo-did-you-mean-highlight">'+d.StringUtils.htmlEncode(t)+"</span>"),this.element.appendChild(o);var n=c.$$("div",{className:"coveo-did-you-mean-automatic-correct"}).el;n.innerHTML=p.l("autoCorrectedQueryTo",'<span class="coveo-highlight">'+r+"</span>"),this.element.appendChild(n),c.$$(this.element).show(),this.usageAnalytics.logSearchEvent(y.analyticsActionCauseList.didyoumeanAutomatic,{})}},t.prototype.handleProcessNewQueryResults=function(e){var t=this;i.Assert.exists(e),i.Assert.exists(e.results);var r=e.results;if(this.logger.trace("Received query results from new query",r),h.Utils.isNonEmptyArray(r.queryCorrections)){var o=this.buildCorrectedSentence(r.queryCorrections[0]);this.correctedTerm=r.queryCorrections[0].correctedQuery;var n=c.$$("div",{className:"coveo-did-you-mean-suggestion"},p.l("didYouMean","")).el;this.element.appendChild(n);var s=c.$$("a",{},o).el;n.appendChild(s),c.$$(s).on("click",function(){t.doQueryWithCorrectedTerm()}),c.$$(this.element).show()}},t.prototype.buildCorrectedSentence=function(e){var t=[],r=0;return m.each(e.wordCorrections,function(o){t.push(d.StringUtils.htmlEncode(e.correctedQuery.slice(r,o.offset))),r=o.offset,t.push("<span class='coveo-did-you-mean-word-correction'>"),t.push(d.StringUtils.htmlEncode(e.correctedQuery.slice(r,o.length+r))),t.push("</span>"),r=o.offset+o.length}),t.push(d.StringUtils.htmlEncode(e.correctedQuery.slice(r))),t.join("")},t.ID="DidYouMean",t.doExport=function(){f.exportGlobally({DidYouMean:t})},t.options={enableAutoCorrection:s.ComponentOptions.buildBooleanOption({defaultValue:!0})},t}(n.Component);t.DidYouMean=v,a.Initialization.registerAutoCreateComponent(v)},367:function(e,t){}});