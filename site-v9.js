
(function(){
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  let view="meaning";

  function chapterTitle(c){
    if(c.id===0)return "Преамбула";
    if(c.id===10)return "Переходные положения";
    return c.name;
  }
  function chapterIds(id){
    const out=[];
    (moduleInfo[id]?.blocks||[]).forEach(b=>(b[3]||[]).forEach(x=>{if(!out.includes(x))out.push(x)}));
    return out;
  }
  function chapterForArticle(num){
    const n=parseFloat(num);
    if(!Number.isFinite(n))return 0;
    if(n<=16)return 1;if(n<=64)return 2;if(n<80)return 3;if(n<=93)return 4;if(n<=109)return 5;if(n<=117)return 6;if(n<=129)return 7;if(n<=133)return 8;return 9;
  }
  function blockForArticle(ch,id){
    const i=(moduleInfo[ch]?.blocks||[]).findIndex(b=>(b[3]||[]).includes(id));
    return i<0?0:i;
  }

  function buildTop(){
    $(".top").innerHTML=
      '<a class="brand" href="#" id="brandHome"><span class="brandMark">§</span><span class="brandText"><b>Конституция РФ</b><small>интерактивный курс</small></span></a>'+
      '<label class="searchBox"><span class="searchIcon">⌕</span><input id="globalSearch" type="search" autocomplete="off" placeholder="Статья, тема, глава…"><span class="searchHint">Ctrl K</span><div class="searchResults" id="searchResults"></div></label>'+
      '<div class="topActions"><button class="topBtn drawerBtn" id="drawerBtn">Главы</button><button class="topBtn icon" id="soundBtn"></button><button class="topBtn" id="resetBtn">Сбросить</button><a class="topBtn official" href="https://publication.pravo.gov.ru/document/0001202210060013" target="_blank" rel="noopener">Официальный текст ↗</a></div>';
    $("#brandHome").onclick=e=>{e.preventDefault();renderHome()};
    $("#drawerBtn").onclick=openDrawer;
    $("#resetBtn").onclick=()=>requestProgressReset();
    $("#soundBtn").onclick=()=>toggleSound();
    bindSearch();
  }

  function buildShells(){
    $(".homeShell").innerHTML='<main class="container" id="homeMain"></main>';
    $(".courseWorkspace").innerHTML=
      '<main class="chapterPage">'+
        '<section class="chapterHeader"><div class="chapterHeaderRow"><button class="chapterNavBtn" id="prevChapter">←</button><div class="chapterHeading"><div class="eyebrow" id="courseKicker"></div><h2 id="courseTitle"></h2><p id="courseDesc"></p></div><button class="chapterNavBtn" id="nextChapter">→</button></div><div class="chapterProgress"><div class="bar"><span id="courseBar"></span></div><span id="coursePct">0%</span></div></section>'+
        '<div class="courseTabsWrap"><nav class="courseTabs">'+
          '<button class="courseTab active" data-view="meaning">Понять</button>'+
          '<button class="courseTab" data-view="quote">Текст</button>'+
          '<button class="courseTab" data-view="official">КС РФ</button>'+
          '<button class="courseTab" data-view="scheme">Схема</button>'+
          '<button class="courseTab" data-view="cases">Кейсы</button>'+
          '<button class="courseTab" data-view="practice">Задания</button>'+
          '<button class="courseTab" data-view="coach">Тренер</button>'+
        '</nav></div>'+
        '<section class="lesson"><div class="lessonTop"><div class="topicRow"><button class="topicBtn" id="prevTopic">←</button><select class="topicSelect" id="topicSelect"></select><button class="topicBtn" id="nextTopic">→</button></div><div class="lessonHeadline" id="lessonHeadline"></div></div><div class="panel" id="panel"></div></section>'+
      '</main>';
    $$(".courseTab").forEach(b=>b.onclick=()=>switchView(b.dataset.view));
  }

  function buildDrawer(){
    const d=document.createElement("div");
    d.className="drawer";
    d.id="chapterDrawer";
    d.innerHTML='<div class="drawerPanel"><div class="drawerHead"><h3>Главы Конституции</h3><button class="drawerClose" id="drawerClose">×</button></div><div class="drawerList" id="drawerList"></div></div>';
    document.body.appendChild(d);
    $("#drawerClose").onclick=closeDrawer;
    d.onclick=e=>{if(e.target===d)closeDrawer()};
    document.addEventListener("keydown",e=>{if(e.key==="Escape")closeDrawer()});
  }
  function openDrawer(){renderDrawer();$("#chapterDrawer").classList.add("open");document.body.style.overflow="hidden"}
  function closeDrawer(){const d=$("#chapterDrawer");if(d)d.classList.remove("open");document.body.style.overflow=""}
  function renderDrawer(){
    const box=$("#drawerList");if(!box)return;
    box.innerHTML=chapters.map(c=>'<button class="drawerChapter '+(c.id===currentModule?'active':'')+'" data-chapter="'+c.id+'"><span class="drawerChapterNo">'+(c.id===0?'§':c.id===10?'II':c.id)+'</span><span><b>'+chapterTitle(c)+'</b><small>'+moduleInfo[c.id].desc+'</small></span><span class="drawerPct">'+modulePct(c.id)+'%</span></button>').join("");
    $$(".drawerChapter",box).forEach(b=>b.onclick=()=>{closeDrawer();openModule(+b.dataset.chapter)});
  }
  renderChapterNavigator=function(){renderDrawer()};

  function bindSearch(){
    const input=$("#globalSearch"),box=$("#searchResults");
    const run=()=>{
      const q=input.value.trim().toLowerCase();
      if(q.length<2){box.classList.remove("open");box.innerHTML="";return}
      const results=[];
      chapters.forEach(c=>{
        if((chapterTitle(c)+" "+moduleInfo[c.id].desc+" "+c.range).toLowerCase().includes(q))
          results.push({tag:"Глава",label:chapterTitle(c),sub:moduleInfo[c.id].desc,ch:c.id,block:0});
      });
      Object.entries(rawTopics).forEach(([num,label])=>{
        if(("статья "+num+" "+label).toLowerCase().includes(q)){
          const ch=chapterForArticle(num),id="a"+num;
          results.push({tag:"Ст. "+num,label:capUi(label),sub:chapterTitle(chapters.find(c=>c.id===ch)||chapters[0]),ch,block:blockForArticle(ch,id)});
        }
      });
      const top=results.slice(0,9);
      box.innerHTML=top.length?top.map((r,i)=>'<button class="searchResult" data-i="'+i+'"><i>'+r.tag+'</i><span><b>'+r.label+'</b><small>'+r.sub+'</small></span></button>').join(""):'<div style="padding:10px;font-size:9px;color:#738199">Ничего не найдено</div>';
      box.classList.add("open");
      $$(".searchResult",box).forEach((b,i)=>b.onclick=()=>{const r=top[i];box.classList.remove("open");input.value="";openModule(r.ch);blockIndex=r.block;view="meaning";renderCurrent()});
    };
    input.addEventListener("input",run);
    document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();input.focus();input.select()}});
    document.addEventListener("click",e=>{if(!e.target.closest(".searchBox"))box.classList.remove("open")});
  }

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
    renderDrawer();
  };
  setTopHeaderMode=function(){};

  function syncChapter(){
    const ch=chapters.find(c=>c.id===currentModule);if(!ch)return;
    $("#courseKicker").textContent=currentModule===0?"Вводная часть":mLabel(currentModule);
    $("#courseTitle").textContent=chapterTitle(ch);
    $("#courseDesc").textContent=moduleInfo[currentModule].desc;
    const idx=chapters.findIndex(c=>c.id===currentModule);
    $("#prevChapter").disabled=idx<=0;$("#nextChapter").disabled=idx>=chapters.length-1;
    $("#prevChapter").onclick=()=>{if(idx>0)openModule(chapters[idx-1].id)};
    $("#nextChapter").onclick=()=>{if(idx<chapters.length-1)openModule(chapters[idx+1].id)};
    updateProgress();
  }

  function syncTopicUI(){
    const inf=moduleInfo[currentModule],bl=inf.blocks[blockIndex];
    $("#topicSelect").innerHTML=inf.blocks.map((x,i)=>'<option value="'+i+'" '+(i===blockIndex?'selected':'')+'>'+(i+1)+'. '+capUi(x[0])+'</option>').join("");
    $("#prevTopic").disabled=blockIndex===0;$("#nextTopic").disabled=blockIndex===inf.blocks.length-1;
    $("#prevTopic").onclick=()=>{if(blockIndex>0){blockIndex--;renderCurrent();scrollLesson()}};
    $("#nextTopic").onclick=()=>{if(blockIndex<inf.blocks.length-1){blockIndex++;renderCurrent();scrollLesson()}};
    $("#topicSelect").onchange=()=>{blockIndex=+$("#topicSelect").value;renderCurrent();scrollLesson()};
    $("#lessonHeadline").innerHTML='<div class="eyebrow">Тема '+(blockIndex+1)+' из '+inf.blocks.length+'</div><h3>'+capUi(bl[0])+'</h3><p>'+capUi(bl[1])+'</p>';
  }
  function scrollLesson(){document.querySelector(".lesson")?.scrollIntoView({behavior:"smooth",block:"start"})}
  function markView(){$$(".courseTab").forEach(b=>b.classList.toggle("active",b.dataset.view===view))}

  function switchView(next){
    view=next;
    markView();
    renderCurrent();
  }
  activateCourseTab=function(tab){
    if(tab==="learn")tab="meaning";
    switchView(tab);
  };

  function renderCurrent(){
    currentTab=view==="meaning"||view==="quote"||view==="official"?"learn":view;
    if(view==="meaning"||view==="quote"||view==="official")renderLearn();
    else if(view==="scheme")renderScheme();
    else if(view==="cases")renderCases();
    else if(view==="practice")renderPractice();
    else renderCoach();
    syncTopicUI();
    markView();
    bindRipple();
  }

  renderLearn=function(){
    const inf=moduleInfo[currentModule],bl=inf.blocks[blockIndex],meta=learnMeta[currentModule]?.[blockIndex]||{},ids=bl[3]||[];
    ids.forEach(id=>state.viewed.add(id));save();updateProgress();
    const links=[...(meta.links||[])],detail=officialPracticeDetails[currentModule+"-"+blockIndex];
    (detail?.links||[]).forEach(x=>{if(!links.some(y=>y[1]===x[1]))links.push(x)});
    const officialLinks=links.map(x=>'<a class="sourceChip" target="_blank" rel="noopener" href="'+x[1]+'">'+x[0]+' ↗</a>').join("");
    let html="";
    if(view==="quote"){
      html='<section class="learnPane"><div class="readerPaneIntro"><div><span>Полный текст</span><h4>'+escHtml(bl[2])+' · без сокращений</h4></div><a class="sourceChip" target="_blank" rel="noopener" href="'+officialSourceForIds(ids)+'">Сверить источник ↗</a></div><div class="fullArticles">'+fullArticleCards(ids)+'</div></section>';
    }else if(view==="official"){
      html='<section class="learnPane"><div class="learnContent">'+expandedOfficial(meta,bl,ids)+'</div><div class="sourceRow">'+officialLinks+'<a class="sourceChip" target="_blank" rel="noopener" href="https://www.ksrf.ru/">Сайт КС РФ ↗</a></div></section>';
    }else{
      html='<section class="learnPane"><div class="learnContent">'+expandedMeaning(meta,bl,ids)+'</div></section>';
    }
    $("#panel").innerHTML=html;
  };

  renderHome=function(){
    currentModule=null;
    const overall=Math.round(chapters.reduce((sum,c)=>sum+modulePct(c.id),0)/chapters.length);
    const lastId=Number.isFinite(state.lastModule)&&state.lastModule?state.lastModule:1;
    const last=chapters.find(c=>c.id===lastId)||chapters[1];

    $("#homeMain").innerHTML=
      '<section class="homeTop"><div><div class="eyebrow">Интерактивный курс</div><h1>Конституция Российской Федерации</h1><p>Полный текст, понятные объяснения, практика Конституционного Суда, интерактивные схемы, кейсы, задания и тренировка свободного ответа. Без дублирующих панелей и лишней навигации.</p><div class="homeActions"><button class="btn primary" id="continueBtn">Продолжить →</button><button class="btn ghost" id="chaptersBtn">Выбрать главу</button></div></div><div class="progressSummary"><span>Общий прогресс</span><strong>'+overall+'%</strong><div class="bar"><span style="width:'+overall+'%"></span></div><small>'+(overall===0?'Начните с главы 1':'Последняя глава: '+chapterTitle(last))+'</small></div></section>'+
      '<section class="homeSection"><div class="sectionTitle"><div><h2>Главы</h2><p>Открывайте в любом порядке</p></div></div><div class="chapterGrid">'+chapters.map(c=>'<button class="chapterCard" data-chapter="'+c.id+'"><div class="chapterCardTop"><span class="chapterNo">'+(c.id===0?'§':c.id===10?'II':c.id)+'</span><span class="chapterPct">'+modulePct(c.id)+'%</span></div><h3>'+chapterTitle(c)+'</h3><p>'+moduleInfo[c.id].desc+'</p><div class="bar"><span style="width:'+modulePct(c.id)+'%"></span></div></button>').join("")+'</div></section>';

    $("#continueBtn").onclick=()=>openModule(overall===0?1:last.id);
    $("#chaptersBtn").onclick=openDrawer;
    $$(".chapterCard").forEach(b=>b.onclick=()=>openModule(+b.dataset.chapter));
    showPage("home");syncSoundButton();renderDrawer();window.scrollTo({top:0,behavior:"auto"});
  };

  openModule=function(id){
    const ch=chapters.find(c=>c.id===id);if(!ch)return;
    currentModule=id;state.lastModule=id;save();
    blockIndex=0;view="meaning";currentTab="learn";currentTask=null;caseIndex=0;checkState=null;
    mobileCaseStep="situation";mobileCoachStep="situation";coachState={scenario:null,number:0,answered:false,score:0};
    showPage("course");syncChapter();syncTopicUI();renderCurrent();syncSoundButton();renderDrawer();window.scrollTo({top:0,behavior:"auto"});
  };

  buildTop();
  buildShells();
  buildDrawer();
  renderHome();
})();
