
(function(){
  "use strict";
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function chapterTitle(c){
    if(c.id===0)return "Преамбула";
    if(c.id===10)return "Переходные положения";
    return c.name;
  }

  function railHTML(activeId){
    return '<aside class="c4Rail">'+
      '<div class="c4RailHead"><span>Оглавление</span><h3>Конституция РФ</h3></div>'+
      '<div class="c4RailList">'+chapters.map(c=>
        '<button class="c4RailItem '+(c.id===activeId?'active':'')+'" data-chapter="'+c.id+'">'+
          '<span class="c4RailNo">'+(c.id===0?'§':c.id===10?'II':c.id)+'</span>'+
          '<span class="c4RailText"><b>'+chapterTitle(c)+'</b><small>'+moduleInfo[c.id].desc+'</small></span>'+
          '<span class="c4RailPct">'+modulePct(c.id)+'%</span>'+
        '</button>').join('')+
      '</div>'+
      '<div class="c4RailFoot"><a href="https://publication.pravo.gov.ru/document/0001202210060013" target="_blank" rel="noopener">Официальный текст ↗</a></div>'+
    '</aside>';
  }

  function bindRail(scope=document){
    qa(".c4RailItem",scope).forEach(b=>b.onclick=()=>openModule(+b.dataset.chapter));
  }

  function buildHeader(){
    const top=q(".top");
    top.innerHTML=
      '<div class="brand"><div class="logo">§</div><div><b>Конституция Российской Федерации</b><small>Интерактивный учебный курс</small></div></div>'+
      '<div class="topCenter"><div class="crumb" id="crumb"></div><div class="topChapterNav active" id="topChapterNav">'+
        '<button class="chapterArrow" id="prevChapterBtn" aria-label="Предыдущая глава">←</button>'+
        '<button class="chapterPicker" id="chapterPicker" aria-controls="chapterMenu" aria-haspopup="true" aria-expanded="false"><span class="chapterPickerLabel" id="chapterPickerLabel"></span><span class="chapterPickerHint">Сменить главу ▾</span></button>'+
        '<button class="chapterArrow" id="nextChapterBtn" aria-label="Следующая глава">→</button>'+
        '<button class="allChaptersBtn" onclick="showHome()">Главная</button>'+
        '<div class="chapterMenu" id="chapterMenu"></div>'+
      '</div></div>'+
      '<div class="topActions">'+
        '<button class="topBtn resetProgressBtn" id="resetProgressBtn" onclick="requestProgressReset()" title="Сбросить прогресс">↻ <span>Сбросить</span></button>'+
        '<button class="topBtn active" id="soundBtn" onclick="toggleSound()">🔊 Звук</button>'+
        '<a class="topBtn sourceBtn" href="https://publication.pravo.gov.ru/document/0001202210060013" target="_blank" rel="noopener">Официальный текст ↗</a>'+
      '</div>';
  }

  function buildShells(){
    q(".homeShell").innerHTML='<div id="c4HomeRail"></div><main class="c4HomeMain" id="c4HomeMain"></main>';

    q(".courseWorkspace").innerHTML=
      '<div id="c4CourseRail"></div>'+
      '<main class="c4CourseMain">'+
        '<header class="c4CourseHead">'+
          '<div class="c4CourseTitle"><div class="eyebrow" id="courseKicker"></div><h2 id="courseTitle"></h2><p id="courseDesc"></p></div>'+
          '<div class="c4CourseProgress"><div class="progressTopline"><span class="progressLabel">Освоение</span><b id="coursePct">0%</b></div><div class="bar"><span id="courseBar"></span></div><div hidden><span id="progressTheory"></span><span id="progressCases"></span><span id="progressMeta"></span></div></div>'+
        '</header>'+
        '<nav class="c4Tabs tabs" aria-label="Режим обучения">'+
          '<button class="tab active" data-tab="learn"><span class="tabIcon">§</span><span><b>Понять</b><small>Смысл и текст</small></span></button>'+
          '<button class="tab" data-tab="scheme"><span class="tabIcon">◇</span><span><b>Схема</b><small>Связи</small></span></button>'+
          '<button class="tab" data-tab="cases"><span class="tabIcon">▤</span><span><b>Кейсы</b><small>Применение</small></span></button>'+
          '<button class="tab" data-tab="coach"><span class="tabIcon">AI</span><span><b>ИИ-тренер</b><small>Свободный ответ</small></span></button>'+
        '</nav>'+
        '<div class="panel" id="panel"></div>'+
      '</main>'+
      '<nav class="mobileCourseNav" aria-label="Навигация по режимам">'+
        '<button class="mobileCourseBtn active" data-tab="learn"><span>§</span><b>Понять</b></button>'+
        '<button class="mobileCourseBtn" data-tab="scheme"><span>◇</span><b>Схема</b></button>'+
        '<button class="mobileCourseBtn" data-tab="cases"><span>▤</span><b>Кейсы</b></button>'+
        '<button class="mobileCourseBtn" data-tab="coach"><span>AI</span><b>Тренер</b></button>'+
      '</nav>';

    qa(".tab,.mobileCourseBtn",q(".courseWorkspace")).forEach(b=>b.onclick=()=>activateCourseTab(b.dataset.tab));
  }

  const baseRenderChapterNavigator=renderChapterNavigator;
  renderChapterNavigator=function(){
    baseRenderChapterNavigator();
    const active=currentModule===null?null:currentModule;
    const hr=q("#c4HomeRail");
    if(hr){hr.innerHTML=railHTML(active);bindRail(hr)}
    const cr=q("#c4CourseRail");
    if(cr){cr.innerHTML=railHTML(active);bindRail(cr)}
  };

  renderHome=function(){
    currentModule=null;
    const main=q("#c4HomeMain");
    const overall=Math.round(chapters.reduce((s,c)=>s+modulePct(c.id),0)/chapters.length);
    const lastId=Number.isFinite(state.lastModule)?state.lastModule:1;
    const last=chapters.find(c=>c.id===lastId)||chapters[1]||chapters[0];

    main.innerHTML=
      '<section class="c4Intro">'+
        '<div class="c4IntroCopy">'+
          '<div class="eyebrow">Государственное и муниципальное управление</div>'+
          '<h1>Конституция как система, а не список статей</h1>'+
          '<p>Весь материал курса сохранён: полный текст Конституции, подробные объяснения, практика Конституционного Суда РФ, интерактивные схемы, жизненные кейсы и ИИ‑тренер.</p>'+
          '<div class="c4IntroActions"><button class="c4Btn primary" id="c4Continue">Продолжить →</button><button class="c4Btn" id="c4Start">Начать с главы 1</button><button class="c4Btn" id="c4Coach">ИИ‑тренер</button></div>'+
        '</div>'+
        '<div class="c4Progress"><div class="c4ProgressTop"><span>Общий прогресс</span><b>'+overall+'%</b></div><div class="bar"><span style="width:'+overall+'%"></span></div><small>'+(overall===0?'Пока ничего не потеряно: начните с первой главы.':'Последняя открытая глава: '+chapterTitle(last))+'.</small></div>'+
      '</section>'+
      '<section class="c4Section">'+
        '<div class="c4SectionHead"><div><h2>Главы Конституции</h2><p>Откройте любую главу — порядок прохождения не ограничен.</p></div></div>'+
        '<div class="c4ChapterGrid">'+chapters.map(c=>
          '<button class="c4ChapterCard" data-chapter="'+c.id+'">'+
            '<div class="c4ChapterCardTop"><span class="c4ChapterNo">'+(c.id===0?'§':c.id===10?'II':c.id)+'</span><span class="c4ChapterPct">'+modulePct(c.id)+'%</span></div>'+
            '<h3>'+chapterTitle(c)+'</h3><p>'+moduleInfo[c.id].desc+'</p>'+
            '<div class="bar"><span style="width:'+modulePct(c.id)+'%"></span></div>'+
          '</button>').join('')+
        '</div>'+
      '</section>';

    q("#c4Continue").onclick=()=>openModule(overall===0?1:last.id);
    q("#c4Start").onclick=()=>openModule(1);
    q("#c4Coach").onclick=()=>{openModule(last.id);setTimeout(()=>activateCourseTab("coach"),0)};
    qa(".c4ChapterCard",main).forEach(b=>b.onclick=()=>openModule(+b.dataset.chapter));

    renderChapterNavigator();
    syncSoundButton();
    bindRipple();
  };

  setLearnPane=function(mode){
    mobileLearnMode=mode;
    const study=q(".c4Study");
    if(!study)return;
    study.dataset.pane=mode;
    qa(".c4ReaderTab").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  };

  renderLearn=function(){
    const inf=moduleInfo[currentModule];
    const bl=inf.blocks[blockIndex];
    const meta=learnMeta[currentModule]?.[blockIndex]||{};
    const ids=bl[3]||[];
    const panel=q("#panel");

    ids.forEach(id=>state.viewed.add(id));
    save();
    updateProgress();

    const links=[...(meta.links||[])];
    const detail=officialPracticeDetails[currentModule+"-"+blockIndex];
    (detail?.links||[]).forEach(x=>{if(!links.some(y=>y[1]===x[1]))links.push(x)});
    const officialLinks=links.map(x=>'<a class="sourceChip" target="_blank" rel="noopener" href="'+x[1]+'">'+x[0]+' ↗</a>').join("");

    panel.innerHTML=
      '<div class="c4Study" data-pane="'+(mobileLearnMode||"meaning")+'">'+
        '<aside class="c4Topics"><div class="c4TopicsHead"><span>Темы главы</span><b>'+inf.blocks.length+'</b></div><div class="c4TopicsList">'+
          inf.blocks.map((t,i)=>
            '<button class="c4Topic '+(i===blockIndex?'active':'')+'" data-topic="'+i+'"><span class="c4TopicNo">'+(i+1)+'</span><span class="c4TopicText"><b>'+capUi(t[0])+'</b><small>'+capUi(t[1])+'</small></span></button>'
          ).join('')+
        '</div></aside>'+
        '<section class="c4Reader">'+
          '<header class="c4ReaderHead"><div><div class="eyebrow">'+mLabel(currentModule)+' · тема '+(blockIndex+1)+' из '+inf.blocks.length+'</div><h3>'+capUi(bl[0])+'</h3><p>'+capUi(bl[1])+'</p></div><div class="c4ReaderNav"><button id="c4Prev" aria-label="Предыдущая тема">←</button><button id="c4Next" aria-label="Следующая тема">→</button></div></header>'+
          '<nav class="c4ReaderTabs" aria-label="Содержание темы"><button class="c4ReaderTab" data-mode="meaning">Объяснение</button><button class="c4ReaderTab" data-mode="quote">Полный текст</button><button class="c4ReaderTab" data-mode="official">Практика КС РФ</button></nav>'+
          '<div class="c4ReaderBody">'+
            '<article class="c4Pane c4Meaning"><div class="readerPaneContent">'+expandedMeaning(meta,bl,ids)+'</div></article>'+
            '<article class="c4Pane c4Quote"><div class="readerPaneIntro"><div><span>Без сокращений</span><h4>'+escHtml(bl[2])+' · статьи приведены полностью</h4></div><a class="sourceChip" target="_blank" rel="noopener" href="'+officialSourceForIds(ids)+'">Официальный источник ↗</a></div><div class="fullArticles">'+fullArticleCards(ids)+'</div></article>'+
            '<article class="c4Pane c4Official"><div class="readerPaneContent">'+expandedOfficial(meta,bl,ids)+'</div><div class="sourceRow">'+officialLinks+'<a class="sourceChip" target="_blank" rel="noopener" href="https://www.ksrf.ru/">Сайт КС РФ ↗</a></div></article>'+
          '</div>'+
        '</section>'+
      '</div>';

    qa(".c4Topic").forEach(b=>b.onclick=()=>{blockIndex=+b.dataset.topic;renderLearn()});
    qa(".c4ReaderTab").forEach(b=>b.onclick=()=>setLearnPane(b.dataset.mode));
    const prev=q("#c4Prev"),next=q("#c4Next");
    prev.disabled=blockIndex===0;
    next.disabled=blockIndex===inf.blocks.length-1;
    prev.onclick=()=>{if(blockIndex>0){blockIndex--;renderLearn()}};
    next.onclick=()=>{if(blockIndex<inf.blocks.length-1){blockIndex++;renderLearn()}};
    setLearnPane(mobileLearnMode||"meaning");
    renderChapterNavigator();
    bindRipple();
  };

  function bindMenuA11y(){
    document.addEventListener("click",e=>{
      const menu=q("#chapterMenu"),picker=q("#chapterPicker");
      if(menu&&picker&&!menu.contains(e.target)&&!picker.contains(e.target)){
        menu.classList.remove("open");
        picker.setAttribute("aria-expanded","false");
      }
    });
    document.addEventListener("keydown",e=>{
      if(e.key==="Escape"){
        const menu=q("#chapterMenu"),picker=q("#chapterPicker");
        if(menu?.classList.contains("open")){
          menu.classList.remove("open");
          picker?.setAttribute("aria-expanded","false");
          picker?.focus();
        }
      }
    });
    const observer=new MutationObserver(()=>{
      const picker=q("#chapterPicker"),menu=q("#chapterMenu");
      if(picker&&menu)picker.setAttribute("aria-expanded",String(menu.classList.contains("open")));
      const sound=q("#soundBtn");
      if(sound)sound.setAttribute("aria-pressed",String(sound.classList.contains("active")));
    });
    observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:["class"]});
  }

  buildHeader();
  buildShells();
  bindMenuA11y();
  renderHome();
  setTopHeaderMode(false);
  renderChapterNavigator();
  syncSoundButton();
  showPage("home");
})();
