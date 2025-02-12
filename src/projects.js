
function renderProjects(data, lang) {

    const projectsContainer = document.getElementById("projects-container");

    // Генерируем карточки проектов
    data.items.forEach((item, index) => {

        const card = document.createElement("div");
        card.className = "project-card ";// + (index % 2 === 0 ? "slide-left" : "slide-right");

        const textDiv = document.createElement("div");
        textDiv.className = "project-text";
        textDiv.innerHTML = `
      <h3>${item.title[lang]}</h3>
      <p>${item.shortDescription[lang]}</p>
    `;

        const img = document.createElement("img");
        img.src = item.previewImage;
        img.alt = item.title[lang];

        // Добавляем элементы в карточку
        card.appendChild(textDiv);
        card.appendChild(img);

        projectsContainer.appendChild(card);
    });
/*
    // Настраиваем IntersectionObserver для появления карточек при прокрутке
    const observerOptions = {
        root: null, // следим за областью viewport
        threshold: 0.3 // карточка должна быть видна хотя бы на 30%
    };

    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log("Visible", entry.target);
                entry.target.classList.add("visible");
                observerInstance.unobserve(entry.target); // чтобы не отслеживать больше
            }
        });
    }, observerOptions);

    // Применяем observer ко всем карточкам
    document.querySelectorAll(".project-card").forEach(card => {
        observer.observe(card);
    });*/
}