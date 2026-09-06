// =====================================
// SATQUERY AI - FRONTEND CONTROLLER
// =====================================


// -------------------------------
// GET ELEMENTS
// -------------------------------

const modeCards = document.querySelectorAll(".mode-card");

const uploadModes = document.querySelectorAll(".upload-mode");

const uploadTitle = document.getElementById("uploadTitle");

const queryInput = document.getElementById("queryInput");

const analyzeButton = document.getElementById("analyzeButton");

const resultsSection = document.getElementById("results");

const resultText = document.getElementById("resultText");

const confidence = document.getElementById("confidence");

const confidenceFill = document.getElementById("confidenceFill");

const selectedTask = document.getElementById("selectedTask");

const selectedModel = document.getElementById("selectedModel");

const executionSteps = document.getElementById("executionSteps");

const evidenceBox = document.getElementById("evidenceBox");

const downloadReport = document.getElementById("downloadReport");


// -------------------------------
// CURRENT MODE
// -------------------------------

let currentMode = "single";


// -------------------------------
// MODE CONFIGURATION
// -------------------------------

const modeConfig = {

    single: {

        title: "Upload Satellite Image",

        uploadId: "singleUpload",

        task: "Single-Image Remote Sensing Analysis",

        model: "Remote-Sensing VQA Specialist",

        placeholder:
            "Example: Describe the land-cover and major objects visible in this image?"

    },


    cross: {

        title: "Upload Optical + SAR Image Pair",

        uploadId: "crossUpload",

        task: "Cross-Modal Optical-SAR Analysis",

        model: "Optical-SAR Fusion Specialist",

        placeholder:
            "Example: Use the Optical and SAR images together to identify built-up and water-covered regions."

    },


    change: {

        title: "Upload Bi-Temporal Image Pair",

        uploadId: "changeUpload",

        task: "Multi-Temporal Change Analysis",

        model: "Change Detection & Change-VQA Specialist",

        placeholder:
            "Example: What changed between these two dates, and where did the change occur?"

    }

};


// -------------------------------
// SELECT MODE
// -------------------------------

modeCards.forEach(function (card) {

    card.addEventListener("click", function () {

        currentMode = card.dataset.mode;

        // Remove active from all cards

        modeCards.forEach(function (item) {

            item.classList.remove("active");

        });

        // Add active to selected card

        card.classList.add("active");

        // Hide all upload modes

        uploadModes.forEach(function (upload) {

            upload.classList.remove("active-upload");

        });

        // Show selected upload mode

        const selectedUpload =
            document.getElementById(
                modeConfig[currentMode].uploadId
            );

        if (selectedUpload) {

            selectedUpload.classList.add("active-upload");

        }

        // Update upload title

        uploadTitle.textContent =
            modeConfig[currentMode].title;

        // Update query placeholder

        queryInput.placeholder =
            modeConfig[currentMode].placeholder;

    });

});


// -------------------------------
// FILE PREVIEW FUNCTION
// -------------------------------

function setupFileUpload(

    inputId,
    statusId,
    previewId,
    previewBoxId

) {

    const input =
        document.getElementById(inputId);

    const status =
        document.getElementById(statusId);

    const preview =
        document.getElementById(previewId);

    const previewBox =
        document.getElementById(previewBoxId);


    if (!input || !status || !preview || !previewBox) {

        console.warn(
            "File upload element missing:",
            inputId
        );

        return;

    }


    input.addEventListener(

        "change",

        function () {

            const file =
                input.files[0];


            if (!file) {

                status.textContent =
                    "No file selected";

                previewBox.style.display =
                    "none";

                return;

            }


            // Display selected filename

            status.textContent =
                "✓ " + file.name;


            // Show preview only for browser-readable images

            if (
                file.type.startsWith("image/")
            ) {

                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

                        preview.src =
                            event.target.result;

                        previewBox.style.display =
                            "block";

                    };


                reader.readAsDataURL(file);

            }

            else {

                previewBox.style.display =
                    "none";

            }

        }

    );

}


// -------------------------------
// SETUP ALL FILE INPUTS
// -------------------------------

setupFileUpload(
    "singleImage",
    "singleStatus",
    "singlePreview",
    "singlePreviewBox"
);

setupFileUpload(
    "opticalImage",
    "opticalStatus",
    "opticalPreview",
    "opticalPreviewBox"
);

setupFileUpload(
    "sarImage",
    "sarStatus",
    "sarPreview",
    "sarPreviewBox"
);

setupFileUpload(
    "beforeImage",
    "beforeStatus",
    "beforePreview",
    "beforePreviewBox"
);

setupFileUpload(
    "afterImage",
    "afterStatus",
    "afterPreview",
    "afterPreviewBox"
);


// -------------------------------
// SUGGESTED QUESTIONS
// -------------------------------

const suggestionButtons =
    document.querySelectorAll(".suggestion-btn");


suggestionButtons.forEach(function (button) {

    button.addEventListener(

        "click",

        function () {

            queryInput.value =
                button.textContent.trim();

            queryInput.focus();

        }

    );

});


// -------------------------------
// SCROLL TO ANALYSIS
// -------------------------------

function scrollToAnalysis() {

    const analysisSection =
        document.getElementById("analysis");


    if (analysisSection) {

        analysisSection.scrollIntoView({

            behavior: "smooth"

        });

    }

}


// -------------------------------
// GET REQUIRED FILES
// -------------------------------

function getFilesForMode() {

    if (currentMode === "single") {

        return [

            document
                .getElementById("singleImage")
                .files[0]

        ];

    }


    if (currentMode === "cross") {

        return [

            document
                .getElementById("opticalImage")
                .files[0],

            document
                .getElementById("sarImage")
                .files[0]

        ];

    }


    if (currentMode === "change") {

        return [

            document
                .getElementById("beforeImage")
                .files[0],

            document
                .getElementById("afterImage")
                .files[0]

        ];

    }


    return [];

}


// -------------------------------
// DETECT TASK FROM QUERY
// -------------------------------

function detectTask(query) {

    const text =
        query.toLowerCase();


    // CHANGE ANALYSIS

    if (
        currentMode === "change"
    ) {

        return {

            task:
                "Multi-Temporal Change Analysis",

            model:
                "Change Detection & Change-VQA Specialist"

        };

    }


    // OPTICAL + SAR

    if (
        currentMode === "cross"
    ) {

        return {

            task:
                "Cross-Modal Optical-SAR Analysis",

            model:
                "Optical-SAR Fusion Specialist"

        };

    }


    // SCENE DESCRIPTION

    if (

        text.includes("describe") ||

        text.includes("description") ||

        text.includes("caption") ||

        text.includes("land cover")

    ) {

        return {

            task:
                "Remote-Sensing Scene Description",

            model:
                "Remote-Sensing Captioning Specialist"

        };

    }


    // GROUNDING

    if (

        text.includes("highlight") ||

        text.includes("where") ||

        text.includes("locate") ||

        text.includes("location") ||

        text.includes("region")

    ) {

        return {

            task:
                "Text-Guided Region Grounding",

            model:
                "Remote-Sensing Grounding Specialist"

        };

    }


    // DEFAULT VQA

    return {

        task:
            "Remote-Sensing Visual Question Answering",

        model:
            "Remote-Sensing VQA Specialist"

    };

}


// -------------------------------
// CREATE DEMO RESULT
// -------------------------------

function generateDemoResult(taskData, query) {

    if (
        currentMode === "change"
    ) {

        return (

            "The bi-temporal analysis detected spatial differences " +

            "between the earlier and later satellite images. " +

            "The SatQuery AI workflow identified areas where " +

            "land-cover patterns changed and routed the query " +

            "through the change-analysis specialist."

        );

    }


    if (
        currentMode === "cross"
    ) {

        return (

            "The Optical and SAR images were jointly analyzed " +

            "to extract complementary information. Optical data " +

            "provides spectral and contextual information, while " +

            "SAR contributes structural information and supports " +

            "observation even under cloud cover."

        );

    }


    return (

        "SatQuery AI interpreted your question and selected " +

        "a remote-sensing specialist workflow. The uploaded " +

        "image was prepared for visual question answering, " +

        "scene understanding, or region grounding based on " +

        "the query."

    );

}


// -------------------------------
// SHOW EXECUTION LOADING
// -------------------------------

function showLoadingTrace() {

    executionSteps.innerHTML = `

        <div class="execution-item">

            <strong>01</strong>

            Input validation started.

        </div>


        <div class="execution-item">

            <strong>02</strong>

            Image modality and configuration checked.

        </div>


        <div class="execution-item">

            <strong>03</strong>

            Natural-language query interpreted.

        </div>


        <div class="execution-item">

            <strong>04</strong>

            Selecting specialist AI workflow.

        </div>

    `;

}


// -------------------------------
// SHOW SUCCESS TRACE
// -------------------------------

function showSuccessTrace(data) {

    executionSteps.innerHTML = `

        <div class="execution-item">

            <strong>01</strong>

            Inputs validated successfully.

        </div>


        <div class="execution-item">

            <strong>02</strong>

            Analysis mode:
            ${data.mode || currentMode}.

        </div>


        <div class="execution-item">

            <strong>03</strong>

            Natural-language query processed.

        </div>


        <div class="execution-item">

            <strong>04</strong>

            Specialist workflow selected.

        </div>


        <div class="execution-item">

            <strong>05</strong>

            Remote-sensing analysis completed.

        </div>


        <div class="execution-item">

            <strong>06</strong>

            Result returned to frontend.

        </div>

    `;

}


// -------------------------------
// SHOW ERROR TRACE
// -------------------------------

function showErrorTrace() {

    executionSteps.innerHTML = `

        <div class="execution-item">

            <strong>01</strong>

            Frontend request created.

        </div>


        <div class="execution-item">

            <strong>02</strong>

            Image and query sent to backend.

        </div>


        <div class="execution-item">

            <strong>03</strong>

            Backend connection failed.

        </div>


        <div class="execution-item">

            <strong>04</strong>

            Please check FastAPI server.

        </div>

    `;

}


// -------------------------------
// ANALYZE
// -------------------------------

analyzeButton.addEventListener(

    "click",

    async function () {


        // -----------------------
        // GET FILES
        // -----------------------

        const files =
            getFilesForMode();


        // -----------------------
        // GET QUERY
        // -----------------------

        const query =
            queryInput.value.trim();


        // -----------------------
        // VALIDATE FILES
        // -----------------------

        if (
            files.some(
                file => !file
            )
        ) {

            alert(

                "Please upload all required satellite images " +

                "for the selected analysis mode."

            );

            return;

        }


        // -----------------------
        // VALIDATE QUERY
        // -----------------------

        if (!query) {

            alert(

                "Please enter a question for SatQuery AI."

            );

            queryInput.focus();

            return;

        }


        // -----------------------
        // DETECT TASK
        // -----------------------

        const taskData =
            detectTask(query);


        // -----------------------
        // SHOW RESULTS SECTION
        // -----------------------

        resultsSection.classList.add("show");


        // -----------------------
        // INITIAL RESULT
        // -----------------------

        resultText.textContent =

            "SatQuery AI Agent is validating inputs " +

            "and selecting the correct specialist workflow...";


        confidence.textContent =
            "--";


        confidenceFill.style.width =
            "0%";


        selectedTask.textContent =
            "Agent routing in progress...";


        selectedModel.textContent =
            "Selecting specialist...";


        // -----------------------
        // DISABLE BUTTON
        // -----------------------

        analyzeButton.disabled =
            true;


        analyzeButton.textContent =
            "Analyzing Satellite Data... ⏳";


        // -----------------------
        // EXECUTION TRACE
        // -----------------------

        showLoadingTrace();


        // -----------------------
        // CREATE FORM DATA
        // -----------------------

        const formData =
            new FormData();


        // Analysis mode

        formData.append(
            "mode",
            currentMode
        );


        // Natural language query

        formData.append(
            "query",
            query
        );


        // -----------------------
        // SEND FIRST IMAGE
        // -----------------------

        if (files[0]) {

            formData.append(
                "image1",
                files[0]
            );

        }


        // -----------------------
        // SEND SECOND IMAGE
        // -----------------------

        if (files[1]) {

            formData.append(
                "image2",
                files[1]
            );

        }


        // -----------------------
        // CONNECT TO FASTAPI
        // -----------------------

        try {
            const response =
                await fetch(

                    "https://satquery-ai-n3de.onrender.com/analyze",

                    {

                        method: "POST",

                        body: formData

                    }

                );


            // -----------------------
            // CHECK RESPONSE
            // -----------------------

            if (!response.ok) {

                throw new Error(

                    "Backend returned HTTP " +
                    response.status

                );

            }


            // -----------------------
            // CONVERT TO JSON
            // -----------------------

            const data =
                await response.json();


            console.log(
                "SatQuery Backend Response:",
                data
            );


            // -----------------------
            // RESULT TEXT
            // -----------------------

            resultText.textContent =

                data.response ||

                generateDemoResult(
                    taskData,
                    query
                );


            // -----------------------
            // SELECTED TASK
            // -----------------------

            selectedTask.textContent =

                data.task ||

                taskData.task;


            // -----------------------
            // SELECTED MODEL
            // -----------------------

            selectedModel.textContent =

                data.model ||

                taskData.model;


            // -----------------------
            // CONFIDENCE
            // -----------------------

            const confidenceScore =

                Number(
                    data.confidence ?? 90
                );


            confidence.textContent =

                confidenceScore + "%";


            confidenceFill.style.width =

                Math.max(
                    0,
                    Math.min(
                        100,
                        confidenceScore
                    )
                ) + "%";


            // -----------------------
            // VISUAL EVIDENCE
            // -----------------------

            evidenceBox.innerHTML = `

                <div>🗺️</div>

                <h3>
                    Evidence Generated
                </h3>

                <p>
                    ${data.evidence ||
                "Remote-sensing evidence will be connected to the AI model in the next stage."
                }
                </p>

            `;


            // -----------------------
            // SUCCESS TRACE
            // -----------------------

            showSuccessTrace(data);


        }

        // -----------------------
        // BACKEND ERROR
        // -----------------------

        catch (error) {

            console.error(
                "SatQuery Backend Error:",
                error
            );


            // Result

            resultText.textContent =

                "Unable to connect to SatQuery AI backend. " +

                "Please make sure the FastAPI server is running.";


            // Task

            selectedTask.textContent =
                "Backend Connection Error";


            // Model

            selectedModel.textContent =
                "FastAPI Backend";


            // Confidence

            confidence.textContent =
                "--";


            confidenceFill.style.width =
                "0%";


            // Evidence

            evidenceBox.innerHTML = `

                <div>⚠️</div>

                <h3>
                    Backend Connection Failed
                </h3>

                <p>
                    Please make sure the SatQuery AI FastAPI
                    server is running on port 8000.
                </p>

            `;


            // Error trace

            showErrorTrace();

        }


        // -----------------------
        // FINALLY
        // -----------------------

        finally {

            // Enable button

            analyzeButton.disabled =
                false;


            analyzeButton.textContent =
                "🤖 Analyze with SatQuery AI →";


            // Scroll to results

            setTimeout(

                function () {

                    resultsSection.scrollIntoView({

                        behavior: "smooth"

                    });

                },

                300

            );

        }

    }

);


// -------------------------------
// DOWNLOAD REPORT
// -------------------------------

if (downloadReport) {

    downloadReport.addEventListener(

        "click",

        function () {

            const reportText =

                "SATQUERY AI ANALYSIS REPORT\n" +

                "====================================\n\n" +

                "Analysis Mode: " +
                currentMode +
                "\n\n" +

                "Query:\n" +
                queryInput.value.trim() +
                "\n\n" +

                "Result:\n" +
                resultText.textContent +
                "\n\n" +

                "Confidence:\n" +
                confidence.textContent +
                "\n\n" +

                "Selected Task:\n" +
                selectedTask.textContent +
                "\n\n" +

                "Specialist Model:\n" +
                selectedModel.textContent +
                "\n\n" +

                "Generated by SatQuery AI\n";


            const blob =
                new Blob(

                    [reportText],

                    {
                        type: "text/plain"
                    }

                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href =
                url;


            link.download =
                "SatQuery_AI_Analysis_Report.txt";


            document.body.appendChild(link);


            link.click();


            document.body.removeChild(link);


            URL.revokeObjectURL(url);

        }

    );

}


// =====================================
// SATQUERY AI - INITIALIZATION
// =====================================

console.log(
    "🛰️ SatQuery AI Frontend Loaded Successfully."
);

console.log(
    "Current Analysis Mode:",
    currentMode
);
console.log(
    "Backend Endpoint:",
    "https://satquery-ai-n3de.onrender.com/analyze"
);