
(function(){
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function title(c){return c.id===0?"Преамбула":c.id===10?"Переходные положения":c.name}
  function rail(active){
    return '<aside class="leftRail"><div class="leftRailHead"><h3>Оглавление</h3><p>Главы Конституции РФ</p></div><div class="leftRailList">'+
      chapters.map(c=>'<button class="leftRailItem '+(c.id===active?'active':'')+'" data-chapter="'+c.id+'"><span class="leftRailNo">'+(c.id===0?'§':c.id===10?'II':c.id)+'</span><span class="leftRailText"><b>'+title(c)+'</b><small>'+moduleInfo[c.id].desc+'</small></span><span class="leftRailPct">'+modulePct(c.id)+'%</span></button>').join('')+
      '</div><div class="leftRailFoot"><a href="https://publication.pravo.gov.ru/document/0001202210060013" target="_blank" rel="noopener">Официальный текст ↗</a></div></aside>'
  }
  function bindRail(scope=document){$$(".leftRailItem",scope).forEach(b=>b.onclick=()=>openModule(+b.dataset.chapter))}

  function buildBase(){
    document.querySelector(".top").innerHTML=
      '<div class="brand"><div class="logo">§</div><div><b>Конституция Российской Федерации</b><small>Интерактивный учебный курс</small></div></div>'+
      '<div class="topCenter"><div class="crumb" id="crumb"></div><div class="topChapterNav active" id="topChapterNav">'+
      '<button class="chapterArrow" id="prevChapterBtn" aria-label="Предыдущая глава">←</button>'+
      '<button class="chapterPicker" id="chapterPicker" aria-controls="chapterMenu" aria-haspopup="true" aria-expanded="false"><span class="chapterPickerLabel" id="chapterPickerLabel"></span><span class="chapterPickerHint">Сменить главу ▾</span></button>'+
      '<button class="chapterArrow" id="nextChapterBtn" aria-label="Следующая глава">→</button>'+
      '<button class="allChaptersBtn" onclick="showHome()">Главная</button><div class="chapterMenu" id="chapterMenu"></div></div></div>'+
      '<div class="topActions"><button class="topBtn resetProgressBtn" id="resetProgressBtn" onclick="requestProgressReset()" title="Сбросить прогресс">↻</button><button class="topBtn active" id="soundBtn" onclick="toggleSound()">🔊 Звук</button><a class="topBtn sourceBtn" href="https://publication.pravo.gov.ru/document/0001202210060013" target="_blank" rel="noopener">Официальный текст ↗</a></div>';

    document.querySelector(".homeShell").innerHTML='<div class="appGrid"><div id="homeLeft"></div><main class="mainSurface" id="homeMain"></main><aside class="rightRail" id="homeRight"></aside></div>';
    document.querySelector(".courseWorkspace").innerHTML=
      '<div class="appGrid"><div id="courseLeft"></div><main class="courseMain">'+
      '<header class="courseHead"><div><div class="eyebrow" id="courseKicker"></div><h2 id="courseTitle"></h2><p id="courseDesc"></p></div><div class="courseHeadProgress"><div class="progressTopline"><span class="progressLabel">Освоение главы</span><b id="coursePct">0%</b></div><div class="bar"><span id="courseBar"></span></div><div hidden><span id="progressTheory"></span><span id="progressCases"></span><span id="progressMeta"></span></div></div></header>'+
      '<nav class="modeTabs tabs"><button class="tab active" data-tab="learn"><span class="tabIcon">§</span><span><b>Понять</b><small>Текст</small></span></button><button class="tab" data-tab="scheme"><span class="tabIcon">◇</span><span><b>Схема</b><small>Связи</small></span></button><button class="tab" data-tab="cases"><span class="tabIcon">▤</span><span><b>Кейсы</b><small>Применение</small></span></button><button class="tab" data-tab="coach"><span class="tabIcon">AI</span><span><b>ИИ-тренер</b><small>Ответ</small></span></button></nav><div class="panel" id="panel"></div></main><aside class="rightRail" id="courseRight"></aside></div>'+
      '<nav class="mobileCourseNav"><button class="mobileCourseBtn active" data-tab="learn"><span>§</span><b>Понять</b></button><button class="mobileCourseBtn" data-tab="scheme"><span>◇</span><b>Схема</b></button><button class="mobileCourseBtn" data-tab="cases"><span>▤</span><b>Кейсы</b></button><button class="mobileCourseBtn" data-tab="coach"><span>AI</span><b>Тренер</b></button></nav>';

    $$(".tab,.mobileCourseBtn",document.querySelector(".courseWorkspace")).forEach(b=>b.onclick=()=>activateCourseTab(b.dataset.tab));
  }

  const baseNavigator=renderChapterNavigator;
  renderChapterNavigator=function(){
    baseNavigator();
    const active=currentModule===null?null:currentModule;
    const hl=$("#homeLeft"); if(hl){hl.innerHTML=rail(active);bindRail(hl)}
    const cl=$("#courseLeft"); if(cl){cl.innerHTML=rail(active);bindRail(cl)}
    const picker=$("#chapterPicker"),menu=$("#chapterMenu");
    if(picker&&menu)picker.setAttribute("aria-expanded",String(menu.classList.contains("open")));
  };

  renderHome=function(){
    currentModule=null;
    const overall=Math.round(chapters.reduce((a,c)=>a+modulePct(c.id),0)/chapters.length);
    const lastId=Number.isFinite(state.lastModule)?state.lastModule:1;
    const last=chapters.find(c=>c.id===lastId)||chapters[1];

    $("#homeMain").innerHTML=
      '<section class="homeHero"><div class="homeHeroCopy"><div class="eyebrow">Государственное и муниципальное управление</div><h1>Конституция без зубрёжки</h1><p>Полный текст норм, объяснение простым языком, практика Конституционного Суда РФ, интерактивные схемы, жизненные кейсы и ИИ‑тренер — в одном курсе.</p><div class="homeHeroActions"><button class="btn primary" id="continueBtn">Продолжить →</button><button class="btn ghost" id="startBtn">Начать с главы 1</button></div></div><div class="homeQuick"><span>Общий прогресс</span><strong>'+overall+'%</strong><div class="bar"><span style="width:'+overall+'%"></span></div><small>'+(overall===0?'Начните с главы 1':'Последняя глава: '+title(last))+'</small></div></section>'+
      '<section class="sectionCard"><div class="sectionHead"><div><h2>Главы Конституции</h2><p>Открывайте в любом порядке</p></div></div><div class="chapterGrid">'+chapters.map(c=>'<button class="chapterCard" data-chapter="'+c.id+'"><div class="chapterCardTop"><span class="chapterBadge">'+(c.id===0?'§':c.id===10?'II':c.id)+'</span><span class="chapterCardPct">'+modulePct(c.id)+'%</span></div><h3>'+title(c)+'</h3><p>'+moduleInfo[c.id].desc+'</p><div class="bar"><span style="width:'+modulePct(c.id)+'%"></span></div></button>').join('')+'</div></section>';

    $("#homeRight").innerHTML=
      '<section class="sideCard"><div class="sideProgressTop"><span>Ваш прогресс</span><b>'+overall+'%</b></div><div class="bar"><span style="width:'+overall+'%"></span></div><button class="btn primary" id="rightContinue">Продолжить</button></section>'+
      '<section class="sideCard"><h3>ИИ‑тренер</h3><p>Свободный ответ по реальным ситуациям. Номер статьи помнить не нужно.</p><button class="btn ghost" id="rightCoach">Открыть тренер</button></section>'+
      '<section class="sideCard"><h3>Как работать</h3><div class="sideList"><div class="sideListItem"><i>1</i><b>Прочитайте полный текст нормы</b></div><div class="sideListItem"><i>2</i><b>Разберите смысл простыми словами</b></div><div class="sideListItem"><i>3</i><b>Посмотрите практику КС РФ</b></div><div class="sideListItem"><i>4</i><b>Закрепите на кейсе или схеме</b></div></div></section>';

    $("#continueBtn").onclick=$("#rightContinue").onclick=()=>openModule(overall===0?1:last.id);
    $("#startBtn").onclick=()=>openModule(1);
    $("#rightCoach").onclick=()=>{openModule(last.id);setTimeout(()=>activateCourseTab("coach"),0)};
    $$(".chapterCard").forEach(b=>b.onclick=()=>openModule(+b.dataset.chapter));
    renderChapterNavigator(); syncSoundButton(); bindRipple();
  };

  function updateRight(bl,ids){
    const r=$("#courseRight"); if(!r)return;
    r.innerHTML=
      '<section class="sideCard"><h3>Сейчас изучаем</h3><p>'+capUi(bl[0])+'</p><div class="sideList">'+ids.map(id=>'<div class="sideListItem"><i>'+articleNo(id)+'</i><b>'+articleLabel(id)+'</b></div>').join('')+'</div></section>'+
      '<section class="sideCard"><h3>Быстрые действия</h3><button class="btn ghost" id="rFull">Полный текст</button><button class="btn ghost" id="rKs">Практика КС РФ</button><button class="btn primary" id="rCases">К кейсам →</button></section>'+
      '<section class="sideCard"><h3>Подсказка</h3><div class="sideQuote">'+(chapterStudyTips[currentModule]||"Сначала определите норму и полномочие, затем оцените действие.")+'</div></section>';
    $("#rFull").onclick=()=>setLearnPane("quote"); $("#rKs").onclick=()=>setLearnPane("official"); $("#rCases").onclick=()=>activateCourseTab("cases");
  }

  setLearnPane=function(mode){
    mobileLearnMode=mode;
    const studio=$(".learningStudio"); if(!studio)return;
    studio.dataset.pane=mode;
    $$(".readerTab").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  };

  renderLearn=function(){
    const inf=moduleInfo[currentModule],bl=inf.blocks[blockIndex],meta=learnMeta[currentModule]?.[blockIndex]||{},ids=bl[3]||[],panel=$("#panel");
    ids.forEach(id=>state.viewed.add(id)); save(); updateProgress();

    const links=[...(meta.links||[])],detail=officialPracticeDetails[currentModule+"-"+blockIndex];
    (detail?.links||[]).forEach(x=>{if(!links.some(y=>y[1]===x[1]))links.push(x)});
    const officialLinks=links.map(x=>'<a class="sourceChip" target="_blank" rel="noopener" href="'+x[1]+'">'+x[0]+' ↗</a>').join("");
    const topics=inf.blocks.map((t,i)=>'<button class="topicRailItem '+(i===blockIndex?'active':'')+'" data-topic="'+i+'"><span>'+(i+1)+'</span><b>'+capUi(t[0])+'</b><small>'+capUi(t[1])+'</small></button>').join("");

    panel.innerHTML='<div class="learningStudio" data-pane="'+(mobileLearnMode||"meaning")+'"><aside class="topicRail"><div class="topicRailHead"><span>Темы главы</span><b>'+inf.blocks.length+'</b></div><div class="topicRailList">'+topics+'</div></aside><section class="reader"><header class="readerHeader"><div><div class="eyebrow">'+mLabel(currentModule)+' · тема '+(blockIndex+1)+' из '+inf.blocks.length+'</div><h3>'+capUi(bl[0])+'</h3><p>'+capUi(bl[1])+'</p></div><div class="readerNav"><button class="conceptArrow" id="prevConceptBtn">←</button><button class="conceptArrow" id="nextConceptBtn">→</button></div></header><div class="readerTabs"><button class="readerTab" data-mode="meaning">Объяснение</button><button class="readerTab" data-mode="quote">Полный текст</button><button class="readerTab" data-mode="official">Практика КС РФ</button></div><div class="readerBody"><article class="readerPane paneMeaning"><div class="readerPaneContent">'+expandedMeaning(meta,bl,ids)+'</div></article><article class="readerPane paneQuote"><div class="readerPaneIntro"><div><span>Без сокращений</span><h4>'+escHtml(bl[2])+' · статьи приведены полностью</h4></div><a class="sourceChip" target="_blank" rel="noopener" href="'+officialSourceForIds(ids)+'">Официальный источник ↗</a></div><div class="fullArticles">'+fullArticleCards(ids)+'</div></article><article class="readerPane paneOfficial"><div class="readerPaneContent">'+expandedOfficial(meta,bl,ids)+'</div><div class="sourceRow">'+officialLinks+'<a class="sourceChip" target="_blank" rel="noopener" href="https://www.ksrf.ru/">Сайт КС РФ ↗</a></div></article></div></section></div>';

    $$(".topicRailItem").forEach(b=>b.onclick=()=>{blockIndex=+b.dataset.topic;renderLearn()});
    $$(".readerTab").forEach(b=>b.onclick=()=>setLearnPane(b.dataset.mode));
    const prev=$("#prevConceptBtn"),next=$("#nextConceptBtn");
    prev.disabled=blockIndex===0; next.disabled=blockIndex===inf.blocks.length-1;
    prev.onclick=()=>{if(blockIndex>0){blockIndex--;renderLearn()}};
    next.onclick=()=>{if(blockIndex<inf.blocks.length-1){blockIndex++;renderLearn()}};
    setLearnPane(mobileLearnMode||"meaning"); updateRight(bl,ids); renderChapterNavigator(); bindRipple();
  };

  const originalOpenModule=openModule;
  openModule=function(id){
    originalOpenModule(id);
    // original function fills header + renders current tab
    renderChapterNavigator();
  };

  document.addEventListener("click",e=>{
    const menu=$("#chapterMenu"),picker=$("#chapterPicker");
    if(menu&&picker&&!menu.contains(e.target)&&!picker.contains(e.target)){menu.classList.remove("open");picker.setAttribute("aria-expanded","false")}
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){
      const menu=$("#chapterMenu"),picker=$("#chapterPicker");
      if(menu?.classList.contains("open")){menu.classList.remove("open");picker?.setAttribute("aria-expanded","false");picker?.focus()}
    }
  });

  buildBase();
  renderHome();
  setTopHeaderMode(false);
  renderChapterNavigator();
  syncSoundButton();
  showPage("home");
})();
