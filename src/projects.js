let carouselState = {
    currentIndex: 0,
    isAnimating: false,
    autoRotateInterval: null,
    touchStartX: 0,
    touchEndX: 0,
    data: null,
    lang: null,
    uiTextsData: null
};

export function renderProjects(data, lang, uiTextsData) {
    const projectsContainer = document.getElementById("projects-container");
    if (!projectsContainer) return;

    // Сохраняем данные в состоянии для использования в навигации
    carouselState.data = data;
    carouselState.lang = lang;
    carouselState.uiTextsData = uiTextsData;

    projectsContainer.innerHTML = '';
    projectsContainer.className = 'projects-carousel';

    // Создаем обертку для карточек
    const carouselTrack = document.createElement('div');
    carouselTrack.className = 'carousel-track';
    carouselTrack.id = 'carousel-track';

    data.items.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "project-item card carousel-card";
        card.dataset.index = index;

        const imageDiv = document.createElement("div");
        imageDiv.className = "project-image";
        
        const img = document.createElement("img");
        img.src = item.previewImage;
        img.alt = item.title[lang];
        
        const overlay = document.createElement("div");
        overlay.className = "project-overlay";
        overlay.innerHTML = `
            <button class="view-project-btn" data-project-index="${index}">
                ${uiTextsData.projectModal.viewDetailsButton[lang]}
            </button>
        `;

        imageDiv.appendChild(img);
        imageDiv.appendChild(overlay);

        const textDiv = document.createElement("div");
        textDiv.className = "project-text";
        textDiv.innerHTML = `
            <h3>${item.title[lang]}</h3>
            <p>${item.shortDescription[lang]}</p>
        `;

        card.appendChild(imageDiv);
        card.appendChild(textDiv);
        carouselTrack.appendChild(card);
    });

    projectsContainer.appendChild(carouselTrack);

    // Создаем навигационные кнопки
    const navPrev = document.createElement('button');
    navPrev.className = 'carousel-nav carousel-prev';
    navPrev.innerHTML = '&#10094;';
    navPrev.setAttribute('aria-label', 'Previous project');

    const navNext = document.createElement('button');
    navNext.className = 'carousel-nav carousel-next';
    navNext.innerHTML = '&#10095;';
    navNext.setAttribute('aria-label', 'Next project');

    projectsContainer.appendChild(navPrev);
    projectsContainer.appendChild(navNext);

    // Создаем индикаторы (точки)
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-dots';
    data.items.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.dataset.index = index;
        dot.setAttribute('aria-label', `Go to project ${index + 1}`);
        dotsContainer.appendChild(dot);
    });
    projectsContainer.appendChild(dotsContainer);

    // Инициализируем карусель
    initCarousel();
    updateCarousel();

    // Добавляем обработчики для модальных окон
    document.querySelectorAll('.view-project-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const index = parseInt(e.target.dataset.projectIndex);
            
            // Открываем модальное окно только для центральной карточки
            if (index === carouselState.currentIndex) {
                openProjectModal(data.items[index], lang, uiTextsData);
            } else {
                // Если кликнули на боковую карточку, переходим к ней
                goToSlide(index);
            }
        });
    });

    // Добавляем клик по карточке для центрирования или открытия
    document.querySelectorAll('.carousel-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-project-btn')) return;
            
            const index = parseInt(card.dataset.index);
            if (index === carouselState.currentIndex) {
                openProjectModal(data.items[index], lang, uiTextsData);
            } else {
                goToSlide(index);
            }
        });
    });
}

function initCarousel() {
    const navPrev = document.querySelector('.carousel-prev');
    const navNext = document.querySelector('.carousel-next');
    const dots = document.querySelectorAll('.carousel-dot');
    const carouselTrack = document.getElementById('carousel-track');

    // Навигационные кнопки
    if (navPrev) {
        navPrev.addEventListener('click', () => {
            previousSlide();
            resetAutoRotate();
        });
    }

    if (navNext) {
        navNext.addEventListener('click', () => {
            nextSlide();
            resetAutoRotate();
        });
    }

    // Индикаторы
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            goToSlide(index);
            resetAutoRotate();
        });
    });

    // Поддержка свайпов на мобильных
    if (carouselTrack) {
        carouselTrack.addEventListener('touchstart', handleTouchStart, { passive: true });
        carouselTrack.addEventListener('touchmove', handleTouchMove, { passive: true });
        carouselTrack.addEventListener('touchend', handleTouchEnd);
    }

    // Клавиатурная навигация
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            previousSlide();
            resetAutoRotate();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoRotate();
        }
    });

    // Пауза автопрокрутки при наведении
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
        projectsContainer.addEventListener('mouseenter', () => {
            stopAutoRotate();
        });

        projectsContainer.addEventListener('mouseleave', () => {
            startAutoRotate();
        });
    }

    // Запускаем автопрокрутку
    startAutoRotate();
}

function updateCarousel() {
    const cards = document.querySelectorAll('.carousel-card');
    const dots = document.querySelectorAll('.carousel-dot');
    const totalCards = cards.length;

    if (totalCards === 0) return;

    cards.forEach((card, index) => {
        // Удаляем все классы позиций
        card.classList.remove('active', 'left', 'right', 'far-left', 'far-right', 'hidden');
        
        const diff = index - carouselState.currentIndex;
        
        if (diff === 0) {
            card.classList.add('active');
        } else if (diff === 1 || diff === -(totalCards - 1)) {
            card.classList.add('right');
        } else if (diff === -1 || diff === (totalCards - 1)) {
            card.classList.add('left');
        } else if (diff === 2 || diff === -(totalCards - 2)) {
            card.classList.add('far-right');
        } else if (diff === -2 || diff === (totalCards - 2)) {
            card.classList.add('far-left');
        } else {
            card.classList.add('hidden');
        }
    });

    // Обновляем индикаторы
    dots.forEach((dot, index) => {
        if (index === carouselState.currentIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function nextSlide() {
    if (carouselState.isAnimating) return;
    
    const totalCards = document.querySelectorAll('.carousel-card').length;
    carouselState.isAnimating = true;
    
    carouselState.currentIndex = (carouselState.currentIndex + 1) % totalCards;
    updateCarousel();
    
    setTimeout(() => {
        carouselState.isAnimating = false;
    }, 600);
}

function previousSlide() {
    if (carouselState.isAnimating) return;
    
    const totalCards = document.querySelectorAll('.carousel-card').length;
    carouselState.isAnimating = true;
    
    carouselState.currentIndex = (carouselState.currentIndex - 1 + totalCards) % totalCards;
    updateCarousel();
    
    setTimeout(() => {
        carouselState.isAnimating = false;
    }, 600);
}

function goToSlide(index) {
    if (carouselState.isAnimating) return;
    
    carouselState.isAnimating = true;
    carouselState.currentIndex = index;
    updateCarousel();
    
    setTimeout(() => {
        carouselState.isAnimating = false;
    }, 600);
}

function handleTouchStart(e) {
    carouselState.touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
    carouselState.touchEndX = e.touches[0].clientX;
}

function handleTouchEnd() {
    const diff = carouselState.touchStartX - carouselState.touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
        if (diff > 0) {
            nextSlide();
        } else {
            previousSlide();
        }
        resetAutoRotate();
    }

    carouselState.touchStartX = 0;
    carouselState.touchEndX = 0;
}

function startAutoRotate() {
    if (carouselState.autoRotateInterval) return;
    
    carouselState.autoRotateInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

function stopAutoRotate() {
    if (carouselState.autoRotateInterval) {
        clearInterval(carouselState.autoRotateInterval);
        carouselState.autoRotateInterval = null;
    }
}

function resetAutoRotate() {
    stopAutoRotate();
    startAutoRotate();
}

function openProjectModal(project, lang, uiTextsData) {
    const modal = document.getElementById('projectModal');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalBody) return;

    // Генерируем медиа контент
    let mediaContent = '';
    
    if (project.media && project.media.length > 0) {
        mediaContent = `
            <div class="project-media-container">
                <div class="media-gallery">
                    ${project.media.map((media, index) => {
                        if (media.type === 'video') {
                            return `
                                <div class="media-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                                    <video controls poster="${media.poster || ''}">
                                        <source src="${media.url}" type="video/mp4">
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            `;
                        } else {
                            return `
                                <div class="media-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                                    <img src="${media.url}" alt="${media.caption || project.title[lang]}">
                                    ${media.caption ? `<p class="media-caption">${media.caption[lang] || media.caption}</p>` : ''}
                                </div>
                            `;
                        }
                    }).join('')}
                </div>
                ${project.media.length > 1 ? `
                    <div class="media-thumbnails">
                        ${project.media.map((media, index) => `
                            <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                                <img src="${media.thumbnail || media.url}" alt="${uiTextsData.projectModal.thumbnailAlt[lang]} ${index + 1}">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        // Fallback на одно изображение
        mediaContent = `
            <div class="project-media-container">
                <img src="${project.previewImage}" alt="${project.title[lang]}" class="modal-project-image">
            </div>
        `;
    }

    modalBody.innerHTML = `
        <div class="modal-project-content">
            ${mediaContent}
            <div class="modal-project-details">
                <h2>${project.title[lang]}</h2>
                <p class="project-full-description">${project.fullDescription ? project.fullDescription[lang] : project.shortDescription[lang]}</p>
                
                ${project.technologies ? `
                    <div class="project-technologies">
                        <h4>${uiTextsData.projectModal.technologiesTitle[lang]}</h4>
                        <div class="tech-tags">
                            ${project.technologies.map(tech => `<span class="tech-tag tag">${tech}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${project.features ? `
                    <div class="project-features">
                        <h4>${uiTextsData.projectModal.featuresTitle[lang]}</h4>
                        <ul>
                            ${project.features[lang] ? project.features[lang].map(feature => `<li>${feature}</li>`).join('') : ''}
                        </ul>
                    </div>
                ` : ''}

                ${project.stats ? `
                    <div class="project-stats">
                        <h4>${uiTextsData.projectModal.statisticsTitle[lang]}</h4>
                        <div class="stats-grid">
                            ${Object.entries(project.stats).map(([key, value]) => `
                                <div class="stat-item">
                                    <span class="stat-value">${value}</span>
                                    <span class="stat-label">${key}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${project.links ? `
                    <div class="project-links">
                        ${Object.entries(project.links).map(([key, url]) => {
                            let label = key;
                            if (key === 'demo') {
                                label = uiTextsData.projectModal.linkLabels.demo[lang];
                            } else if (key === 'github') {
                                label = uiTextsData.projectModal.linkLabels.github;
                            } else if (key === 'store') {
                                label = uiTextsData.projectModal.linkLabels.store[lang];
                            }
                            return `<a href="${url}" target="_blank" class="project-link-btn btn btn-sm">${label}</a>`;
                        }).join('')}
                    </div>
                ` : project.link ? `
                    <div class="project-links">
                        <a href="${project.link}" target="_blank" class="project-link-btn btn btn-sm">
                            ${uiTextsData.projectModal.linkLabels.viewProject[lang]}
                        </a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // Инициализируем галерею медиа
    initMediaGallery();

    // Анимация появления модального окна
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Плавное появление
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

function initMediaGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mediaItems = document.querySelectorAll('.media-item');
    
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            const index = parseInt(thumbnail.dataset.index);
            
            // Убираем активные классы
            thumbnails.forEach(t => t.classList.remove('active'));
            mediaItems.forEach(m => m.classList.remove('active'));
            
            // Добавляем активные классы
            thumbnail.classList.add('active');
            mediaItems[index].classList.add('active');
        });
    });
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        // Анимация закрытия
        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Инициализация модальных окон
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('projectModal');
    const closeBtn = modal?.querySelector('.close');
    const backdrop = modal?.querySelector('.modal-backdrop');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }
    
    if (backdrop) {
        backdrop.addEventListener('click', closeProjectModal);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }
    
    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
});