// teamCards.js

/**
 * Функция генерирует HTML-разметку карточек команды на основе данных и языка.
 * @param {Object} data - JSON-объект с данными о команде.
 * @param {string} lang - Код языка (например, "ru" или "en").
 * @param {Object} uiTextsData - Тексты интерфейса.
 */
export function renderTeam(data, lang, uiTextsData) {
    const teamContainer = document.getElementById("team-container");
    if (!teamContainer) return;

    // Очищаем контейнер перед рендерингом
    teamContainer.innerHTML = "";

    data.items.forEach((member, index) => {
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

        // --- Новый контейнер для всего контента ---
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

        // --- Новый контейнер для скрытых деталей ---
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

        // Собираем карточку
        contentDiv.appendChild(infoDiv);
        contentDiv.appendChild(detailsDiv);

        teamCard.appendChild(photoDiv);
        teamCard.appendChild(contentDiv);
        teamContainer.appendChild(teamCard);
    });
}
