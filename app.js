const track = document.getElementById("track");
const train = document.getElementById("train");
const ledText = document.querySelector(".led-text");
const ledKo = document.getElementById("led-ko");
const ledEn = document.getElementById("led-en");
const alight = document.getElementById("alight");
const stations = [...track.querySelectorAll(".station:not(.station-soon)")];
track.querySelector(".line").style.setProperty("--count", track.querySelectorAll(".station").length);
const vertical = matchMedia("(max-width: 899px)");
const touch = matchMedia("(hover: none)");
let active = null;
let ready = false;

const memory = {
  get() {
    try { return sessionStorage.getItem("ko-station"); } catch { return null; }
  },
  set(code) {
    try { sessionStorage.setItem("ko-station", code); } catch {}
  },
};
let notices = [];
let noticeIndex = 0;

const codeOf = (s) => s.querySelector(".code").textContent;
const nameOf = (s) => s.querySelector(".ko").textContent;
const enOf = (s) => s.querySelector(".en").textContent;

function park(station) {
  const dot = station.querySelector(".dot").getBoundingClientRect();
  const box = track.getBoundingClientRect();
  train.style.setProperty("--tx", `${dot.left + dot.width / 2 - box.left + track.scrollLeft}px`);
  train.style.setProperty("--ty", `${dot.top + dot.height / 2 - box.top}px`);
}

function marquee(span) {
  span.classList.remove("run");
  const overflow = span.scrollWidth - ledText.clientWidth;
  if (overflow <= 0) return;
  span.style.setProperty("--run", `${-overflow - 8}px`);
  span.style.setProperty("--run-steps", Math.ceil(overflow / 6));
  span.style.setProperty("--run-time", `${Math.max(3, overflow / 40)}s`);
  span.classList.add("run");
}

function flip() {
  ledText.classList.remove("flip");
  void ledText.offsetWidth;
  ledText.classList.add("flip");
}

function arrive(station) {
  if (station === active) return;
  active = station;
  const index = stations.indexOf(station);
  stations.forEach((s, i) => s.classList.toggle("is-active", i === index));
  park(station);
  alight.href = station.querySelector(".stop").href;

  const next = stations[index + 1];
  notices = [
    `This stop is ${enOf(station)}`,
    next ? `다음 역은 ${nameOf(next)} 역입니다` : "다음 역은 공사 중입니다",
    "내리실 문은 오른쪽입니다",
  ];
  noticeIndex = 0;
  ledKo.textContent = `이번 역은 ${nameOf(station)} 역입니다`;
  ledEn.textContent = notices[0];
  flip();
  marquee(ledKo);
  marquee(ledEn);
}

setInterval(() => {
  if (!notices.length) return;
  noticeIndex = (noticeIndex + 1) % notices.length;
  ledEn.textContent = notices[noticeIndex];
  marquee(ledEn);
}, 3500);

ledText.addEventListener("animationend", (e) => {
  if (e.animationName === "flip") ledText.classList.remove("flip");
});

stations.forEach((station) => {
  const stop = station.querySelector(".stop");
  stop.addEventListener("click", () => memory.set(codeOf(station)));
  stop.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && arrive(station));
  stop.addEventListener("focus", () => arrive(station));
});

const pageWatcher = new IntersectionObserver(
  (entries) => {
    if (!ready || !vertical.matches) return;
    const hit = entries.find((e) => e.isIntersecting);
    if (hit) arrive(hit.target);
  },
  { rootMargin: "-45% 0px -45% 0px" },
);

const trackWatcher = new IntersectionObserver(
  (entries) => {
    if (!ready || vertical.matches || !touch.matches) return;
    const hit = entries.find((e) => e.isIntersecting);
    if (hit) arrive(hit.target);
  },
  { root: track, rootMargin: "0px -45% 0px -45%" },
);

stations.forEach((s) => {
  pageWatcher.observe(s);
  trackWatcher.observe(s);
});

function measure() {
  track.classList.toggle("has-more", track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
}

track.addEventListener("scroll", measure, { passive: true });

track.addEventListener(
  "wheel",
  (e) => {
    if (vertical.matches || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    const max = track.scrollWidth - track.clientWidth;
    if (max <= 0) return;
    const atEdge = (e.deltaY < 0 && track.scrollLeft <= 0) || (e.deltaY > 0 && track.scrollLeft >= max - 1);
    if (atEdge) return;
    e.preventDefault();
    track.scrollLeft += e.deltaY;
  },
  { passive: false },
);

addEventListener("resize", () => {
  measure();
  if (active) park(active);
});

alight.addEventListener("click", () => active && memory.set(codeOf(active)));

function place(station) {
  train.style.transition = "none";
  arrive(station);
  void train.offsetWidth;
  train.style.transition = "";
}

function centered() {
  const mid = innerHeight / 2;
  return stations.find((s) => {
    const r = s.getBoundingClientRect();
    return r.top <= mid && r.bottom >= mid;
  });
}

function enter(first) {
  const axis = vertical.matches ? "--ty" : "--tx";
  park(first);
  const target = train.style.getPropertyValue(axis);
  train.style.transition = "none";
  train.style.setProperty(axis, "-80px");
  void train.offsetWidth;
  train.style.transition = "";
  arrive(first);
  train.style.setProperty(axis, target);
}

function start() {
  const kind = performance.getEntriesByType("navigation")[0]?.type;
  const returning = kind === "back_forward" || kind === "reload";
  const saved = returning && stations.find((s) => codeOf(s) === memory.get());
  if (vertical.matches && returning) {
    place(centered() || saved || stations[0]);
  } else if (saved) {
    saved.scrollIntoView({ block: "nearest", inline: "center" });
    place(saved);
  } else {
    enter(stations[0]);
  }
  ready = true;
}

measure();
requestAnimationFrame(start);

const clock = document.getElementById("clock");
const seoul = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" });
const tick = () => { clock.textContent = seoul.format(new Date()); };
tick();
setInterval(tick, 15000);
