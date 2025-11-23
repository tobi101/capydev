export function renderServices(servicesData, lang) {
    const container = document.getElementById('services-container');
    if (!container) return;

    const titleElement = document.getElementById('services-title');
    if (titleElement) {
        titleElement.textContent = servicesData.localization.sectionTitle[lang];
    }

    container.innerHTML = '';

    servicesData.items.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card card';
        
        // Устанавливаем фоновое изображение через CSS переменную
        if (service.backImage) {
            serviceCard.style.setProperty('--back-image', `url('${service.backImage}')`);
        }

        const featuresHTML = service.features.map(feature => 
            `<li>${feature[lang]}</li>`
        ).join('');

        serviceCard.innerHTML = `
            ${service.backImage ? `<div class="service-back-image" style="background-image: url('${service.backImage}')"></div>` : ''}
            <div class="service-content">
                <span class="service-icon">${service.icon}</span>
                <h3 class="service-title">${service.title[lang]}</h3>
                <p class="service-description">${service.description[lang]}</p>
            </div>
            <ul class="service-features">
                ${featuresHTML}
            </ul>
        `;

        container.appendChild(serviceCard);
    });
}