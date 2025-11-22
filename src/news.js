import JSON5 from 'json5';
import { getLocalizedText } from './main.js';

let newsData = null;
let currentNewsLanguage = 'ru';
let newsModalInitialized = false;
let currentNewsPage = 0;
let filteredNewsItems = null;

const NEWS_ITEMS_PER_PAGE = 3;

const CTA_TYPES = {
    MODAL: 'modal',
    EXTERNAL: 'external'
};

const newsModalElements = {
    wrapper: null,
    backdrop: null,
    closeBtn: null,
    title: null,
    date: null,
    readTime: null,
    tags: null,
    article: null,
    image: null,
    cover: null
};

const paginationElements = {
    container: null,
    prevBtn: null,
    nextBtn: null,
    status: null
};

/**
 * Загружает данные новостей из JSON файла
 */
async function loadNewsData() {
    try {
        const response = await fetch('data/news.json5');
        const text = await response.text();
        newsData = JSON5.parse(text);
        return newsData;
    } catch (error) {
        console.error('Ошибка загрузки данных новостей:', error);
        return null;
    }
}

function getActiveNewsItems() {
    if (filteredNewsItems !== null) {
        return filteredNewsItems;
    }
    return newsData?.items || [];
}

/**
 * Форматирует дату в читаемый формат
 */
function formatDate(dateString, lang) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    
    if (lang === 'ru') {
        return date.toLocaleDateString('ru-RU', options);
    }
    return date.toLocaleDateString('en-US', options);
}

/**
 * Создает HTML карточки новости
 */
function createNewsCard(newsItem, lang) {
    const title = getLocalizedText(newsItem.title, lang);
    const excerpt = getLocalizedText(newsItem.excerpt, lang);
    const readTime = getLocalizedText(newsItem.readTime, lang);
    const formattedDate = formatDate(newsItem.date, lang);
    const dateMeta = renderMetaValue(formattedDate, 'date');
    const timeMeta = renderMetaValue(readTime, 'time');
    
    const tags = newsItem.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('');
    const cardLabel = getLocalizedText(newsItem.label, lang);
    const labelBadge = cardLabel ? `<div class="news-card-label">${cardLabel}</div>` : '';
    const ctaHtml = getCtaHtml(newsItem, lang);
    
    return `
        <article class="news-card" data-id="${newsItem.id}">
            <div class="news-image">
                <img src="${newsItem.image}" alt="${title}" loading="lazy" onerror="this.style.display='none'; this.parentElement.classList.add('no-image');">
                ${labelBadge}
            </div>
            <div class="news-content">
                <div class="news-meta">
                    <span class="news-date">${dateMeta}</span>
                    <span class="news-read-time">${timeMeta}</span>
                </div>
                <h3 class="news-title">${title}</h3>
                <p class="news-excerpt">${excerpt}</p>
                <div class="news-tags">
                    ${tags}
                </div>
                ${ctaHtml}
            </div>
        </article>
    `;
}

function renderMetaValue(value, iconType) {
    if (!value) return '';
    return `${getMetaIcon(iconType)}<span class="news-meta-text">${value}</span>`;
}

function getMetaIcon(type) {
    if (type === 'date') {
        return `
            <svg class="news-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <rect x="4" y="6" width="16" height="14" rx="2" ry="2" stroke-width="1.8"></rect>
                <path d="M16 4v4M8 4v4M4 11h16" stroke-width="1.8" stroke-linecap="round"></path>
            </svg>
        `;
    }

    if (type === 'time') {
        return `
            <svg class="news-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" stroke-width="1.8"></circle>
                <path d="M12 7v5l3 2" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        `;
    }

    return '';
}

function getCtaHtml(newsItem, lang) {
    const cta = newsItem.cta;
    if (!cta) {
        return '';
    }

    const label = getLocalizedText(cta.label || newsData.localization.readMore, lang);

    if (cta.type === CTA_TYPES.EXTERNAL && cta.url) {
        return `
            <a class="news-read-more news-cta-link" href="${cta.url}" target="_blank" rel="noopener noreferrer">
                ${label}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </a>
        `;
    }

    if (cta.type === CTA_TYPES.MODAL && cta.markdown) {
        return `
            <button class="news-read-more news-cta-modal" data-id="${newsItem.id}" data-action="modal">
                ${label}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;
    }

    return '';
}

/**
 * Рендерит секцию новостей
 */
export function renderNews(lang, page = currentNewsPage) {
    const container = document.getElementById('news-container');
    if (!container || !newsData) return;

    currentNewsLanguage = lang;

    // Обновляем заголовок секции
    const sectionTitle = document.getElementById('news-title');
    if (sectionTitle) {
        sectionTitle.textContent = getLocalizedText(newsData.localization.sectionTitle, lang);
    }

    const activeItems = getActiveNewsItems();

    // Сортируем новости по дате (новые первые)
    const sortedNews = [...activeItems].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    const totalItems = sortedNews.length;
    if (totalItems === 0) {
        container.innerHTML = `<p class="news-empty">${lang === 'ru' ? 'Нет новостей' : 'No news yet'}</p>`;
        updatePaginationUI(lang, 0, 0);
        return;
    }

    const totalPages = Math.max(1, Math.ceil(totalItems / NEWS_ITEMS_PER_PAGE));
    const clampedPage = Math.min(Math.max(page, 0), totalPages - 1);
    currentNewsPage = clampedPage;

    const startIndex = clampedPage * NEWS_ITEMS_PER_PAGE;
    const displayNews = sortedNews.slice(startIndex, startIndex + NEWS_ITEMS_PER_PAGE);

    const newsHTML = displayNews.map(item => createNewsCard(item, lang)).join('');
    container.innerHTML = newsHTML;

    attachNewsCtaHandlers(lang);
    updatePaginationUI(lang, totalPages, totalItems);

    // Анимация появления карточек
    animateNewsCards();
}

function attachNewsCtaHandlers(lang) {
    const modalButtons = document.querySelectorAll('.news-cta-modal');
    modalButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const newsId = e.currentTarget.dataset.id;
            await openNewsDetail(newsId, lang);
        });
    });
}

function setupPaginationControls(uiTextsData = null, lang = 'ru') {
    if (paginationElements.container) return;

    const container = document.getElementById('news-pagination');
    const prevBtn = document.getElementById('news-prev');
    const nextBtn = document.getElementById('news-next');
    const status = document.getElementById('news-page-status');

    if (!container || !prevBtn || !nextBtn || !status) {
        return;
    }

    paginationElements.container = container;
    paginationElements.prevBtn = prevBtn;
    paginationElements.nextBtn = nextBtn;
    paginationElements.status = status;

    // Устанавливаем aria-label из uiTextsData
    if (uiTextsData?.newsPagination) {
        prevBtn.setAttribute('aria-label', getLocalizedText(uiTextsData.newsPagination.prevLabel, lang));
        nextBtn.setAttribute('aria-label', getLocalizedText(uiTextsData.newsPagination.nextLabel, lang));
    }

    prevBtn.addEventListener('click', () => changeNewsPage(-1));
    nextBtn.addEventListener('click', () => changeNewsPage(1));
}

function changeNewsPage(delta) {
    const items = getActiveNewsItems();
    if (!items.length) return;

    const totalPages = Math.max(1, Math.ceil(items.length / NEWS_ITEMS_PER_PAGE));
    const nextPage = Math.min(Math.max(currentNewsPage + delta, 0), totalPages - 1);

    if (nextPage !== currentNewsPage) {
        currentNewsPage = nextPage;
        renderNews(currentNewsLanguage, currentNewsPage);
    }
}

function updatePaginationUI(lang, totalPages, totalItems) {
    const { container, prevBtn, nextBtn, status } = paginationElements;
    if (!container || !prevBtn || !nextBtn || !status) return;

    if (totalItems <= NEWS_ITEMS_PER_PAGE || totalPages <= 1) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    const prevLabel = getLocalizedText(newsData.localization.pagination?.prev, lang) || 'Previous';
    const nextLabel = getLocalizedText(newsData.localization.pagination?.next, lang) || 'Next';

    prevBtn.disabled = currentNewsPage === 0;
    nextBtn.disabled = currentNewsPage >= totalPages - 1;
    prevBtn.textContent = prevLabel;
    nextBtn.textContent = nextLabel;
    prevBtn.setAttribute('aria-label', prevLabel);
    nextBtn.setAttribute('aria-label', nextLabel);

    const statusTemplate = getLocalizedText(newsData.localization.pagination?.status, lang) || 'Page {current} of {total}';
    status.textContent = statusTemplate
        .replace('{current}', String(currentNewsPage + 1))
        .replace('{total}', String(totalPages));
}

/**
 * Анимирует появление карточек новостей
 */
function animateNewsCards() {
    const cards = document.querySelectorAll('.news-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    cards.forEach(card => {
        observer.observe(card);
    });
}

/**
 * Открывает детальную страницу новости в зависимости от типа CTA
 */
async function openNewsDetail(newsId, lang) {
    if (!newsData) return;

    const newsItem = newsData.items.find(item => item.id === newsId);
    if (!newsItem || !newsItem.cta) return;

    if (newsItem.cta.type === CTA_TYPES.MODAL) {
        await openNewsModal(newsItem, lang);
    }
}

/**
 * Фильтрует новости по тегу
 */
export function filterNewsByTag(tag, language = currentNewsLanguage) {
    if (!newsData) return;

    if (tag && tag !== 'all') {
        filteredNewsItems = newsData.items.filter(item =>
            item.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    } else {
        filteredNewsItems = null;
    }

    currentNewsPage = 0;
    renderNews(language, currentNewsPage);
}

/**
 * Инициализирует блок новостей
 */
export async function initNews(language = 'ru', uiTextsData = null) {
    await loadNewsData();
    setupNewsModal(uiTextsData, language);
    setupPaginationControls(uiTextsData, language);
    
    if (newsData) {
        renderNews(language);
    }

    // Слушаем изменение языка
    window.addEventListener('languageChanged', (e) => {
        renderNews(e.detail.language);
    });
}

async function openNewsModal(newsItem, lang) {
    if (!newsItem.cta?.markdown) return;
    if (!newsModalInitialized) {
        setupNewsModal();
    }

    const { wrapper, title, date, readTime, tags, article, image, cover } = newsModalElements;
    if (!wrapper || !title || !article) return;

    const localizedTitle = getLocalizedText(newsItem.title, lang);
    title.textContent = localizedTitle;
    if (date) {
        date.innerHTML = renderMetaValue(formatDate(newsItem.date, lang), 'date');
    }
    if (readTime) {
        readTime.innerHTML = renderMetaValue(getLocalizedText(newsItem.readTime, lang), 'time');
    }
    if (tags) {
        tags.innerHTML = newsItem.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('');
    }

    if (image) {
        if (newsItem.image) {
            image.src = newsItem.image;
            image.alt = localizedTitle;
            image.style.display = 'block';
            image.removeAttribute('aria-hidden');
            if (cover) {
                cover.classList.remove('hidden');
            }
        } else {
            image.removeAttribute('src');
            image.alt = '';
            image.style.display = 'none';
            image.setAttribute('aria-hidden', 'true');
            if (cover) {
                cover.classList.add('hidden');
            }
        }
    }

    if (article) {
        article.innerHTML = '<p class="news-modal-loading">Загружаем статью...</p>';
    }

    try {
        const markdown = await fetchMarkdownFile(newsItem.cta.markdown);
        const html = convertMarkdownToHtml(markdown);
        if (article) {
            article.innerHTML = html;
        }
    } catch (error) {
        console.error('Ошибка загрузки markdown для новости:', error);
        if (article) {
            article.innerHTML = '<p class="news-modal-error">Не удалось загрузить статью. Попробуйте позже.</p>';
        }
    }

    wrapper.style.display = 'block';
    wrapper.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
        wrapper.classList.add('show');
    });
    document.body.style.overflow = 'hidden';
}

async function fetchMarkdownFile(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Не удалось загрузить markdown: ${path}`);
    }
    return response.text();
}

function convertMarkdownToHtml(markdown) {
    if (!markdown) return '';

    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    let html = '';
    let unorderedListOpen = false;
    let orderedListOpen = false;

    const closeUnorderedList = () => {
        if (unorderedListOpen) {
            html += '</ul>';
            unorderedListOpen = false;
        }
    };

    const closeOrderedList = () => {
        if (orderedListOpen) {
            html += '</ol>';
            orderedListOpen = false;
        }
    };

    const closeAllLists = () => {
        closeUnorderedList();
        closeOrderedList();
    };

    lines.forEach((line) => {
        const trimmed = line.trim();

        if (trimmed.length === 0) {
            closeAllLists();
            return;
        }

        if (/^#{1,6}\s/.test(trimmed)) {
            closeAllLists();
            const level = Math.min(trimmed.match(/^#+/)[0].length + 1, 6);
            const content = trimmed.replace(/^#{1,6}\s+/, '');
            html += `<h${level}>${applyInlineMarkdown(content)}</h${level}>`;
            return;
        }

        if (/^[-*+]\s+/.test(trimmed)) {
            closeOrderedList();
            if (!unorderedListOpen) {
                html += '<ul>';
                unorderedListOpen = true;
            }
            const content = trimmed.replace(/^[-*+]\s+/, '');
            html += `<li>${applyInlineMarkdown(content)}</li>`;
            return;
        }

        if (/^\d+\.\s+/.test(trimmed)) {
            closeUnorderedList();
            if (!orderedListOpen) {
                html += '<ol>';
                orderedListOpen = true;
            }
            const content = trimmed.replace(/^\d+\.\s+/, '');
            html += `<li>${applyInlineMarkdown(content)}</li>`;
            return;
        }

        closeAllLists();

        html += `<p>${applyInlineMarkdown(trimmed)}</p>`;
    });

    closeAllLists();

    return html;
}

function applyInlineMarkdown(text) {
    const escaped = escapeHtml(text);
    return escaped
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function setupNewsModal(uiTextsData = null, lang = 'ru') {
    if (newsModalInitialized) return;

    const wrapper = document.getElementById('newsModal');
    if (!wrapper) return;

    newsModalElements.wrapper = wrapper;
    newsModalElements.backdrop = wrapper.querySelector('.modal-backdrop');
    newsModalElements.closeBtn = wrapper.querySelector('.close');
    newsModalElements.title = document.getElementById('newsModalTitle');
    newsModalElements.date = document.getElementById('newsModalDate');
    newsModalElements.readTime = document.getElementById('newsModalReadTime');
    newsModalElements.tags = document.getElementById('newsModalTags');
    newsModalElements.article = document.getElementById('newsModalArticle');
    newsModalElements.image = document.getElementById('newsModalImage');
    newsModalElements.cover = document.getElementById('newsModalCover');

    // Устанавливаем aria-label из uiTextsData
    if (newsModalElements.closeBtn && uiTextsData?.newsModal) {
        newsModalElements.closeBtn.setAttribute('aria-label', getLocalizedText(uiTextsData.newsModal.closeLabel, lang));
    }

    if (newsModalElements.image) {
        newsModalElements.image.addEventListener('error', () => {
            newsModalElements.image?.setAttribute('aria-hidden', 'true');
            newsModalElements.image.style.display = 'none';
            newsModalElements.cover?.classList.add('hidden');
        });
    }

    newsModalElements.closeBtn?.addEventListener('click', closeNewsModal);
    newsModalElements.closeBtn?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            closeNewsModal();
        }
    });
    newsModalElements.backdrop?.addEventListener('click', closeNewsModal);
    wrapper.addEventListener('click', (e) => {
        if (e.target === wrapper) {
            closeNewsModal();
        }
    });

    document.addEventListener('keydown', handleNewsModalEscape);

    newsModalInitialized = true;
}

function closeNewsModal() {
    const wrapper = newsModalElements.wrapper;
    if (!wrapper) return;

    wrapper.classList.remove('show');
    setTimeout(() => {
        wrapper.style.display = 'none';
        wrapper.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }, 300);
}

function handleNewsModalEscape(event) {
    if (event.key === 'Escape' && newsModalElements.wrapper?.classList.contains('show')) {
        closeNewsModal();
    }
}
