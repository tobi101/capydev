import JSON5 from 'json5';
import { renderServices } from './services.js';
import { renderWorkflow } from './workflow.js';
import { renderContacts } from './contacts.js';
import { renderProjects } from './projects.js';
import { renderTeam } from './teamCards.js';

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

// Определяем язык (по умолчанию русский)
const lang = navigator.language.startsWith('en') ? 'en' : 'ru';

function renderPage() {
    // Отрисовываем контент
    document.getElementById('site-title').textContent = contentData.siteTitle[lang];
    
    // Обновляем навигацию
    const navLinks = {
        'link-about': contentData.nav.about[lang],
        'link-services': contentData.nav.services[lang],
        'link-projects': contentData.nav.projects[lang],
        'link-workflow': contentData.nav.workflow[lang],
        'link-team': contentData.nav.team[lang],
        'link-contacts': contentData.nav.contacts[lang]
    };

    Object.entries(navLinks).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    });

    // Обновляем hero секцию
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroCta = document.getElementById('hero-cta');
    
    if (heroTitle) heroTitle.textContent = contentData.hero.title[lang];
    if (heroSubtitle) heroSubtitle.textContent = contentData.hero.subtitle[lang];
    if (heroCta) heroCta.textContent = contentData.hero.cta[lang];

    // Обновляем about секцию
    const aboutTitle = document.getElementById('about-title');
    const aboutDescription = document.getElementById('about-description');
    const aboutStats = document.getElementById('about-stats');
    
    if (aboutTitle) aboutTitle.textContent = contentData.about.title[lang];
    if (aboutDescription) aboutDescription.textContent = contentData.about.description[lang];
    
    if (aboutStats) {
        aboutStats.innerHTML = '';
        contentData.about.stats.forEach(stat => {
            const statElement = document.createElement('div');
            statElement.className = 'stat-item';
            statElement.innerHTML = `
                <span class="stat-number">${stat.number}</span>
                <span class="stat-label">${stat.label[lang]}</span>
            `;
            aboutStats.appendChild(statElement);
        });
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

async function loadData() {
    try {
        const lang = navigator.language.startsWith("en") ? "en" : "ru";

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
        renderPage();
        renderServices(servicesData, lang);
        renderWorkflow(workflowData, lang);
        renderProjects(projectsData, lang, uiTextsData);
        renderTeam(teamData, lang, uiTextsData);
        renderContacts(contactsData, lang);
        renderFooter(uiTextsData, lang);

    } catch (error) {
        console.error("Ошибка загрузки данных:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadData);