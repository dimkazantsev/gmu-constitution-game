
(function(){
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  let currentView="meaning";

  function chapterTitle(c){
    if(c.id===0)return "Преамбула";
    if(c.id===10)return "Переходные положения";
    return c.name;
  }

  function railHTML(activeId){
    return '<aside class="sidebar">'+
      '<div class="sidebarHead"><h3>Конституция РФ</h3><p>Выберите главу</p></div>'+
      '<div class="sidebarList">'+chapters.map(c=>
        '<button class="chapterBtn '+(c.id===activeId?'active':'')+'" data-chapter="'+c.id+'">'+
          '<span class="chapterNo">'+(c.id===0?'§':c.id===10?'II':c.id)+'</span>'+
          '<span class="chapterText"><b>'+chapterTitle(c)+'</b><small>'+moduleInfo[c.id].desc+'</small></span>'+
          '<span class="chapterPct">'+modulePct(c.id)+'%</span>'+
        '</button>').join("")+'</div>'+
      '<div class="sidebarFoot"><a href="https://publication.pravo.gov.ru/document/0001202210060013" target="_blank" rel="noopener">Официальный текст ↗</a></div>'+
    '</aside>';
  }

  function bindRail(scope){
    $$(".chapterBtn",scope).forEach(b=>b.onclick=()=>{
      openModule(+b.dataset.chapter);
      $(".page.active")?.classList.remove("drawerOpen");
    });
  }

  function buildTop(){
    $(".top").innerHTML=
      '<a class="brand" href="#" id="brandHome"><span class="brandMark">§</span><span class="brandText"><b>Конституция Российской Федерации</b><small>Интерактивный учебный курс</small></span></a>'+
      '<div class="topActions">'+
        '<button class="topBtn menuBtn" id="menuBtn" aria-label="Открыть оглавление">☰</button>'+
        '<button class="topBtn resetBtn" id="resetBtn">Сбросить</button>'+
        '<button class="topBtn" id="soundBtn"></button>'+
        '<a class="topBtn officialBtn" href="https://publication.pravo.gov.ru/document/0001202210060013" target="_blank" rel="noopener">Официальный текст ↗</a>'+
      '</div>';
    $("#brandHome").onclick=e=>{e.preventDefault();showHome()};
    $("#menuBtn").onclick=()=>$(".page.active")?.classList.toggle("drawerOpen");
    $("#resetBtn").onclick=()=>requestProgressReset();
    $("#soundBtn").onclick=()=>toggleSound();
  }

  function buildShells(){
    $(".homeShell").innerHTML='<div class="shell"><div id="homeRail"></div><main class="mainCard homeMain" id="homeMain"></main></div>';
    $(".courseWorkspace").innerHTML='<div class="shell"><div id="courseRail"></div><main class="mainCard courseCard"><header class="courseHead"><div class="courseHeadTop"><div><div class="eyebrow" id="courseKicker"></div><h2 id="courseTitle"></h2><p id="courseDesc"></p></div><div class="courseProgress"><div class="courseProgressTop"><span>Прогресс</span><b id="coursePct">0%</b></div><div class="bar"><span id="courseBar"></span></div></div></div></header><nav class="viewTabs" aria-label="Разделы главы"><button class="viewTab active" data-view="meaning">Понять</button><button class="viewTab" data-view="quote">Текст</button><button class="viewTab" data-view="official">КС РФ</button><button class="viewTab" data-view="scheme">Схема</button><button class="viewTab" data-view="cases">Кейсы</button><button class="viewTab" data-view="coach">Тренер</button></nav><div class="panel" id="panel"></div></main></div>';
    $$(".viewTab").forEach(b=>b.onclick=()=>switchView(b.dataset.view));
  }

  renderChapterNavigator=function(){
    const active=currentModule===null?null:currentModule;
    const h=$("#homeRail");if(h){h.innerHTML=railHTML(active);bindRail(h)}
    const c=$("#courseRail");if(c){c.innerHTML=railHTML(active);bindRail(c)}
  };

  syncSoundButton=function(){
    const b=$("#soundBtn");if(!b)return;
    b.textContent=state.sound?"🔊":"🔇";
    b.title=state.sound?"Выключить звук":"Включить звук";
    b.setAttribute("aria-label",b.title);
  };

  updateProgress=function(){
    if(currentModule===null)return;
    const p=modulePct(currentModule);
    const pct=$("#coursePct"),bar=$("#courseBar");
    if(pct)pct.textContent=p+"%";
    if(bar)bar.style.width=p+"%";
    renderChapterNavigator();
  };

  function setCourseHead(){
    const ch=chapters.find(c=>c.id===currentModule);
    if(!ch)return;
    $("#courseKicker").textContent=currentModule===0?"Вводная часть":mLabel(currentModule);
    $("#courseTitle").textContent=chapterTitle(ch);
    $("#courseDesc").textContent=moduleInfo[currentModule].desc;
    updateProgress();
  }

  function markView(view){
    $$(".viewTab").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  }

  function switchView(view){
    currentView=view;
    markView(view);
    if(view==="meaning"||view==="quote"||view==="official"){
      currentTab="learn";
      renderLearn();
      return;
    }
    if(view==="scheme"){
      currentTab="scheme";
      renderScheme();
      return;
    }
    if(view==="cases"){
      currentTab="cases";
      renderCases();
      return;
    }
    currentTab="coach";
    renderCoach();
  }

  activateCourseTab=function(tab){
    if(tab==="practice")tab="cases";
    switchView(tab);
  };

  function renderTopicBar(inf){
    return '<div class="topicBar">'+
      '<button class="topicArrow" id="topicPrev" aria-label="Предыдущая тема">←</button>'+
      '<select class="topicSelect" id="topicSelect" aria-label="Тема главы">'+
        inf.blocks.map((b,i)=>'<option value="'+i+'" '+(i===blockIndex?'selected':'')+'>'+(i+1)+'. '+capUi(b[0])+'</option>').join("")+
      '</select>'+
      '<button class="topicArrow" id="topicNext" aria-label="Следующая тема">→</button>'+
    '</div>';
  }

  function bindTopicControls(inf){
    const prev=$("#topicPrev"),next=$("#topicNext"),sel=$("#topicSelect");
    prev.disabled=blockIndex===0;
    next.disabled=blockIndex===inf.blocks.length-1;
    prev.onclick=()=>{if(blockIndex>0){blockIndex--;renderLearn();window.scrollTo({top:0,behavior:"smooth"})}};
    next.onclick=()=>{if(blockIndex<inf.blocks.length-1){blockIndex++;renderLearn();window.scrollTo({top:0,behavior:"smooth"})}};
    sel.onchange=()=>{blockIndex=+sel.value;renderLearn();window.scrollTo({top:0,behavior:"smooth"})};
  }

  renderLearn=function(){
    const inf=moduleInfo[currentModule],bl=inf.blocks[blockIndex],meta=learnMeta[currentModule]?.[blockIndex]||{},ids=bl[3]||[];
    ids.forEach(id=>state.viewed.add(id));
    save();
    updateProgress();

    const links=[...(meta.links||[])],detail=officialPracticeDetails[currentModule+"-"+blockIndex];
    (detail?.links||[]).forEach(x=>{if(!links.some(y=>y[1]===x[1]))links.push(x)});
    const officialLinks=links.map(x=>'<a class="sourceChip" target="_blank" rel="noopener" href="'+x[1]+'">'+x[0]+' ↗</a>').join("");

    let body="";
    if(currentView==="quote"){
      body='<div class="readerPaneIntro"><div><span>Полный текст</span><h4>'+escHtml(bl[2])+' · без сокращений</h4></div><a class="sourceChip" target="_blank" rel="noopener" href="'+officialSourceForIds(ids)+'">Сверить источник ↗</a></div><div class="fullArticles">'+fullArticleCards(ids)+'</div>';
    }else if(currentView==="official"){
      body='<div class="learnContent">'+expandedOfficial(meta,bl,ids)+'</div><div class="sourceRow">'+officialLinks+'<a class="sourceChip" target="_blank" rel="noopener" href="https://www.ksrf.ru/">Сайт КС РФ ↗</a></div>';
    }else{
      body='<div class="learnIntro"><div class="eyebrow">Тема '+(blockIndex+1)+' из '+inf.blocks.length+'</div><h3>'+capUi(bl[0])+'</h3><p>'+capUi(bl[1])+'</p></div><div class="learnContent">'+expandedMeaning(meta,bl,ids)+'</div>';
    }

    $("#panel").innerHTML='<section class="learnView">'+renderTopicBar(inf)+body+'</section>';
    bindTopicControls(inf);
    markView(currentView);
    bindRipple();
  };

  renderHome=function(){
    currentModule=null;
    const overall=Math.round(chapters.reduce((sum,c)=>sum+modulePct(c.id),0)/chapters.length);
    const lastId=Number.isFinite(state.lastModule)&&state.lastModule?state.lastModule:1;
    const last=chapters.find(c=>c.id===lastId)||chapters[1];

    $("#homeMain").innerHTML=
      '<section class="homeHero"><div><div class="eyebrow">Интерактивный учебный курс</div><h1>Конституция без зубрёжки</h1><p>Полный текст Конституции, понятные объяснения, практика Конституционного Суда, схемы, кейсы и тренировка свободного ответа. Всё содержимое курса осталось на месте — изменена только оболочка.</p><div class="homeActions"><button class="btn primary" id="continueBtn">Продолжить →</button><button class="btn ghost" id="startBtn">Начать с главы 1</button></div></div><div class="progressBox"><span>Общий прогресс</span><strong>'+overall+'%</strong><div class="bar"><span style="width:'+overall+'%"></span></div><small>'+(overall===0?'Начните с главы 1':'Последняя глава: '+chapterTitle(last))+'</small></div></section>'+
      '<div class="homeNote"><b>Как устроен курс.</b> Выберите главу слева. Внутри неё доступны только шесть разделов: объяснение, полный текст, практика КС РФ, схема, кейсы и тренер. Никаких дополнительных панелей и дублирующих кнопок.</div>';

    $("#continueBtn").onclick=()=>openModule(overall===0?1:last.id);
    $("#startBtn").onclick=()=>openModule(1);
    renderChapterNavigator();
    syncSoundButton();
    showPage("home");
    window.scrollTo({top:0,behavior:"auto"});
  };

  openModule=function(id){
    const ch=chapters.find(c=>c.id===id);if(!ch)return;
    currentModule=id;
    state.lastModule=id;
    save();
    blockIndex=0;
    currentTab="learn";
    currentView="meaning";
    currentTask=null;
    caseIndex=0;
    checkState=null;
    mobileCaseStep="situation";
    mobileCoachStep="situation";
    coachState={scenario:null,number:0,answered:false,score:0};
    showPage("course");
    $(".page.active")?.classList.remove("drawerOpen");
    setCourseHead();
    renderChapterNavigator();
    switchView("meaning");
    syncSoundButton();
    window.scrollTo({top:0,behavior:"auto"});
  };

  document.addEventListener("click",e=>{
    if(!e.target.closest(".sidebar")&&!e.target.closest("#menuBtn")){
      $(".page.active")?.classList.remove("drawerOpen");
    }
  });

  buildTop();
  buildShells();
  renderHome();
})();
