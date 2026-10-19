const explorer = document.getElementById("explorer");
const task = document.getElementById("task");
const detailsName = document.getElementById("details-name");
const detailsDesc = document.getElementById("details-desc");
const detailsOpen = document.getElementById("details-open");
const statusBar = document.getElementById("status");
const files = [...document.querySelectorAll(".file")];
const coarse = matchMedia("(any-pointer: coarse)");
const reopen = document.getElementById("reopen");

statusBar.textContent = `개체 ${files.length}개 · 두 번 눌러 실행`;
detailsName.textContent = `미니게임 ${files.length}개`;

function select(file) {
  files.forEach((f) => f.classList.toggle("selected", f === file));
  const name = file.querySelector(".file-name").textContent;
  detailsName.textContent = name;
  detailsDesc.textContent = file.dataset.desc;
  detailsOpen.href = file.href;
  detailsOpen.hidden = false;
  statusBar.textContent = `${name} 선택됨`;
}

files.forEach((file) => {
  file.addEventListener("click", (e) => {
    const touch = e.pointerType ? e.pointerType !== "mouse" : coarse.matches;
    if (touch || e.detail === 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    select(file);
  });
  file.addEventListener("dblclick", () => {
    location.href = file.href;
  });
  file.addEventListener("focus", () => select(file));
});

function showWindow(show) {
  explorer.hidden = !show;
  task.setAttribute("aria-pressed", String(show));
  (show ? explorer : reopen).focus();
}

document.querySelectorAll("[data-hide]").forEach((b) => b.addEventListener("click", () => showWindow(false)));
reopen.addEventListener("click", () => showWindow(true));
task.addEventListener("click", () => showWindow(explorer.hidden));

const clock = document.getElementById("clock");
function tick() {
  clock.textContent = new Date().toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
}
tick();
setInterval(tick, 10000);
