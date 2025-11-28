// teamCards.js

let teamData = null;
let currentTeamLanguage = 'ru';
let currentTeamPage = 0;
let teamItemsPerPage = 4;
let resizeTimeout = null;
let uiTexts = null;
let isFirstRender = true;

// Параметры для расчёта количества карточек
const TEAM_CARD_MIN_WIDTH = 280; // минимальная ширина карточки из CSS
const TEAM_CARD_GAP = 30; // gap между карточками из CSS

const paginationElements = {
    container: null,
    prevBtn: null,
    nextBtn: null,
    status: null
};

/**
 * Инициализирует данные команды
 */
export function initTeamData(data) {
    teamData = data;
}

/**
 * Вычисляет количество карточек, помещающихся на страницу
 */
function calculateTeamItemsPerPage() {
    const container = document.getElementById('team-container');
    if (!container || !teamData?.display) return 4;

    const containerWidth = container.offsetWidth;
    if (containerWidth <= 0) return 4;

    const { maxColumns = 4, maxRows = 1 } = teamData.display;

    // Вычисляем сколько карточек помещается в строку
    const columnsCount = Math.floor((containerWidth + TEAM_CARD_GAP) / (TEAM_CARD_MIN_WIDTH + TEAM_CARD_GAP));
    
    // Ограничиваем максимальным числом столбцов из настроек
    const actualColumns = Math.max(1, Math.min(columnsCount, maxColumns));
    
    // Возвращаем количество карточек на странице (столбцы * строки)
    return actualColumns * maxRows;
}

/**
 * Функция генерирует HTML-разметку карточек команды на основе данных и языка.
 * @param {Object} data - JSON-объект с данными о команде.
 * @param {string} lang - Код языка (например, "ru" или "en").
 * @param {Object} uiTextsData - Тексты интерфейса.
 * @param {number} page - Номер страницы.
 */
export function renderTeam(data, lang, uiTextsData, page = currentTeamPage) {
    const teamContainer = document.getElementById("team-container");
    if (!teamContainer) return;

    // Сохраняем данные для использования при resize
    if (data) teamData = data;
    if (uiTextsData) uiTexts = uiTextsData;
    currentTeamLanguage = lang;

    if (!teamData) return;

    // Пересчитываем количество карточек на страницу
    teamItemsPerPage = calculateTeamItemsPerPage();

    const totalItems = teamData.items.length;
    if (totalItems === 0) {
        teamContainer.innerHTML = `<p class="team-empty">${lang === 'ru' ? 'Команда пока не указана' : 'No team members yet'}</p>`;
        updatePaginationUI(lang, 0, 0);
        return;
    }

    const totalPages = Math.max(1, Math.ceil(totalItems / teamItemsPerPage));
    const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
    currentTeamPage = clampedPage;

    const startIndex = clampedPage * teamItemsPerPage;
    const displayMembers = teamData.items.slice(startIndex, startIndex + teamItemsPerPage);

    // Очищаем контейнер перед рендерингом
    teamContainer.innerHTML = "";

    displayMembers.forEach((member, index) => {
        const teamCard = createTeamCard(member, lang, uiTexts, index);
        teamContainer.appendChild(teamCard);
    });

    updatePaginationUI(lang, totalPages, totalItems);
    
    // Анимация появления карточек
    // При первом рендере используем IntersectionObserver, при переключении страниц - сразу
    animateTeamCards(!isFirstRender);
    isFirstRender = false;
}

/**
 * Создаёт DOM-элемент карточки участника команды
 */
function createTeamCard(member, lang, uiTextsData, index) {
    // Карточка команды
    const teamCard = document.createElement("div");
    teamCard.className = "team-member card";
    teamCard.dataset.index = index;

    // Фото участника
    const photoDiv = document.createElement("div");
    photoDiv.className = "member-photo";
    const img = document.createElement("img");
    img.src = member.photo;
    img.alt = member.name[lang];
    photoDiv.appendChild(img);

    // --- Контейнер для всего контента ---
    const contentDiv = document.createElement("div");
    contentDiv.className = "member-content";

    // Информация о участнике (имя, роль)
    const infoDiv = document.createElement("div");
    infoDiv.className = "member-info";
    
    const name = document.createElement("h4");
    name.textContent = member.name[lang];
    
    const role = document.createElement("div");
    role.className = "member-role";
    role.textContent = member.role[lang];

    infoDiv.appendChild(name);
    infoDiv.appendChild(role);

    // --- Контейнер для скрытых деталей ---
    const detailsDiv = document.createElement("div");
    detailsDiv.className = "member-details";

    const description = document.createElement("div");
    description.className = "member-description";
    description.textContent = member.detailDescription[lang];
    detailsDiv.appendChild(description);

    // Навыки (если есть)
    if (member.skills && member.skills.length > 0) {
        const skillsDiv = document.createElement("div");
        skillsDiv.className = "member-skills";
        
        member.skills.forEach(skill => {
            const skillTag = document.createElement("span");
            skillTag.className = "skill-tag tag";
            skillTag.textContent = skill;
            skillsDiv.appendChild(skillTag);
        });
        
        detailsDiv.appendChild(skillsDiv);
    }

    // Социальные сети
    const socialDiv = document.createElement("div");
    socialDiv.className = "member-social";
    
    const socialLinks = [
        { platform: 'github', icon: '🔗', url: member.social?.github },
        { platform: 'linkedin', icon: '💼', url: member.social?.linkedin },
        { platform: 'telegram', icon: '💬', url: member.social?.telegram },
        { platform: 'email', icon: '📧', url: member.social?.email ? `mailto:${member.social.email}` : null }
    ];

    socialLinks.forEach(social => {
        if (social.url) {
            const link = document.createElement("a");
            link.className = "social-link";
            link.href = social.url;
            link.target = "_blank";
            link.textContent = social.icon;
            link.title = social.platform;
            socialDiv.appendChild(link);
        }
    });
    detailsDiv.appendChild(socialDiv);

    // Кнопка связаться
    if (uiTextsData?.teamCard?.contactButton) {
        const contactBtn = document.createElement("button");
        contactBtn.className = "contact-member-btn btn btn-xs";
        contactBtn.textContent = uiTextsData.teamCard.contactButton[lang];
        contactBtn.addEventListener('click', () => {
            if (member.social?.email) {
                window.open(`mailto:${member.social.email}`, '_blank');
            } else if (member.social?.telegram) {
                window.open(member.social.telegram, '_blank');
            }
        });
        detailsDiv.appendChild(contactBtn);
    }

    // Собираем карточку
    contentDiv.appendChild(infoDiv);
    contentDiv.appendChild(detailsDiv);

    teamCard.appendChild(photoDiv);
    teamCard.appendChild(contentDiv);

    return teamCard;
}

/**
 * Настраивает элементы пагинации
 */
export function setupTeamPagination() {
    if (paginationElements.container) return;

    const container = document.getElementById('team-pagination');
    const prevBtn = document.getElementById('team-prev');
    const nextBtn = document.getElementById('team-next');
    const status = document.getElementById('team-page-status');

    if (!container || !prevBtn || !nextBtn || !status) {
        return;
    }

    paginationElements.container = container;
    paginationElements.prevBtn = prevBtn;
    paginationElements.nextBtn = nextBtn;
    paginationElements.status = status;

    prevBtn.addEventListener('click', () => changeTeamPage(-1));
    nextBtn.addEventListener('click', () => changeTeamPage(1));
}

/**
 * Переключает страницу команды
 */
function changeTeamPage(delta) {
    if (!teamData?.items?.length) return;

    const totalPages = Math.max(1, Math.ceil(teamData.items.length / teamItemsPerPage));
    const nextPage = Math.min(Math.max(currentTeamPage + delta, 0), totalPages - 1);

    if (nextPage !== currentTeamPage) {
        currentTeamPage = nextPage;
        renderTeam(teamData, currentTeamLanguage, uiTexts, currentTeamPage);
    }
}

/**
 * Обновляет UI пагинации
 */
function updatePaginationUI(lang, totalPages, totalItems) {
    const { container, prevBtn, nextBtn, status } = paginationElements;
    if (!container || !prevBtn || !nextBtn || !status) return;

    if (totalItems <= teamItemsPerPage || totalPages <= 1) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    const prevLabel = teamData?.localization?.pagination?.prev?.[lang] || 'Back';
    const nextLabel = teamData?.localization?.pagination?.next?.[lang] || 'Next';

    prevBtn.disabled = currentTeamPage === 0;
    nextBtn.disabled = currentTeamPage >= totalPages - 1;
    prevBtn.textContent = prevLabel;
    nextBtn.textContent = nextLabel;
    prevBtn.setAttribute('aria-label', prevLabel);
    nextBtn.setAttribute('aria-label', nextLabel);

    const statusTemplate = teamData?.localization?.pagination?.status?.[lang] || 'Page {current} of {total}';
    status.textContent = statusTemplate
        .replace('{current}', String(currentTeamPage + 1))
        .replace('{total}', String(totalPages));
}

/**
 * Анимирует появление карточек команды
 * @param {boolean} immediate - если true, анимирует сразу (при переключении страниц)
 */
function animateTeamCards(immediate = false) {
    const cards = document.querySelectorAll('#team-container .team-member:not(.visible)');
    
    if (immediate) {
        // При переключении страниц - анимируем сразу с задержкой
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
        });
    } else {
        // При первой загрузке - используем IntersectionObserver
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const index = parseInt(card.dataset.index) || 0;
                    setTimeout(() => {
                        card.classList.add('visible');
                    }, index * 100);
                    observer.unobserve(card);
                }
            });
        }, {
            threshold: 0.1
        });

        cards.forEach(card => {
            observer.observe(card);
        });
    }
}

/**
 * Обработчик изменения размера окна
 */
function handleTeamResize() {
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    
    resizeTimeout = setTimeout(() => {
        const newItemsPerPage = calculateTeamItemsPerPage();
        
        // Перерисовываем только если количество карточек изменилось
        if (newItemsPerPage !== teamItemsPerPage) {
            currentTeamPage = 0;
            renderTeam(teamData, currentTeamLanguage, uiTexts, currentTeamPage);
        }
    }, 150);
}

/**
 * Инициализирует обработчик resize
 */
export function initTeamResize() {
    window.addEventListener('resize', handleTeamResize);
}

/**
 * Обновляет язык отображения команды
 */
export function updateTeamLanguage(lang, uiTextsData = null) {
    currentTeamLanguage = lang;
    if (uiTextsData) uiTexts = uiTextsData;
    
    if (teamData) {
        renderTeam(teamData, lang, uiTexts, currentTeamPage);
    }
}
