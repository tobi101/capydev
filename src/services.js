async function renderServices(servicesData, lang) {
    const container = document.getElementById('services-container');
    if (!container) return;

    const titleElement = document.getElementById('services-title');
    if (titleElement) {
        titleElement.textContent = servicesData.localization.sectionTitle[lang];
    }

    container.innerHTML = '';

    servicesData.items.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';

        const featuresHTML = service.features.map(feature => 
            `<li>${feature[lang]}</li>`
        ).join('');

        serviceCard.innerHTML = `
            <span class="service-icon">${service.icon}</span>
            <h3 class="service-title">${service.title[lang]}</h3>
            <p class="service-description">${service.description[lang]}</p>
            <ul class="service-features">
                ${featuresHTML}
            </ul>
        `;

        container.appendChild(serviceCard);
    });
}