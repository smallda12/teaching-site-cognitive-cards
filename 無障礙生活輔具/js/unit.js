// 「食物」單元：4 步驟導覽切換 + Step① 圖卡認識（全部呈現／逐張瀏覽＋自動播放）
document.addEventListener('DOMContentLoaded', () => {

  // ---------- 4 步驟導覽 ----------
  const stepBtns = Array.from(document.querySelectorAll('.step-btn'));
  const panels = Array.from(document.querySelectorAll('.step-panel'));
  const cardAudio = document.getElementById('cardAudio');

  function goToStep(step){
    stepBtns.forEach(b => b.classList.toggle('active', b.dataset.step === step));
    panels.forEach(p => p.classList.toggle('active', p.dataset.step === step));
    if (step !== '1') stopAuto();
    window.scrollTo({top:0, behavior:'smooth'});
  }
  stepBtns.forEach(btn => btn.addEventListener('click', () => goToStep(btn.dataset.step)));

  // ---------- Step①：全部呈現，點卡片聽發音 ----------
  document.querySelectorAll('.flash-card').forEach(card => {
    card.addEventListener('click', () => {
      const src = card.dataset.audio;
      if (!src) return;
      stopAuto();
      cardAudio.src = src;
      cardAudio.currentTime = 0;
      cardAudio.play().catch(() => {});
    });
  });

  // ---------- Step①：全部呈現／逐張瀏覽 切換 ----------
  const viewBtns = Array.from(document.querySelectorAll('.view-btn'));
  const viewPanels = Array.from(document.querySelectorAll('.view-panel'));

  // 圖卡資料直接從「全部呈現」的既有 DOM 讀出來，不另外重打一份清單，
  // 避免以後改圖卡內容時，兩邊的文字/路徑各改一次而漂移。
  const items = [];
  document.querySelectorAll('.view-panel[data-view="grid"] .group-heading').forEach(heading => {
    const group = heading.textContent.trim();
    const grid = heading.nextElementSibling;
    if (!grid) return;
    grid.querySelectorAll('.flash-card').forEach(card => {
      items.push({
        group,
        img: card.querySelector('img').getAttribute('src'),
        label: card.querySelector('.label').textContent,
        audio: card.dataset.audio,
      });
    });
  });

  let idx = 0;
  let autoPlay = false;
  let autoTimer = null;

  const singleGroupEl = document.getElementById('singleGroup');
  const singleCountEl = document.getElementById('singleCount');
  const singleImgEl = document.getElementById('singleImg');
  const singleLabelEl = document.getElementById('singleLabel');
  const singlePrevBtn = document.getElementById('singlePrev');
  const singleNextBtn = document.getElementById('singleNext');
  const singlePlayBtn = document.getElementById('singlePlay');
  const singleAutoBtn = document.getElementById('singleAuto');

  function renderSingle(playAudio){
    const it = items[idx];
    if (!it) return;
    singleGroupEl.textContent = it.group;
    singleCountEl.textContent = (idx+1) + ' / ' + items.length;
    singleImgEl.src = it.img;
    singleImgEl.alt = it.label;
    singleLabelEl.textContent = it.label;
    singlePrevBtn.disabled = idx === 0;
    singleNextBtn.disabled = idx === items.length - 1;
    singlePlayBtn.classList.remove('playing');
    if (playAudio) playCurrent();
  }

  function playCurrent(){
    const it = items[idx];
    if (!it) return;
    cardAudio.src = it.audio;
    cardAudio.currentTime = 0;
    const p = cardAudio.play();
    if (p !== undefined){
      p.then(() => singlePlayBtn.classList.add('playing')).catch(() => {});
    }
  }

  function goToSingle(i, playAudio){
    if (i < 0 || i >= items.length) return;
    idx = i;
    renderSingle(playAudio !== false);
  }

  function updateAutoBtn(){
    singleAutoBtn.classList.toggle('active', autoPlay);
    singleAutoBtn.textContent = autoPlay ? '⏸ 停止自動播放' : '▶ 自動播放';
  }

  function stopAuto(){
    autoPlay = false;
    updateAutoBtn();
    clearTimeout(autoTimer);
  }

  singlePrevBtn.addEventListener('click', () => { stopAuto(); goToSingle(idx - 1); });
  singleNextBtn.addEventListener('click', () => { stopAuto(); goToSingle(idx + 1); });
  singlePlayBtn.addEventListener('click', () => playCurrent());

  singleAutoBtn.addEventListener('click', () => {
    autoPlay = !autoPlay;
    updateAutoBtn();
    if (autoPlay) playCurrent();
    else clearTimeout(autoTimer);
  });

  cardAudio.addEventListener('ended', () => {
    singlePlayBtn.classList.remove('playing');
    if (!autoPlay) return;
    if (idx < items.length - 1){
      autoTimer = setTimeout(() => goToSingle(idx + 1), 700);
    } else {
      stopAuto(); // 播完最後一張，自動停止（不循環），避免在背景一直播下去
    }
  });

  document.addEventListener('keydown', (e) => {
    const singlePanel = document.querySelector('.view-panel[data-view="single"]');
    if (!singlePanel || !singlePanel.classList.contains('active')) return;
    if (e.key === 'ArrowRight'){ stopAuto(); goToSingle(idx + 1); }
    else if (e.key === 'ArrowLeft'){ stopAuto(); goToSingle(idx - 1); }
    else if (e.key === ' '){ e.preventDefault(); playCurrent(); }
  });

  function setView(view){
    viewBtns.forEach(b => b.classList.toggle('active', b.dataset.view === view));
    viewPanels.forEach(p => p.classList.toggle('active', p.dataset.view === view));
    if (view === 'single'){
      renderSingle(false);
    } else {
      stopAuto();
      cardAudio.pause();
    }
  }
  viewBtns.forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));

  setView('grid');
  goToStep('1');
});
