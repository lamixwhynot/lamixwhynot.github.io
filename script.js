/* ============================================================
   script.js — общий скрипт для всех страниц
   ============================================================ */

// ──────────────────────────────────────────────────────────────
//  ✏️  НАСТРОЙ ДАТУ начала отношений
//      Формат: new Date(год, месяц-1, день, часы, минуты)
//      Пример: 14 февраля 2023, 18:30 → new Date(2023, 1, 14, 18, 30)
// ──────────────────────────────────────────────────────────────
const START_DATE = new Date(2025, 11, 14, 22, 20); // ← ЗАМЕНИ ЭТУ ДАТУ


/* ──────────────── TIMER ──────────────── */
function updateTimer() {
  const daysEl    = document.getElementById('days');
  const hoursEl   = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  if (!daysEl) return;

  const diff = Date.now() - START_DATE.getTime();
  if (diff < 0) { daysEl.textContent = '000'; return; }

  const totalMin  = Math.floor(diff / 60000);
  const totalHrs  = Math.floor(totalMin  / 60);
  const days      = Math.floor(totalHrs  / 24);
  const hours     = totalHrs  % 24;
  const minutes   = totalMin  % 60;

  daysEl.textContent    = String(days).padStart(3, '0');
  hoursEl.textContent   = String(hours).padStart(2, '0');
  minutesEl.textContent = String(minutes).padStart(2, '0');
}

updateTimer();
setInterval(updateTimer, 10000); // обновлять каждые 10 секунд


/* ──────────────── HEART DRAWING ANIMATION ──────────────── */
(function () {
  const path   = document.getElementById('heart-path');
  const svg    = document.querySelector('.heart-svg');
  const tip    = document.getElementById('pencil-tip');
  const ring   = document.getElementById('pencil-ring');
  if (!path || !svg) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    svg.classList.add('drawn', 'shaded', 'pass2', 'beating');
    document.querySelectorAll('.sp').forEach(el => el.classList.add('pop'));
    return;
  }

  const totalLen    = path.getTotalLength();
  const DRAW_MS     = 2300; // длительность отрисовки

  // Кривая ускорения (ease-in-out)
  function ease(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // Скрыть путь
  path.style.strokeDasharray  = totalLen;
  path.style.strokeDashoffset = totalLen;

  let startTime = null;
  let tipShown  = false;

  function frame(now) {
    if (!startTime) startTime = now;
    const raw      = Math.min((now - startTime) / DRAW_MS, 1);
    const progress = ease(raw);

    // Двигаем штрих
    path.style.strokeDashoffset = totalLen * (1 - progress);

    // Двигаем кончик карандаша
    const pt = path.getPointAtLength(progress * totalLen);
    tip.setAttribute('cx', pt.x);
    tip.setAttribute('cy', pt.y);
    ring.setAttribute('cx', pt.x);
    ring.setAttribute('cy', pt.y);

    // Показываем кончик при первом кадре
    if (!tipShown) {
      tip.style.transition  = 'opacity 0.25s';
      ring.style.transition = 'opacity 0.25s';
      tip.style.opacity     = '1';
      ring.style.opacity    = '0.55';
      tipShown = true;
    }

    if (raw < 1) {
      requestAnimationFrame(frame);
      return;
    }

    // === Отрисовка завершена ===

    // Убираем кончик карандаша
    tip.style.transition  = 'opacity 0.5s';
    ring.style.transition = 'opacity 0.5s';
    tip.style.opacity     = '0';
    ring.style.opacity    = '0';

    // Заливка + штриховка + второй проход
    setTimeout(() => {
      svg.classList.add('drawn');   // мягкая заливка
      svg.classList.add('shaded');  // карандашная штриховка
    }, 100);

    setTimeout(() => {
      svg.classList.add('pass2');   // пунктирный второй проход
    }, 350);

    // Искорки
    setTimeout(() => {
      document.querySelectorAll('.sp').forEach(el => el.classList.add('pop'));
    }, 500);

    // Биение сердца
    setTimeout(() => {
      svg.classList.add('beating');
    }, 1500);
  }

  // Небольшая задержка перед стартом
  setTimeout(() => requestAnimationFrame(frame), 350);
})();


/* ──────────────── SCROLL REVEAL (reasons list) ──────────────── */
(function () {
  const items = document.querySelectorAll('.r-item');
  if (!items.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    items.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // небольшая задержка для каждого следующего элемента
          const index = Array.from(items).indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('visible'), index * 70);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach(el => observer.observe(el));
})();
