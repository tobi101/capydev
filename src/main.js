
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

// Определяем язык (по умолчанию русский)
const lang = navigator.language.startsWith('en') ? 'en' : 'ru';

function renderPage() {


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

async function loadData() {
    try {
        // Определяем язык пользователя (например, ru или en)
        const lang = navigator.language.startsWith("en") ? "en" : "ru";

        contentData = await fetchJSON('data/content.json');
        projectsData = await fetchJSON('data/projects.json');
        teamData = await fetchJSON('data/team.json');
        renderPage();
        renderProjects(projectsData, lang)
        renderTeam(teamData, lang)

    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}


document.addEventListener('DOMContentLoaded', loadData);