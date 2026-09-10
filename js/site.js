/** ARVENAIRE core-page UI runtime (no network submission logic). */
(function(){
  'use strict';

  function nav(){
    const button=document.querySelector('.app-menu');
    const links=document.querySelector('.app-nav-links');
    if(!button||!links)return;
    button.addEventListener('click',()=>{
      const open=links.classList.toggle('is-open');
      button.setAttribute('aria-expanded',String(open));
    });
    links.addEventListener('click',e=>{
      if(e.target.closest('a')){links.classList.remove('is-open');button.setAttribute('aria-expanded','false');}
    });
  }

  function reveal(){
    const nodes=document.querySelectorAll('.app-reveal');
    if(!nodes.length)return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver'in window)){
      nodes.forEach(n=>n.classList.add('is-visible'));return;
    }
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}
    }),{threshold:.1,rootMargin:'0px 0px -25px'});
    nodes.forEach(n=>io.observe(n));
  }

  function year(){document.querySelectorAll('[data-current-year]').forEach(el=>el.textContent=String(new Date().getFullYear()));}

  function contactTopic(){
    const select=document.querySelector('[data-contact-topic]');
    if(!select)return;
    const requested=new URLSearchParams(location.search).get('topic');
    if(!requested)return;
    const option=[...select.options].find(o=>o.value===requested);
    if(option)select.value=requested;
  }

  function resources(){
    const grid=document.querySelector('[data-resource-grid]');
    const search=document.querySelector('[data-resource-search]');
    const modal=document.querySelector('[data-resource-modal]');
    if(search&&grid){
      search.addEventListener('input',()=>{
        const q=search.value.trim().toLowerCase();
        grid.querySelectorAll('[data-resource-card]').forEach(card=>{
          card.hidden=!!q&&!card.textContent.toLowerCase().includes(q);
        });
      });
    }
    if(!modal)return;
    const form=modal.querySelector('form');
    const title=modal.querySelector('[data-modal-title]');
    const resourceField=modal.querySelector('[name="resource_downloaded"]');
    const close=()=>{modal.classList.remove('is-open');document.body.style.overflow='';};
    document.addEventListener('click',event=>{
      const trigger=event.target.closest('[data-resource-file]');
      if(trigger){
        const file=trigger.dataset.resourceFile;
        const name=trigger.dataset.resourceTitle||'ARVENAIRE resource';
        title.textContent=name;
        resourceField.value=name;
        form.dataset.download=file;
        form.dataset.subject='New Resource Download: '+name;
        modal.classList.add('is-open');
        document.body.style.overflow='hidden';
        modal.querySelector('input[name="name"]')?.focus();
        return;
      }
      if(event.target.closest('[data-modal-close]')||event.target===modal)close();
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&modal.classList.contains('is-open'))close();});
  }

  function init(){nav();reveal();year();contactTopic();resources();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
