/* =============================================================
   common.js  |  국립중앙박물관 메인 스크립트
   ============================================================= */

/* ── 언어 드롭다운 ── */
function toggleLang() {
  document.getElementById('langDropdown').classList.toggle('open');
}

/* ── 전체메뉴 열기/닫기 ── */
function toggleMegaMenu() {
  const menu        = document.getElementById('megaMenu');
  const toggle      = document.getElementById('menuToggle');
  const combinedBtn = document.getElementById('combinedMenuBtn');
  const header      = document.getElementById('siteHeader');
  const isOpen      = menu.classList.contains('open');

  menu.style.paddingTop = header.offsetHeight + 'px';

  if (isOpen) {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.textContent = '더 보기 ☰';
    toggle.classList.remove('active-menu');
    if (combinedBtn) combinedBtn.classList.remove('is-open');
  } else {
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.textContent = '닫기 ✕';
    toggle.classList.add('active-menu');
    header.classList.remove('hide');
    if (combinedBtn) combinedBtn.classList.add('is-open');
    if (window.innerWidth <= 768) {
      const searchInput = menu.querySelector('.mega-menu__search-input');
      if (searchInput) setTimeout(() => searchInput.focus(), 420);
    }
  }
}

/* ── 검색바 ── */
function toggleSearch() {
  const bar     = document.getElementById('searchBar');
  const overlay = document.getElementById('searchOverlay');
  const header  = document.getElementById('siteHeader');
  bar.style.top = header.offsetHeight + 'px';
  bar.classList.toggle('open');
  overlay.classList.toggle('open');
  if (bar.classList.contains('open')) bar.querySelector('.search-bar__input').focus();
}
function closeSearch() {
  document.getElementById('searchBar').classList.remove('open');
  document.getElementById('searchOverlay').classList.remove('open');
}

/* ── 섹션 스크롤 이동 ── */
function scrollToSection(targetId) {
  const target = document.getElementById(targetId);
  const header = document.getElementById('siteHeader');
  const nav    = document.getElementById('scrollspyNav');
  if (!target) return;
  const headerH = header.classList.contains('hide') ? 0 : header.offsetHeight;
  const navH    = nav ? nav.offsetHeight : 0;
  const top     = target.getBoundingClientRect().top + window.scrollY - headerH - navH;
  window.scrollTo({ top, behavior: 'smooth' });
}

/* ── 층별안내 탭 ── */
function switchFloor(btn, targetId) {
  document.querySelectorAll('.floor-tab').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.floor-content').forEach(el => el.classList.remove('active'));
  document.getElementById(targetId).classList.add('active');
}

/* ── FAQ ── */
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
}

/* ── 소속 박물관 드롭다운 ── */
function toggleAffiliate() {
  const list = document.getElementById('affiliateList');
  const btn  = list.previousElementSibling;
  list.classList.toggle('open');
  btn.setAttribute('aria-expanded', list.classList.contains('open'));
}

/* ── 메가메뉴 아코디언 (모바일) ── */
function toggleMegaCol(titleEl) {
  if (window.innerWidth > 768) return;
  titleEl.parentElement.classList.toggle('open');
}

/* ── hero 탭 ── */
function switchHeroTab(btn, targetId) {
  document.querySelectorAll('.hero__tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.hero__hours-wrap, .hero__access').forEach(el => el.classList.remove('active'));
  document.getElementById(targetId).classList.add('active');
}


/* =============================================================
   전시 슬라이더
============================================================= */

let currentType = 'special';
let slideTimer;

function switchExhibitionTab(btn, type) {
  currentType = type;
  document.querySelectorAll('.exhibition__tab').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.exhi-slider__img').forEach(img => img.classList.remove('active'));
  document.querySelectorAll('.exhi-slide-text').forEach(txt => txt.classList.remove('active'));
  const typeImgs  = document.querySelectorAll(`.exhi-slider__img[data-type="${type}"]`);
  const typeTexts = document.querySelectorAll(`.exhi-slide-text[data-type="${type}"]`);
  if (typeImgs[0])  typeImgs[0].classList.add('active');
  if (typeTexts[0]) typeTexts[0].classList.add('active');
  renderDots();
  resetSlideTimer();
}

function moveSlide(direction) {
  const typeImgs  = Array.from(document.querySelectorAll(`.exhi-slider__img[data-type="${currentType}"]`));
  const typeTexts = Array.from(document.querySelectorAll(`.exhi-slide-text[data-type="${currentType}"]`));
  if (typeImgs.length === 0) return;
  const activeIdx = typeImgs.findIndex(img => img.classList.contains('active'));
  typeImgs[activeIdx].classList.remove('active');
  typeTexts[activeIdx]?.classList.remove('active');
  const nextIdx = (activeIdx + direction + typeImgs.length) % typeImgs.length;
  typeImgs[nextIdx].classList.add('active');
  typeTexts[nextIdx]?.classList.add('active');
  updateDots(nextIdx);
  resetSlideTimer();
}

function goToSlide(index) {
  const typeImgs  = Array.from(document.querySelectorAll(`.exhi-slider__img[data-type="${currentType}"]`));
  const typeTexts = Array.from(document.querySelectorAll(`.exhi-slide-text[data-type="${currentType}"]`));
  typeImgs.forEach(img => img.classList.remove('active'));
  typeTexts.forEach(txt => txt.classList.remove('active'));
  if (typeImgs[index])  typeImgs[index].classList.add('active');
  if (typeTexts[index]) typeTexts[index].classList.add('active');
  updateDots(index);
  resetSlideTimer();
}

function renderDots() {
  const container = document.getElementById('exhiDots');
  if (!container) return;
  const typeImgs  = document.querySelectorAll(`.exhi-slider__img[data-type="${currentType}"]`);
  const activeIdx = Array.from(typeImgs).findIndex(img => img.classList.contains('active'));
  container.innerHTML = '';
  typeImgs.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'exhi-dot' + (i === activeIdx ? ' active' : '');
    dot.setAttribute('aria-label', `${i + 1}번 전시`);
    dot.addEventListener('click', () => goToSlide(i));
    container.appendChild(dot);
  });
}

function updateDots(activeIdx) {
  document.querySelectorAll('.exhi-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === activeIdx);
  });
}

function startSlideTimer() {
  slideTimer = setInterval(() => moveSlide(1), 5000);
}
function resetSlideTimer() {
  clearInterval(slideTimer);
  startSlideTimer();
}


/* =============================================================
   뮤지엄 굿즈 슬라이더
============================================================= */

let goodsPage = 0;

function getGoodsVisible() {
  if (window.innerWidth > 1024) return 4;
  if (window.innerWidth > 768)  return 3;
  return 2;
}

function getGoodsGap() {
  return window.innerWidth <= 768 ? 16 : 24;
}

function moveGoods(dir) {
  const visible    = getGoodsVisible();
  const total      = document.querySelectorAll('.goods-card').length;
  const totalPages = Math.ceil(total / visible);
  goodsPage = (goodsPage + dir + totalPages) % totalPages;
  slideGoodsTo(goodsPage);
  renderGoodsDots();
}

function goToGoodsPage(page) {
  goodsPage = page;
  slideGoodsTo(page);
  renderGoodsDots();
}

function slideGoodsTo(page) {
  const track = document.getElementById('goodsTrack');
  if (!track) return;
  const firstCard = track.querySelector('.goods-card');
  if (!firstCard) return;
  const visible   = getGoodsVisible();
  const total     = document.querySelectorAll('.goods-card').length;
  const gap       = getGoodsGap();
  const cardWidth = firstCard.offsetWidth + gap;
  const maxOffset = total - visible;
  const offset    = Math.min(page * visible, maxOffset);
  track.style.transform = `translateX(-${offset * cardWidth}px)`;
}

function renderGoodsDots() {
  const container = document.getElementById('goodsDots');
  if (!container) return;
  const visible    = getGoodsVisible();
  const total      = document.querySelectorAll('.goods-card').length;
  const totalPages = Math.ceil(total / visible);
  container.innerHTML = '';
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement('button');
    dot.className   = 'goods-dot' + (i === goodsPage ? ' active' : '');
    dot.setAttribute('aria-label', `${i + 1}페이지`);
    dot.addEventListener('click', () => goToGoodsPage(i));
    container.appendChild(dot);
  }
}


/* =============================================================
   페이지 로드 시 자동 실행
============================================================= */
document.addEventListener('DOMContentLoaded', function () {

  /* ── 전시 슬라이더 초기화 ── */
  renderDots();
  startSlideTimer();

  /* ── 굿즈 슬라이더 초기화 ── */
  renderGoodsDots();

  /* 화면 크기 바뀌면 굿즈 슬라이더 리셋 */
  window.addEventListener('resize', () => {
    goodsPage = 0;
    const track = document.getElementById('goodsTrack');
    if (track) track.style.transform = 'translateX(0)';
    renderGoodsDots();
  });

  /* ── 헤더 스크롤 숨김/표시 ── */
  let lastScrollY = 0;
  const header = document.getElementById('siteHeader');

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const menu         = document.getElementById('megaMenu');
    const searchBar    = document.getElementById('searchBar');
    const menuIsOpen   = menu && menu.classList.contains('open');
    const searchIsOpen = searchBar && searchBar.classList.contains('open');

    if (currentScrollY > lastScrollY && currentScrollY > 400) {
      if (menuIsOpen) { toggleMegaMenu(); } else { header.classList.add('hide'); }
      if (searchIsOpen) searchBar.style.top = '0px';
    } else {
      header.classList.remove('hide');
      if (searchIsOpen) searchBar.style.top = header.offsetHeight + 'px';
    }
    lastScrollY = currentScrollY;
  });

  /* ── 언어 드롭다운 외부 클릭 닫기 ── */
  document.addEventListener('click', (e) => {
    const wrap = document.querySelector('.lang-wrap');
    if (wrap && !wrap.contains(e.target)) {
      document.getElementById('langDropdown').classList.remove('open');
    }
  });

  /* ── ESC 키 ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const menu = document.getElementById('megaMenu');
      if (menu && menu.classList.contains('open')) toggleMegaMenu();
      closeSearch();
    }
  });

  /* ── Fade-in 애니메이션 ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  /* ── 오늘 운영시간 자동 표시 ── */
  const today    = new Date();
  const month    = today.getMonth() + 1;
  const date     = today.getDate();
  const day      = today.getDay();
  const dayNames = ['일','월','화','수','목','금','토'];
  const dayName  = dayNames[day];
  const badge    = document.querySelector('.hero__open-badge');
  const timeText = document.querySelector('.hero__hours-today-text');
  if (badge && timeText) {
    if (month === 1 && date === 1) {
      badge.textContent = '휴관일';
      badge.style.cssText = 'background:#333; color:#fff; border-color:#333;';
      timeText.textContent = '오늘(' + dayName + ') 휴관입니다';
    } else if (day === 3 || day === 6) {
      timeText.textContent = '오늘(' + dayName + ') 09:30 ~ 21:00';
    } else {
      timeText.textContent = '오늘(' + dayName + ') 09:30 ~ 17:30';
    }
  }

  /* ── 스크롤스파이 ── */
  const spySections = ['visitInfo','floorGuide','facilitiesSection','accessSection','faqSection'];
  const navItems    = document.querySelectorAll('.scrollspy-nav__item');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(item => item.classList.remove('active'));
        const active = document.querySelector(`.scrollspy-nav__item[data-target="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  spySections.forEach(id => {
    const el = document.getElementById(id);
    if (el) spyObserver.observe(el);
  });

  /* ── 스크롤스파이 네비 top 조절 ── */
  const scrollspyNav = document.getElementById('scrollspyNav');
  window.addEventListener('scroll', () => {
    if (scrollspyNav) {
      scrollspyNav.style.top = header.classList.contains('hide') ? '0px' : header.offsetHeight + 'px';
    }
  });

  /* ── TOP 버튼 ── */
  const topBtn = document.getElementById('topBtn');
  let lastScrollForTop = 0;
  if (topBtn) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      if (currentScroll < lastScrollForTop && currentScroll > 300) {
        topBtn.classList.add('visible');
      } else {
        topBtn.classList.remove('visible');
      }
      lastScrollForTop = currentScroll;
    });
  }

}); /* ── DOMContentLoaded 끝 ── */


/* ── 관람 유의사항 아코디언 ── */
function toggleGuideline(btn) {
  const item   = btn.closest('.guideline-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.guideline-item').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.guideline-item__q').setAttribute('aria-expanded', 'false');
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

/* ── 편의시설 탭 전환 ── */
function switchFacilityTab(btn, targetId) {
  document.querySelectorAll('.facility-tab').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.facility-tab-content').forEach(el => el.classList.remove('active'));
  document.getElementById(targetId).classList.add('active');
}