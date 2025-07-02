async function renderWorkflow(workflowData, lang) {
    const container = document.getElementById('workflow-container');
    if (!container) return;

    const titleElement = document.getElementById('workflow-title');
    if (titleElement) {
        titleElement.textContent = workflowData.localization.sectionTitle[lang];
    }

    container.innerHTML = '';

    workflowData.steps.forEach(step => {
        const stepElement = document.createElement('div');
        stepElement.className = 'workflow-step';

        stepElement.innerHTML = `
            <div class="step-number">${step.number}</div>
            <div class="step-content">
                <h3>${step.title[lang]}</h3>
                <p>${step.description[lang]}</p>
            </div>
        `;

        container.appendChild(stepElement);
    });
}