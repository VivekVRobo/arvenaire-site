/** ARVENAIRE blog index interaction only. Article content stays in semantic HTML pages. */
(function(){
  'use strict';
  function init(){
    const grid=document.querySelector('[data-blog-grid]');
    const buttons=[...document.querySelectorAll('[data-blog-filter]')];
    if(!grid||!buttons.length)return;
    buttons.forEach(button=>button.addEventListener('click',()=>{
      const category=button.dataset.blogFilter||'all';
      buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      grid.querySelectorAll('[data-blog-card]').forEach(card=>{
        card.hidden=category!=='all'&&card.dataset.blogCategory!==category;
      });
    }));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
