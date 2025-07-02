function renderProjects(data, lang) {
    const projectsContainer = document.getElementById("projects-container");
    if (!projectsContainer) return;

    projectsContainer.innerHTML = '';

    data.items.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "project-item";
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
                ${lang === 'ru' ? 'Подробнее' : 'View Details'}
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
        projectsContainer.appendChild(card);
    });

    // Добавляем обработчики для модальных окон
    document.querySelectorAll('.view-project-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Анимация клика
            const button = e.target;
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
            
            // Анимация карточки
            const projectCard = button.closest('.project-item');
            projectCard.style.transform = 'scale(0.98)';
            projectCard.style.filter = 'brightness(1.1)';
            
            setTimeout(() => {
                const index = parseInt(e.target.dataset.projectIndex);
                openProjectModal(data.items[index], lang);
                
                // Возвращаем карточку в исходное состояние
                projectCard.style.transform = '';
                projectCard.style.filter = '';
            }, 200);
        });
    });
}

function openProjectModal(project, lang) {
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
                                <img src="${media.thumbnail || media.url}" alt="Thumbnail ${index + 1}">
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
                        <h4>${lang === 'ru' ? 'Технологии:' : 'Technologies:'}</h4>
                        <div class="tech-tags">
                            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${project.features ? `
                    <div class="project-features">
                        <h4>${lang === 'ru' ? 'Особенности:' : 'Features:'}</h4>
                        <ul>
                            ${project.features[lang] ? project.features[lang].map(feature => `<li>${feature}</li>`).join('') : ''}
                        </ul>
                    </div>
                ` : ''}

                ${project.stats ? `
                    <div class="project-stats">
                        <h4>${lang === 'ru' ? 'Статистика:' : 'Statistics:'}</h4>
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
                        ${Object.entries(project.links).map(([key, url]) => `
                            <a href="${url}" target="_blank" class="project-link-btn">
                                ${key === 'demo' ? (lang === 'ru' ? 'Демо' : 'Demo') : 
                                  key === 'github' ? 'GitHub' :
                                  key === 'store' ? (lang === 'ru' ? 'Магазин' : 'Store') :
                                  key}
                            </a>
                        `).join('')}
                    </div>
                ` : project.link ? `
                    <div class="project-links">
                        <a href="${project.link}" target="_blank" class="project-link-btn">
                            ${lang === 'ru' ? 'Посмотреть проект' : 'View Project'}
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