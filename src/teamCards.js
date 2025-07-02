// teamCards.js

/**
 * Функция генерирует HTML-разметку карточек команды на основе данных и языка.
 * @param {Object} data - JSON-объект с данными о команде.
 * @param {string} lang - Код языка (например, "ru" или "en").
 */
function renderTeam(data, lang) {
    const teamContainer = document.getElementById("team-container");
    if (!teamContainer) return;

    // Очищаем контейнер перед рендерингом
    teamContainer.innerHTML = "";

    data.items.forEach((member, index) => {
        // Карточка команды
        const teamCard = document.createElement("div");
        teamCard.className = "team-member";
        teamCard.dataset.index = index;

        // Фото участника
        const photoDiv = document.createElement("div");
        photoDiv.className = "member-photo";
        const img = document.createElement("img");
        img.src = member.photo;
        img.alt = member.name[lang];
        photoDiv.appendChild(img);

        // Информация о участнике
        const infoDiv = document.createElement("div");
        infoDiv.className = "member-info";
        
        const name = document.createElement("h4");
        name.textContent = member.name[lang];
        
        const role = document.createElement("div");
        role.className = "member-role";
        role.textContent = member.role[lang];
        
        const description = document.createElement("div");
        description.className = "member-description";
        description.textContent = member.detailDescription[lang];

        infoDiv.appendChild(name);
        infoDiv.appendChild(role);
        infoDiv.appendChild(description);

        // Навыки (если есть)
        if (member.skills && member.skills.length > 0) {
            const skillsDiv = document.createElement("div");
            skillsDiv.className = "member-skills";
            
            member.skills.forEach(skill => {
                const skillTag = document.createElement("span");
                skillTag.className = "skill-tag";
                skillTag.textContent = skill;
                skillsDiv.appendChild(skillTag);
            });
            
            infoDiv.appendChild(skillsDiv);
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

        // Кнопка связаться
        const contactBtn = document.createElement("button");
        contactBtn.className = "contact-member-btn";
        contactBtn.textContent = lang === 'ru' ? 'Связаться' : 'Contact';
        contactBtn.addEventListener('click', () => {
            if (member.social?.email) {
                window.open(`mailto:${member.social.email}`, '_blank');
            } else if (member.social?.telegram) {
                window.open(member.social.telegram, '_blank');
            }
        });

        // Собираем карточку
        teamCard.appendChild(photoDiv);
        teamCard.appendChild(infoDiv);
        teamCard.appendChild(socialDiv);
        teamCard.appendChild(contactBtn);
        teamContainer.appendChild(teamCard);
    });
}
