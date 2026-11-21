(function(){
  var d=document, b=d.body;
  // menu
  var bur=d.getElementById('burger'), nav=d.getElementById('nav');
  function closeMenu(){b.classList.remove('menu-open');bur.setAttribute('aria-expanded','false');bur.setAttribute('aria-label','Otwórz menu');}
  bur.addEventListener('click',function(){var o=b.classList.toggle('menu-open');bur.setAttribute('aria-expanded',o?'true':'false');bur.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu');});
  nav.addEventListener('click',function(e){if(e.target.closest('a'))closeMenu();});
  d.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu();});

  // przeciąganie myszą dla torów przewijanych
  function dragScroll(t){
    var down=false,sx=0,sl=0,moved=false;
    t.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=t.scrollLeft;t.style.scrollSnapType='none';});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>5)moved=true;t.scrollLeft=sl-dx;});
    window.addEventListener('pointerup',function(){if(!down)return;down=false;t.style.scrollSnapType='';var w=t.clientWidth;});
    t.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false;}},true);
    t.addEventListener('dragstart',function(e){e.preventDefault();});
  }

  // karuzele w kartach
  d.querySelectorAll('[data-car]').forEach(function(c){
    var t=c.querySelector('.track'), imgs=t.querySelectorAll('img'), n=imgs.length;
    if(n<2)return;
    var dots=d.createElement('div');dots.className='dots';
    for(var i=0;i<n;i++){dots.appendChild(d.createElement('i'));}
    var p=d.createElement('button'),nx=d.createElement('button');
    p.className='arr p';nx.className='arr n';p.innerHTML='&#8249;';nx.innerHTML='&#8250;';p.setAttribute('aria-label','Poprzednie zdjęcie');nx.setAttribute('aria-label','Następne zdjęcie');
    c.appendChild(p);c.appendChild(nx);c.appendChild(dots);
    function idx(){return Math.round(t.scrollLeft/t.clientWidth);}
    function upd(){var k=idx();dots.querySelectorAll('i').forEach(function(x,j){x.classList.toggle('on',j===k);});p.disabled=k<=0;nx.disabled=k>=n-1;}
    p.addEventListener('click',function(){t.scrollTo({left:(idx()-1)*t.clientWidth,behavior:'smooth'});});
    nx.addEventListener('click',function(){t.scrollTo({left:(idx()+1)*t.clientWidth,behavior:'smooth'});});
    t.addEventListener('scroll',function(){requestAnimationFrame(upd);},{passive:true});
    dragScroll(t);upd();
  });

  // pas zdjęć czapek
  d.querySelectorAll('[data-strip]').forEach(function(s){
    var t=s.querySelector('.track'),p=s.querySelector('.ctl .p'),n=s.querySelector('.ctl .n');
    function step(){var f=t.querySelector('figure');return f?f.getBoundingClientRect().width+parseFloat(getComputedStyle(t).columnGap||16):300;}
    function upd(){p.disabled=t.scrollLeft<4;n.disabled=t.scrollLeft+t.clientWidth>=t.scrollWidth-4;}
    p.addEventListener('click',function(){t.scrollBy({left:-step(),behavior:'smooth'});});
    n.addEventListener('click',function(){t.scrollBy({left:step(),behavior:'smooth'});});
    t.addEventListener('scroll',function(){requestAnimationFrame(upd);},{passive:true});
    window.addEventListener('resize',upd);
    dragScroll(t);upd();
  });

  // lightbox
  var lb=d.getElementById('lb'),lim=lb.querySelector('img'),cap=lb.querySelector('.cap'),cnt=lb.querySelector('.cnt'),list=[],cur=0,last=null;
  function srcOf(el){return el.getAttribute('data-full')||el.getAttribute('href');}
  function show(i){cur=(i+list.length)%list.length;var el=list[cur];lim.src=srcOf(el);var im=el.tagName==='IMG'?el:el.querySelector('img');lim.alt=im?im.alt:'';cap.textContent=el.getAttribute('data-cap')||'';cnt.textContent=(cur+1)+' / '+list.length;lb.querySelector('.pv').hidden=lb.querySelector('.nx').hidden=list.length<2;
    var nxt=list[(cur+1)%list.length];if(nxt&&'requestIdleCallback' in window){requestIdleCallback(function(){var x=new Image();x.src=srcOf(nxt);});}}
  function open(el){var g=el.getAttribute('data-lb');list=[].slice.call(d.querySelectorAll('[data-lb="'+g+'"]'));last=d.activeElement;lb.hidden=false;lb.classList.add('on');b.style.overflow='hidden';show(list.indexOf(el));lb.querySelector('.x').focus();}
  function close(){lb.classList.remove('on');lb.hidden=true;b.style.overflow='';lim.removeAttribute('src');if(last)last.focus();}
  d.addEventListener('click',function(e){var el=e.target.closest('[data-lb]');if(!el||lb.contains(el))return;e.preventDefault();open(el);});
  d.querySelectorAll('figure[data-lb], img[data-lb]').forEach(function(el){el.tabIndex=0;el.setAttribute('role','button');el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(el);}});});
  lb.querySelector('.x').addEventListener('click',close);
  lb.querySelector('.pv').addEventListener('click',function(){show(cur-1);});
  lb.querySelector('.nx').addEventListener('click',function(){show(cur+1);});
  lb.addEventListener('click',function(e){if(e.target===lb)close();});
  d.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1);});
  var tx=null;lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;},{passive:true});
  lb.addEventListener('touchend',function(e){if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>40)show(cur+(dx<0?1:-1));tx=null;});

  // aktywna pozycja menu
  var links=[].slice.call(nav.querySelectorAll('a[href^="#"]'));
  if('IntersectionObserver' in window){var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id);});}});},{rootMargin:'-45% 0px -50% 0px'});
  links.forEach(function(a){var t=d.getElementById(a.getAttribute('href').slice(1));if(t)so.observe(t);});}

  // mapa dopiero przy przewinięciu
  var m=d.getElementById('map');
  if(m&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){var f=d.createElement('iframe');f.src=m.getAttribute('data-src');f.loading='lazy';f.title='Mapa: ul. Edwarda Dembowskiego 7, Sanok';f.referrerPolicy='no-referrer-when-downgrade';m.appendChild(f);io.disconnect();}},{rootMargin:'300px'});io.observe(m);}

  // formularz pokazowy
  var f=d.getElementById('form');
  f.addEventListener('submit',function(e){e.preventDefault();var o=f.querySelector('.ok');if(!o){o=d.createElement('p');o.className='ok';f.appendChild(o);}o.textContent='Dziękujemy. To podgląd strony, więc formularz niczego nie wysyła. Na docelowej stronie zapytanie trafi na laboratorium@desinger.pl.';});
})();
