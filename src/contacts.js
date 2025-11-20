export function renderContacts(contactsData, lang) {
    const container = document.getElementById('contact-info');
    const formContainer = document.getElementById('contact-form');
    
    if (!container || !formContainer) return;

    const titleElement = document.getElementById('contacts-title');
    const formTitleElement = document.getElementById('form-title');
    const formSubtitleElement = document.getElementById('form-subtitle');
    
    if (titleElement) {
        titleElement.textContent = contactsData.localization.sectionTitle[lang];
    }
    if (formTitleElement) {
        formTitleElement.textContent = contactsData.localization.formTitle[lang];
    }
    if (formSubtitleElement) {
        formSubtitleElement.textContent = contactsData.localization.formSubtitle[lang];
    }

    container.innerHTML = '';
    contactsData.contactInfo.forEach(contact => {
        const contactElement = document.createElement('a');
        contactElement.className = 'contact-item';
        contactElement.href = contact.link;
        if (contact.link.startsWith('mailto:') || contact.link.startsWith('https:')) {
            contactElement.target = '_blank';
        }

        contactElement.innerHTML = `
            <span class="contact-icon">${contact.icon}</span>
            <div class="contact-details">
                <h4>${contact.label[lang]}</h4>
                <p>${contact.value}</p>
            </div>
        `;

        container.appendChild(contactElement);
    });

    formContainer.innerHTML = '';
    contactsData.form.fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        let inputHTML = '';
        
        if (field.type === 'select') {
            const optionsHTML = field.options.map(option => 
                `<option value="${option.value}">${option.label[lang]}</option>`
            ).join('');
            inputHTML = `<select name="${field.name}" ${field.required ? 'required' : ''}>
                <option value="">${field.label[lang]}</option>
                ${optionsHTML}
            </select>`;
        } else if (field.type === 'textarea') {
            inputHTML = `<textarea name="${field.name}" placeholder="${field.placeholder[lang]}" ${field.required ? 'required' : ''}></textarea>`;
        } else {
            inputHTML = `<input type="${field.type}" name="${field.name}" placeholder="${field.placeholder[lang]}" ${field.required ? 'required' : ''}>`;
        }

        formGroup.innerHTML = `
            <label for="${field.name}">${field.label[lang]}</label>
            ${inputHTML}
        `;

        formContainer.appendChild(formGroup);
    });

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'submit-button';
    submitButton.textContent = contactsData.form.submitButton[lang];
    formContainer.appendChild(submitButton);

    formContainer.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    console.log('Form submitted:', data);
    
    alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
    e.target.reset();
}