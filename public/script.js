const API_URL = 'https://ai-medical-assistant-agent.onrender.com';
// ===========================================
// TAB SWITCHING
// ===========================================
function switchTab(event, tabName) {

    // Hide all sections
    document.querySelectorAll('.content-section')
    .forEach(el => {
        el.classList.remove('active');
    });

    // Remove active class from tabs
    document.querySelectorAll('.tab')
    .forEach(el => {
        el.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName)
    .classList.add('active');

    // Active current tab
    event.target.classList.add('active');
}

// ===========================================
// FILE INPUT HANDLERS
// ===========================================
document.getElementById('fileInput')
.addEventListener('change', (e) => {

    const fileName =
        e.target.files[0]?.name || '';

    document.getElementById('fileName')
    .textContent = fileName
        ? `✓ ${fileName}`
        : '';
});

document.getElementById('prescriptionFile')
.addEventListener('change', (e) => {

    const fileName =
        e.target.files[0]?.name || '';

    document.getElementById('prescFileName')
    .textContent = fileName
        ? `✓ ${fileName}`
        : '';
});

document.getElementById('reportFile')
.addEventListener('change', (e) => {

    const fileName =
        e.target.files[0]?.name || '';

    document.getElementById('reportFileName')
    .textContent = fileName
        ? `✓ ${fileName}`
        : '';
});

// ===========================================
// ENTER KEY SUPPORT
// ===========================================
document
.getElementById("queryInput")
.addEventListener("keydown", function(e){

    if(e.key === "Enter" && !e.shiftKey){

        e.preventDefault();

        submitChat();
    }
});

// ===========================================
// FILE VALIDATION
// ===========================================
function validateFile(file){

    if(!file) return true;

    const allowedTypes = [

        "image/png",

        "image/jpeg",

        "application/pdf"
    ];

    if(!allowedTypes.includes(file.type)){

        alert(
            "Only PNG, JPG, JPEG are allowed."
        );

        return false;
    }

    return true;
}

// ===========================================
// SUBMIT CHAT
// ===========================================
async function submitChat() {

    const query =
        document.getElementById('queryInput').value;

    const file =
        document.getElementById('fileInput').files[0];

    if (!query.trim()) {

        alert('Please enter a query');

        return;
    }

    if(!validateFile(file)) return;

    showLoading(
        'chatResponse',
        'chatResponseContent'
    );

    try {
        const formData = new FormData();
        formData.append('query', query);

        if (file){
            formData.append('file', file);
        }

        const response = await fetch(`${API_URL}/MedicalChat`,
            {
                method: 'POST',
                body: formData
            }
        );

        // Backend Error Handling
        if(!response.ok){

            throw new Error("Server Error");
        }

        const data = await response.json();

        displayResponse('chatResponse','chatResponseContent', data);

        // Clear Inputs
        document.getElementById('queryInput').value = '';
        document.getElementById('fileInput').value = '';
        document.getElementById('fileName').textContent = '';

    } catch (error) {

        showError(
            'chatResponse',
            'chatResponseContent',
            error.message
        );
    }
}

// ===========================================
// SUBMIT PRESCRIPTION
// ===========================================
async function submitPrescription() {

    const file =document.getElementById('prescriptionFile').files[0];

    const query =document.getElementById('prescriptionQuery').value ||'Analyze this prescription';

    if (!file) {
        alert('Please upload a prescription');
        return;
    }

    if(!validateFile(file)) return;

    showLoading(
        'prescriptionResponse',
        'prescriptionResponseContent'
    );

    try {
        const formData = new FormData();
        formData.append('query', query);
        formData.append('file', file);

        const response = await fetch(`${API_URL}/MedicalChat`,
            {
                method: 'POST',
                body: formData
            }
        );

        if(!response.ok){

            throw new Error("Server Error");
        }

        const data = await response.json();

        displayResponse('prescriptionResponse','prescriptionResponseContent',data);

        // Clear Inputs
        document.getElementById('prescriptionFile').value = '';
        document.getElementById('prescFileName').textContent = '';
        document.getElementById('prescriptionQuery').value = '';

    } catch (error) {

        showError(
            'prescriptionResponse',
            'prescriptionResponseContent',
            error.message
        );
    }
}

// ===========================================
// SUBMIT REPORT
// ===========================================
async function submitReport() {

    const file =
        document.getElementById('reportFile').files[0];

    if (!file) {
        alert('Please upload a report');
        return;
    }

    if(!validateFile(file)) return;

    showLoading(
        'reportResponse',
        'reportResponseContent'
    );

    try {

        const formData = new FormData();

        formData.append(
            'query','Explain this medical report');

        formData.append('file', file);

        const response = await fetch(`${API_URL}/MedicalChat`,
            {
                method: 'POST',
                body: formData
            }
        );

        if(!response.ok){
            throw new Error("Server Error");
        }

        const data = await response.json();

        displayResponse(
            'reportResponse',
            'reportResponseContent',
            data
        );

        // Clear Inputs
        document.getElementById(
            'reportFile'
        ).value = '';

        document.getElementById(
            'reportFileName'
        ).textContent = '';

    } catch (error) {

        showError(
            'reportResponse',
            'reportResponseContent',
            error.message
        );
    }
}

// ===========================================
// LOADING UI
// ===========================================
function showLoading(responseId, contentId) {

    const responseEl =
        document.getElementById(responseId);

    const contentEl =
        document.getElementById(contentId);

    responseEl.style.display = 'block';

    responseEl.scrollIntoView({
        behavior: 'smooth'
    });

    contentEl.classList.add('loading');

    contentEl.innerHTML = `

        <div class="loader"></div>

        <p style="margin-top:10px;">
            Analyzing Medical Data...
        </p>
    `;
}

// ===========================================
// DISPLAY RESPONSE
// ===========================================
function displayResponse(
    responseId,
    contentId,
    data
){

    const responseEl =
        document.getElementById(responseId);

    const contentEl =
        document.getElementById(contentId);

    responseEl.style.display = 'block';

    responseEl.scrollIntoView({
        behavior: 'smooth'
    });

    contentEl.classList.remove('loading');

    let html = '';

    // Category
    if (data.category) {

        html += `
            <div class="status-badge status-info">
                Category:
                ${data.category.toUpperCase()}
            </div>
        `;
    }

    // OCR Text
    if (data.ocr_report) {

        html += `
        <div style="
        max-height:150px;
        overflow-y:auto;
        line-height:1.6;
        color:#94a3b8;
        ">
           ${data.ocr_report.substring(0, 400)}...
        </div>`;
    }

    if (data.answer) {

        let formattedAnswer = data.answer

            // Headings
            .replace(/## (.*)/g,
                '<h3 style="margin-top:18px;color:#4ade80;">$1</h3>')

            // Bullet points
            .replace(/- (.*)/g,
                '<li style="margin-left:20px;margin-top:8px;">$1</li>')

            // Line breaks
            .replace(/\n/g, '<br>');

        html += `

            <div style="
                margin-top:1rem;
                line-height:1.8;
                font-size:15px;
                color:#e5e7eb;
            ">

                <strong style="
                    font-size:18px;
                    color:#38bdf8;
                ">
                    🤖 AI Analysis
                </strong>

                <div style="
                    margin-top:12px;
                ">

                    ${formattedAnswer}

                </div>

            </div>
        `;
    }

    contentEl.innerHTML = html;
}

// ===========================================
// ERROR UI
// ===========================================
function showError(
    responseId,
    contentId,
    errorMsg
){

    const responseEl =
        document.getElementById(responseId);

    const contentEl =
        document.getElementById(contentId);

    responseEl.style.display = 'block';

    responseEl.scrollIntoView({
        behavior: 'smooth'
    });

    contentEl.classList.remove('loading');

    contentEl.innerHTML = `

        <div
            class="status-badge"
            style="
                background:
                rgba(255,107,53,0.2);

                color:var(--accent);
            "
        >

            Error: ${errorMsg}

        </div>
    `;
}

// ===========================================
// SCROLL FUNCTIONS
// ===========================================
function scrollToChat() {

    document
    .querySelector('.tabs-section')
    .scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToFeatures() {

    document
    .getElementById('features')
    .scrollIntoView({
        behavior: 'smooth'
    });
}