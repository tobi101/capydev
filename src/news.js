import { getLocalizedText } from './main.js';

let newsData = null;

/**
 * Загружает данные новостей из JSON файла
 */
async function loadNewsData() {
    try {
        const response = await fetch('data/news.json5');
        const text = await response.text();
        // Простая обработка JSON5 (удаление комментариев)
        const jsonText = text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
        newsData = JSON.parse(jsonText);
        return newsData;
    } catch (error) {
        console.error('Ошибка загрузки данных новостей:', error);
        return null;
    }
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
    
    const tags = newsItem.tags.map(tag => `<span class="news-tag">${tag}</span>`).join('');
    
    const featuredClass = newsItem.featured ? 'news-card-featured' : '';
    
    return `
        <article class="news-card ${featuredClass}" data-id="${newsItem.id}">
            <div class="news-image">
                <img src="${newsItem.image}" alt="${title}" loading="lazy" onerror="this.style.display='none'; this.parentElement.classList.add('no-image');">
                ${newsItem.featured ? '<div class="featured-badge">Featured</div>' : ''}
            </div>
            <div class="news-content">
                <div class="news-meta">
                    <span class="news-date">${formattedDate}</span>
                    <span class="news-read-time">${readTime}</span>
                </div>
                <h3 class="news-title">${title}</h3>
                <p class="news-excerpt">${excerpt}</p>
                <div class="news-tags">
                    ${tags}
                </div>
                <button class="news-read-more" data-id="${newsItem.id}">
                    ${getLocalizedText(newsData.localization.readMore, lang)}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        </article>
    `;
}

/**
 * Рендерит секцию новостей
 */
export function renderNews(lang) {
    const container = document.getElementById('news-container');
    if (!container || !newsData) return;

    // Обновляем заголовок секции
    const sectionTitle = document.getElementById('news-title');
    if (sectionTitle) {
        sectionTitle.textContent = getLocalizedText(newsData.localization.sectionTitle, lang);
    }

    // Сортируем новости по дате (новые первые)
    const sortedNews = [...newsData.items].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    // Показываем только первые 3 новости (можно изменить)
    const displayNews = sortedNews.slice(0, 6);

    const newsHTML = displayNews.map(item => createNewsCard(item, lang)).join('');
    container.innerHTML = newsHTML;

    // Добавляем обработчики для кнопок "Читать далее"
    const readMoreButtons = container.querySelectorAll('.news-read-more');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const newsId = e.currentTarget.dataset.id;
            openNewsDetail(newsId);
        });
    });

    // Анимация появления карточек
    animateNewsCards();
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
 * Открывает детальную страницу новости (заглушка)
 */
function openNewsDetail(newsId) {
    console.log('Opening news detail for ID:', newsId);
    // Здесь можно реализовать модальное окно или переход на отдельную страницу
    alert(`Детальная страница новости ${newsId} - будет реализована позже`);
}

/**
 * Фильтрует новости по тегу
 */
export function filterNewsByTag(tag, language = 'ru') {
    const container = document.getElementById('news-container');
    if (!container || !newsData) return;

    let filteredNews = newsData.items;
    
    if (tag && tag !== 'all') {
        filteredNews = newsData.items.filter(item => 
            item.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
    }

    const sortedNews = [...filteredNews].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    const newsHTML = sortedNews.map(item => createNewsCard(item, language)).join('');
    container.innerHTML = newsHTML;

    animateNewsCards();
}

/**
 * Инициализирует блок новостей
 */
export async function initNews(language = 'ru') {
    await loadNewsData();
    
    if (newsData) {
        renderNews(language);
    }

    // Слушаем изменение языка
    window.addEventListener('languageChanged', (e) => {
        renderNews(e.detail.language);
    });
}
