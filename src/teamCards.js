// teamCards.js

/**
 * Функция генерирует HTML-разметку карточек команды на основе данных и языка.
 * @param {Object} data - JSON-объект с данными о команде.
 * @param {string} lang - Код языка (например, "ru" или "en").
 */
function renderTeam(data, lang) {
    // Получаем секцию команды по id
    const teamSection = document.getElementById("team");

    // Если в секции нет контейнера, создаём его
    let container = teamSection.querySelector(".container");
    if (!container) {
        container = document.createElement("div");
        container.className = "container";
        teamSection.appendChild(container);
    }

    // Добавляем заголовок секции (если его ещё нет)
    if (!container.querySelector(".section-title")) {
        const title = document.createElement("h5");
        title.className = "section-title h1";
        // Берём заголовок из JSON или используем дефолтное значение
        title.textContent =
            (data.localization &&
                data.localization.sectionTitle &&
                data.localization.sectionTitle[lang]) ||
            "OUR TEAM";
        container.appendChild(title);
    }

    // Если в контейнере нет ряда для карточек, создаём его
    let row = container.querySelector(".row");
    if (!row) {
        row = document.createElement("div");
        row.className = "row";
        container.appendChild(row);
    }

    // Для каждого члена команды создаём карточку
    data.items.forEach((member) => {
        // Создаем колонку
        const colDiv = document.createElement("div");
        colDiv.className = "col-xs-12 col-sm-6 col-md-4";

        // Внешний контейнер с эффектом flip
        const imageFlipDiv = document.createElement("div");
        imageFlipDiv.className = "image-flip";
        imageFlipDiv.setAttribute("ontouchstart", "this.classList.toggle('hover');");

        // Основной блок flip
        const mainflipDiv = document.createElement("div");
        mainflipDiv.className = "mainflip";

        // --- Frontside (лицевая сторона) ---
        const frontsideDiv = document.createElement("div");
        frontsideDiv.className = "frontside";

        const cardDivFront = document.createElement("div");
        cardDivFront.className = "card";

        const cardBodyFront = document.createElement("div");
        cardBodyFront.className = "card-body text-center";

        // Изображение
        const pImg = document.createElement("p");
        const img = document.createElement("img");
        img.className = "img-fluid";
        img.src = member.photo;
        img.alt = "card image";
        pImg.appendChild(img);

        // Заголовок (имя)
        const h4Title = document.createElement("h4");
        h4Title.className = "card-title";
        h4Title.textContent = member.name[lang];

        // Краткое описание (роль или короткое описание)
        const pText = document.createElement("p");
        pText.className = "card-text";
        pText.textContent = member.shortDescription[lang];

        // Кнопка (можно добавить ссылку или событие)
        const aButton = document.createElement("a");
        aButton.href = "#";
        aButton.className = "btn btn-primary btn-sm";
        aButton.innerHTML = '<i class="fa fa-plus"></i>';

        // Собираем переднюю сторону карточки
        cardBodyFront.appendChild(pImg);
        cardBodyFront.appendChild(h4Title);
        cardBodyFront.appendChild(pText);
        cardBodyFront.appendChild(aButton);
        cardDivFront.appendChild(cardBodyFront);
        frontsideDiv.appendChild(cardDivFront);

        // --- Backside (обратная сторона) ---
        const backsideDiv = document.createElement("div");
        backsideDiv.className = "backside";

        const cardDivBack = document.createElement("div");
        cardDivBack.className = "card";

        const cardBodyBack = document.createElement("div");
        cardBodyBack.className = "card-body text-center mt-4";

        const h4TitleBack = document.createElement("h4");
        h4TitleBack.className = "card-title";
        h4TitleBack.textContent = member.name[lang];

        const pTextBack = document.createElement("p");
        pTextBack.className = "card-text";
        pTextBack.textContent = member.detailDescription[lang];

        // Социальные ссылки
        const ulSocial = document.createElement("ul");
        ulSocial.className = "list-inline";
        if (member.social) {
            Object.keys(member.social).forEach((key) => {
                const li = document.createElement("li");
                li.className = "list-inline-item";
                const a = document.createElement("a");
                a.className = "social-icon text-xs-center";
                a.target = "_blank";
                a.href = member.social[key];
                // Определяем класс иконки по типу соцсети
                let iconClass = "fa-link";
                switch (key.toLowerCase()) {
                    case "facebook":
                        iconClass = "fa-facebook";
                        break;
                    case "twitter":
                        iconClass = "fa-twitter";
                        break;
                    case "skype":
                        iconClass = "fa-skype";
                        break;
                    case "google":
                        iconClass = "fa-google";
                        break;
                }
                a.innerHTML = `<i class="fa ${iconClass}"></i>`;
                li.appendChild(a);
                ulSocial.appendChild(li);
            });
        }

        // Собираем обратную сторону карточки
        cardBodyBack.appendChild(h4TitleBack);
        cardBodyBack.appendChild(pTextBack);
        cardBodyBack.appendChild(ulSocial);
        cardDivBack.appendChild(cardBodyBack);
        backsideDiv.appendChild(cardDivBack);

        // Собираем flip-блок
        mainflipDiv.appendChild(frontsideDiv);
        mainflipDiv.appendChild(backsideDiv);
        imageFlipDiv.appendChild(mainflipDiv);
        colDiv.appendChild(imageFlipDiv);

        // Добавляем полученную карточку в ряд
        row.appendChild(colDiv);
    });
}