function renderExtension(v, h) {
  const { rect, line, text, circle, arrow, car, person, road, zebra, W, H } = h;
  const ink = '#17212c';
  const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
  const signal = (x, y, active) => rect(x - 32, y - 88, 64, 176, ink, 'rx="10"') + ['red', 'amber', 'green'].map((c, i) => circle(x, y - 50 + i * 50, 18, c === active ? { red: '#ef2748', amber: '#ffd52b', green: '#20c273' }[c] : '#535c65')).join('') + line(x, y + 90, x, y + 145, ink, 8);
  const dimension = (x, y1, y2, label) => line(x, y1, x, y2, ink, 3) + line(x - 14, y1, x + 14, y1, ink, 3) + line(x - 14, y2, x + 14, y2, ink, 3) + text(x + 78, (y1 + y2) / 2 + 9, label, 30);
  const building = (x, y, w, height) => rect(x, y, w, height, '#c4d2d8', `stroke="${ink}" stroke-width="3"`) + rect(x + 18, y + 20, 32, 35, '#fff') + rect(x + w - 50, y + 20, 32, 35, '#fff');
  const bicycle = (x, y) => `<g transform="translate(${x} ${y})">${circle(-34, 22, 24, 'none', `stroke="${ink}" stroke-width="5"`)}${circle(40, 22, 24, 'none', `stroke="${ink}" stroke-width="5"`)}${path('M-34 22 L-12 -14 L15 22 Z M-12 -14 L30 -14 L15 22 M30 -14 L40 22 M24 -23 L36 -23', 'none', `stroke="${ink}" stroke-width="5"`)}</g>`;
  const bus = (x, y) => `<g transform="translate(${x} ${y})">${rect(-53, -116, 106, 232, '#0f7897', `rx="12" stroke="${ink}" stroke-width="6"`)}${rect(-40, -95, 80, 32, '#d6e8ec')}${rect(-39, 69, 78, 29, '#253741')}${text(0, 10, 'BUS', 27, '#fff')}</g>`;
  const motorway = (x, y) => rect(x - 62, y - 72, 124, 144, '#187c55', 'rx="4" stroke="#fff" stroke-width="4"') + path(`M${x-42} ${y+52} L${x-20} ${y-49} L${x-10} ${y-49} L${x-21} ${y+52} Z M${x+42} ${y+52} L${x+20} ${y-49} L${x+10} ${y-49} L${x+21} ${y+52} Z`, '#fff') + rect(x - 49, y - 15, 98, 14, '#fff');
  switch (v.mode) {
    case 'green-left-turn':
      return road() + rect(0, 230, W, 240, '#47505a') + car(600, 566) + car(480, 131, 'B', 180, '#a34563') + signal(755, 470, 'green') + line(548, 473, 638, 473, '#fff', 9) + path('M600 484 L600 356 Q600 290 470 290 L240 290', 'none', 'stroke="#fff" stroke-width="8" marker-end="url(#arrow)"') + arrow(480, 210, 480, 275);
    case 'amber':
      return road() + car(600, 570) + line(548, 290, 638, 290, '#fff', 10) + signal(760, 237, 'amber') + arrow(600, 486, 600, 390);
    case 'no-entry':
      return line(550, 380, 550, 623, '#7f909a', 16) + circle(550, 291, 181, '#dc0032') + rect(400, 254, 300, 74, '#ffd52b');
    case 'urban':
      return road() + car(600, 564) + building(75, 92, 200, 178) + building(100, 415, 205, 215) + building(830, 395, 206, 212) + rect(707, 102, 330, 171, '#fff', `stroke="${ink}" stroke-width="5"`) + path('M725 246 L725 179 L765 142 L805 179 L805 207 L825 207 L825 158 L857 158 L857 135 L887 135 L887 211 L920 211 L920 175 L959 146 L1008 175 L1008 246 Z', ink);
    case 'solid-obstacle':
      return rect(420, 0, 240, H, '#47505a') + line(430, 0, 430, H) + line(650, 0, 650, H) + line(540, 0, 540, H) + rect(551, 250, 91, 128, '#c47850', `stroke="${ink}" stroke-width="4"`) + line(560, 268, 633, 355, '#fff', 8) + line(560, 355, 633, 268, '#fff', 8) + car(600, 570) + arrow(600, 486, 600, 415);
    case 'pass-right':
      return rect(390, 0, 420, H, '#47505a') + line(402, 0, 402, H) + line(798, 0, 798, H) + line(540, 0, 540, H, '#fff', 5, 'stroke-dasharray="34 28"') + car(587, 252, 'B', 0, '#a34563') + circle(560, 197, 10, '#ffd52b') + car(690, 560) + arrow(690, 480, 690, 396) + path('M587 172 Q587 90 510 90', 'none', 'stroke="#fff" stroke-width="7" marker-end="url(#arrow)"');
    case 'bus-stop':
      return road() + car(622, 562) + arrow(600, 475, 600, 398) + rect(714, 150, 91, 120, '#ffd52b', `stroke="${ink}" stroke-width="4"`) + rect(736, 176, 47, 62, '#125da2', 'rx="5"') + rect(743, 184, 33, 20, '#fff') + circle(744, 237, 5, ink) + circle(775, 237, 5, ink) + line(760, 270, 760, 328, ink, 6) + dimension(839, 209, 505, '15 m');
    case 'parking-time':
      return rect(175, 116, 750, 429, '#fff', `stroke="#9babb4" stroke-width="4" rx="6"`) + text(352, 203, 'MON', 36) + text(748, 203, 'TUE', 36) + line(550, 145, 550, 504, '#9babb4', 3) + text(352, 307, '09:00', 53) + text(748, 307, '?', 70) + `<g transform="translate(352 425) scale(.8)">${car(0, 0, '', 90)}</g>` + line(442, 427, 660, 427, ink, 5);
    case 'motorway-eligibility':
      return rect(390, 0, 320, H, '#47505a') + line(550, 0, 550, H, '#fff', 5, 'stroke-dasharray="34 28"') + car(624, 514) + motorway(841, 196) + rect(35, 430, 285, 130, '#fff', `stroke="#9babb4" stroke-width="4" rx="6"`) + text(178, 474, 'DESIGN MAX', 29) + text(178, 532, '35 km/h', 42);
    case 'narrow-bridge': {
      const x = 808, y = 474;
      const b6 = circle(x, y, 80, '#ffd52b', 'stroke="#dc0032" stroke-width="16"') + path(`M${x+14} ${y+47} L${x+14} ${y-13} L${x-1} ${y-13} L${x+27} ${y-46} L${x+55} ${y-13} L${x+40} ${y-13} L${x+40} ${y+47} Z`, '#dc0032') + path(`M${x-48} ${y-44} L${x-48} ${y+15} L${x-62} ${y+15} L${x-34} ${y+48} L${x-6} ${y+15} L${x-21} ${y+15} L${x-21} ${y-44} Z`, '#000');
      return rect(420, 0, 240, H, '#47505a') + rect(420, 252, 72, 157, '#b6c6cf') + rect(610, 252, 50, 157, '#b6c6cf') + line(480, 249, 480, 414, ink, 7) + line(621, 249, 621, 414, ink, 7) + car(600, 570) + car(480, 113, 'B', 180, '#a34563') + arrow(480, 190, 480, 231) + b6;
    }
    case 'school-bus':
      return road() + bus(632, 229) + car(600, 573) + person(672, 81) + rect(759, 189, 130, 130, '#ffd52b', `stroke="${ink}" stroke-width="4"`) + `<g transform="translate(803 254) scale(.65)">${person(0, 0)}</g>` + `<g transform="translate(850 261) scale(.5)">${person(0, 0)}</g>` + circle(778, 166, 16, '#ffd52b', `stroke="${ink}" stroke-width="4"`) + circle(870, 166, 16, '#ffd52b', `stroke="${ink}" stroke-width="4"`) + line(778, 140, 778, 123, '#bb7600', 5) + line(870, 140, 870, 123, '#bb7600', 5);
    case 'drl': {
      const face = (x, rear) => rect(x - 159, 245, 318, 219, '#0f7897', `rx="28" stroke="${ink}" stroke-width="7"`) + path(`M${x-131} 252 L${x-105} 172 L${x+105} 172 L${x+131} 252 Z`, '#d6e8ec', `stroke="${ink}" stroke-width="7"`) + rect(x - 127, 297, 70, 23, rear ? '#53545b' : '#fff') + rect(x + 57, 297, 70, 23, rear ? '#53545b' : '#fff') + rect(x - 80, 423, 160, 15, ink) + text(x, 553, rear ? 'REAR' : 'FRONT', 36);
      return circle(999, 88, 37, '#ffd52b') + face(275, false) + face(820, true);
    }
    case 'high-beam-behind':
      return rect(0, 0, W, H, '#273138') + road() + path('M574 510 L545 186 L655 186 L626 510 Z', '#ffe49a', 'opacity=".5"') + car(600, 567) + car(600, 186, 'B', 0, '#a34563');
    case 'walk-bike':
      return road() + zebra(283) + car(600, 559) + person(764, 310) + bicycle(833, 314) + text(755, 244, 'B', 34) + line(780, 311, 821, 291, ink, 5);
    case 'wildlife':
      return road() + rect(660, 0, 100, H, '#d5dcdf') + car(713, 545) + path('M778 270 L858 270 L881 244 L904 247 L895 291 L867 310 L794 310 Z M786 301 L777 342 L789 342 L804 307 M849 302 L867 341 L879 341 L867 298', '#8b6a28', `stroke="${ink}" stroke-width="4"`) + circle(897, 247, 16, '#8b6a28') + line(891, 232, 887, 214, ink, 4) + line(903, 232, 911, 215, ink, 4) + line(897, 284, 996, 232, '#8b6a28', 6, 'stroke-dasharray="14 14"');
    case 'mutual-merge':
      return path('M278 700 L278 447 L447 184 L447 0 L653 0 L653 184 L822 447 L822 700 Z', '#47505a') + path('M291 700 L291 447 L458 184 L458 0 M641 0 L641 184 L809 447 L809 700', 'none', 'stroke="#fff" stroke-width="5"') + line(550, 465, 550, 700, '#fff', 5, 'stroke-dasharray="30 25"') + car(414, 575, 'A') + car(684, 575, 'B', 0, '#a34563') + arrow(550, 158, 550, 62);
    case 'plugin-hybrid':
      return rect(95, 170, 235, 165, '#c4d2d8', `rx="8" stroke="${ink}" stroke-width="4"`) + text(212, 245, 'ENGINE', 32) + rect(426, 170, 235, 165, '#0f7897', 'rx="8"') + text(543, 245, 'E-MOTOR', 32, '#fff') + rect(738, 170, 265, 165, '#fff', `rx="8" stroke="${ink}" stroke-width="4"`) + text(870, 245, 'BATTERY', 32) + rect(987, 222, 25, 60, ink) + line(330, 251, 425, 251, ink, 6) + line(661, 251, 738, 251, ink, 6) + path('M870 335 L870 483 L650 483', 'none', `stroke="${ink}" stroke-width="9"`) + rect(577, 446, 77, 73, '#0f7897', 'rx="10"') + line(595, 446, 595, 418, ink, 9) + line(633, 446, 633, 418, ink, 9) + text(338, 519, 'PLUG-IN', 40);
    case 'studded-trailer': {
      const wheel = (x, y) => circle(x, y, 40, ink) + circle(x, y, 20, '#b6c6cf');
      return rect(35, 445, 1030, 150, '#d9edf2') + path('M430 374 L469 318 L614 318 L648 374 L686 397 L686 452 L400 452 L400 396 Z', '#0f7897', `stroke="${ink}" stroke-width="5"`) + wheel(453, 452) + wheel(624, 452) + line(686, 419, 755, 419, ink, 9) + rect(755, 349, 224, 88, '#b6c6cf', `stroke="${ink}" stroke-width="5"`) + wheel(866, 446) + line(453, 452, 328, 312, ink, 3) + circle(219, 220, 110, ink) + circle(219, 220, 68, '#b6c6cf') + Array.from({ length: 12 }, (_, i) => circle(219 + 91 * Math.cos(i * Math.PI / 6), 220 + 91 * Math.sin(i * Math.PI / 6), 6, '#fff')).join('') + text(216, 79, 'CAR TYRE', 29);
    }
    case 'registered-weights':
      return rect(75, 139, 430, 409, '#fff', `rx="6" stroke="#9babb4" stroke-width="4"`) + rect(595, 139, 430, 409, '#fff', `rx="6" stroke="#9babb4" stroke-width="4"`) + text(290, 219, 'CAR', 34) + text(810, 219, 'TRAILER', 34) + text(290, 304, 'TOTALVIKT', 31) + text(810, 304, 'TOTALVIKT', 31) + text(290, 381, '2400 kg', 52) + text(810, 381, '1300 kg', 52) + line(130, 447, 447, 447, '#9babb4', 5) + line(650, 447, 964, 447, '#9babb4', 5);
    case 'ownership-form':
      return rect(301, 80, 498, 545, '#ffe17f', `rx="6" stroke="#9babb4" stroke-width="4"`) + text(550, 159, 'AGARBYTE', 38) + text(434, 244, 'SELLER', 27) + text(669, 244, 'BUYER', 27) + line(550, 209, 550, 570, '#9babb4', 3) + [300, 360, 420, 539].map((y) => line(336, y, 518, y, ink, 3) + line(583, y, 764, y, ink, 3)).join('') + text(434, 515, 'SIGN', 25) + text(669, 515, 'SIGN', 25);
    case 'headrest':
      return rect(238, 591, 700, 40, '#c4d2d8') + path('M432 556 L432 329 L464 329 L464 512 L691 512 L691 556 Z', '#0f7897', `stroke="${ink}" stroke-width="7"`) + circle(548, 211, 64, '#d6a487', `stroke="${ink}" stroke-width="5"`) + line(528, 281, 531, 386, ink, 38) + line(531, 390, 641, 486, ink, 29) + line(643, 486, 782, 512, ink, 29) + line(538, 335, 666, 359, ink, 24) + rect(409, 147, 66, 167, '#47505a', 'rx="18"') + line(435, 314, 435, 329, ink, 8) + line(460, 314, 460, 329, ink, 8) + line(326, 147, 618, 147, '#9babb4', 3, 'stroke-dasharray="12 12"');
    case 'idle-time':
      return building(100, 96, 335, 187) + building(646, 96, 335, 187) + rect(50, 500, 1000, 99, '#adb8bf') + `<g transform="translate(550 448) scale(1.7)">${car(0, 0, '', 90)}</g>` + rect(406, 61, 288, 115, '#fff', 'stroke="#9babb4" stroke-width="3" rx="6"') + text(550, 139, '03:00', 54) + text(550, 664, 'STOCKHOLM', 34);
    case 'zone2':
      return rect(155, 97, 353, 209, '#fff', `stroke="${ink}" stroke-width="5"`) + text(331, 172, 'MILJOZON', 33) + text(331, 247, 'KLASS 2', 38) + line(331, 306, 331, 598, '#7f909a', 12) + rect(614, 251, 326, 225, '#fff', 'stroke="#9babb4" stroke-width="4" rx="6"') + text(777, 338, 'DIESEL', 38) + text(777, 414, 'EURO 5', 44);
    case 'charging':
      return building(72, 82, 470, 440) + rect(160, 263, 148, 189, '#0f7897', `rx="12" stroke="${ink}" stroke-width="5"`) + rect(196, 294, 76, 52, '#d6e8ec') + path('M234 453 L234 557 L780 557 L780 456', 'none', `stroke="${ink}" stroke-width="8"`) + car(780, 369, '', 0, '#0f7897', true) + rect(378, 306, 78, 88, '#fff', `rx="6" stroke="${ink}" stroke-width="4"`) + circle(417, 351, 25, 'none', `stroke="${ink}" stroke-width="3"`) + circle(406, 351, 5, ink) + circle(428, 351, 5, ink);
    case 'visual-scan':
      return road() + rect(660, 239, 440, 180, '#47505a') + line(660, 249, 1100, 249) + line(660, 409, 1100, 409) + building(675, 434, 300, 207) + car(600, 562) + arrow(600, 483, 600, 439);
    case 'children-procession':
      return road() + car(600, 570) + [402, 457, 512, 567, 622, 677].map((x) => `<g transform="translate(${x} 306) scale(.72)">${person(0, 0)}</g>`).join('') + person(732, 306) + line(333, 359, 787, 359, '#0f7897', 4, 'stroke-dasharray="10 12"') + text(839, 313, 'LEADER', 27);
    default: throw new Error(`Unknown expansion scene: ${v.mode}`);
  }
}
module.exports = { renderExtension };
