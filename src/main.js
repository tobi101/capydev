import JSON5 from './vendor/json5.mjs';
import { renderServices } from './services.js';
import { renderWorkflow } from './workflow.js';
import { renderContacts } from './contacts.js';
import { renderProjects } from './projects.js';
import { renderTeam } from './teamCards.js';
import { initNews, updateNewsLanguage } from './news.js';

// Функция для загрузки JSON5-файлов
async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Ошибка при загрузке ${url}: ${response.status}`);
    }
    const text = await response.text();
    return JSON5.parse(text);
}

// Глобальные переменные с данными
let contentData = {};
let projectsData = {};
let teamData = {};
let servicesData = {};
let workflowData = {};
let contactsData = {};
let uiTextsData = {};

// Определяем язык (сначала проверяем localStorage, потом браузер)
let currentLanguage = localStorage.getItem('language') || (navigator.language.startsWith('en') ? 'en' : 'ru');
const lang = currentLanguage;

// Экспортируем функцию для получения локализованного текста
export function getLocalizedText(textObj, language) {
    if (!textObj) return '';
    if (typeof textObj === 'string') return textObj;
    return textObj[language] || textObj['ru'] || textObj['en'] || '';
}

function renderPage() {
    // Отрисовываем контент
    document.getElementById('site-title').textContent = contentData.siteTitle[currentLanguage];
    
    // Обновляем навигацию
    const navLinks = {
        'link-about': contentData.nav.about[currentLanguage],
        'link-services': contentData.nav.services[currentLanguage],
        'link-projects': contentData.nav.projects[currentLanguage],
        'link-workflow': contentData.nav.workflow[currentLanguage],
        'link-team': contentData.nav.team[currentLanguage],
        'link-news': contentData.nav.news ? contentData.nav.news[currentLanguage] : (currentLanguage === 'ru' ? 'Новости' : 'News'),
        'link-contacts': contentData.nav.contacts[currentLanguage]
    };

    Object.entries(navLinks).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    });

    // Обновляем hero секцию
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroCta = document.getElementById('hero-cta');
    
    if (heroTitle) heroTitle.textContent = contentData.hero.title[currentLanguage];
    if (heroSubtitle) heroSubtitle.textContent = contentData.hero.subtitle[currentLanguage];
    if (heroCta) heroCta.textContent = contentData.hero.cta[currentLanguage];

    // Обновляем about секцию
    const aboutTitle = document.getElementById('about-title');
    const aboutDescription = document.getElementById('about-description');
    const aboutStats = document.getElementById('about-stats');
    
    if (aboutTitle) aboutTitle.textContent = contentData.about.title[currentLanguage];
    if (aboutDescription) aboutDescription.textContent = contentData.about.description[currentLanguage];
    
    if (aboutStats) {
        aboutStats.innerHTML = '';
        contentData.about.stats.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.className = 'stat-item';
            statElement.innerHTML = `
                <span class="stat-number">${stat.number}</span>
                <span class="stat-label">${stat.label[currentLanguage]}</span>
            `;
            aboutStats.appendChild(statElement);
        });
    }
    
    // Обновляем заголовки других секций
    const teamTitle = document.getElementById('team-title');
    if (teamTitle && contentData.team) {
        teamTitle.textContent = contentData.team.title[currentLanguage];
    }
    
    const projectsTitle = document.getElementById('projects-title');
    if (projectsTitle && contentData.projects) {
        projectsTitle.textContent = contentData.projects.title[currentLanguage];
    }
}

// Функция для определения активного элемента в горизонтальном контейнере
function updateActiveItem(container) {
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

// Функция для отрисовки футера
function renderFooter(uiTextsData, lang) {
    const footer = document.querySelector('footer .footer-container');
    if (!footer) return;

    const copyright = footer.querySelector('p');
    if (copyright) {
        copyright.textContent = uiTextsData.footer.copyright[lang];
    }

    const links = footer.querySelectorAll('.footer-links a');
    if (links.length >= 3) {
        links[0].textContent = uiTextsData.footer.contactEmail;
        links[0].href = `mailto:${uiTextsData.footer.contactEmail}`;
        links[1].textContent = uiTextsData.footer.links.contacts[lang];
        links[2].textContent = uiTextsData.footer.links.about[lang];
    }

    // Обновляем кнопку "Наверх"
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.setAttribute('aria-label', uiTextsData.backToTop.ariaLabel[lang]);
    }

    // Обновляем title страницы
    document.title = uiTextsData.meta.pageTitle[lang];
    
    // Обновляем alt логотипа
    const logoImg = document.querySelector('.logo-img');
    if (logoImg) {
        logoImg.alt = uiTextsData.meta.logoAlt[lang];
    }
}

let newsInitialized = false;

async function loadData() {
    try {
        // Загружаем все данные параллельно
        const [content, projects, team, services, workflow, contacts, uiTexts] = await Promise.all([
            fetchJSON('data/content.json5'),
            fetchJSON('data/projects.json5'),
            fetchJSON('data/team.json5'),
            fetchJSON('data/services.json5'),
            fetchJSON('data/workflow.json5'),
            fetchJSON('data/contacts.json5'),
            fetchJSON('data/ui-texts.json5')
        ]);

        contentData = content;
        projectsData = projects;
        teamData = team;
        servicesData = services;
        workflowData = workflow;
        contactsData = contacts;
        uiTextsData = uiTexts;

        // Отрисовываем все секции
        await renderAllContent();

    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

async function renderAllContent() {
    renderPage();
    renderServices(servicesData, currentLanguage);
    renderWorkflow(workflowData, currentLanguage);
    renderProjects(projectsData, currentLanguage, uiTextsData);
    renderTeam(teamData, currentLanguage, uiTextsData);
    
    if (!newsInitialized) {
        await initNews(currentLanguage, uiTextsData);
        newsInitialized = true;
    } else {
        updateNewsLanguage(currentLanguage, uiTextsData);
    }
    
    renderContacts(contactsData, currentLanguage);
    renderFooter(uiTextsData, currentLanguage);
    updateLanguageButton();
}

function updateLanguageButton() {
    const langButton = document.getElementById('current-lang');
    if (langButton) {
        langButton.textContent = currentLanguage.toUpperCase();
    }
}

async function switchLanguage() {
    currentLanguage = currentLanguage === 'ru' ? 'en' : 'ru';
    localStorage.setItem('language', currentLanguage);
    await renderAllContent();
}

function setupLanguageToggle() {
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', switchLanguage);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupLanguageToggle();
});