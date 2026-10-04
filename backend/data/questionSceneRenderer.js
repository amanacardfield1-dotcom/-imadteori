const W = 1100;
const H = 700;
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const line = (x1, y1, x2, y2, color = '#fff', width = 5, extra = '') => `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
const text = (x, y, value, size = 30, color = '#17212c') => `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="700" fill="${color}" text-anchor="middle">${escape(value)}</text>`;
const circle = (x, y, radius, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" ${extra}/>`;
function arrow(x1, y1, x2, y2) { return line(x1, y1, x2, y2, '#fff', 8, 'marker-end="url(#arrow)"'); }
function car(x, y, letter = 'A', rotation = 0, fill = '#0f7897', truck = false) {
  const height = truck ? 175 : 114;
  return `<g transform="translate(${x} ${y}) rotate(${rotation})">${rect(-42, -height / 2, 84, height, '#18232d', 'rx="15"')}${rect(-36, -height / 2 + 3, 72, height - 6, fill, 'rx="12"')}${rect(-28, -height / 2 + 19, 56, 21, '#d6e8ec', 'rx="4"')}${rect(-27, height / 2 - 36, 54, 18, '#253741', 'rx="3"')}${rect(-43, -height / 2 + 26, 7, 24, '#18232d')}${rect(36, -height / 2 + 26, 7, 24, '#18232d')}${rect(-43, height / 2 - 47, 7, 24, '#18232d')}${rect(36, height / 2 - 47, 7, 24, '#18232d')}${text(0, 12, letter, 30, '#fff')}${rect(-27, -height / 2 + 3, 13, 6, '#ffe49a')}${rect(14, -height / 2 + 3, 13, 6, '#ffe49a')}</g>`;
}
function person(x, y, bike = false) {
  return bike
    ? `<g transform="translate(${x} ${y})">${circle(-20, 17, 16, 'none', 'stroke="#17212c" stroke-width="5"')}${circle(23, 17, 16, 'none', 'stroke="#17212c" stroke-width="5"')}<path d="M-20 17 L-2 -10 L12 17 Z M12 17 L23 17 L14 -20" fill="none" stroke="#17212c" stroke-width="5"/>${circle(4, -35, 10, '#17212c')}${line(4, -23, -2, -6, '#0f7897', 10)}${line(-2, -6, 16, -12, '#17212c', 5)}${line(-2, -6, 10, 12, '#17212c', 5)}</g>`
    : `<g transform="translate(${x} ${y})">${circle(0, -23, 12, '#17212c')}${line(0, -8, 0, 19, '#0f7897', 13)}${line(-17, 2, 17, 2, '#17212c', 6)}${line(0, 16, -13, 35, '#17212c', 6)}${line(0, 16, 13, 35, '#17212c', 6)}</g>`;
}
function road(horizontal = false) {
  return horizontal
    ? rect(0, 230, W, 240, '#47505a') + line(0, 240, W, 240) + line(0, 460, W, 460) + line(0, 350, W, 350, '#fff', 5, 'stroke-dasharray="34 28"')
    : rect(420, 0, 240, H, '#47505a') + line(430, 0, 430, H) + line(650, 0, 650, H) + line(540, 0, 540, H, '#fff', 5, 'stroke-dasharray="34 28"');
}
function zebra(y = 280) { return Array.from({ length: 7 }, (_, i) => rect(438 + i * 29, y, 18, 74, '#fff')).join(''); }
function yieldSign(x, y, size = 72) {
  return `<path d="M${x-size/2} ${y-size/3} L${x+size/2} ${y-size/3} L${x} ${y+size/2} Z" fill="#ffd52b" stroke="#dc0032" stroke-width="${size/9}" stroke-linejoin="round"/>`;
}
function speedSign(x, y, number, radius = 57) { return circle(x, y, radius, '#ffd52b', `stroke="#dc0032" stroke-width="${radius/6}"`) + text(x, y + radius * .23, number, radius * .8); }
function cycleSign(x, y) {
  return rect(x-43, y-48, 86, 96, '#125da2') + `<path d="M${x-37} ${y+38} L${x+37} ${y+38} L${x} ${y-39} Z" fill="#fff"/>` + `<g transform="translate(${x} ${y+7}) scale(.5)">${person(0, 0, true)}</g>` + rect(x-23,y+29,12,5,'#17212c') + rect(x-6,y+29,12,5,'#17212c') + rect(x+11,y+29,12,5,'#17212c');
}
function intersection(v) {
  const exit = ['exit', 'indicator'].includes(v.mode);
  let s = exit ? road(true) + rect(550, 470, 100, 230, '#adb8bf') + rect(445, 500, 330, 160, '#d5dcdf') + rect(550, 470, 100, 230, '#adb8bf')
    : road() + rect(0, 230, W, 240, '#47505a') + line(0, 240, 420, 240) + line(660, 240, W, 240) + line(0, 460, 420, 460) + line(660, 460, W, 460) + line(0, 350, 420, 350, '#fff', 5, 'stroke-dasharray="34 28"') + line(660, 350, W, 350, '#fff', 5, 'stroke-dasharray="34 28"');
  s += car(600, 570) + arrow(600, 492, 600, 410);
  if (exit) s += car(290, 410, 'B', 90, '#a34563') + arrow(360, 410, 450, 410) + rect(760, 520, 65, 70, '#125da2') + text(792, 568, 'P', 44, '#fff');
  else if (v.mode !== 'turn-crossing') s += car(850, 290, 'B', -90, '#a34563') + arrow(776, 290, 690, 290);
  if (v.mode === 'indicator') s += circle(345, 435, 9, '#ffd52b');
  if (v.mode === 'assist') s += rect(730, 545, 140, 70, '#fff', 'rx="4"') + text(800, 590, 'ASSIST', 25);
  if (v.mode === 'turn-crossing') s += `<path d="M600 470 Q600 410 695 410 L760 410" stroke="#fff" stroke-width="8" fill="none" marker-end="url(#arrow)"/>` + Array.from({ length: 7 }, (_, i) => rect(790, 248+i*29, 66, 18, '#fff')).join('') + person(829, 506);
  return s;
}
function lanes(v) {
  let s = rect(225, 0, 505, H, '#47505a') + line(238, 0, 238, H) + line(708, 0, 708, H) + line(470, 0, 470, H, '#fff', 5, 'stroke-dasharray="34 28"');
  if (v.mode === 'change') return s + car(590, 420) + car(350, 500, 'B', 0, '#a34563') + arrow(590, 330, 590, 250) + arrow(350, 410, 350, 330);
  s += v.mode === 'merge' ? `<path d="M1080 690 L1080 200 L730 0 L730 700 Z" fill="#47505a"/>` : `<path d="M650 425 L1050 185" fill="none" stroke="#47505a" stroke-width="160"/>`;
  if (v.mode === 'merge') s += car(870, 500) + car(590, 345, 'B', 0, '#a34563') + `<path d="M870 410 Q870 235 745 170" fill="none" stroke="#fff" stroke-width="8" marker-end="url(#arrow)"/>` + line(730, 210, 730, H, '#fff', 5, 'stroke-dasharray="30 24"');
  else s += car(590, 175) + arrow(590, 95, 590, 35) + `<path d="M590 540 Q590 450 790 342 L950 245" fill="none" stroke="#fff" stroke-width="8" marker-end="url(#arrow)"/>` + text(975, 125, 'EXIT', 28);
  return s;
}
function roadScene(v) {
  let s = road();
  if (v.hazard === 'responsibility') return s + car(610, 330, 'A', -35) + car(497, 284, 'B', 115, '#a34563') + circle(553, 320, 14, '#eeb949');
  if (['bend', 'pressure'].includes(v.hazard)) s = rect(420, 220, 240, H-220, '#47505a') + `<path d="M540 240 Q540 110 820 90" fill="none" stroke="#47505a" stroke-width="240"/>` + line(430, 240, 430, H) + line(650, 240, 650, H) + line(540, 240, 540, H, '#fff', 5, 'stroke-dasharray="34 28"') + rect(355, 18, 250, 145, '#96b5a3') + rect(690, 340, 130, 140, '#96b5a3');
  const ay = ['tailgate','anger','pressure'].includes(v.hazard) ? 390 : 555;
  s += car(600, ay) + arrow(600, ay-85, 600, ay-140);
  if (v.lead) s += car(600, 200, 'C', 0, '#8b6a28', v.hazard === 'truck');
  if (['tailgate','anger','pressure'].includes(v.hazard)) s += car(600, ay+150, 'B', 0, '#a34563');
  if (v.hazard === 'obstacle') s += rect(562, 225, 74, 135, '#cc8152') + line(568, 230, 630, 345, '#fff', 7) + car(480, 180, 'B', 180, '#a34563');
  if (v.hazard === 'ball') s += car(710, 220, '', 0, '#6e8791') + car(710, 415, '', 0, '#6e8791') + circle(648, 315, 19, '#eeb949') + line(641, 300, 655, 330, '#17212c', 3);
  if (v.hazard === 'fog') s += rect(420, 0, 240, 310, '#d1dae1') + line(450, 100, 630, 100, '#fff', 15) + line(450, 150, 630, 150, '#fff', 15) + line(450, 200, 630, 200, '#fff', 15);
  if (v.hazard === 'ice') s += rect(435, 160, 210, 190, '#a9d9e3') + line(450, 210, 625, 190, '#eafbff', 9) + line(450, 280, 625, 255, '#eafbff', 9);
  if (v.hazard === 'night') s += car(480, 200, 'B', 180, '#a34563') + circle(825,120,35,'#e8cf7e') + `<path d="M572 492 L545 295 L652 295 L628 492 Z" fill="#ffe49a" opacity=".5"/>` + `<path d="M452 264 L425 435 L528 435 L508 264 Z" fill="#ffe49a" opacity=".5"/>`;
  if (['collision','responsibility'].includes(v.hazard)) s += car(605, 245, 'B', -30, '#a34563') + car(487, 264, 'C', 125, '#8b6a28') + line(500, 329, 660, 345, '#f1bc48', 6);
  if (v.hazard === 'breakdown') s += car(632, 190, 'B', 0, '#a34563') + `<path d="M621 325 L655 390 L587 390 Z" fill="none" stroke="#dc0032" stroke-width="10"/>`;
  if (v.hazard === 'fatigue') s += `<path d="M601 615 Q665 460 683 350" fill="none" stroke="#eac451" stroke-width="7" stroke-dasharray="14 12"/>` + text(770, 230, 'Z z', 50);
  if (v.hazard === 'red') s += rect(708, 120, 70, 175, '#17212c', 'rx="10"') + circle(743, 155, 20, '#eb2748') + circle(743, 205, 20, '#555d66') + circle(743, 255, 20, '#555d66') + line(548, 305, 638, 305, '#fff', 9);
  return s;
}
function crossing(v) {
  let s = road() + car(600, 560) + arrow(600, 476, 600, 395);
  if (v.mode === 'cycle') s += Array.from({ length: 8 }, (_, i) => rect(438+i*27, 250, 16, 16, '#fff') + rect(438+i*27, 330, 16, 16, '#fff')).join('') + `<path d="M555 372 L575 372 L565 390 Z M583 372 L603 372 L593 390 Z M611 372 L631 372 L621 390 Z" fill="#fff"/>` + person(720, 298, true) + text(780, 310, 'B', 28) + cycleSign(739, 174);
  else s += zebra() + person(725, 320);
  if (v.mode === 'queue') s += car(600, 210, 'B', 0, '#a34563') + car(600, 70, 'C', 0, '#8b6a28');
  return s;
}
function parking(v) {
  if (v.mode === 'crossing') return road() + zebra(200) + car(617, 450) + arrow(600, 590, 600, 535) + line(775, 274, 775, 393, '#17212c', 4) + line(752, 274, 797, 274, '#17212c', 4) + line(752, 393, 797, 393, '#17212c', 4) + text(865, 347, '6 m', 42);
  if (v.mode === 'entrance') return road(true) + rect(645, 470, 165, 230, '#adb8bf') + rect(810, 500, 180, 180, '#c1d1cc') + car(730, 410, 'A', 90) + car(730, 600, 'B') + arrow(730, 516, 730, 465);
  let s = rect(110, 95, 875, 520, '#d5dcdf') + line(180, 170, 180, 530) + line(415, 170, 415, 530) + line(650, 170, 650, 530) + line(885, 170, 885, 530);
  if (v.mode === 'damage') s += car(530, 350, 'B') + car(403, 415, 'A', -23) + circle(463, 398, 15, '#eeb949');
  else s += car(540, 265, 'A') + `<path d="M510 325 L390 540 L670 540 L570 325 Z" fill="#a9d9e3" opacity=".7"/>` + person(758, 436) + arrow(540, 378, 540, 458);
  return s;
}
function sideCar(v) {
  let s = rect(110, 530, 880, 40, '#adb8bf') + `<path d="M200 475 L240 356 L380 350 L450 265 L680 265 L770 350 L870 383 L900 475 Z" fill="#0f7897" stroke="#17212c" stroke-width="6"/>` + `<path d="M472 286 L557 286 L557 348 L405 348 Z M575 286 L666 286 L733 348 L575 348 Z" fill="#d6e8ec"/>` + circle(337, 476, 61, '#17212c') + circle(337, 476, 31, '#b8c7d0') + circle(759, 476, 61, '#17212c') + circle(759, 476, 31, '#b8c7d0');
  if (['roof','rack'].includes(v.mode)) s += line(490, 265, 490, 228, '#17212c', 8) + line(655, 265, 655, 228, '#17212c', 8) + rect(413, 179, 333, 53, '#a34563', 'rx="25"');
  if (v.mode === 'rack') s += line(890, 391, 970, 391, '#17212c', 12) + line(970, 300, 970, 470, '#17212c', 10);
  if (v.mode === 'particles') { s += text(570, 214, 'EV', 40); for (let i=0;i<16;i++) s += circle(245+i*36, 544+(i%3)*22, 4+i%4, '#817057'); }
  return s;
}
function tyre(v) {
  let s = circle(360, 346, 178, '#17212c') + circle(360, 346, 120, '#aebcc7') + circle(360, 346, 70, '#e4edf0');
  for (let i=0;i<16;i++) s += `<path d="M342 169 L322 198 M382 169 L405 198" fill="none" stroke="#687680" stroke-width="9" transform="rotate(${i*22.5} 360 346)"/>`;
  if (v.value === 'studs') { for(let i=0;i<16;i++) s += circle(360+154*Math.cos(i*Math.PI/8),346+154*Math.sin(i*Math.PI/8),7,'#eaf2f0'); s += line(140, 532, 580, 532, '#47505a', 18); }
  else if (v.value === 'pressure') s += circle(800, 290, 95, '#fff', 'stroke="#17212c" stroke-width="9"') + line(800, 290, 840, 235, '#a34563', 7) + `<path d="M795 390 L795 475 L530 475" fill="none" stroke="#17212c" stroke-width="14"/>` + rect(750, 520, 115, 75, '#cc8152') + rect(885, 520, 90, 75, '#cc8152');
  else s += rect(650, 230, 280, 150, '#fff', 'rx="8" stroke="#9babb4" stroke-width="3"') + text(790, 320, v.value, 48) + text(790, 440, '*', 65, '#0f7897');
  return s;
}
function load(v) {
  let s = sideCar({}) + line(900, 463, 949, 463, '#17212c', 10) + rect(945, 359, 130, 102, '#b6c6cf', 'stroke="#17212c" stroke-width="5"') + circle(1013, 470, 43, '#17212c');
  if (v.mode === 'weights') s += text(570, 175, `${v.carWeight} kg`, 42) + text(997, 278, `${v.trailerWeight} kg`, 36);
  else s += rect(956, 290, 53, 65, '#cc8152') + rect(1015, 303, 50, 53, '#d9aa60');
  return s;
}
function cabin(v) {
  if (v.mode === 'child') return rect(120, 120, 360, 440, '#d5dcdf', 'rx="25"') + `<path d="M220 485 L220 240 Q220 170 280 190 L310 425 L403 425 L403 485 Z" fill="#0f7897" stroke="#17212c" stroke-width="7"/>` + person(328, 305) + line(330, 320, 340, 399, '#a34563', 15) + line(790, 170, 790, 555, '#17212c', 6) + line(766, 170, 816, 170, '#17212c', 5) + line(766, 555, 816, 555, '#17212c', 5) + text(913, 376, '120 cm', 38);
  return rect(120, 480, 850, 60, '#c4d2d8') + `<path d="M445 465 L480 258 L523 268 L497 417 L689 417 L689 465 Z" fill="#0f7897" stroke="#17212c" stroke-width="8"/>` + circle(555, 315, 25, '#17212c') + circle(580,315,7,'#17212c') + line(538, 341, 532, 382, '#17212c', 30) + line(532,382,620,402,'#17212c',20) + line(527,345,583,382,'#a34563',12) + rect(215, 280, 140, 160, '#47505a', 'rx="20"') + circle(400, 348, 65, '#e8b465', 'stroke="#17212c" stroke-width="5"') + text(350, 207, 'AIRBAG ON', 32) + arrow(415, 348, 459, 348);
}
function renderScene(v) {
  let content;
  switch(v.kind) {
    case 'extension': content = require('./questionExpansionRenderer').renderExtension(v, { rect, line, text, circle, arrow, car, person, road, zebra, W, H }); break;
    case 'intersection': content = intersection(v); break;
    case 'road': content = roadScene(v); break;
    case 'lanes': content = lanes(v); break;
    case 'crossing': content = crossing(v); break;
    case 'parking': content = parking(v); break;
    case 'car-side': content = sideCar(v); break;
    case 'tyre': content = tyre(v); break;
    case 'load': content = load(v); break;
    case 'cabin': content = cabin(v); break;
    case 'sign': content = v.sign === 'speed' ? speedSign(550, 330, v.value, 200) : yieldSign(550, 305, 400); break;
    case 'distance': content = road() + car(600, 560) + arrow(600, 475, 600, 350) + text(800, 360, v.value, 52) + text(800, 450, v.detail, 48); break;
    case 'tyre-layout': content = `<g transform="translate(550 350) scale(2.8)">${car(0,0,'',0,'#0f7897')}</g>` + text(550, 125, 'FRONT', 36) + text(550, 625, 'REAR', 36) + line(300, 277, 422, 277, '#17212c', 4) + line(676, 421, 800, 421, '#17212c', 4); break;
    case 'documents': content = rect(380, 145, 370, 420, '#fff', 'rx="6" stroke="#9babb4" stroke-width="4"') + text(565, 238, 'OWNERSHIP', 33) + text(565, 340, 'DAY 1', 48) + line(440, 410, 680, 410, '#9babb4', 6) + line(440, 455, 650, 455, '#9babb4', 6) + circle(241, 329, 58, 'none', 'stroke="#17212c" stroke-width="14"') + line(241, 391, 241, 530, '#17212c', 18) + line(243, 475, 279, 475, '#17212c', 17); break;
    case 'timeline': content = line(160, 365, 920, 365, '#17212c', 7) + circle(210, 365, 15, '#0f7897') + circle(800, 365, 15, '#a34563') + text(210, 290, v.unit ? '0' : v.detail, 48) + text(800, 290, v.unit ? `${v.value} months` : v.value, 48); break;
    case 'routes': content = `<path d="M160 500 Q300 200 550 320 Q780 470 940 180 M160 500 Q430 600 720 550 Q900 460 940 180" fill="none" stroke="#47505a" stroke-width="70"/>` + text(370, 220, 'A', 48) + text(570, 650, 'B', 48) + car(440, 323, '', 90, '#a34563') + car(330, 352, '', 65, '#8b6a28') + car(228, 435, '', 35) + car(735, 545, '', 80); break;
    case 'rail': content = road() + rect(0, 260, W, 110, '#b5c0c3') + line(0, 287, W, 287, '#17212c', 8) + line(0, 342, W, 342, '#17212c', 8) + Array.from({length:20},(_,i)=>line(i*58,270,i*58,360,'#706d64',7)).join('') + car(600, 560) + car(600, 195, 'B', 0, '#a34563') + car(600, 52, 'C', 0, '#8b6a28') + line(711, 447, 711, 197, '#dc0032', 13) + line(711, 447, 711, 197, '#fff', 7, 'stroke-dasharray="30 30"'); break;
    case 'choice': {
      content = rect(155, 155, 380, 390, '#d5dcdf', 'rx="20"') + circle(770, 280, 78, 'none', 'stroke="#17212c" stroke-width="17"') + line(770, 360, 770, 525, '#17212c', 22) + line(770, 445, 821, 445, '#17212c', 20);
      if(v.mode === 'alcohol') content += `<path d="M270 235 L425 235 L407 330 Q347 415 288 330 Z" fill="#a34563" stroke="#17212c" stroke-width="7"/>` + line(347, 384, 347, 472, '#17212c', 8) + line(300, 473, 394, 473, '#17212c', 8) + text(750, 620, 'TAXI', 42);
      else if(v.mode === 'medicine') content += rect(280, 228, 133, 233, '#fff', 'rx="14" stroke="#17212c" stroke-width="6"') + rect(280, 210, 133, 37, '#0f7897') + text(347, 353, 'Rx', 55) + text(755, 620, '?', 60);
      else content = circle(780, 350, 180, 'none', 'stroke="#17212c" stroke-width="22"') + circle(780,350,55,'#47505a') + line(780,350,652,477,'#17212c',18) + line(780,350,908,477,'#17212c',18) + rect(405, 335, 72, 237, '#d6a487', 'rx="25"') + rect(280, 213, 134, 255, '#17212c', 'rx="18"') + rect(293, 235, 108, 195, '#a9d9e3', 'rx="5"') + `<path d="M317 384 L317 315 L370 315 L370 270" fill="none" stroke="#0f7897" stroke-width="8"/>` + rect(397,299,70,24,'#d6a487','rx="10"') + rect(397,329,70,24,'#d6a487','rx="10"') + rect(397,359,70,24,'#d6a487','rx="10"'); break;
    }
    default: throw new Error(`Unknown scene type: ${v.kind}`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img"><title>${escape(v.alt)}</title><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L6 3 L0 6 Z" fill="#fff"/></marker></defs>${rect(0, 0, W, H, '#eaf2f0')}${content}</svg>`;
}
module.exports = { renderScene, W, H };
