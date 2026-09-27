/* Content revision. The publication layout remains in site-v10.js and site-v10.css. */
Object.keys(coachCurriculum).forEach(ch=>{coachTemplates[ch]=coachCurriculum[ch];});
Object.keys(addedCases).forEach(ch=>{
  const legacy=replacedLegacyCaseChapters.has(Number(ch))?[]:caseBank[ch].map((c,i)=>({...c,id:`legacy-case-${ch}-${i}`}));
  const previous=state.doneCases[ch]||[];
  state.doneCases[ch]=previous.map(id=>typeof id==='number'&&legacy[id]?legacy[id].id:id);
  caseBank[ch]=[...legacy,...addedCases[ch]];
});
Object.keys(extraTasks).forEach(ch=>{taskBank[ch]=[...taskBank[ch].filter(t=>!retiredTaskIds.has(t.id)),...extraTasks[ch]];});
// Old queues keep their identifiers; retired items are excluded from active counts.
const activeTaskDone=ch=>taskBank[ch].filter(t=>(state.doneTasks[ch]||[]).includes(t.id)).length;
const activeCaseDone=ch=>caseBank[ch].filter(c=>(state.doneCases[ch]||[]).includes(c.id)).length;
rawTopics['79.1']='международный мир и безопасность, мирное сосуществование и невмешательство';
rawTopics['92.1']='неприкосновенность Президента, прекратившего исполнение полномочий';
const transitionTopics=['вступление Конституции в силу и прекращение действия прежней Конституции','применение прежних правовых актов в непротиворечащей части','полномочия Президента, избранного до вступления Конституции в силу','работа действовавшего Правительства в новой конституционной рамке','непрерывность правосудия и переходные условия для судей','переходный порядок рассмотрения дел присяжными, ареста и содержания под стражей','двухлетний срок палат первого созыва','открытие первого заседания Совета Федерации Президентом','специальные условия деятельности депутатов и членов Совета Федерации первого созыва'];
targets.forEach(t=>{if(t.type==='article')t.topic=rawTopics[t.article]||t.topic;if(/^t\d+$/.test(t.id))t.topic=transitionTopics[Number(t.id.slice(1))-1];});
moduleInfo[3].blocks[1][0]='Разграничение компетенции';
moduleInfo[3].blocks[4][0]='Международное участие и конституционные пределы';
moduleInfo[3].blocks[4][1]='Участие в межгосударственных объединениях, пределы исполнения их решений и ориентиры международного мира и безопасности.';

plainArticleExplanation=function(id){
 const [meaning,example,caution]=articleNotes[id];
 return '<div class="plainArticleText"><p><b>Смысл нормы.</b> '+escHtml(meaning)+'</p><p><b>Учебный пример.</b> '+escHtml(example)+'</p><div class="plainTrap"><b>Важно различать</b><span>'+escHtml(caution)+'</span></div></div>';
};
expandedMeaning=function(meta,bl,ids){
 const [idea,connection,question]=topicNotes[currentModule][blockIndex];
 return '<div class="plainLead"><span>Сначала главное</span><h4>'+escHtml(bl[0])+'</h4><p>'+escHtml(idea)+'</p></div><div class="plainLife"><b>Как связаны нормы</b><p>'+escHtml(connection)+'</p></div><div class="plainQuestion"><b>Вопрос для размышления</b><p>'+escHtml(question)+'</p></div><div class="plainArticles"><div class="plainSectionTitle">Смысл статей и учебные примеры</div>'+ids.map(id=>'<article class="plainArticle"><div class="plainArticleNo">'+articleLabel(id)+'</div>'+plainArticleExplanation(id)+'</article>').join('')+'</div><p class="readingNote">Авторское учебное объяснение. Примеры вымышлены; текст Конституции доступен во вкладке «Текст статей».</p>';
};

function shuffleCopy(items){
 const result=items.slice();
 for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
function prepareChoice(item){
 if(!item.options||item._presented)return item;
 const order=shuffleCopy(item.options.map((_,i)=>i));
 return {...item,options:order.map(i=>item.options[i]),answer:item.type==='multi'?item.answer:order.indexOf(item.answer),_presented:true};
}
schemeShuffle=shuffleCopy;
const renderTaskInputBase=renderTaskInput;
renderTaskInput=function(task){
 const presented=prepareChoice(task);
 if(currentTask&&currentTask.id===task.id)currentTask=presented;
 renderTaskInputBase(presented);
};
fail=function(message,element){
 errorSound();
 if(element?.classList){element.classList.add('wrong','shake');setTimeout(()=>element.classList.remove('wrong','shake'),450);}
 document.getElementById('feedback').innerHTML='<b>Пока неверно.</b><p>'+escHtml(message)+'</p><p>'+escHtml(currentTask.why)+'</p><span class="refs">'+escHtml(currentTask.refs)+'</span><p>Попробуйте ещё раз.</p>';
};

function emptyRevision(){return {coach:{},schemes:[]};}
let learningRevision;
try{learningRevision=JSON.parse(localStorage.getItem('constitution_content_v11')||'null');}catch(_){}
if(!learningRevision||typeof learningRevision.coach!=='object'||!Array.isArray(learningRevision.schemes))learningRevision=emptyRevision();
const saveBeforeRevision=save;
save=function(){saveBeforeRevision();localStorage.setItem('constitution_content_v11',JSON.stringify(learningRevision));};
const resetBeforeRevision=resetAllProgress;
resetAllProgress=function(){learningRevision=emptyRevision();localStorage.removeItem('constitution_content_v11');resetBeforeRevision();};
function resetChapterProgress(ch){
 if(!chapters.some(c=>c.id===ch))return;
 clearPracticeAttempts(ch);
 targets.filter(t=>t.chapter===ch).forEach(t=>state.viewed.delete(t.id));
 delete state.doneTasks[ch];delete state.doneCases[ch];delete state.scores[ch];
 state.bosses.delete(ch);delete state.coachSeen[ch];
 const answers=Object.values(learningRevision.coach[ch]?.answers||{});
 state.coachSolved=Math.max(0,(state.coachSolved||0)-answers.length);
 state.coachPoints=Math.max(0,(state.coachPoints||0)-answers.reduce((sum,a)=>sum+(Number(a.score)||0),0));
 delete learningRevision.coach[ch];
 learningRevision.schemes=learningRevision.schemes.filter(id=>id!==ch);
 save();
}
function coachRecord(ch=currentModule){
 if(!learningRevision.coach[ch])learningRevision.coach[ch]={currentId:null,seen:[],answers:{},drafts:{},ended:false};
 return learningRevision.coach[ch];
}
function chapterProgress(ch){
 const blocks=moduleInfo[ch].blocks,coach=coachRecord(ch);
 const parts={topics:[blocks.filter(bl=>(bl[3]||[]).every(id=>state.viewed.has(id))).length,blocks.length],scheme:[learningRevision.schemes.includes(ch)?1:0,1],cases:[activeCaseDone(ch),caseBank[ch].length],tasks:[activeTaskDone(ch),taskBank[ch].length],coach:[coachTemplates[ch].filter(c=>coach.answers[c.id]).length,coachTemplates[ch].length]};
 const done=Object.values(parts).reduce((n,p)=>n+p[0],0),total=Object.values(parts).reduce((n,p)=>n+p[1],0);
 return {parts,done,total,percent:Math.floor(done/total*100)};
}
modulePct=ch=>chapterProgress(ch).percent;
function progressDescription(ch){const p=chapterProgress(ch).parts;return `Темы: ${p.topics.join(' из ')}; схема: ${p.scheme.join(' из ')}; кейсы: ${p.cases.join(' из ')}; задания: ${p.tasks.join(' из ')}; ответы тренеру: ${p.coach.join(' из ')}`;}
bossUnlocked=ch=>activeTaskDone(ch)===taskBank[ch].length&&activeCaseDone(ch)===caseBank[ch].length;
function recordSchemeComplete(){if(!learningRevision.schemes.includes(currentModule))learningRevision.schemes.push(currentModule);save();updateProgress();}

function selectCoachScenario(scenario){
 const record=coachRecord();record.currentId=scenario.id;record.ended=false;
 if(!record.seen.includes(scenario.id))record.seen.push(scenario.id);
 const answer=record.answers[scenario.id];
 coachState={scenario,number:coachTemplates[currentModule].findIndex(c=>c.id===scenario.id)+1,answered:Boolean(answer),score:answer?.score||0};
 mobileCoachStep='situation';save();
}
newCoachScenario=function(){
 const record=coachRecord(),bank=coachTemplates[currentModule],next=bank.find(c=>!record.seen.includes(c.id));
 if(next)selectCoachScenario(next);else{record.ended=true;record.currentId=null;coachState.scenario=null;save();}
 renderCoach();
};
function restartCoachSet(onlyUnanswered=false){
 const record=coachRecord();record.seen=onlyUnanswered?coachTemplates[currentModule].filter(c=>record.answers[c.id]).map(c=>c.id):[];record.currentId=null;record.ended=false;
 coachState.scenario=null;newCoachScenario();
}
function showCoachReview(){
 const c=coachState.scenario,record=coachRecord(),answer=record.answers[c.id];if(!answer)return;
 const res=evaluateCoach(answer.text,c),box=document.getElementById('coachResult');
 box.classList.add('show');box.closest('.coachResponse').classList.add('reviewed');
 box.innerHTML='<div class="coachResultLabel">Разбор ответа</div><div class="coachResultHead"><div class="coachScore">'+res.hits.filter(Boolean).length+'/'+res.hits.length+'</div><div><h4>Опорные понятия в вашем ответе</h4><p>Отметки показывают совпадения по ключевым словам. Сопоставьте ход своего рассуждения с примером ниже.</p></div></div><div class="detected">'+c.labels.map((label,i)=>'<span class="'+(res.hits[i]?'':'miss')+'">'+(res.hits[i]?'✓ ':'○ ')+escHtml(label)+'</span>').join('')+'</div><div class="modelAnswer"><b>Возможный вариант ответа</b><p>'+escHtml(c.model)+'</p><div class="legalBase"><span>Правовое основание</span><b>'+escHtml(c.refs)+'</b></div></div><div class="coachButtons"><button class="btn ghost" id="coachRevise">Уточнить ответ</button><button class="btn primary" onclick="newCoachScenario()">'+(record.seen.length<coachTemplates[currentModule].length?'Следующая ситуация →':'Завершить набор')+'</button></div>';
 document.getElementById('coachAnswer').disabled=true;
 document.getElementById('coachSubmit').disabled=true;
 document.getElementById('coachRevise').onclick=()=>{coachState.answered=false;document.getElementById('coachAnswer').disabled=false;document.getElementById('coachSubmit').disabled=false;setMobileCoachStep('answer');document.getElementById('coachAnswer').focus();};
}
renderCoach=function(){
 const panel=document.getElementById('panel'),bank=coachTemplates[currentModule],record=coachRecord();
 if(record.ended){
  const answered=bank.filter(c=>record.answers[c.id]).length;
  panel.innerHTML='<div class="finish"><div><div class="score">✓</div><h3>Все '+bank.length+' ситуаций просмотрены</h3><p>Вы ответили на '+answered+' из '+bank.length+'. Набор завершён; повтор можно начать самостоятельно.</p><div class="row">'+(answered<bank.length?'<button class="btn primary" onclick="restartCoachSet(true)">Ответить на пропущенные</button>':'')+'<button class="btn ghost" onclick="restartCoachSet()">Повторить набор</button></div></div></div>';return;
 }
 if(!coachState.scenario){const scenario=bank.find(c=>c.id===record.currentId)||bank.find(c=>!record.seen.includes(c.id));if(!scenario){record.ended=true;save();renderCoach();return;}selectCoachScenario(scenario);}
 const c=coachState.scenario;
 panel.innerHTML='<div class="coachWorkbench" data-mobile-step="'+mobileCoachStep+'"><div class="coachMobileSteps"><button class="coachMobileStep" data-step="situation">1 · Ситуация</button><button class="coachMobileStep" data-step="answer">2 · Ответ</button><button class="coachMobileStep" data-step="review">3 · Разбор</button></div><div class="coachTopbar"><div class="coachIdentity"><div class="aiOrb">§</div><div><h3>Ситуационный тренер</h3><p>Учебная ситуация · свободный ответ · разбор</p></div></div><div class="coachCounter">Ситуация '+coachState.number+' из '+bank.length+'</div></div><div class="coachGrid"><section class="coachSituation"><div class="scenarioLabel">'+escHtml(c.topic)+'</div><div class="scenarioText">'+escHtml(c.text)+'</div><div class="scenarioScene">'+c.actors.map(a=>'<div class="miniActor"><i>'+escHtml(a[0])+'</i>'+escHtml(a[1])+'</div>').join('<span class="arrow">→</span>')+'</div><div class="coachQuestionBox"><span>Вопрос</span><h4>'+escHtml(c.question)+'</h4></div><div class="coachChecklist"><b>Опоры для ответа</b>'+c.labels.map((label,i)=>'<div><span>'+(i+1)+'</span>'+escHtml(label)+'</div>').join('')+'</div><button class="btn primary coachToAnswer" id="coachToAnswerBtn">Перейти к ответу →</button></section><section class="coachResponse"><div class="coachResponseHead"><div><span class="eyebrow">Ваш ответ</span><h4>Объясните ситуацию своими словами</h4></div><span class="coachNoArticle">Номер статьи не нужен</span></div><textarea class="freeAnswer" id="coachAnswer" placeholder="Сформулируйте вывод и объясните, какими нормами и обстоятельствами он обоснован."></textarea><div class="coachActions">'+(bank.length>1?'<button class="btn ghost" onclick="newCoachScenario()">'+(record.seen.length<bank.length?'Другая ситуация':'Завершить набор')+'</button>':'')+'<button class="btn primary" id="coachSubmit" onclick="submitCoach()">Разобрать ответ →</button></div><div class="coachResult" id="coachResult"><div class="coachResultPlaceholder"><b>После ответа здесь появится разбор.</b><span>Сравните свой вывод с возможным вариантом ответа и правовым основанием.</span></div></div></section></div></div>';
 document.querySelectorAll('.coachMobileStep').forEach(b=>b.onclick=()=>setMobileCoachStep(b.dataset.step));
 document.getElementById('coachToAnswerBtn').onclick=()=>{setMobileCoachStep('answer');document.getElementById('coachAnswer').focus();};
 const ta=document.getElementById('coachAnswer');ta.value=record.drafts[c.id]??record.answers[c.id]?.text??'';
 ta.oninput=()=>{record.drafts[c.id]=ta.value;save();};
 if(record.answers[c.id])showCoachReview();
 setMobileCoachStep(mobileCoachStep);bindRipple();
};
submitCoach=function(){
 if(coachState.answered)return;
 const ta=document.getElementById('coachAnswer'),answer=ta?.value.trim()||'';
 if(answer.length<20){toast('Напишите хотя бы одно содержательное предложение');ta.focus();return;}
 const c=coachState.scenario,record=coachRecord(),res=evaluateCoach(answer,c),previous=record.answers[c.id];
 record.answers[c.id]={text:answer,score:res.score};record.drafts[c.id]=answer;
 if(!previous)state.coachSolved=(state.coachSolved||0)+1;
 state.coachPoints=(state.coachPoints||0)+res.score-(previous?.score||0);
 coachState.answered=true;coachState.score=res.score;save();showCoachReview();setMobileCoachStep('review');updateProgress();
};
save();
