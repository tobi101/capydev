// teamCards.js

/**
 * Функция генерирует HTML-разметку карточек команды на основе данных и языка.
 * @param {Object} data - JSON-объект с данными о команде.
 * @param {string} lang - Код языка (например, "ru" или "en").
 */
function renderTeam(data, lang) {
    const teamContainer = document.getElementById("team-container");

    // Очищаем контейнер перед рендерингом (на случай обновления)
    teamContainer.innerHTML = "";

    data.items.forEach((member) => {
        // Карточка команды
        const teamCard = document.createElement("div");
        teamCard.className = "team-card";

        // Внутренний контейнер для переворота
        const teamCardInner = document.createElement("div");
        teamCardInner.className = "team-card-inner";

        // Передняя сторона
        const front = document.createElement("div");
        front.className = "team-card-front";
        front.innerHTML = `
      <img src="${member.photo}" alt="${member.name[lang]}">
      <h4>${member.name[lang]}</h4>
      <p>${member.role[lang]}</p>
      <button class="btn">Подробнее</button>
    `;

        // Задняя сторона
        const back = document.createElement("div");
        back.className = "team-card-back";
        back.innerHTML = `
      <h4>${member.name[lang]}</h4>
      <p>${member.detailDescription[lang]}</p>
      <div class="social-links">
        ${member.social.facebook ? `<a href="${member.social.facebook}" target="_blank"><i class="fa fa-facebook"></i></a>` : ""}
        ${member.social.twitter ? `<a href="${member.social.twitter}" target="_blank"><i class="fa fa-twitter"></i></a>` : ""}
        ${member.social.skype ? `<a href="${member.social.skype}" target="_blank"><i class="fa fa-skype"></i></a>` : ""}
        ${member.social.google ? `<a href="${member.social.google}" target="_blank"><i class="fa fa-google"></i></a>` : ""}
      </div>
    `;

        // Собираем карточку
        teamCardInner.appendChild(front);
        teamCardInner.appendChild(back);
        teamCard.appendChild(teamCardInner);
        teamContainer.appendChild(teamCard);
    });
}
