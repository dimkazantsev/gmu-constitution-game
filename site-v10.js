/* Constitution course: publication and reader interface. Learning data lives in app.js. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const svg = (p) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  const icons = {
    arrow: svg('<path d="M5 12h14m-6-6 6 6-6 6"/>'),
    back: svg('<path d="M19 12H5m6-6-6 6 6 6"/>'),
    down: svg('<path d="m6 9 6 6 6-6"/>'),
    search: svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
    menu: svg('<path d="M4 7h16M4 12h16M4 17h10"/>'),
    close: svg('<path d="m6 6 12 12M6 18 18 6"/>'),
    book: svg('<path d="M12 5c-3-2-7-2-9-1v15c3-1 6 0 9 1 3-1 6-2 9-1V4c-2-1-6-1-9 1Zm0 0v15"/>'),
    meaning: svg('<path d="M9 18h6m-5 3h4M9 15c0-2-3-3-3-7a6 6 0 0 1 12 0c0 4-3 5-3 7Z"/>'),
    court: svg('<path d="m3 8 9-5 9 5H3Zm1 12h16M6 11v6m6-6v6m6-6v6"/>'),
    scheme: svg('<rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="17" width="7" height="5" rx="1"/><rect x="15" y="17" width="7" height="5" rx="1"/><path d="M12 7v5M5.5 17v-5h13v5"/>'),
    cases: svg('<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V4h8v3M3 12c6 3 12 3 18 0m-9 0v4"/>'),
    tasks: svg('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="m8 10 2 2 5-5m-7 9h8"/>'),
    coach: svg('<path d="M21 11a9 9 0 0 1-9 9 11 11 0 0 1-4-.8L3 21l1.5-5A9 9 0 1 1 21 11Z"/><path d="M8 9h8m-8 4h5"/>'),
    sound: svg('<path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'),
    mute: svg('<path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 5 6m0-6-5 6"/>'),
    external: svg('<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>'),
    check: svg('<path d="m5 12 4 4L19 6"/>'),
    reset: svg('<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/>')
  };
  const views = [
    ['meaning', 'Понять', 'meaning'], ['quote', 'Текст статей', 'book'],
    ['official', 'Практика КС', 'court'], ['scheme', 'Схема', 'scheme'],
    ['cases', 'Кейсы', 'cases'], ['practice', 'Задания', 'tasks'], ['coach', 'Тренер', 'coach']
  ];
  let view = 'meaning';
  let routeLock = false;
  let searchItems = [];
  let searchIndex = -1;
  let lastLocation;
  window.remainingTasks=function(){
    const done=new Set(state.doneTasks[currentModule]||[]);
    return (taskBank[currentModule]||[]).filter(task=>!done.has(task.id));
  };
  try { lastLocation = JSON.parse(localStorage.getItem('constitution_location') || 'null'); } catch (_) {}
  const title = c => c.id === 10 ? 'Заключительные и переходные положения' : c.name;
  const number = c => c.id === 0 ? '§' : c.id === 10 ? 'II' : String(c.id).padStart(2, '0');
  const range = c => c.id === 0 ? 'Вводная часть' : c.id === 10 ? 'Пункты 1–9' : 'Статьи ' + c.range;
  const overall = () => Math.round(chapters.reduce((s, c) => s + modulePct(c.id), 0) / chapters.length);
  const last = () => chapters.find(c => c.id === (lastLocation?.chapter ?? state.lastModule)) || chapters[1];
  const allTopics = () => chapters.reduce((n, c) => n + moduleInfo[c.id].blocks.length, 0);
  const topicCount = n => n + ' ' + (n%100>=11&&n%100<=14?'тем':n%10===1?'тема':n%10>=2&&n%10<=4?'темы':'тем');
  const chapterFromArticle = num => chapterFor(num);
  const blockForArticle = (ch, id) => Math.max(0, moduleInfo[ch].blocks.findIndex(b => b[3].includes(id)));
  function setRoute() {
    if (routeLock) return;
    const hash = currentModule === null ? '#home' : '#chapter/' + currentModule + '/' + blockIndex + '/' + view;
    if (location.hash !== hash) history.pushState(null, '', hash);
  }
  function saveLocation() {
    if (currentModule === null) return;
    lastLocation = {chapter: currentModule, topic: blockIndex, view};
    try { localStorage.setItem('constitution_location', JSON.stringify(lastLocation)); } catch (_) {}
  }
  function buildTop() {
    $('.top').innerHTML = '<div class="headerInner">' +
      '<a class="brand" href="#home" id="brandHome"><span class="brandMark">§</span><span class="brandText"><b>Конституция</b><small>Российская Федерация</small></span></a>' +
      '<nav class="headerNav" aria-label="Основная навигация"><button id="navHome" class="navLink">Учебник</button><button id="navChapters" class="navLink">Главы</button><button id="navPractice" class="navLink">Практика</button></nav>' +
      '<div class="topActions"><button class="searchTrigger" id="searchTrigger" aria-label="Поиск статьи или темы">' + icons.search + '<span>Найти статью</span><kbd>⌘ K</kbd></button><button class="iconButton soundButton" id="soundBtn"></button><button class="iconButton" id="drawerBtn" aria-label="Открыть оглавление и настройки">' + icons.menu + '</button></div></div>';
    $('#brandHome').onclick = e => {e.preventDefault(); renderHome();};
    $('#navHome').onclick = () => renderHome();
    $('#navChapters').onclick = openDrawer;
    $('#drawerBtn').onclick = openDrawer;
    $('#navPractice').onclick = () => openModule(last().id, 0, 'practice');
    $('#soundBtn').onclick = toggleSound;
    $('#searchTrigger').onclick = openSearch;
    $('#searchTrigger kbd').textContent=/Mac|iPhone|iPad/.test(navigator.platform)?'⌘ K':'Ctrl K';
  }
  function buildShells() {
    $('.homeShell').innerHTML = '<div class="homeInner" id="homeMain"></div>';
    $('.courseWorkspace').innerHTML = '<div class="courseLayout"><aside class="courseSidebar" aria-label="Оглавление курса"><div class="sidebarHeading"><span>Оглавление</span><button class="iconButton" id="sideHome" aria-label="На главную">' + icons.back + '</button></div><div class="sideNav" id="sideNav"></div><div class="sidebarBottom"><span>Ваш прогресс</span><b id="sidebarPct"></b><div class="bar"><span id="sidebarBar"></span></div></div></aside><div class="chapterPage">' +
      '<header class="chapterHeader"><div class="chapterMeta"><button class="chapterCrumb" id="mobileContents">' + icons.menu + 'Оглавление</button><span id="courseKicker"></span><span id="courseRange"></span><div class="chapterArrows"><button class="iconButton" id="prevChapter" aria-label="Предыдущая глава">' + icons.back + '</button><button class="iconButton" id="nextChapter" aria-label="Следующая глава">' + icons.arrow + '</button></div></div><h1 id="courseTitle"></h1><p id="courseDesc"></p><div class="chapterProgress"><div class="bar"><span id="courseBar"></span></div><span id="coursePct"></span></div></header>' +
      '<nav class="courseTabs" aria-label="Режим изучения" role="tablist">' + views.map(([id, label, icon]) => '<button class="courseTab" id="tab-' + id + '" role="tab" data-view="' + id + '" aria-controls="panel">' + icons[icon] + '<span>' + label + '</span></button>').join('') + '</nav>' +
      '<section class="lesson"><div class="lessonTop" id="lessonTop"><div class="topicRow"><div><label for="topicSelect" id="topicLabel">Тема</label><select id="topicSelect" class="topicSelect"></select></div><div class="topicArrows"><button class="iconButton" id="prevTopic" aria-label="Предыдущая тема">' + icons.back + '</button><button class="iconButton" id="nextTopic" aria-label="Следующая тема">' + icons.arrow + '</button></div></div><p id="lessonHeadline"></p></div><div class="panel" id="panel" role="tabpanel"></div></section>' +
      '<footer class="lessonFooter"><span>Изучайте в своём темпе. Прогресс сохраняется.</span><button class="textButton" id="nextStep">Следующая тема ' + icons.arrow + '</button></footer></div></div>';
    $('#sideHome').onclick = () => renderHome();
    $('#mobileContents').onclick = openDrawer;
    $$('.courseTab').forEach(b => {
      b.onclick = () => switchView(b.dataset.view);
      b.onkeydown = e => {
        const tabs = $$('.courseTab'), i = tabs.indexOf(b);
        let next;
        if(e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if(e.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
        if(e.key === 'Home') next = 0;
        if(e.key === 'End') next = tabs.length - 1;
        if(next !== undefined) {e.preventDefault(); tabs[next].click(); tabs[next].focus();}
      };
    });
  }
  function buildDialogs() {
    const host = document.createElement('div');
    host.innerHTML = '<dialog id="chapterDrawer" class="drawer"><div class="drawerHead"><div><span class="quietLabel">Ваш учебник</span><h2>Оглавление</h2></div><button class="iconButton" id="drawerClose" aria-label="Закрыть оглавление">' + icons.close + '</button></div><div class="drawerList" id="drawerList"></div><div class="drawerFooter"><div class="drawerProgress"><span>Прогресс курса</span><b id="drawerOverall"></b></div><div class="bar"><span id="drawerBar"></span></div><div class="drawerSettings"><button class="textButton" id="drawerSound"></button><button class="textButton" id="resetBtn">' + icons.reset + 'Сбросить прогресс</button></div><a class="sourceLink" href="' + officialConstUrl + '" target="_blank" rel="noopener">Официальный текст Конституции ' + icons.external + '</a></div></dialog>' +
      '<dialog id="searchDialog" class="searchDialog"><div class="searchInputRow">' + icons.search + '<input id="globalSearch" type="search" placeholder="Номер статьи, право или тема…" aria-label="Поиск по Конституции" role="combobox" aria-expanded="false" aria-controls="searchResults" autocomplete="off"><button class="iconButton" id="searchClose" aria-label="Закрыть поиск">' + icons.close + '</button></div><div class="searchResults" id="searchResults" role="listbox" aria-label="Результаты поиска"></div><div class="searchFooter">↑ ↓ выбрать <span>Enter открыть</span><span>Esc закрыть</span></div></dialog>';
    document.body.appendChild(host);
    $('#drawerClose').onclick = () => $('#chapterDrawer').close();
    $('#searchClose').onclick = () => $('#searchDialog').close();
    $('#drawerSound').onclick = toggleSound;
    $('#resetBtn').onclick = () => {$('#chapterDrawer').close(); requestProgressReset();};
    ['chapterDrawer', 'searchDialog'].forEach(id => {
      const d = $('#' + id);
      d.setAttribute('aria-label', id === 'chapterDrawer' ? 'Оглавление и настройки' : 'Поиск по Конституции');
      d.addEventListener('click', e => {if(e.target === d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
      d.addEventListener('close', () => document.body.classList.remove('dialogOpen'));
    });
    $('#globalSearch').addEventListener('input', runSearch);
    $('#globalSearch').name='constitution-search';
    $('#globalSearch').addEventListener('keydown', e => {
      if(e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if(!searchItems.length) return;
        searchIndex = (searchIndex + (e.key === 'ArrowDown' ? 1 : -1) + searchItems.length) % searchItems.length;
        $$('.searchResult').forEach((b,i) => {b.classList.toggle('selected',i===searchIndex); b.setAttribute('aria-selected',String(i===searchIndex));});
        $('#globalSearch').setAttribute('aria-activedescendant', 'result-' + searchIndex);
        $('#result-' + searchIndex)?.scrollIntoView({block:'nearest'});
      }
      if(e.key === 'Enter' && searchItems.length) {e.preventDefault(); chooseSearch(Math.max(0,searchIndex));}
    });
    document.addEventListener('keydown', e => {if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}});
  }
  function openDrawer() {renderNavigation(); $('#chapterDrawer').showModal(); document.body.classList.add('dialogOpen');}
  function openSearch() {$('#searchDialog').showModal(); document.body.classList.add('dialogOpen'); runSearch(); $('#globalSearch').focus();}
  function renderNavigation() {
    const markup = (topics) => chapters.map(c => '<div class="navChapterGroup"><button class="navChapter ' + (currentModule===c.id?'active':'') + '" data-chapter="' + c.id + '"' + (currentModule===c.id?' aria-current="page"':'') + '><span class="navNumber">' + number(c) + '</span><span>' + title(c) + '</span>' + (modulePct(c.id)===100?'<i class="navCheck">'+icons.check+'</i>':'') + '</button>' +
      (topics&&currentModule===c.id?'<div class="navTopics">'+moduleInfo[c.id].blocks.map((b,i)=>'<button class="navTopic '+(i===blockIndex?'active':'')+'" data-topic="'+i+'">'+capUi(b[0])+'</button>').join('')+'</div>':'')+'</div>').join('');
    $('#sideNav').innerHTML = markup(true);
    $('#drawerList').innerHTML = markup(true);
    $$('.navChapter').forEach(b=>b.onclick=()=>{if($('#chapterDrawer').open)$('#chapterDrawer').close();openModule(+b.dataset.chapter);});
    $$('.navTopic').forEach(b=>b.onclick=()=>{if($('#chapterDrawer').open)$('#chapterDrawer').close();blockIndex=+b.dataset.topic;currentTask=null;renderCurrent();});
    const pct=overall();
    $('#sidebarPct').textContent=pct+'%'; $('#sidebarBar').style.width=pct+'%';
    $('#drawerOverall').textContent=pct+'%'; $('#drawerBar').style.width=pct+'%';
  }
  function runSearch() {
    const q=$('#globalSearch').value.trim().toLowerCase().replace(/ё/g,'е');
    searchIndex=-1; searchItems=[];
    $('#globalSearch').removeAttribute('aria-activedescendant');
    if(q) {
      const numeric=q.match(/^(?:ст(?:атья|\.)?\s*)?(\d+(?:\.\d+)?)$/)?.[1];
      Object.entries(rawTopics).forEach(([n,t])=>{
        if(numeric?n===numeric:('статья '+n+' '+t+' '+(constitutionFullText['a'+n]||'')).toLowerCase().replace(/ё/g,'е').includes(q)) {
          const ch=chapterFromArticle(n);
          searchItems.push({tag:'Статья '+n,label:capUi(t),ch,topic:blockForArticle(ch,'a'+n),view:'quote',article:'a'+n});
        }
      });
      chapters.forEach(c=>{if((title(c)+' '+mLabel(c.id)).toLowerCase().includes(q))searchItems.push({tag:mLabel(c.id),label:title(c),ch:c.id,topic:0,view:'meaning'});});
    } else {
      [1,2,7].forEach(id=>searchItems.push({tag:mLabel(id),label:title(chapters[id]),ch:id,topic:0,view:'meaning'}));
    }
    searchItems=searchItems.slice(0,40);
    $('#globalSearch').setAttribute('aria-expanded',String(searchItems.length>0));
    $('#searchResults').innerHTML=(q?'':'<p class="searchSuggestion">Можно искать по номеру статьи или словам</p>')+(searchItems.length?searchItems.map((r,i)=>'<button id="result-'+i+'" role="option" aria-selected="false" class="searchResult" data-result="'+i+'"><span class="searchTag">'+r.tag+'</span><span>'+escHtml(r.label)+'</span>'+icons.arrow+'</button>').join(''):'<div class="searchEmpty"><b>Ничего не найдено</b><p>Попробуйте номер статьи или другое слово: например, «образование».</p></div>');
    $$('.searchResult').forEach(b=>b.onclick=()=>chooseSearch(+b.dataset.result));
  }
  function chooseSearch(i) {
    const r=searchItems[i];if(!r)return;
    $('#searchDialog').close();openModule(r.ch,r.topic,r.view);
    if(r.article) {const label=articleLabel(r.article);const el=$$('.fullArticle').find(x=>$('.fullArticleHead>span',x)?.textContent===label);el?.scrollIntoView({block:'start',behavior:'auto'});}
  }
  syncSoundButton = function () {
    $('#soundBtn').innerHTML=state.sound?icons.sound:icons.mute;
    $('#soundBtn').setAttribute('aria-label',state.sound?'Выключить звук':'Включить звук');
    $('#soundBtn').setAttribute('aria-pressed',String(state.sound));
    $('#drawerSound').innerHTML=(state.sound?icons.sound:icons.mute)+(state.sound?'Звук включён':'Звук выключен');
  };
  renderChapterNavigator=renderNavigation;
  const originalCoachRenderer=renderCoach;
  renderCoach=function(){
    originalCoachRenderer();
    const orb=$('.aiOrb');if(orb)orb.innerHTML=icons.coach;
    $('#coachAnswer')?.setAttribute('aria-label','Ваш ответ на ситуацию');
    if($('#coachAnswer')){$('#coachAnswer').name='coach-answer';$('#coachAnswer').autocomplete='off';}
    $('#coachResult')?.setAttribute('aria-live','polite');
    const result=$('#coachResult');
    if(result&&!$('.coachScoringNote'))result.insertAdjacentHTML('afterend','<p class="coachScoringNote">Тренер ищет ключевые элементы ответа. Оценка ориентировочная: сравните свою аргументацию с разбором.</p>');
  };
  const originalCaseRenderer=renderCases;
  renderCases=function(){
    originalCaseRenderer();
    $('#caseHypothesis')?.setAttribute('aria-label','Ваша гипотеза о ситуации');
    if($('#caseHypothesis')){$('#caseHypothesis').name='case-hypothesis';$('#caseHypothesis').autocomplete='off';}
    $('#caseExplain')?.setAttribute('aria-live','polite');
  };
  const originalTaskInput=renderTaskInput;
  renderTaskInput=function(task){
    originalTaskInput(task);
    $$('.matchSelect').forEach((el,i)=>{el.setAttribute('aria-label',$('.matchLeft',el.closest('.matchRow'))?.textContent||'Соответствие '+(i+1));el.name='match-'+i;});
    $$('.orderItem').forEach(row=>$$('.move',row).forEach((b,i)=>b.setAttribute('aria-label',(i===0?'Переместить выше: ':'Переместить ниже: ')+$('span',row).textContent)));
    if(task.type==='multi')$$('#answerZone .ans').forEach(b=>{b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>b.setAttribute('aria-pressed',String(b.classList.contains('selected'))));});
    $('#feedback')?.setAttribute('aria-live','polite');
  };
  const originalSchemeRenderer=renderScheme;
  renderScheme=function(){
    originalSchemeRenderer();
    $$('.schemeTarget').forEach(t=>{t.tabIndex=0;t.setAttribute('role','button');t.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();t.click();}};});
    $('#schemeFeedback')?.setAttribute('aria-live','polite');
  };
  setTopHeaderMode=function(){};
  updateProgress=function(){
    if(currentModule!==null) {const p=modulePct(currentModule);$('#coursePct').textContent=p+'% главы';$('#courseBar').style.width=p+'%';}
    renderNavigation();
  };
  function syncChapter() {
    const c=chapters.find(c=>c.id===currentModule), i=chapters.indexOf(c);
    $('#courseKicker').textContent=mLabel(c.id); $('#courseTitle').textContent=title(c); $('#courseRange').textContent=range(c); $('#courseDesc').textContent=moduleInfo[c.id].desc;
    $('#prevChapter').disabled=i===0; $('#nextChapter').disabled=i===chapters.length-1;
    $('#prevChapter').onclick=()=>i>0&&openModule(chapters[i-1].id);
    $('#nextChapter').onclick=()=>i<chapters.length-1&&openModule(chapters[i+1].id);
  }
  function syncTopic() {
    const blocks=moduleInfo[currentModule].blocks,b=blocks[blockIndex];
    const reading=['meaning','quote','official'].includes(view);
    $('#lessonTop').hidden=!reading;
    $('#topicLabel').textContent='Тема '+(blockIndex+1)+' из '+blocks.length;
    $('#topicSelect').innerHTML=blocks.map((x,i)=>'<option value="'+i+'" '+(i===blockIndex?'selected':'')+'>'+capUi(x[0])+'</option>').join('');
    $('#lessonHeadline').textContent=capUi(b[1]);
    $('#prevTopic').disabled=blockIndex===0;$('#nextTopic').disabled=blockIndex===blocks.length-1;
    $('#prevTopic').onclick=()=>{if(blockIndex>0){blockIndex--;renderCurrent();}};
    $('#nextTopic').onclick=()=>{if(blockIndex<blocks.length-1){blockIndex++;renderCurrent();}};
    $('#topicSelect').onchange=e=>{blockIndex=+e.target.value;renderCurrent();};
    $('#nextStep').innerHTML=(blockIndex<blocks.length-1?'Следующая тема':'Следующая глава')+icons.arrow;
    $('#nextStep').disabled=currentModule===10&&blockIndex===blocks.length-1;
    $('#nextStep').onclick=()=>{if(blockIndex<blocks.length-1){blockIndex++;view='meaning';renderCurrent();}else{const i=chapters.findIndex(c=>c.id===currentModule);if(i<chapters.length-1)openModule(chapters[i+1].id);}};
  }
  function switchView(next) {
    if(!views.some(v=>v[0]===next))next='meaning';
    if(next===view)return;
    view=next;renderCurrent();
  }
  activateCourseTab=tab=>switchView(tab==='learn'?'meaning':tab);
  function renderCurrent() {
    currentTab=['meaning','quote','official'].includes(view)?'learn':view;
    const panel=$('#panel');panel.dataset.view=view;panel.setAttribute('aria-labelledby','tab-'+view);
    syncTopic();
    $$('.courseTab').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    if(currentTab==='learn')renderLearn();
    else if(view==='scheme')renderScheme();
    else if(view==='cases')renderCases();
    else if(view==='practice')renderPractice();
    else renderCoach();
    if(view==='coach') {
      const orb=$('.aiOrb');if(orb)orb.innerHTML=icons.coach;
      const textarea=$('#coachAnswer');if(textarea)textarea.setAttribute('aria-label','Ваш ответ на ситуацию');
    }
    $('#caseHypothesis')?.setAttribute('aria-label','Ваша гипотеза о ситуации');
    updateProgress();saveLocation();setRoute();bindRipple();
  }
  renderLearn=function() {
    const b=moduleInfo[currentModule].blocks[blockIndex],meta=learnMeta[currentModule]?.[blockIndex]||{},ids=b[3]||[];
    ids.forEach(id=>state.viewed.add(id));save();
    let html;
    if(view==='quote')html='<div class="readerPaneIntro"><div><span class="quietLabel">Первоисточник</span><h2>'+escHtml(b[2])+'</h2></div><span class="readingNote">Полный текст, без сокращений</span></div><div class="fullArticles">'+fullArticleCards(ids)+'</div>';
    else if(view==='official') {
      const links=[...(meta.links||[])];(officialPracticeDetails[currentModule+'-'+blockIndex]?.links||[]).forEach(x=>{if(!links.some(y=>y[1]===x[1]))links.push(x);});
      html='<div class="learnContent">'+expandedOfficial(meta,b,ids)+'</div><div class="sourceRow">'+links.map(x=>'<a class="sourceChip" target="_blank" rel="noopener" href="'+x[1]+'">'+x[0]+icons.external+'</a>').join('')+'<a class="sourceChip" target="_blank" rel="noopener" href="https://www.ksrf.ru/">Сайт КС РФ '+icons.external+'</a></div>';
    } else html='<div class="learnContent">'+expandedMeaning(meta,b,ids)+'</div><details class="inlineSource"><summary>'+icons.book+'Прочитать полный текст статей'+icons.down+'</summary><div class="fullArticles">'+fullArticleCards(ids)+'</div></details>';
    $('#panel').innerHTML='<div class="learnPane" tabindex="0" role="region" aria-label="'+(view==='quote'?'Текст статей':view==='official'?'Практика Конституционного Суда':'Объяснение темы')+'"><div class="readingInner">'+html+'</div></div>';
  };
  renderHome=function() {
    currentModule=null;document.body.classList.remove('inCourse');
    const pct=overall(),resume=state.viewed.size>0,c=last();
    const chapterList=chapters.filter(c=>c.id>0&&c.id<10);
    $('#homeMain').innerHTML=
      '<section class="hero"><div class="heroCopy"><div class="editionLabel"><span></span>Интерактивный учебник</div><h1>Конституция.<br>От текста<br>к пониманию.</h1><p>Как устроено государство, что значат ваши права и как применять их в жизни. Разбираемся по порядку.</p><div class="heroActions"><button class="btn primary" id="startCourse">'+(resume?'Продолжить изучение':'Начать изучение')+icons.arrow+'</button><button class="textButton" id="allChapters">Все главы'+icons.down+'</button></div><div class="heroFootnote">'+icons.check+'В своём темпе'+icons.check+'С сохранением прогресса</div></div>'+
      '<div class="heroVisual" id="heroVisual"><div class="bookGround"></div><button class="bookObject" id="bookOpen" aria-label="Открыть учебник Конституции"><span class="bookPages"></span><span class="bookCover"><span class="bookTop">Российская Федерация</span><span class="bookEmblem">§</span><span class="bookTitle">Конституция</span><span class="bookSubtitle">Основной закон.<br>Понятным языком.</span><span class="bookBottom"><span>Интерактивное издание</span><i>'+icons.arrow+'</i></span></span><span class="bookRibbon"></span></button><div class="articleNote"><span>Статья 2</span><p>Человек, его права и свободы<br>являются высшей ценностью.</p></div><span class="bookHint">Нажмите, чтобы открыть</span></div></section>'+
      '<section class="studyStrip" aria-label="Возможности курса"><div class="studyStripIntro">Один текст.<br><b>Разные способы понять.</b></div><button data-feature="quote">'+icons.book+'<span>Читать статьи<small>Полный текст Конституции</small></span></button><button data-feature="official">'+icons.court+'<span>Разбирать практику<small>Дела Конституционного Суда</small></span></button><button data-feature="practice">'+icons.tasks+'<span>Проверять себя<small>Ситуации и задания</small></span></button></section>'+
      '<section class="contents" id="chaptersSection"><div class="sectionHeading"><div><span class="quietLabel">Содержание учебника</span><h2>Вся Конституция.<br>Глава за главой.</h2></div><p>Начните с основ или выберите то,<br>что интересно сейчас.</p></div>'+
      '<button class="introChapter" data-chapter="0"><span class="introSymbol">§</span><span><b>С чего всё начинается</b><small>Преамбула Конституции</small></span><span class="introDesc">'+moduleInfo[0].desc+'</span>'+icons.arrow+'</button>'+
      '<div class="chapterIndex">'+chapterList.map(ch=>'<button class="chapterEntry" data-chapter="'+ch.id+'"><span class="entryNumber">'+number(ch)+'</span><span class="entryText"><small>'+range(ch)+'</small><h3>'+title(ch)+'</h3><span class="entryMeta">'+topicCount(moduleInfo[ch.id].blocks.length)+' '+(modulePct(ch.id)?'<i class="entryProgress">'+modulePct(ch.id)+'% пройдено</i>':'')+'</span></span><span class="entryArrow">'+icons.arrow+'</span></button>').join('')+'</div>'+
      '<button class="introChapter outroChapter" data-chapter="10"><span class="introSymbol">II</span><span><b>Заключительные и переходные положения</b><small>Раздел второй · пункты 1–9</small></span>'+icons.arrow+'</button></section>'+
      '<section class="continueCard"><div class="continueIcon">'+icons.book+'</div><div><span class="quietLabel">Ваш маршрут</span><h2>'+(resume?'Продолжим с того же места?':'Первый шаг — понять основы.')+'</h2><p>'+(resume?title(c):'Начните с первой главы. Остальные можно открыть в любой момент.')+'</p></div><div class="continueAction"><span>'+pct+'% курса пройдено</span><button class="btn primary" id="resumeBottom">'+(resume?'Продолжить':'Открыть главу 1')+icons.arrow+'</button></div></section>'+
      '<footer class="siteFooter"><div><b>§ Конституция РФ</b><span>Учебный курс</span></div><a href="'+officialConstUrl+'" target="_blank" rel="noopener">Официальный текст'+icons.external+'</a><span>9 глав · '+allTopics()+' тем</span></footer>';
    const start=()=>resume?openModule(c.id,lastLocation?.chapter===c.id?lastLocation.topic:0,lastLocation?.chapter===c.id?lastLocation.view:'meaning'):openModule(1);
    $('#startCourse').onclick=start;$('#resumeBottom').onclick=start;$('#bookOpen').onclick=start;
    $('#allChapters').onclick=()=>$('#chaptersSection').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    $$('.chapterEntry,.introChapter').forEach(b=>b.onclick=()=>openModule(+b.dataset.chapter));
    $$('[data-feature]').forEach(b=>b.onclick=()=>openModule(resume?c.id:1,0,b.dataset.feature));
    const visual=$('#heroVisual'),book=$('#bookOpen');
    if(matchMedia('(pointer:fine) and (prefers-reduced-motion: no-preference)').matches) {
      visual.onpointermove=e=>{const r=visual.getBoundingClientRect();book.style.setProperty('--rx',((e.clientY-r.top)/r.height-.5)*-7+'deg');book.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*8+'deg');};
      visual.onpointerleave=()=>{book.style.removeProperty('--rx');book.style.removeProperty('--ry');};
    }
    showPage('home');renderNavigation();syncSoundButton();setRoute();window.scrollTo({top:0,behavior:'instant'});
  };
  openModule=function(id,topic=0,nextView='meaning') {
    const c=chapters.find(c=>c.id===id);if(!c)return;
    currentModule=id;state.lastModule=id;save();
    blockIndex=Math.max(0,Math.min(Number(topic)||0,moduleInfo[id].blocks.length-1));
    view=views.some(v=>v[0]===nextView)?nextView:'meaning';
    currentTask=null;caseIndex=0;checkState=null;mobileCaseStep='situation';mobileCoachStep='situation';coachState={scenario:null,number:0,answered:false,score:0};
    document.body.classList.add('inCourse');showPage('course');syncChapter();renderCurrent();syncSoundButton();window.scrollTo({top:0,behavior:'instant'});
  };
  /* Keep feedback visible until the learner chooses to advance. */
  succeed=function(el) {
    if(!currentTask)return;
    if((state.doneTasks[currentModule]||[]).includes(currentTask.id))return;
    successSound();el?.classList.add('correct');
    if(!state.doneTasks[currentModule])state.doneTasks[currentModule]=[];
    state.doneTasks[currentModule].push(currentTask.id);save();updateProgress();
    $$('#answerZone button,#answerZone select').forEach(b=>b.disabled=true);
    $('#feedback').classList.add('successFeedback');
    $('#feedback').innerHTML='<b>Верно.</b><p>'+currentTask.why+'</p><span class="refs">Основание: '+currentTask.refs+'</span><button class="btn primary" id="nextTask">Следующее задание'+icons.arrow+'</button>';
    $('#nextTask').onclick=()=>{currentTask=null;renderPractice();};
    $('#nextTask').focus({preventScroll:true});
  };
  const originalReset=resetAllProgress;
  resetAllProgress=function(){lastLocation=null;try{localStorage.removeItem('constitution_location');}catch(_){}originalReset();};
  function restoreRoute() {
    routeLock=true;
    const m=location.hash.match(/^#chapter\/(\d+)\/(\d+)\/([a-z]+)$/);
    if(m&&chapters.some(c=>c.id===+m[1]))openModule(+m[1],+m[2],m[3]);else renderHome();
    routeLock=false;
  }
  buildTop();buildShells();buildDialogs();
  window.addEventListener('popstate',restoreRoute);
  window.addEventListener('hashchange',restoreRoute);
  $('#resetOverlay').addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;const buttons=$$('#resetOverlay button'),first=buttons[0],end=buttons[buttons.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();end.focus();}else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus();}
  });
  restoreRoute();
})();
