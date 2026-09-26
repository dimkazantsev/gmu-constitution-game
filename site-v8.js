
(function(){
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  let mode="meaning";

  function title(c){
    if(c.id===0)return "Преамбула";
    if(c.id===10)return "Переходные положения";
    return c.name;
  }
  function roman(id){
    const r=["","I","II","III","IV","V","VI","VII","VIII","IX"];
    if(id===0)return "§";
    if(id===10)return "II";
    return r[id]||String(id);
  }
  function chapterIndex(){
    return chapters.findIndex(c=>c.id===currentModule);
  }

  function buildTop(){
    $(".top").innerHTML=
      '<a class="brand" href="#" id="homeBrand"><span class="brandMark">§</span><span class="brandText"><b>Конституция Российской Федерации</b><small>Интерактивный учебный курс</small></span></a>'+
      '<button class="chapterControl" id="chapterControl"><span>Глава</span><span class="chapterControlLabel" id="chapterControlLabel">Выберите главу</span><span>⌄</span></button>'+
      '<div class="topActions"><button class="topBtn homeBtn" id="homeBtn">Главная</button><button class="topBtn resetBtn" id="resetBtn">Сбросить</button><button class="topBtn icon" id="soundBtn"></button><a class="topBtn officialBtn" href="https://publication.pravo.gov.ru/document/0001202210060013" target="_blank" rel="noopener">Официальный текст ↗</a></div>';
    $("#homeBrand").onclick=e=>{e.preventDefault();showHome()};
    $("#homeBtn").onclick=()=>showHome();
    $("#chapterControl").onclick=()=>openSheet();
    $("#resetBtn").onclick=()=>requestProgressReset();
    $("#soundBtn").onclick=()=>toggleSound();
  }

  function buildShells(){
    $(".homeShell").innerHTML='<main class="wrap" id="homeMain"></main>';
    $(".courseWorkspace").innerHTML=
      '<main class="courseWrap">'+
        '<div class="courseTop"><button class="chapterArrow" id="prevChapter" aria-label="Предыдущая глава">←</button><div class="courseTitle"><div class="eyebrow" id="courseKicker"></div><h2 id="courseTitle"></h2><p id="courseDesc"></p></div><button class="chapterArrow" id="nextChapter" aria-label="Следующая глава">→</button></div>'+
        '<div class="chapterProgress"><div class="bar"><span id="courseBar"></span></div><span id="coursePct">0%</span></div>'+
        '<section class="lessonCard"><header class="lessonHeader"><div class="lessonSelector"><button id="prevTopic" aria-label="Предыдущая тема">←</button><select id="topicSelect" aria-label="Тема главы"></select><button id="nextTopic" aria-label="Следующая тема">→</button></div><div class="lessonHeadline" id="lessonHeadline"></div></header><div class="panel" id="panel"></div></section>'+
      '</main>'+
      '<nav class="modeDock" aria-label="Режим изучения">'+
        '<button class="modeBtn active" data-mode="meaning"><i>◎</i><b>Понять</b></button>'+
        '<button class="modeBtn" data-mode="quote"><i>§</i><b>Текст</b></button>'+
        '<button class="modeBtn" data-mode="official"><i>⚖</i><b>КС РФ</b></button>'+
        '<button class="modeBtn" data-mode="scheme"><i>◇</i><b>Схема</b></button>'+
        '<button class="modeBtn" data-mode="cases"><i>▤</i><b>Кейсы</b></button>'+
        '<button class="modeBtn" data-mode="coach"><i>AI</i><b>Тренер</b></button>'+
      '</nav>';
    $$(".modeBtn").forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));
  }

  function buildSheet(){
    const sheet=document.createElement("div");
    sheet.className="chapterSheet";
    sheet.id="chapterSheet";
    sheet.innerHTML='<div class="chapterSheetCard" role="dialog" aria-modal="true" aria-labelledby="sheetTitle"><div class="sheetHead"><h3 id="sheetTitle">Главы Конституции</h3><button class="sheetClose" id="sheetClose" aria-label="Закрыть">×</button></div><div class="sheetGrid" id="sheetGrid"></div></div>';
    document.body.appendChild(sheet);
    $("#sheetClose").onclick=closeSheet;
    sheet.onclick=e=>{if(e.target===sheet)closeSheet()};
    document.addEventListener("keydown",e=>{if(e.key==="Escape")closeSheet()});
  }

  function refreshSheet(){
    const grid=$("#sheetGrid");if(!grid)return;
    grid.innerHTML=chapters.map(c=>
      '<button class="sheetChapter '+(c.id===currentModule?'active':'')+'" data-chapter="'+c.id+'"><span class="sheetRoman">'+roman(c.id)+'</span><span><b>'+title(c)+'</b><small>'+moduleInfo[c.id].desc+'</small></span><span class="sheetPct">'+modulePct(c.id)+'%</span></button>'
    ).join("");
    $$(".sheetChapter",grid).forEach(b=>b.onclick=()=>{closeSheet();openModule(+b.dataset.chapter)});
  }
  function openSheet(){refreshSheet();$("#chapterSheet").classList.add("open");document.body.style.overflow="hidden"}
  function closeSheet(){const s=$("#chapterSheet");if(s)s.classList.remove("open");document.body.style.overflow=""}

  renderChapterNavigator=function(){refreshSheet()};

  syncSoundButton=function(){
    const b=$("#soundBtn");if(!b)return;
    b.textContent=state.sound?"🔊":"🔇";
    b.title=state.sound?"Выключить звук":"Включить звук";
    b.setAttribute("aria-label",b.title);
  };

  updateProgress=function(){
    if(currentModule===null)return;
    const p=modulePct(currentModule);
    $("#coursePct").textContent=p+"%";
    $("#courseBar").style.width=p+"%";
    refreshSheet();
  };

  function syncChapterHeader(){
    const ch=chapters.find(c=>c.id===currentModule);if(!ch)return;
    $("#courseKicker").textContent=currentModule===0?"Вводная часть":mLabel(currentModule);
    $("#courseTitle").textContent=title(ch);
    $("#courseDesc").textContent=moduleInfo[currentModule].desc;
    $("#chapterControlLabel").textContent=(currentModule===0?"Преамбула":mLabel(currentModule)+" · "+title(ch));
    const idx=chapterIndex();
    $("#prevChapter").disabled=idx<=0;
    $("#nextChapter").disabled=idx>=chapters.length-1;
    $("#prevChapter").onclick=()=>{if(idx>0)openModule(chapters[idx-1].id)};
    $("#nextChapter").onclick=()=>{if(idx<chapters.length-1)openModule(chapters[idx+1].id)};
    updateProgress();
  }

  function syncTopics(){
    const inf=moduleInfo[currentModule];
    $("#topicSelect").innerHTML=inf.blocks.map((b,i)=>'<option value="'+i+'" '+(i===blockIndex?'selected':'')+'>'+(i+1)+'. '+capUi(b[0])+'</option>').join("");
    $("#prevTopic").disabled=blockIndex===0;
    $("#nextTopic").disabled=blockIndex===inf.blocks.length-1;
    $("#prevTopic").onclick=()=>{if(blockIndex>0){blockIndex--;renderCurrent();scrollLessonTop()}};
    $("#nextTopic").onclick=()=>{if(blockIndex<inf.blocks.length-1){blockIndex++;renderCurrent();scrollLessonTop()}};
    $("#topicSelect").onchange=()=>{blockIndex=+$("#topicSelect").value;renderCurrent();scrollLessonTop()};
  }

  function syncLessonHeadline(){
    const bl=moduleInfo[currentModule].blocks[blockIndex];
    $("#lessonHeadline").innerHTML='<div class="eyebrow">Тема '+(blockIndex+1)+' из '+moduleInfo[currentModule].blocks.length+'</div><h3>'+capUi(bl[0])+'</h3><p>'+capUi(bl[1])+'</p>';
  }

  function markMode(){
    $$(".modeBtn").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
  }

  function scrollLessonTop(){
    document.querySelector(".lessonCard")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  function switchMode(next){
    mode=next;
    markMode();
    if(next==="meaning"||next==="quote"||next==="official"){
      currentTab="learn";
      renderLearn();
    }else if(next==="scheme"){
      currentTab="scheme";
      renderScheme();
    }else if(next==="cases"){
      currentTab="cases";
      renderCases();
    }else{
      currentTab="coach";
      renderCoach();
    }
    syncTopics();
    syncLessonHeadline();
  }

  activateCourseTab=function(tab){
    if(tab==="practice")tab="cases";
    switchMode(tab);
  };

  function renderCurrent(){
    if(mode==="meaning"||mode==="quote"||mode==="official")renderLearn();
    else if(mode==="scheme")renderScheme();
    else if(mode==="cases")renderCases();
    else renderCoach();
    syncTopics();
    syncLessonHeadline();
  }

  renderLearn=function(){
    const inf=moduleInfo[currentModule],bl=inf.blocks[blockIndex],meta=learnMeta[currentModule]?.[blockIndex]||{},ids=bl[3]||[];
    ids.forEach(id=>state.viewed.add(id));save();updateProgress();

    const links=[...(meta.links||[])],detail=officialPracticeDetails[currentModule+"-"+blockIndex];
    (detail?.links||[]).forEach(x=>{if(!links.some(y=>y[1]===x[1]))links.push(x)});
    const officialLinks=links.map(x=>'<a class="sourceChip" target="_blank" rel="noopener" href="'+x[1]+'">'+x[0]+' ↗</a>').join("");

    let html="";
    if(mode==="quote"){
      html='<section class="learnPane"><div class="readerPaneIntro"><div><span>Полный текст</span><h4>'+escHtml(bl[2])+' · без сокращений</h4></div><a class="sourceChip" target="_blank" rel="noopener" href="'+officialSourceForIds(ids)+'">Сверить источник ↗</a></div><div class="fullArticles">'+fullArticleCards(ids)+'</div></section>';
    }else if(mode==="official"){
      html='<section class="learnPane"><div class="learnContent">'+expandedOfficial(meta,bl,ids)+'</div><div class="sourceRow">'+officialLinks+'<a class="sourceChip" target="_blank" rel="noopener" href="https://www.ksrf.ru/">Сайт КС РФ ↗</a></div></section>';
    }else{
      html='<section class="learnPane"><div class="learnContent">'+expandedMeaning(meta,bl,ids)+'</div></section>';
    }
    $("#panel").innerHTML=html;
    markMode();
    bindRipple();
  };

  renderHome=function(){
    currentModule=null;
    $("#chapterControlLabel").textContent="Выбрать главу";
    const overall=Math.round(chapters.reduce((sum,c)=>sum+modulePct(c.id),0)/chapters.length);
    const lastId=Number.isFinite(state.lastModule)&&state.lastModule?state.lastModule:1;
    const last=chapters.find(c=>c.id===lastId)||chapters[1];

    $("#homeMain").innerHTML=
      '<section class="cover"><div class="coverCopy"><div class="eyebrow">Цифровой учебник</div><h1>Конституция без интерфейсного шума</h1><p>Одна страница для чтения. Один нижний док для переключения режимов. Главы открываются по необходимости. Полный текст, объяснения, практика КС РФ, схемы, кейсы и тренер сохранены.</p><div class="coverActions"><button class="btn primary" id="homeContinue">Продолжить →</button><button class="btn ghost" id="openCatalog">Выбрать главу</button></div></div><div class="coverProgress"><span>Общий прогресс</span><strong>'+overall+'%</strong><div class="bar"><span style="width:'+overall+'%"></span></div><small>'+(overall===0?'Начните с главы I':'Последняя глава: '+title(last))+'</small></div></section>'+
      '<section class="catalog"><div class="catalogHead"><div><h2>Главы Конституции</h2><p>Откройте любую — порядок не ограничен</p></div></div><div class="chapterCards">'+chapters.map(c=>'<button class="chapterCard" data-chapter="'+c.id+'"><div class="chapterCardTop"><span class="chapterRoman">'+roman(c.id)+'</span><span class="chapterPct">'+modulePct(c.id)+'%</span></div><h3>'+title(c)+'</h3><p>'+moduleInfo[c.id].desc+'</p><div class="bar"><span style="width:'+modulePct(c.id)+'%"></span></div></button>').join("")+'</div></section>';

    $("#homeContinue").onclick=()=>openModule(overall===0?1:last.id);
    $("#openCatalog").onclick=openSheet;
    $$(".chapterCard").forEach(b=>b.onclick=()=>openModule(+b.dataset.chapter));
    $(".modeDock")?.remove();
    showPage("home");
    syncSoundButton();
    window.scrollTo({top:0,behavior:"auto"});
  };

  openModule=function(id){
    const ch=chapters.find(c=>c.id===id);if(!ch)return;
    currentModule=id;
    state.lastModule=id;
    save();
    blockIndex=0;
    mode="meaning";
    currentTab="learn";
    currentTask=null;
    caseIndex=0;
    checkState=null;
    mobileCaseStep="situation";
    mobileCoachStep="situation";
    coachState={scenario:null,number:0,answered:false,score:0};

    showPage("course");
    if(!$(".modeDock")){
      $(".courseWorkspace").insertAdjacentHTML("beforeend",
        '<nav class="modeDock" aria-label="Режим изучения"><button class="modeBtn active" data-mode="meaning"><i>◎</i><b>Понять</b></button><button class="modeBtn" data-mode="quote"><i>§</i><b>Текст</b></button><button class="modeBtn" data-mode="official"><i>⚖</i><b>КС РФ</b></button><button class="modeBtn" data-mode="scheme"><i>◇</i><b>Схема</b></button><button class="modeBtn" data-mode="cases"><i>▤</i><b>Кейсы</b></button><button class="modeBtn" data-mode="coach"><i>AI</i><b>Тренер</b></button></nav>'
      );
      $$(".modeBtn").forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));
    }
    syncChapterHeader();
    syncTopics();
    syncLessonHeadline();
    renderCurrent();
    syncSoundButton();
    refreshSheet();
    window.scrollTo({top:0,behavior:"auto"});
  };

  setTopHeaderMode=function(){};
  renderChapterNavigator=function(){refreshSheet()};

  buildTop();
  buildShells();
  buildSheet();
  renderHome();
})();
