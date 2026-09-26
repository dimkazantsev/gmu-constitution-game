
(function(){
  "use strict";

  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function syncA11y(){
    const sound=q("#soundBtn");
    if(sound){
      const on=sound.classList.contains("active");
      sound.setAttribute("aria-pressed",String(on));
      sound.setAttribute("aria-label",on?"Выключить звук":"Включить звук");
      sound.title=on?"Выключить звук":"Включить звук";
    }

    const picker=q("#chapterPicker");
    const menu=q("#chapterMenu");
    if(picker&&menu){
      picker.setAttribute("aria-controls","chapterMenu");
      picker.setAttribute("aria-haspopup","true");
      picker.setAttribute("aria-expanded",String(menu.classList.contains("open")));
    }

    qa(".tab,.mobileCourseBtn,.readerTab").forEach(el=>{
      const active=el.classList.contains("active");
      el.setAttribute("aria-selected",String(active));
      if(active)el.setAttribute("aria-current","page");
      else el.removeAttribute("aria-current");
    });

    qa(".topicRailItem").forEach(el=>{
      if(el.classList.contains("active"))el.setAttribute("aria-current","step");
      else el.removeAttribute("aria-current");
    });

    qa(".carouselDot").forEach(el=>{
      const active=el.classList.contains("active");
      el.setAttribute("aria-pressed",String(active));
    });

    qa(".page").forEach(el=>{
      el.setAttribute("aria-hidden",String(!el.classList.contains("active")));
    });
  }

  function closeChapterMenu(){
    const menu=q("#chapterMenu");
    const picker=q("#chapterPicker");
    if(menu?.classList.contains("open")){
      menu.classList.remove("open");
      picker?.setAttribute("aria-expanded","false");
    }
  }

  document.addEventListener("click",e=>{
    const menu=q("#chapterMenu");
    const picker=q("#chapterPicker");
    if(menu&&picker&&!menu.contains(e.target)&&!picker.contains(e.target))closeChapterMenu();
  });

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){
      const wasOpen=q("#chapterMenu")?.classList.contains("open");
      closeChapterMenu();
      if(wasOpen)q("#chapterPicker")?.focus();
    }
  });

  const observer=new MutationObserver(()=>requestAnimationFrame(syncA11y));
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","disabled"]});

  window.addEventListener("pageshow",syncA11y);
  syncA11y();
})();
