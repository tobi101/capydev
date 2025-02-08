// Функция для загрузки JSON-файлов
async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Ошибка при загрузке ${url}: ${response.status}`);
    }
    return response.json();
}

// Глобальные переменные с данными
let contentData = {};
let projectsData = {};
let teamData = {};
let skillsData = {};

// Определяем язык (по умолчанию русский)
const lang = navigator.language.startsWith('en') ? 'en' : 'ru';

async function loadData() {
    try {
        contentData = await fetchJSON('data/content.json');
        projectsData = await fetchJSON('data/projects.json');
        teamData = await fetchJSON('data/team.json');
        skillsData = await fetchJSON('data/skills.json');
        renderPage();
    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

function renderPage() {
    // Установка заголовка и навигационных ссылок
    document.getElementById('site-title').textContent = contentData.localization.siteTitle[lang];
    document.getElementById('link-projects').textContent = contentData.localization.nav.projects[lang];
    document.getElementById('link-team').textContent = contentData.localization.nav.team[lang];
    document.getElementById('link-skills').textContent = contentData.localization.nav.skills[lang];

    // Отрисовка раздела "Проекты"
    const projectsSection = document.querySelector('#projects');
    projectsSection.querySelector('h2').textContent = projectsData.localization.sectionTitle[lang];
    const projectListContainer = projectsSection.querySelector('.project-list');
    projectsData.items.forEach(item => {
        const projectDiv = document.createElement('div');
        projectDiv.className = 'project-item';
        projectDiv.innerHTML = `
      <h3>${item.title[lang]}</h3>
      <img src="${item.previewImage}" alt="${item.title[lang]}">
      <div class="summary">${item.shortDescription[lang]}</div>
      <div class="details">${item.detailDescription ? item.detailDescription[lang] : item.shortDescription[lang]}</div>
    `;
        projectListContainer.appendChild(projectDiv);
    });
    // При прокрутке обновляем активный элемент
    projectListContainer.addEventListener('scroll', () => updateActiveItem(projectListContainer));
    updateActiveItem(projectListContainer); // начальная проверка

    // Отрисовка раздела "Команда"
    const teamSection = document.querySelector('#team');
    teamSection.querySelector('h2').textContent = teamData.localization.sectionTitle[lang];
    const teamListContainer = teamSection.querySelector('.team-list');
    teamData.items.forEach(member => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'team-member';
        memberDiv.innerHTML = `
      <h3>${member.name[lang]}</h3>
      <img src="${member.photo}" alt="${member.name[lang]}">
      <div class="summary">${member.role[lang]}</div>
      <div class="details">${member.detailDescription ? member.detailDescription[lang] : member.role[lang]}</div>
    `;
        teamListContainer.appendChild(memberDiv);
    });
    teamListContainer.addEventListener('scroll', () => updateActiveItem(teamListContainer));
    updateActiveItem(teamListContainer);

    // Отрисовка раздела "Навыки" с графом
    const skillsSection = document.querySelector('#skills');
    skillsSection.querySelector('h2').textContent = skillsData.localization.sectionTitle[lang];
    const skillsListContainer = skillsSection.querySelector('.skills-list');

    // Очищаем контейнер и создаём SVG для линий графа
    skillsListContainer.innerHTML = '';
    const svgNS = "http://www.w3.org/2000/svg";
    const svgElem = document.createElementNS(svgNS, "svg");
    svgElem.style.position = "absolute";
    svgElem.style.top = "0";
    svgElem.style.left = "0";
    svgElem.style.width = "100%";
    svgElem.style.height = "100%";
    svgElem.style.pointerEvents = "none";
    skillsListContainer.appendChild(svgElem);

    const containerWidth = skillsListContainer.clientWidth;
    const containerHeight = skillsListContainer.clientHeight;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    const radius = Math.min(containerWidth, containerHeight) / 3;

    // Располагаем узлы по окружности
    const skillNodes = {};
    skillsData.items.forEach((skill, index) => {
        const angle = (2 * Math.PI / skillsData.items.length) * index;
        const x = centerX + radius * Math.cos(angle) - 60; // 60 = половина ширины узла (120/2)
        const y = centerY + radius * Math.sin(angle) - 60;
        const skillDiv = document.createElement('div');
        skillDiv.className = 'skill-item';
        skillDiv.setAttribute('data-id', skill.id);
        skillDiv.style.left = `${x}px`;
        skillDiv.style.top = `${y}px`;
        skillDiv.innerHTML = `
      <span>${skill.name[lang]}</span>
      <div class="skill-detail">${skill.detail[lang]}</div>
    `;
        skillsListContainer.appendChild(skillDiv);
        skillNodes[skill.id] = skillDiv;
    });

    // Отрисовка линий, соединяющих узлы
    skillsData.items.forEach(skill => {
        const fromNode = skillNodes[skill.id];
        if (!fromNode) return;
        const fromRect = fromNode.getBoundingClientRect();
        const containerRect = skillsListContainer.getBoundingClientRect();
        const x1 = fromRect.left - containerRect.left + fromRect.width / 2;
        const y1 = fromRect.top - containerRect.top + fromRect.height / 2;

        if (Array.isArray(skill.connections)) {
            skill.connections.forEach(connId => {
                const toNode = skillNodes[connId];
                if (!toNode) return;
                const toRect = toNode.getBoundingClientRect();
                const x2 = toRect.left - containerRect.left + toRect.width / 2;
                const y2 = toRect.top - containerRect.top + toRect.height / 2;

                const line = document.createElementNS(svgNS, 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                svgElem.appendChild(line);
            });
        }
    });
}

// Функция для определения активного элемента в горизонтальном контейнере
function updateActiveItem(container) {
    // Отбираем только элементы проектов или команды (без SVG и т.п.)
    const children = Array.from(container.children).filter(child =>
        child.classList.contains('project-item') || child.classList.contains('team-member')
    );
    if (children.length === 0) return;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    let minDistance = Infinity;
    let activeItem = null;
    children.forEach(child => {
        const childRect = child.getBoundingClientRect();
        const childCenter = childRect.left + childRect.width / 2;
        const distance = Math.abs(childCenter - containerCenter);
        if (distance < minDistance) {
            minDistance = distance;
            activeItem = child;
        }
    });
    children.forEach(child => child.classList.remove('active'));
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', loadData);
