
(function(){
  "use strict";

  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function chapterShort(c){
    if(c.id===0)return "Преамбула";
    if(c.id===10)return "Переходные положения";
    return c.name;
  }

  function buildHeader(){
    const top=q(".top");
    if(!top)return;
    top.innerHTML=
      '<div class="topRow">'+
        '<div class="brand"><div class="logo">§</div><div><b>Конституция Российской Федерации</b><small>Понять. Применить. Проверить себя.</small></div></div>'+
        '<div class="topCenter"><div class="crumb" id="crumb"></div><div class="topChapterNav active" id="topChapterNav">'+
          '<button class="chapterArrow" id="prevChapterBtn" aria-label="Предыдущая глава">←</button>'+
          '<button class="chapterPicker" id="chapterPicker" aria-controls="chapterMenu" aria-haspopup="true" aria-expanded="false"><span class="chapterPickerLabel" id="chapterPickerLabel"></span><span class="chapterPickerHint">Сменить главу ▾</span></button>'+
          '<button class="chapterArrow" id="nextChapterBtn" aria-label="Следующая глава">→</button>'+
          '<button class="allChaptersBtn" onclick="showHome()">Все главы</button>'+
          '<div class="chapterMenu" id="chapterMenu"></div>'+
        '</div></div>'+
        '<div class="topActions">'+
          '<button class="topBtn resetProgressBtn" id="resetProgressBtn" onclick="requestProgressReset()" title="Сбросить прогресс">↻</button>'+
          '<button class="topBtn active" id="soundBtn" onclick="toggleSound()">🔊 Звук</button>'+
          '<a class="topBtn sourceBtn" href="https://publication.pravo.gov.ru/document/0001202210060013" target="_blank" rel="noopener">Официальный текст ↗</a>'+
        '</div>'+
      '</div>'+
      '<nav class="globalNav" aria-label="Основная навигация">'+
        '<button id="globalHome">Главная</button>'+
        '<button id="globalConstitution">Конституция</button>'+
        '<button id="globalPractice">Практика КС РФ</button>'+
        '<button id="globalCases">Кейсы</button>'+
        '<button id="globalCoach">ИИ-тренер</button>'+
      '</nav>';

    q("#globalHome").onclick=()=>showHome();
    q("#globalConstitution").onclick=()=>{
      const id=currentModule===null?(Number.isFinite(state.lastModule)?state.lastModule:1):currentModule;
      openModule(id);
    };
    q("#globalPractice").onclick=()=>{
      const id=currentModule===null?(Number.isFinite(state.lastModule)?state.lastModule:1):currentModule;
      openModule(id);
      setTimeout(()=>setLearnPane("official"),0);
    };
    q("#globalCases").onclick=()=>{
      const id=currentModule===null?(Number.isFinite(state.lastModule)?state.lastModule:1):currentModule;
      openModule(id);
      setTimeout(()=>activateCourseTab("cases"),0);
    };
    q("#globalCoach").onclick=()=>{
      const id=currentModule===null?(Number.isFinite(state.lastModule)?state.lastModule:1):currentModule;
      openModule(id);
      setTimeout(()=>activateCourseTab("coach"),0);
    };
  }

  function railHTML(activeId){
    const items=chapters.map(c=>
      '<button class="chapterRailItem '+(c.id===activeId?'active':'')+'" data-chapter="'+c.id+'">'+
        '<span class="chapterRailNo">'+(c.id===0?'§':c.id===10?'II':c.id)+'</span>'+
        '<span class="chapterRailText"><b>'+chapterShort(c)+'</b><small>'+moduleInfo[c.id].desc+'</small></span>'+
        '<span class="chapterRailPct">'+modulePct(c.id)+'%</span>'+
      '</button>'
    ).join("");
    return '<aside class="chapterRail">'+
      '<div class="chapterRailHead"><span>Навигация</span><h3>Главы Конституции</h3></div>'+
      '<div class="chapterRailList">'+items+'</div>'+
      '<div class="chapterRailFoot"><a class="chapterRailSource" href="https://publication.pravo.gov.ru/document/0001202210060013" target="_blank" rel="noopener">§ Официальный текст ↗</a></div>'+
    '</aside>';
  }

  function bindRail(scope=document){
    qa(".chapterRailItem",scope).forEach(b=>b.onclick=()=>openModule(+b.dataset.chapter));
  }

  function buildHomeShell(){
    const shell=q(".homeShell");
    if(!shell)return;
    shell.innerHTML=
      '<div id="homeRailSlot"></div>'+
      '<main class="homeMain">'+
        '<section class="homeHero">'+
          '<div class="homeHeroCopy">'+
            '<div class="eyebrow">Государственное и муниципальное управление</div>'+
            '<h1>Конституция без зубрёжки</h1>'+
            '<p>Полный текст норм, объяснение простым языком, реальные позиции Конституционного Суда, схемы, жизненные кейсы и тренировка свободного ответа.</p>'+
            '<div class="homeHeroActions">'+
              '<button class="btn primary" id="homeContinueBtn">Продолжить изучение →</button>'+
              '<button class="btn ghost" id="homeStartBtn">Начать с первой главы</button>'+
            '</div>'+
          '</div>'+
        '</section>'+
        '<section class="homeSection">'+
          '<div class="homeSectionHead"><div><h2>Как работать с курсом</h2><p>Не запоминать номера — понимать механизм нормы.</p></div></div>'+
          '<div class="homeRouteGrid">'+
            '<button class="homeRouteCard" data-route="learn"><span class="homeRouteIcon">§</span><b>Понять норму</b><span>Полный текст статьи и подробное объяснение человеческим языком.</span></button>'+
            '<button class="homeRouteCard" data-route="official"><span class="homeRouteIcon">КС</span><b>Посмотреть практику</b><span>Как Конституционный Суд применяет норму в реальных спорах.</span></button>'+
            '<button class="homeRouteCard" data-route="coach"><span class="homeRouteIcon">AI</span><b>Проверить себя</b><span>Свободный ответ, кейсы и ИИ-тренер по пройденному материалу.</span></button>'+
          '</div>'+
        '</section>'+
        '<section class="homeSection">'+
          '<div class="homeSectionHead"><div><h2>Структура Конституции</h2><p>Можно открыть любую главу сразу.</p></div></div>'+
          '<div class="homeChapterGrid" id="homeChapterGrid"></div>'+
        '</section>'+
      '</main>'+
      '<aside class="homeAside" id="homeAside"></aside>';
  }

  function buildCourseShell(){
    const cw=q(".courseWorkspace");
    if(!cw)return;
    cw.innerHTML=
      '<div id="courseRailSlot"></div>'+
      '<main class="courseCenter">'+
        '<section class="courseHero">'+
          '<div class="courseHeroMain"><div class="eyebrow" id="courseKicker"></div><h2 id="courseTitle"></h2><p id="courseDesc"></p></div>'+
          '<div class="courseHeroProgress"><div class="progressTopline"><span class="progressLabel">Освоение главы</span><b id="coursePct">0%</b></div><div class="bar"><span id="courseBar"></span></div><div style="display:none"><span id="progressTheory"></span><span id="progressCases"></span><span id="progressMeta"></span></div></div>'+
        '</section>'+
        '<nav class="courseModeTabs tabs" aria-label="Режим обучения">'+
          '<button class="tab active" data-tab="learn"><span class="tabIcon">§</span><span><b>Понять</b><small>Текст и смысл</small></span></button>'+
          '<button class="tab" data-tab="scheme"><span class="tabIcon">◇</span><span><b>Схема</b><small>Механизм</small></span></button>'+
          '<button class="tab" data-tab="cases"><span class="tabIcon">▤</span><span><b>Кейсы</b><small>Применение</small></span></button>'+
          '<button class="tab" data-tab="coach"><span class="tabIcon">AI</span><span><b>ИИ-тренер</b><small>Свободный ответ</small></span></button>'+
        '</nav>'+
        '<div class="panel" id="panel"></div>'+
      '</main>'+
      '<aside class="courseAside" id="courseAside"></aside>'+
      '<nav class="mobileCourseNav" aria-label="Навигация по режимам">'+
        '<button class="mobileCourseBtn active" data-tab="learn"><span>§</span><b>Понять</b></button>'+
        '<button class="mobileCourseBtn" data-tab="scheme"><span>◇</span><b>Схема</b></button>'+
        '<button class="mobileCourseBtn" data-tab="cases"><span>▤</span><b>Кейсы</b></button>'+
        '<button class="mobileCourseBtn" data-tab="coach"><span>AI</span><b>Тренер</b></button>'+
      '</nav>';
    qa(".tab,.mobileCourseBtn",cw).forEach(b=>b.onclick=()=>activateCourseTab(b.dataset.tab));
  }

  function refreshGlobalNav(){
    const map={
      globalHome:currentModule===null,
      globalConstitution:currentModule!==null&&currentTab==="learn"&&mobileLearnMode!=="official",
      globalPractice:currentModule!==null&&currentTab==="learn"&&mobileLearnMode==="official",
      globalCases:currentModule!==null&&currentTab==="cases",
      globalCoach:currentModule!==null&&currentTab==="coach"
    };
    Object.entries(map).forEach(([id,on])=>q("#"+id)?.classList.toggle("active",!!on));
  }

  const baseRenderChapterNavigator=renderChapterNavigator;
  renderChapterNavigator=function(){
    baseRenderChapterNavigator();
    const active=currentModule===null?null:currentModule;
    const homeSlot=q("#homeRailSlot");
    if(homeSlot){
      homeSlot.innerHTML=railHTML(active);
      bindRail(homeSlot);
    }
    const courseSlot=q("#courseRailSlot");
    if(courseSlot){
      courseSlot.innerHTML=railHTML(active);
      bindRail(courseSlot);
    }
    refreshGlobalNav();
  };

  renderHome=function(){
    currentModule=null;
    const lastId=Number.isFinite(state.lastModule)?state.lastModule:1;
    const last=chapters.find(c=>c.id===lastId)||chapters[1]||chapters[0];
    const overall=Math.round(chapters.reduce((sum,c)=>sum+modulePct(c.id),0)/chapters.length);

    q("#homeRailSlot").innerHTML=railHTML(null);
    bindRail(q("#homeRailSlot"));

    const grid=q("#homeChapterGrid");
    grid.innerHTML=chapters.map(c=>
      '<button class="homeChapterMini" data-chapter="'+c.id+'">'+
        '<span>'+(c.id===0?'§':c.id===10?'II':c.id)+'</span>'+
        '<span><b>'+chapterShort(c)+'</b><small>'+moduleInfo[c.id].blocks.length+' смысловых блоков</small></span>'+
        '<span>'+modulePct(c.id)+'%</span>'+
      '</button>'
    ).join("");
    qa(".homeChapterMini",grid).forEach(b=>b.onclick=()=>openModule(+b.dataset.chapter));

    q("#homeContinueBtn").onclick=()=>openModule(overall===0?1:last.id);
    q("#homeStartBtn").onclick=()=>openModule(1);

    qa(".homeRouteCard").forEach(b=>b.onclick=()=>{
      const id=overall===0?1:last.id;
      openModule(id);
      if(b.dataset.route==="official")setTimeout(()=>setLearnPane("official"),0);
      if(b.dataset.route==="coach")setTimeout(()=>activateCourseTab("coach"),0);
    });

    q("#homeAside").innerHTML=
      '<section class="asideCard">'+
        '<div class="asideProgressTop"><span>Общий прогресс</span><b>'+overall+'%</b></div>'+
        '<div class="bar"><span style="width:'+overall+'%"></span></div>'+
        '<p>'+(overall===0?'Начните с главы 1: основы конституционного строя.':'Последняя глава: '+chapterShort(last))+'</p>'+
        '<button class="btn primary asideAction" id="asideContinue">Продолжить →</button>'+
      '</section>'+
      '<section class="asideCard"><h3>ИИ-тренер</h3><p>Формулируйте ответ своими словами. Тренер проверяет, назвали ли вы норму, механизм и правовой вывод.</p><button class="btn ghost asideAction" id="asideCoach">Открыть тренер</button></section>'+
      '<section class="asideCard"><h3>Принцип курса</h3><div class="asideQuote">Сначала прочитать норму. Затем понять, что она запрещает, разрешает или требует. И только после этого решать кейс.</div></section>';

    q("#asideContinue").onclick=()=>openModule(overall===0?1:last.id);
    q("#asideCoach").onclick=()=>{openModule(last.id);setTimeout(()=>activateCourseTab("coach"),0)};
    renderChapterNavigator();
    syncSoundButton();
    bindRipple();
    refreshGlobalNav();
  };

  function updateCourseAside(bl,ids,meta){
    const aside=q("#courseAside");
    if(!aside)return;
    const simpleBits=ids.map(id=>articlePlainOverrides[id]?.simple).filter(Boolean);
    const articleItems=ids.map(id=>'<div class="contextArticle"><span>'+articleNo(id)+'</span>'+articleLabel(id)+'</div>').join("");
    const tip=chapterStudyTips[currentModule]||"Читайте норму вместе с соседними статьями и проверяйте компетенцию каждого органа.";
    aside.innerHTML=
      '<section class="asideCard"><h3>Сейчас изучаем</h3><div class="contextNow"><span>'+mLabel(currentModule)+'</span><b>'+capUi(bl[0])+'</b></div>'+
        '<div class="contextArticleList">'+articleItems+'</div>'+
      '</section>'+
      '<section class="asideCard"><h3>Что важно увидеть</h3><p>'+(simpleBits[0]||capUi(bl[1]))+'</p><div class="contextTip">'+tip+'</div></section>'+
      '<section class="asideCard"><h3>Быстрые действия</h3><div class="contextActions">'+
        '<button class="btn ghost" id="asideFullText">Полный текст нормы</button>'+
        '<button class="btn ghost" id="asideKsrf">Практика КС РФ</button>'+
        '<button class="btn primary" id="asideToCases">Решить кейсы →</button>'+
      '</div></section>';
    q("#asideFullText").onclick=()=>setLearnPane("quote");
    q("#asideKsrf").onclick=()=>setLearnPane("official");
    q("#asideToCases").onclick=()=>activateCourseTab("cases");
  }

  setLearnPane=function(mode){
    mobileLearnMode=mode;
    const workspace=q(".articleWorkspace");
    if(!workspace)return;
    workspace.dataset.pane=mode;
    qa(".articleReaderTab").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
    refreshGlobalNav();
  };

  renderLearn=function(){
    const inf=moduleInfo[currentModule],bl=inf.blocks[blockIndex],meta=learnMeta[currentModule]?.[blockIndex]||{},ids=bl[3]||[],panel=q("#panel");
    ids.forEach(id=>state.viewed.add(id));
    save();
    updateProgress();

    const links=[...(meta.links||[])],detail=officialPracticeDetails[currentModule+"-"+blockIndex];
    (detail?.links||[]).forEach(x=>{if(!links.some(y=>y[1]===x[1]))links.push(x)});
    const officialLinks=links.map(x=>'<a class="sourceChip" target="_blank" rel="noopener" href="'+x[1]+'">'+x[0]+' ↗</a>').join("");

    const topics=inf.blocks.map((topic,i)=>
      '<button class="articleTopic '+(i===blockIndex?'active':'')+'" data-topic="'+i+'">'+(i+1)+'. '+capUi(topic[0])+'</button>'
    ).join("");

    panel.innerHTML=
      '<div class="articleWorkspace" data-pane="'+(mobileLearnMode||"meaning")+'">'+
        '<div class="articleTopics">'+topics+'</div>'+
        '<header class="articleHead">'+
          '<div class="articleHeadMain"><div class="eyebrow">'+mLabel(currentModule)+' · тема '+(blockIndex+1)+' из '+inf.blocks.length+'</div><h3>'+capUi(bl[0])+'</h3><p>'+capUi(bl[1])+'</p></div>'+
          '<div class="articleNav"><button id="prevConceptBtn" aria-label="Предыдущая тема">←</button><button id="nextConceptBtn" aria-label="Следующая тема">→</button></div>'+
        '</header>'+
        '<section class="articleReader">'+
          '<nav class="articleReaderTabs" aria-label="Содержание темы">'+
            '<button class="articleReaderTab" data-mode="meaning">Понять</button>'+
            '<button class="articleReaderTab" data-mode="quote">Текст статьи</button>'+
            '<button class="articleReaderTab" data-mode="official">Практика КС РФ</button>'+
          '</nav>'+
          '<div class="articleReaderBody">'+
            '<article class="articlePane articlePaneMeaning"><div class="readerPaneContent">'+expandedMeaning(meta,bl,ids)+'</div></article>'+
            '<article class="articlePane articlePaneQuote"><div class="readerPaneIntro"><div><span>Без сокращений</span><h4>'+escHtml(bl[2])+' · статьи приведены полностью</h4></div><a class="sourceChip" target="_blank" rel="noopener" href="'+officialSourceForIds(ids)+'">Официальный источник ↗</a></div><div class="fullArticles">'+fullArticleCards(ids)+'</div></article>'+
            '<article class="articlePane articlePaneOfficial"><div class="readerPaneContent">'+expandedOfficial(meta,bl,ids)+'</div><div class="sourceRow">'+officialLinks+'<a class="sourceChip" target="_blank" rel="noopener" href="https://www.ksrf.ru/">Сайт КС РФ ↗</a></div></article>'+
          '</div>'+
        '</section>'+
      '</div>';

    qa(".articleTopic").forEach(b=>b.onclick=()=>{blockIndex=+b.dataset.topic;renderLearn()});
    qa(".articleReaderTab").forEach(b=>b.onclick=()=>setLearnPane(b.dataset.mode));
    const prev=q("#prevConceptBtn"),next=q("#nextConceptBtn");
    prev.disabled=blockIndex===0;
    next.disabled=blockIndex===inf.blocks.length-1;
    prev.onclick=()=>{if(blockIndex>0){blockIndex--;renderLearn()}};
    next.onclick=()=>{if(blockIndex<inf.blocks.length-1){blockIndex++;renderLearn()}};
    setLearnPane(mobileLearnMode||"meaning");
    updateCourseAside(bl,ids,meta);
    renderChapterNavigator();
    bindRipple();
  };

  const baseActivateCourseTab=activateCourseTab;
  activateCourseTab=function(tab){
    baseActivateCourseTab(tab);
    refreshGlobalNav();
  };

  const baseShowHome=showHome;
  showHome=function(){
    currentModule=null;
    setTopHeaderMode(false);
    renderHome();
    renderChapterNavigator();
    showPage("home");
    refreshGlobalNav();
  };

  buildHeader();
  buildHomeShell();
  buildCourseShell();

  const reset=q("#resetOverlay");
  if(reset)document.body.appendChild(reset);
  const toast=q("#toast");
  if(toast)document.body.appendChild(toast);

  renderHome();
  setTopHeaderMode(false);
  renderChapterNavigator();
  syncSoundButton();
  showPage("home");
  refreshGlobalNav();
})();
