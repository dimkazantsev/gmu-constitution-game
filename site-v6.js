
(function(){
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const KREMLIN_CREDIT='Фото Кремля: Julmin / Wikimedia Commons, CC BY-SA 1.0';
  const KREMLIN_PAGE='https://commons.wikimedia.org/wiki/File:Panorama_of_Moscow_Kremlin.jpg';

  function chapterTitle(c){return c.id===0?"Преамбула":c.id===10?"Переходные положения":c.name}
  function articleIdsForChapter(id){
    const inf=moduleInfo[id]; if(!inf)return [];
    const out=[];
    (inf.blocks||[]).forEach(b=>(b[3]||[]).forEach(x=>{if(!out.includes(x))out.push(x)}));
    return out;
  }
  function chapterForArticle(n){
    const x=parseFloat(n);
    if(!Number.isFinite(x))return 0;
    if(x<=16)return 1;if(x<=64)return 2;if(x<80)return 3;if(x<=93)return 4;if(x<=109)return 5;if(x<=117)return 6;if(x<=129)return 7;if(x<=133)return 8;return 9;
  }
  function findBlockByArticle(ch,id){
    const inf=moduleInfo[ch]; if(!inf)return 0;
    const idx=inf.blocks.findIndex(b=>(b[3]||[]).includes(id));
    return idx<0?0:idx;
  }

  function buildTop(){
    $(".top").innerHTML=
      '<div class="topPrimary">'+
        '<div class="brand"><img class="brandCrest" src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Coat_of_Arms_of_the_Russian_Federation.svg" alt="Государственный герб Российской Федерации"><div><b>Конституция Российской Федерации</b><small>Понятно. Современно. На реальных примерах.</small></div></div>'+
        '<div class="topSearchWrap"><div class="topSearch"><span class="topSearchIcon">⌕</span><input id="siteSearch" type="search" autocomplete="off" placeholder="Поиск по статьям, темам, кейсам…" aria-label="Поиск по курсу"><span class="searchShortcut">Ctrl + K</span><div class="searchResults" id="searchResults"></div></div></div>'+
        '<div class="topUtilities"><button class="utilityBtn" id="favBtn"><span class="utilityIcon">♡</span><span class="utilityText">Избранное</span></button><button class="utilityBtn" id="progressBtn"><span class="utilityIcon">▥</span><span class="utilityText">Мой прогресс</span></button><button class="utilityBtn active" id="soundBtn" onclick="toggleSound()"><span class="utilityIcon">◐</span></button><button class="mobileMenuBtn" id="mobileMenuBtn" aria-label="Открыть оглавление">☰</button></div>'+
      '</div>'+
      '<nav class="topSecondary" aria-label="Основная навигация">'+
        '<button class="topNavBtn" data-nav="home">Главная</button><button class="topNavBtn active" data-nav="constitution">Конституция</button><button class="topNavBtn" data-nav="scheme">Схемы</button><button class="topNavBtn" data-nav="cases">Кейсы</button><button class="topNavBtn" data-nav="coach">ИИ‑тренер</button><button class="topNavBtn" data-nav="about">О курсе</button>'+
      '</nav>';

    $$(".topNavBtn").forEach(b=>b.onclick=()=>{
      const target=b.dataset.nav;
      if(target==="home"){showHome();return}
      const id=currentModule===null?(Number.isFinite(state.lastModule)&&state.lastModule?state.lastModule:1):currentModule;
      openModule(id);
      if(target==="scheme")setTimeout(()=>activateCourseTab("scheme"),0);
      if(target==="cases")setTimeout(()=>activateCourseTab("cases"),0);
      if(target==="coach")setTimeout(()=>activateCourseTab("coach"),0);
      if(target==="about")setTimeout(()=>toast("Курс: полный текст Конституции, объяснения, КС РФ, схемы, кейсы и тренер"),0);
    });
    $("#progressBtn").onclick=()=>showHome();
    $("#favBtn").onclick=()=>toast("Избранное будет привязано к статьям на следующем этапе");
    $("#mobileMenuBtn").onclick=()=>$(".page.active")?.classList.toggle("mobileRailOpen");
    bindSearch();
  }

  function setTopActive(name){
    $$(".topNavBtn").forEach(b=>b.classList.toggle("active",b.dataset.nav===name));
  }

  function bindSearch(){
    const input=$("#siteSearch"),box=$("#searchResults");
    if(!input||!box)return;
    const run=()=>{
      const q=input.value.trim().toLowerCase();
      if(q.length<2){box.classList.remove("open");box.innerHTML="";return}
      const results=[];
      chapters.forEach(c=>{
        if(chapterTitle(c).toLowerCase().includes(q)||String(c.range).toLowerCase().includes(q)){
          results.push({kind:"Глава",label:chapterTitle(c),sub:mLabel(c.id),ch:c.id,block:0});
        }
      });
      Object.entries(rawTopics).forEach(([num,label])=>{
        const hay=("статья "+num+" "+label).toLowerCase();
        if(hay.includes(q)){
          const ch=chapterForArticle(num),id="a"+num;
          results.push({kind:"Ст. "+num,label:capUi(label),sub:chapterTitle(chapters.find(c=>c.id===ch)||chapters[0]),ch,block:findBlockByArticle(ch,id)});
        }
      });
      const top=results.slice(0,10);
      box.innerHTML=top.length?top.map((r,i)=>'<button class="searchResult" data-i="'+i+'"><i>'+r.kind+'</i><span><b>'+r.label+'</b><small>'+r.sub+'</small></span></button>').join(""):'<div style="padding:12px;font-size:10px;color:#71819a">Ничего не найдено</div>';
      box.classList.add("open");
      $$(".searchResult",box).forEach((b,i)=>b.onclick=()=>{
        const r=top[i];box.classList.remove("open");input.value="";openModule(r.ch);blockIndex=r.block;renderLearn();
      });
    };
    input.addEventListener("input",run);
    input.addEventListener("keydown",e=>{if(e.key==="Escape"){box.classList.remove("open");input.blur()}});
    document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();input.focus();input.select()}});
    document.addEventListener("click",e=>{if(!e.target.closest(".topSearch"))box.classList.remove("open")});
  }

  function railHTML(activeId){
    return '<aside class="leftRail">'+
      '<div class="leftRailHead"><div class="leftRailTitleRow"><h3>Оглавление</h3><button class="leftRailMini" title="Свернуть">⌘</button></div><label class="railSearch"><span>⌕</span><input class="railFilter" placeholder="Поиск по главам и статьям"></label></div>'+
      '<div class="leftRailList">'+chapters.map(c=>{
        const active=c.id===activeId;
        const subs=active?articleIdsForChapter(c.id).map(id=>'<button class="articleSubBtn '+((moduleInfo[c.id]?.blocks[blockIndex]?.[3]||[]).includes(id)?'active':'')+'" data-article="'+id+'"><span class="articleSubDot"></span><span>'+articleLabel(id)+'. '+capUi(rawTopics[articleNo(id)]||"")+'</span></button>').join(""):"";
        return '<div class="chapterGroup"><button class="leftRailItem '+(active?'active':'')+'" data-chapter="'+c.id+'"><span class="leftRailNo">'+(c.id===0?'§':c.id===10?'II':roman(c.id))+'</span><span class="leftRailText"><b>'+chapterTitle(c)+'</b><small>'+(c.id===0?'вводная часть':'ст. '+c.range)+'</small></span><span class="leftRailArrow">›</span></button>'+ (subs?'<div class="articleSubnav">'+subs+'</div>':"")+'</div>'
      }).join("")+'</div>'+
      '<div class="leftRailFoot"><a class="constDoc" href="https://publication.pravo.gov.ru/document/0001202210060013" target="_blank" rel="noopener"><span class="constBook">§</span><span><b>Полный текст Конституции РФ</b><span>Открыть документ ↗</span></span></a></div>'+
    '</aside>';
  }
  function roman(n){return ["","I","II","III","IV","V","VI","VII","VIII","IX","X"][n]||n}
  function bindRail(scope){
    $$(".leftRailItem",scope).forEach(b=>b.onclick=()=>openModule(+b.dataset.chapter));
    $$(".articleSubBtn",scope).forEach(b=>b.onclick=()=>{const id=b.dataset.article;const ch=currentModule;blockIndex=findBlockByArticle(ch,id);renderLearn();$(".page.active")?.classList.remove("mobileRailOpen")});
    const filter=$(".railFilter",scope);
    if(filter)filter.oninput=()=>{
      const q=filter.value.trim().toLowerCase();
      $$(".chapterGroup",scope).forEach(g=>g.style.display=!q||g.textContent.toLowerCase().includes(q)?"":"none");
    };
  }

  function buildShells(){
    $(".homeShell").innerHTML='<div class="appGrid"><div id="homeLeft"></div><main class="centerSurface homeCenter" id="homeCenter"></main><aside class="rightRail" id="homeRight"></aside></div>';
    $(".courseWorkspace").innerHTML='<div class="appGrid"><div id="courseLeft"></div><main class="centerSurface courseCenter"><div class="panel" id="panel"></div></main><aside class="rightRail" id="courseRight"></aside></div>';
  }

  const baseNavigator=renderChapterNavigator;
  renderChapterNavigator=function(){
    baseNavigator();
    const active=currentModule===null?null:currentModule;
    const h=$("#homeLeft"); if(h){h.innerHTML=railHTML(active);bindRail(h)}
    const c=$("#courseLeft"); if(c){c.innerHTML=railHTML(active);bindRail(c)}
  };

  function rightProgress(id){
    const p=id===null?Math.round(chapters.reduce((a,c)=>a+modulePct(c.id),0)/chapters.length):modulePct(id);
    const blocks=id===null?0:(moduleInfo[id]?.blocks||[]).length;
    const learned=id===null?state.viewed.size:(moduleInfo[id]?.blocks||[]).filter(bl=>(bl[3]||[]).some(x=>state.viewed.has(x))).length;
    const cases=id===null?totalCaseDone():(state.doneCases[id]?.length||0);
    const tasks=id===null?totalTaskDone():(state.doneTasks[id]?.length||0);
    return '<section class="sideCard"><div class="sideProgressTop"><span>'+(id===null?'Общий прогресс':'Ваш прогресс по главе')+'</span><b>'+p+'%</b></div><div class="sideMeta"><span>'+(id===null?'Курс':'Глава '+id)+'</span><span>'+learned+' из '+blocks+' тем</span></div><div class="bar" style="margin-top:7px"><span style="width:'+p+'%"></span></div><div class="progressStats3"><div class="statMini"><span>Прочитано</span><b>'+learned+'</b></div><div class="statMini"><span>Кейсы</span><b>'+cases+'</b></div><div class="statMini"><span>Задания</span><b>'+tasks+'</b></div></div><button class="btn primary" id="continueSide">Продолжить →</button></section>'
  }

  function rightCommon(){
    return '<section class="sideCard"><div class="aiCardHead"><span class="aiAvatar">AI</span><div><h3>ИИ‑тренер</h3><p>Разбирайте кейсы и объясняйте Конституцию своими словами.</p></div><span class="aiBadge">Beta</span></div><button class="btn ghost" id="openAiSide">Открыть чат с ИИ →</button></section>'+
      '<section class="sideCard"><h3>Интерактивные материалы</h3><div class="sideList"><div class="sideListItem"><i>◇</i><b>Схема: устройство власти</b></div><div class="sideListItem"><i>▦</i><b>Карта: федеративное устройство</b></div><div class="sideListItem red"><i>▶</i><b>Кейсы из реальной жизни</b></div><div class="sideListItem purple"><i>▤</i><b>Практика Конституционного Суда</b></div></div></section>'+
      '<section class="sideCard"><h3>Проверьте себя</h3><div class="sideList"><div class="sideListItem green"><i>✓</i><b>Тесты и задания</b></div><div class="sideListItem red"><i>◎</i><b>Практические ситуации</b></div><div class="sideListItem purple"><i>▶</i><b>Кейс из реальной жизни</b></div></div></section>'+
      '<div class="photoCredit">'+KREMLIN_CREDIT+' · <a href="'+KREMLIN_PAGE+'" target="_blank" rel="noopener">источник</a></div>';
  }

  renderHome=function(){
    currentModule=null;setTopActive("home");
    const overall=Math.round(chapters.reduce((a,c)=>a+modulePct(c.id),0)/chapters.length);
    const lastId=Number.isFinite(state.lastModule)&&state.lastModule?state.lastModule:1;
    const last=chapters.find(c=>c.id===lastId)||chapters[1];
    $("#homeCenter").innerHTML='<section class="homeHero"><div><div class="eyebrow">Интерактивный курс</div><h1>Конституция Российской Федерации</h1><p>Читайте полный текст, разбирайте каждую норму простыми словами, смотрите практику КС РФ, собирайте схемы и решайте реальные кейсы.</p><div class="homeHeroActions"><button class="btn primary" id="homeContinue">Продолжить изучение →</button><button class="btn ghost" id="homeStart">Начать с главы I</button></div></div><div class="homeProgressBox"><span>Общий прогресс</span><strong>'+overall+'%</strong><div class="bar"><span style="width:'+overall+'%"></span></div><small>'+(overall===0?'Начните с основ конституционного строя':'Последняя глава: '+chapterTitle(last))+'</small></div></section>'+
      '<section class="homeSection"><div class="homeSectionHead"><div><h2>Главы Конституции</h2><p>Можно изучать в любом порядке</p></div></div><div class="chapterGrid">'+chapters.map(c=>'<button class="chapterCard" data-chapter="'+c.id+'"><div class="chapterCardTop"><span class="chapterBadge">'+(c.id===0?'§':c.id===10?'II':roman(c.id))+'</span><span class="chapterCardPct">'+modulePct(c.id)+'%</span></div><h3>'+chapterTitle(c)+'</h3><p>'+moduleInfo[c.id].desc+'</p><div class="bar"><span style="width:'+modulePct(c.id)+'%"></span></div></button>').join("")+'</div></section>';
    $("#homeRight").innerHTML=rightProgress(null)+rightCommon();
    $("#homeContinue").onclick=$("#continueSide").onclick=()=>openModule(overall===0?1:last.id);
    $("#homeStart").onclick=()=>openModule(1);
    $("#openAiSide").onclick=()=>{openModule(last.id);setTimeout(()=>activateCourseTab("coach"),0)};
    $$(".chapterCard").forEach(b=>b.onclick=()=>openModule(+b.dataset.chapter));
    renderChapterNavigator();syncSoundButton();bindRipple();
  };

  function updateCourseRight(){
    const r=$("#courseRight");if(!r)return;
    r.innerHTML=rightProgress(currentModule)+rightCommon();
    $("#continueSide").onclick=()=>{if(currentTab==="learn"&&blockIndex<moduleInfo[currentModule].blocks.length-1){blockIndex++;renderLearn()}else activateCourseTab("cases")};
    $("#openAiSide").onclick=()=>activateCourseTab("coach");
  }

  function articleNumLabel(ids){
    if(!ids.length)return mLabel(currentModule);
    if(ids.length===1)return articleLabel(ids[0]);
    return articleLabel(ids[0])+'–'+articleLabel(ids[ids.length-1]).replace("Статья ","");
  }

  setLearnPane=function(mode){
    mobileLearnMode=mode;
    const studio=$(".learningStudio");if(!studio)return;
    studio.dataset.pane=mode;
    $$(".articleTool[data-mode]").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  };

  renderLearn=function(){
    setTopActive("constitution");
    const inf=moduleInfo[currentModule],bl=inf.blocks[blockIndex],meta=learnMeta[currentModule]?.[blockIndex]||{},ids=bl[3]||[],panel=$("#panel");
    ids.forEach(id=>state.viewed.add(id));save();updateProgress();

    const links=[...(meta.links||[])],detail=officialPracticeDetails[currentModule+"-"+blockIndex];
    (detail?.links||[]).forEach(x=>{if(!links.some(y=>y[1]===x[1]))links.push(x)});
    const officialLinks=links.map(x=>'<a class="sourceChip" target="_blank" rel="noopener" href="'+x[1]+'">'+x[0]+' ↗</a>').join("");

    const chapterArticleIds=articleIdsForChapter(currentModule);
    const nums=chapterArticleIds.map(id=>'<button class="articleNumber '+(ids.includes(id)?'active':'')+'" data-article="'+id+'">'+articleNo(id)+'</button>').join("");
    const concepts=inf.blocks.slice(Math.max(0,blockIndex-1),Math.min(inf.blocks.length,blockIndex+3)).map(x=>'<span class="conceptChip">'+capUi(x[0])+'</span>').join("");
    const mainIdea=escHtml(meta.meaning||bl[1]);

    const chrome='<div class="articleChrome"><div class="breadcrumbs"><span>Главная</span><span class="crumbSep">›</span><span>'+mLabel(currentModule)+'. '+chapterTitle(chapters.find(c=>c.id===currentModule))+'</span><span class="crumbSep">›</span><span>'+articleNumLabel(ids)+'</span></div>'+
      '<section class="articleHero"><span class="heroChapter">'+mLabel(currentModule)+'. '+chapterTitle(chapters.find(c=>c.id===currentModule))+'</span><h1>'+articleNumLabel(ids)+'</h1><p>'+capUi(bl[1])+'</p><span class="articleCountBadge">'+chapterArticleIds.length+' статей</span></section>'+
      '<div class="articleNumbers">'+nums+'</div>'+
      '<nav class="articleToolTabs"><button class="articleTool active" data-mode="meaning"><i>◉</i>Понять</button><button class="articleTool" data-mode="quote"><i>▤</i>Полный текст</button><button class="articleTool" data-mode="meaning" data-scroll="plainArticles"><i>▥</i>Объяснение</button><button class="articleTool" data-mode="official"><i>⚖</i>Практика КС РФ</button><button class="articleTool" data-mode="meaning" data-scroll="plainLife"><i>◇</i>Примеры из жизни</button><button class="articleTool" data-action="scheme"><i>⌘</i>Схемы</button><button class="articleTool" data-action="cases"><i>✓</i>Задания</button></nav></div>';

    panel.innerHTML='<div class="learningStudio" data-pane="'+(mobileLearnMode||"meaning")+'"><section class="reader"><div class="readerBody">'+
      '<article class="readerPane paneMeaning">'+chrome+'<div class="contentTopGrid"><section class="ideaCard"><h3><i>◎</i>Главная идея статьи</h3><p>'+mainIdea+'</p></section><section class="conceptCard"><h3><i>⌘</i>Ключевые понятия</h3><div class="conceptChips">'+concepts+'</div></section></div><div class="readerPaneContent">'+expandedMeaning(meta,bl,ids)+'</div></article>'+
      '<article class="readerPane paneQuote">'+chrome+'<div class="readerPaneIntro"><div><span>Официальный текст</span><h4>'+escHtml(bl[2])+' · без сокращений</h4></div><a class="sourceChip" target="_blank" rel="noopener" href="'+officialSourceForIds(ids)+'">Сверить источник ↗</a></div><div class="fullArticles">'+fullArticleCards(ids)+'</div></article>'+
      '<article class="readerPane paneOfficial">'+chrome+'<div class="readerPaneContent">'+expandedOfficial(meta,bl,ids)+'</div><div class="sourceRow">'+officialLinks+'<a class="sourceChip" target="_blank" rel="noopener" href="https://www.ksrf.ru/">Сайт КС РФ ↗</a></div></article>'+
      '</div></section></div>';

    $$(".articleNumber").forEach(b=>b.onclick=()=>{blockIndex=findBlockByArticle(currentModule,b.dataset.article);renderLearn()});
    $$(".articleTool[data-mode]").forEach(b=>b.onclick=()=>{
      setLearnPane(b.dataset.mode);
      if(b.dataset.scroll)setTimeout(()=>$(".paneMeaning ."+b.dataset.scroll)?.scrollIntoView({behavior:"smooth",block:"start"}),30);
    });
    $$(".articleTool[data-action='scheme']").forEach(b=>b.onclick=()=>activateCourseTab("scheme"));
    $$(".articleTool[data-action='cases']").forEach(b=>b.onclick=()=>activateCourseTab("cases"));
    setLearnPane(mobileLearnMode||"meaning");
    updateCourseRight();renderChapterNavigator();bindRipple();
  };

  const baseActivate=activateCourseTab;
  activateCourseTab=function(tab){
    baseActivate(tab);
    setTopActive(tab==="scheme"?"scheme":tab==="cases"?"cases":tab==="coach"?"coach":"constitution");
    updateCourseRight();
  };

  const originalOpen=openModule;
  openModule=function(id){
    originalOpen(id);
    $(".page.active")?.classList.remove("mobileRailOpen");
    setTopActive("constitution");
    updateCourseRight();
  };

  document.addEventListener("click",e=>{
    if(!e.target.closest(".leftRail")&&!e.target.closest("#mobileMenuBtn"))$(".page.active")?.classList.remove("mobileRailOpen");
  });

  buildTop();
  buildShells();
  renderChapterNavigator();
  syncSoundButton();
  openModule(1);
})();
