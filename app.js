
// DATE AUTOMATIQUE

const today = document.getElementById("today");

today.textContent = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});



// NAVIGATION ENTRE LES PAGES

const navLinks = document.querySelectorAll(".nav-link");

const dashboardPage = document.getElementById("dashboard-page");
const notesPage = document.getElementById("notes-page");
const otherPage = document.getElementById("other-page");

const pageTitle = document.getElementById("page-title");
const otherTitle = document.getElementById("other-title");

const pageNames = {
    dashboard: "Tableau de bord",
    notes: "Mes notes",
    finance: "Finances",
    library: "Bibliothèque",
    calendar: "Calendrier"
};

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navLinks.forEach(item =>
            item.classList.remove("active")
        );

        link.classList.add("active");

        const page = link.dataset.page;

        pageTitle.textContent = pageNames[page];

        dashboardPage.classList.add("hidden");
        notesPage.classList.add("hidden");
        otherPage.classList.add("hidden");

        if (page === "dashboard") {
            dashboardPage.classList.remove("hidden");
        }
        else if (page === "notes") {
            notesPage.classList.remove("hidden");
        }
        else {
            otherPage.classList.remove("hidden");
            otherTitle.textContent = pageNames[page];
        }

    });

});


// GESTION DES ACTIVITES

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");


const TASKS_STORAGE_KEY = "studentHubTasks";

let tasks = JSON.parse(
    localStorage.getItem(TASKS_STORAGE_KEY) || "[]"
);

if (!Array.isArray(tasks)) {
    tasks = [];
}

function saveTasks() {
    localStorage.setItem(
        TASKS_STORAGE_KEY,
        JSON.stringify(tasks)
    );
}

// Afficher les activités

function displayTasks() {

    taskList.innerHTML = "";

    if (tasks.length === 0) {
        taskList.innerHTML =
            '<li class="empty">Aucune activité pour le moment.</li>';
    }

    tasks.forEach((task, index) => {

        const li = document.createElement("li");

        const name = document.createElement("span");
        name.textContent = "• " + task;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "×";
        deleteButton.className = "delete-task";

        deleteButton.addEventListener("click", () => {
            tasks.splice(index, 1);
            displayTasks();
        });

        li.append(name, deleteButton);
        taskList.appendChild(li);

    });

    taskCount.textContent = tasks.length;

    saveTasks();
}

// Ajouter une activité

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const newTask = taskInput.value.trim();

    if (newTask === "") return;

    tasks.push(newTask);

    taskInput.value = "";

    displayTasks();

});


// Initialisation

displayTasks();

// GESTION DES NOTES


// ========================================
// STUDENT HUB - GESTION DES UE
// VERSION SEMESTRIELLE
// ========================================


// 1. BASE DE DONNEES

const STORAGE_KEY = "studentHubUnits";

function loadUnits() {

    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return [];

        const data = JSON.parse(saved);

        if (!Array.isArray(data)) return [];

        return data.filter(unit =>
            unit &&
            (unit.semester === "S1" || unit.semester === "S2") &&
            Array.isArray(unit.subjects)
        );

    } catch (error) {
        console.error("Erreur de lecture :", error);
        return [];
    }

}

let units = loadUnits();


// 2. SAUVEGARDE AUTOMATIQUE

function saveUnits() {

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(units)
        );
    } catch (error) {
        alert("Impossible de sauvegarder les données.");
        console.error(error);
    }

}


// 3. ELEMENTS HTML

const ueForm = document.getElementById("ue-form");
const subjectForm = document.getElementById("subject-form");

const ueName = document.getElementById("ue-name");
const ueSemester = document.getElementById("ue-semester");

const subjectUe = document.getElementById("subject-ue");
const subjectName = document.getElementById("subject-name");
const subjectGrade = document.getElementById("subject-grade");

const ueList = document.getElementById("ue-list");
const ueCredits = document.getElementById("ue-credits");

 // 4. CREER UNE UE

ueForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = ueName.value.trim();
    const semester = ueSemester.value;
    const credits = Number(ueCredits.value);

    if (
        !name ||
        !["S1", "S2"].includes(semester) ||
        !Number.isInteger(credits) ||
        credits <= 0 ||
        credits > 60
    ) {
        alert("Vérifie les informations saisies.");
        return;
    }

    units.push({
        id: Date.now() + Math.random(),
        name: name,
        semester: semester,
        credits: credits,
        subjects: []
    });

    saveUnits();
    ueForm.reset();
    displayUnits();

});


// 5. METTRE A JOUR LE CHOIX DES UE

function updateUeOptions() {

    subjectUe.innerHTML =
        '<option value="">Choisir une UE</option>';

    units.forEach(unit => {

        const option = document.createElement("option");

        option.value = unit.id;
        option.textContent =
            unit.name + " (" + unit.semester + ")";

        subjectUe.appendChild(option);

    });

}


// 6. AJOUTER UNE MATIERE

subjectForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const unit = units.find(
        item => String(item.id) === subjectUe.value
    );

    const name = subjectName.value.trim();
    const grade = Number(subjectGrade.value);

    if (!unit || !name ||
        !Number.isFinite(grade) ||
        grade < 0 || grade > 20) {

        alert("Vérifie les informations saisies.");
        return;
    }

    unit.subjects.push({
        id: Date.now() + Math.random(),
        name: name,
        grade: grade
    });

    saveUnits();
    subjectForm.reset();
    displayUnits();

});


// 7. CALCUL DE LA MOYENNE DE L'UE

function calculateUnitAverage(unit) {

    if (!unit.subjects.length) return null;

    const total = unit.subjects.reduce(
        (sum, subject) => sum + subject.grade,
        0
    );

    return total / unit.subjects.length;

}


// 8. VALIDATION DE L'UE

function getUnitStatus(unit) {

// 14. DECISION UNIVERSITAIRE

function getUnitDecision(unit) {

    const average = calculateUnitAverage(unit);

    if (average === null) {
        return {
            label: "En attente",
            code: "pending",
            acquiredCredits: 0
        };
    }

    if (average >= 10) {
        return {
            label: "Validée",
            code: "valid",
            acquiredCredits: Number(unit.credits) || 0
        };
    }

    return {
        label: "Non validée",
        code: "invalid",
        acquiredCredits: 0
    };
}


    const average = calculateUnitAverage(unit);

    if (average === null) return "pending";

    return average >= 10 ? "valid" : "invalid";

}

// 15. BILAN ANNUEL

function getAnnualResults() {

    const s1 = getSemesterResults("S1");
    const s2 = getSemesterResults("S2");

    const totalCredits = s1.totalCredits + s2.totalCredits;

    const acquiredCredits =
        s1.acquiredCredits + s2.acquiredCredits;

    const annualAverage =
        s1.average !== null && s2.average !== null
            ? (s1.average + s2.average) / 2
            : null;

    return {
        totalCredits,
        acquiredCredits,
        remainingCredits: totalCredits - acquiredCredits,
        annualAverage,
        validated: acquiredCredits >= 60
    };
}


// 16. STUDENT HUB ANALYTICS

function updateAnalytics() {

    const averageElement =
        document.getElementById("analytics-average");

    if (!averageElement) return;

    const validatedElement =
        document.getElementById("analytics-validated");

    const creditsElement =
        document.getElementById("analytics-credits");

    const rateElement =
        document.getElementById("analytics-rate");

    const semestersElement =
        document.getElementById("analytics-semesters");

    const averages = units
        .map(calculateUnitAverage)
        .filter(value => value !== null);

    const generalAverage = averages.length
        ? averages.reduce((sum, value) => sum + value, 0)
            / averages.length
        : null;

    const validated = units.filter(
        unit => getUnitStatus(unit) === "valid"
    ).length;

    const acquiredCredits = units
        .filter(unit => getUnitStatus(unit) === "valid")
        .reduce(
            (sum, unit) => sum + (Number(unit.credits) || 0),
            0
        );

    const validationRate = units.length
        ? (validated / units.length) * 100
        : 0;

    averageElement.textContent =
        generalAverage === null
            ? "-- / 20"
            : generalAverage.toFixed(2) + " / 20";

    validatedElement.textContent = validated;
    creditsElement.textContent = acquiredCredits;
    rateElement.textContent =
        validationRate.toFixed(1) + " %";

    // ANALYSE PAR SEMESTRE

    semestersElement.innerHTML = "";

    ["S1", "S2"].forEach(semester => {

        const result = getSemesterResults(semester);

        const section = document.createElement("div");
        section.className = "analytics-semester";

        const average = result.average === null
            ? "--"
            : result.average.toFixed(2) + " / 20";

        const progress = result.totalCredits
            ? Math.min(
                100,
                result.acquiredCredits /
                result.totalCredits * 100
            )
            : 0;

        const title = semester === "S1"
            ? "Semestre 1"
            : "Semestre 2";

        section.innerHTML = `
            <h4>${title}</h4>

            <p>Moyenne : <strong>${average}</strong></p>

            <p>
                UE validées :
                <strong>${result.validatedUnits}
                / ${result.totalUnits}</strong>
            </p>

            <p>
                Crédits :
                <strong>${result.acquiredCredits}
                / ${result.totalCredits}</strong>
            </p>

            <div class="analytics-progress">
                <div style="width:${progress}%"></div>
            </div>
        `;

        semestersElement.appendChild(section);

    });

}


// 9. MODIFIER UNE NOTE

function editSubject(unit, subject) {

    const newName = prompt(
        "Modifier le nom de la matière :",
        subject.name
    );

    if (newName === null) return;

    const cleanName = newName.trim();

    if (!cleanName) {
        alert("Le nom ne peut pas être vide.");
        return;
    }

    const newGrade = prompt(
        "Modifier la note sur 20 :",
        subject.grade
    );

    if (newGrade === null) return;

    const grade = Number(newGrade);

    if (newGrade.trim() === "" ||
        !Number.isFinite(grade) ||
        grade < 0 || grade > 20) {

        alert("La note doit être comprise entre 0 et 20.");
        return;
    }

    subject.name = cleanName;
    subject.grade = grade;

    saveUnits();
    displayUnits();

}
updateStatistics();
updateAnalytics();

 // 18. MODIFIER UNE UE

function editUnit(unit) {

    const newName = prompt(
        "Nouveau nom de l'UE :",
        unit.name
    );

    if (newName === null) return;

    const cleanName = newName.trim();

    if (!cleanName) {
        alert("Le nom de l'UE ne peut pas être vide.");
        return;
    }

    const newSemester = prompt(
        "Semestre : S1 ou S2",
        unit.semester
    );

    if (newSemester === null) return;

    const semester = newSemester.trim().toUpperCase();

    if (!["S1", "S2"].includes(semester)) {
        alert("Semestre invalide.");
        return;
    }

    const newCredits = prompt(
        "Nombre de crédits :",
        unit.credits
    );

    if (newCredits === null) return;

    if (
        newCredits.trim() === "" ||
        !Number.isInteger(Number(newCredits)) ||
        Number(newCredits) <= 0 ||
        Number(newCredits) > 60
    ) {
        alert("Nombre de crédits invalide.");
        return;
    }

    unit.name = cleanName;
    unit.semester = semester;
    unit.credits = Number(newCredits);

    saveUnits();
    displayUnits();

}


// 19. RECHERCHE INTELLIGENTE

const ueSearch = document.getElementById("ue-search");
const searchCount = document.getElementById("search-count");

function filterUnits() {

    const query = ueSearch.value
        .trim()
        .toLowerCase();

    const filteredUnits = units.filter(unit => {

        const unitMatch = unit.name.toLowerCase()
            .includes(query);

        const subjectMatch = unit.subjects.some(subject =>
            subject.name.toLowerCase().includes(query)
        );

        return unitMatch || subjectMatch;
    });

    searchCount.textContent = query
        ? filteredUnits.length + " UE trouvée(s)"
        : "";

    displayUnits(filteredUnits);
}

ueSearch.addEventListener("input", filterUnits);

// 10. AFFICHER LES UE

function displayUnits(displayedUnits = units) {

    ueList.innerHTML = "";

    updateUeOptions();

    ["S1", "S2"].forEach(semester => {

        const section = document.createElement("div");
        section.className = "semester-section";

        const semesterUnits = displayedUnits.filter(
    unit => unit.semester === semester
);

        const heading = document.createElement("div");
        heading.className = "semester-title";

        const title = document.createElement("h2");

        title.textContent =
            semester === "S1"
                ? "Semestre 1"
                : "Semestre 2";

        const count = document.createElement("span");

        count.textContent =
            semesterUnits.length + " unité(s) d'enseignement";

        heading.append(title, count);
        section.appendChild(heading);


        if (semesterUnits.length === 0) {

            const empty = document.createElement("div");
            empty.className = "semester-empty";
            empty.textContent =
                "Aucune UE enregistrée dans ce semestre.";

            section.appendChild(empty);

        }


        semesterUnits.forEach(unit => {

            const card = document.createElement("div");
            card.className = "ue-card";

            const header = document.createElement("div");
            header.className = "ue-header";

            const title = document.createElement("h3");
            title.textContent = unit.name;

            const badge = document.createElement("span");
            const status = getUnitStatus(unit);

            badge.className = "ue-status " + status;

            badge.textContent =
                status === "valid" ? "UE VALIDÉE" :
                status === "invalid" ? "NON VALIDÉE" :
                "EN ATTENTE";

            const removeUE = document.createElement("button");
            removeUE.className = "delete-ue";
            removeUE.textContent = "Supprimer";

            removeUE.addEventListener("click", () => {

                if (confirm("Supprimer cette UE et ses matières ?")) {

                    units = units.filter(
                        item => item.id !== unit.id
                    );

                    saveUnits();
                    displayUnits();

                }

            });

            const editUE = document.createElement("button");

editUE.className = "edit-ue";
editUE.textContent = "Modifier";

editUE.addEventListener("click", () => {
    editUnit(unit);
});

header.append(title, badge, editUE, removeUE);
            // MATIERES DE L'UE

            unit.subjects.forEach(subject => {

                const row = document.createElement("div");
                row.className = "subject-row";

                const name = document.createElement("span");
                name.textContent = subject.name;

                const note = document.createElement("span");
                note.className = "subject-note";
                note.textContent =
                    Number(subject.grade).toFixed(2) + "/20";

                const actions = document.createElement("div");
                actions.className = "subject-actions";

                const edit = document.createElement("button");
                edit.className = "edit-subject";
                edit.textContent = "Modifier";

                edit.addEventListener("click", () => {
                    editSubject(unit, subject);
                });

                const remove = document.createElement("button");
                remove.className = "delete-subject";
                remove.textContent = "×";

                remove.addEventListener("click", () => {

                    unit.subjects = unit.subjects.filter(
                        item => item.id !== subject.id
                    );

                    saveUnits();
                    displayUnits();

                });

                actions.append(edit, remove);
                row.append(name, note, actions);

                card.appendChild(row);

            });


            // RESULTAT DE L'UE

            const result = document.createElement("div");
            result.className = "ue-result";

            const label = document.createElement("span");
            label.textContent = "Moyenne de l'UE";

            const value = document.createElement("strong");

            const average = calculateUnitAverage(unit);

            value.textContent =
                average === null
                    ? "-- / 20"
                    : average.toFixed(2) + " / 20";

            result.append(label, value);
            card.appendChild(result);

            section.appendChild(card);

        });

        ueList.appendChild(section);

    });

    updateStatistics();

}

// 12. RESULTATS SEMESTRIELS

function getSemesterResults(semester) {

    const semesterUnits = units.filter(
        unit => unit.semester === semester
    );

    const averages = semesterUnits
        .map(calculateUnitAverage)
        .filter(value => value !== null);

    const average = averages.length
        ? averages.reduce((sum, value) => sum + value, 0)
            / averages.length
        : null;

    const totalCredits = semesterUnits.reduce(
        (sum, unit) => sum + (Number(unit.credits) || 0),
        0
    );

    const acquiredCredits = semesterUnits
        .filter(unit => getUnitStatus(unit) === "valid")
        .reduce(
            (sum, unit) => sum + (Number(unit.credits) || 0),
            0
        );

    const validatedUnits = semesterUnits.filter(
        unit => getUnitStatus(unit) === "valid"
    ).length;

    return {
        semester,
        average,
        totalCredits,
        acquiredCredits,
        remainingCredits: totalCredits - acquiredCredits,
        totalUnits: semesterUnits.length,
        validatedUnits
    };
}


// 13. GENERATION DU BULLETIN UNIVERSITAIRE

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function printSemesterBulletin(semester) {

    const results = getSemesterResults(semester);

    const semesterUnits = units.filter(
        unit => unit.semester === semester
    );

    const rows = semesterUnits.map(unit => {

        const average = calculateUnitAverage(unit);
        const status = getUnitStatus(unit);

        const subjects = unit.subjects.map(subject =>
            escapeHTML(subject.name) + " : " +
            Number(subject.grade).toFixed(2) + "/20"
        ).join("<br>");

        const decision =
            status === "valid" ? "VALIDÉE" :
            status === "invalid" ? "NON VALIDÉE" :
            "EN ATTENTE";

        const acquired =
            status === "valid" ? Number(unit.credits) || 0 : 0;

        return `
            <tr>
                <td>${escapeHTML(unit.name)}</td>
                <td>${subjects || "Aucune matière"}</td>
                <td>${average === null ? "--" : average.toFixed(2)}</td>
                <td>${Number(unit.credits) || 0}</td>
                <td>${acquired}</td>
                <td>${decision}</td>
            </tr>
        `;

    }).join("");

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
        alert("Autorise les fenêtres pop-up pour imprimer le bulletin.");
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Bulletin Student Hub</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 35px;
                    color: #222;
                }

                h1, h2 {
                    text-align: center;
                }

                .subtitle {
                    text-align: center;
                    color: #666;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 30px;
                }

                th, td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                    font-size: 12px;
                }

                th {
                    background: #172554;
                    color: white;
                }

                .summary {
                    margin-top: 25px;
                    padding: 15px;
                    background: #f1f5f9;
                }

                @media print {
                    body { padding: 10px; }
                }
            </style>
        </head>

        <body>

            <h1>STUDENT HUB</h1>
            <h2>BULLETIN UNIVERSITAIRE</h2>

            <p class="subtitle">
                ${semester === "S1" ? "Semestre 1" : "Semestre 2"}
            </p>

            <p>Date : ${new Date().toLocaleDateString("fr-FR")}</p>

            <table>
                <thead>
                    <tr>
                        <th>UE</th>
                        <th>Matières et notes</th>
                        <th>Moyenne</th>
                        <th>Crédits</th>
                        <th>Acquis</th>
                        <th>Décision</th>
                    </tr>
                </thead>

                <tbody>
                    ${rows}
                </tbody>
            </table>

            <div class="summary">
                <p>Moyenne semestrielle :
                    ${results.average === null
                        ? "--"
                        : results.average.toFixed(2) + "/20"}
                </p>

                <p>UE validées :
                    ${results.validatedUnits}/${results.totalUnits}
                </p>

                <p>Crédits acquis :
                    ${results.acquiredCredits}/${results.totalCredits}
                </p>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                };
            <\/script>

        </body>
        </html>
    `);

    printWindow.document.close();

}

 // 11. STATISTIQUES GENERALES ET CREDITS

function updateStatistics() {

    // Nombre d'UE validées
    const validatedUnits = units.filter(
        unit => getUnitStatus(unit) === "valid"
    );

    const validated = validatedUnits.length;

    // Nombre total d'UE
    const totalUnits = units.length;

    // Moyenne générale simple des UE
    const averages = units
        .map(calculateUnitAverage)
        .filter(value => value !== null);

    const generalAverage = averages.length
        ? averages.reduce((sum, value) => sum + value, 0)
            / averages.length
        : null;

    // Calcul des crédits
    const totalCredits = units.reduce(
        (sum, unit) => sum + (Number(unit.credits) || 0),
        0
    );

    const acquiredCredits = validatedUnits.reduce(
        (sum, unit) => sum + (Number(unit.credits) || 0),
        0
    );

    const remainingCredits = Math.max(
        0,
        totalCredits - acquiredCredits
    );

    const progress = totalCredits > 0
        ? (acquiredCredits / totalCredits) * 100
        : 0;

    // Affichage des statistiques
    document.getElementById("validated-count").textContent =
        validated;

    document.getElementById("ue-count").textContent =
        totalUnits;

    document.getElementById("overall-average").textContent =
        generalAverage === null
            ? "-- / 20"
            : generalAverage.toFixed(2) + " / 20";

    // Affichage des crédits si les éléments existent
    const acquiredElement =
        document.getElementById("acquired-credits");

    const totalElement =
        document.getElementById("total-credits");

    const remainingElement =
        document.getElementById("remaining-credits");

    const progressElement =
        document.getElementById("credit-progress");

    if (acquiredElement) {
        acquiredElement.textContent = acquiredCredits;
    }

    if (totalElement) {
        totalElement.textContent = totalCredits;
    }

    if (remainingElement) {
        remainingElement.textContent = remainingCredits;
    }

    if (progressElement) {
        progressElement.style.width = progress + "%";
    }

}

// 12. INITIALISATION

displayUnits();

displayUnits();
heading.append(title, count);
section.appendChild(heading);
const printButton = document.createElement("button");

printButton.textContent = "Imprimer le bulletin";
printButton.className = "print-bulletin";

printButton.addEventListener("click", () => {
    printSemesterBulletin(semester);
});

section.appendChild(printButton);
// AJOUTER UNE MATIERE

gradeForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("subject").value.trim();
    const grade = Number(document.getElementById("grade").value);
    const coef = Number(document.getElementById("coefficient").value);

    if (!name || !Number.isFinite(grade) ||
        !Number.isFinite(coef) ||
        grade < 0 || grade > 20 || coef <= 0) {
        alert("Vérifie les informations saisies.");
        return;
    }

   
// 17. PROFIL ETUDIANT

const profileForm = document.getElementById("profile-form");

const PROFILE_KEY = "studentHubProfile";

const profileFields = [
    "lastname",
    "firstname",
    "matricule",
    "university",
    "field",
    "level",
    "year"
];

function loadProfile() {

    const saved = localStorage.getItem(PROFILE_KEY);

    if (!saved) return;

    try {
        const profile = JSON.parse(saved);

        profileFields.forEach(field => {
            const element = document.getElementById(
                "profile-" + field
            );

            if (element && profile[field] !== undefined) {
                element.value = profile[field];
            }
        });

    } catch (error) {
        console.error("Erreur de chargement du profil", error);
    }
}

profileForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const profile = {};

    profileFields.forEach(field => {
        profile[field] = document.getElementById(
            "profile-" + field
        ).value.trim();
    });

    localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(profile)
    );

    alert("Profil enregistré avec succès !");

});

loadProfile();


// 20. THEME CLAIR ET SOMBRE

const themeToggle = document.getElementById("theme-toggle");

function applyTheme(theme) {

    document.documentElement.dataset.theme = theme;

    themeToggle.textContent =
        theme === "dark"
            ? "☀️ Mode clair"
            : "🌙 Mode sombre";

    localStorage.setItem("studentHubTheme", theme);
}

const savedTheme =
    localStorage.getItem("studentHubTheme") || "light";

applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {

    const currentTheme =
        document.documentElement.dataset.theme;

    applyTheme(
        currentTheme === "dark" ? "light" : "dark"
    );

});

// ======================================
// STUDENT HUB — SYSTÈME DE SAUVEGARDE
// ======================================

function exporterSauvegarde() {
    const sauvegarde = {
        application: "Student Hub",
        version: "1.0",
        dateExport: new Date().toISOString(),
        donnees: {}
    };

    for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);

        sauvegarde.donnees[cle] = localStorage.getItem(cle);
    }

    const fichier = new Blob(
        [JSON.stringify(sauvegarde, null, 2)],
        { type: "application/json" }
    );

    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(fichier);
    lien.download = "Student-Hub-Sauvegarde.json";

    lien.click();

    URL.revokeObjectURL(lien.href);
}

// ======================================
// IMPORTER UNE SAUVEGARDE
// ======================================
function importerSauvegarde(fichier) {
    if (!fichier) return;

    const lecteur = new FileReader();

    lecteur.onload = function(event) {
        try {
            const sauvegarde = JSON.parse(event.target.result);

            if (
                sauvegarde.application !== "Student Hub" ||
                !sauvegarde.donnees ||
                typeof sauvegarde.donnees !== "object" ||
                Array.isArray(sauvegarde.donnees)
            ) {
                throw new Error("Sauvegarde invalide");
            }

            const donnees = sauvegarde.donnees;

            // Vérification complète avant modification
            for (const [cle, valeur] of Object.entries(donnees)) {
                if (
                    typeof cle !== "string" ||
                    typeof valeur !== "string"
                ) {
                    throw new Error("Données incorrectes");
                }
            }

            const confirmation = confirm(
                "Attention : cette opération va remplacer les données de Student Hub. Continuer ?"
            );

            if (!confirmation) return;

            // Sauvegarde de sécurité des données actuelles
            const anciennesDonnees = {};

            Object.keys(localStorage).forEach(cle => {
                anciennesDonnees[cle] = localStorage.getItem(cle);
            });

            try {
                // Suppression uniquement des anciennes données Student Hub
                Object.keys(anciennesDonnees).forEach(cle => {
                    if (cle.startsWith("studentHub_")) {
                        localStorage.removeItem(cle);
                    }
                });

                // Restauration des nouvelles données
                Object.entries(donnees).forEach(([cle, valeur]) => {
                    localStorage.setItem(cle, valeur);
                });

                alert("Restauration réussie !");
                location.reload();

            } catch (erreur) {
                // Retour aux données précédentes en cas d'échec
                Object.keys(localStorage).forEach(cle => {
                    if (cle.startsWith("studentHub_")) {
                        localStorage.removeItem(cle);
                    }
                });

                Object.entries(anciennesDonnees).forEach(([cle, valeur]) => {
                    localStorage.setItem(cle, valeur);
                });

                throw erreur;
            }

        } catch (erreur) {
            alert("Impossible de restaurer : fichier invalide ou erreur de stockage.");
        }
    };

    lecteur.readAsText(fichier);
// ======================================
// STUDENT HUB — PROFIL ÉTUDIANT
// ======================================

const PROFILE_STORAGE_KEY = "studentHubProfile";

// Charger le profil
function loadStudentProfile() {
    try {
        return JSON.parse(
            localStorage.getItem(PROFILE_STORAGE_KEY)
        ) || {};
    } catch (error) {
        console.error("Erreur de chargement du profil :", error);
        return {};
    }
}

// Sauvegarder le profil
function saveStudentProfile(profile) {
    try {
        localStorage.setItem(
            PROFILE_STORAGE_KEY,
            JSON.stringify(profile)
        );

        return true;

    } catch (error) {
        console.error("Erreur de sauvegarde du profil :", error);
        return false;
    }
}

let studentProfile = loadStudentProfile();
}
// ======================================
// STUDENT HUB — PARAMÈTRES
// ======================================

const SETTINGS_STORAGE_KEY = "studentHubSettings";

function loadStudentSettings() {
    try {
        return JSON.parse(
            localStorage.getItem(SETTINGS_STORAGE_KEY)
        ) || {};
    } catch (error) {
        console.error("Erreur de chargement des paramètres :", error);
        return {};
    }
}

function saveStudentSettings(settings) {
    try {
        localStorage.setItem(
            SETTINGS_STORAGE_KEY,
            JSON.stringify(settings)
        );

        return true;

    } catch (error) {
        console.error("Erreur de sauvegarde :", error);
        return false;
    }
}

let studentSettings = loadStudentSettings();
// ======================================
// STUDENT HUB — EXPORTATION COMPLÈTE
// ======================================

function exporterSauvegarde() {

    const sauvegarde = {
        application: "Student Hub",
        version: "1.0",
        dateExport: new Date().toISOString(),

        donnees: {
            ue: localStorage.getItem("studentHubUnits"),
            activites: localStorage.getItem("studentHubTasks"),
            profil: localStorage.getItem("studentHubProfile"),
            parametres: localStorage.getItem("studentHubSettings")
        }
    };

    const contenu = JSON.stringify(sauvegarde, null, 2);

    const fichier = new Blob(
        [contenu],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(fichier);

    const lien = document.createElement("a");

    lien.href = url;
    lien.download = "Student-Hub-Sauvegarde.json";

    document.body.appendChild(lien);
    lien.click();
    lien.remove();

    URL.revokeObjectURL(url);

    alert("Sauvegarde téléchargée avec succès !");
}// ======================================
// STUDENT HUB — IMPORTATION
// ======================================

function importerSauvegarde(fichier) {

    if (!fichier) return;

    const lecteur = new FileReader();

    lecteur.onload = function(event) {

        try {

            const sauvegarde = JSON.parse(event.target.result);

            if (
                sauvegarde.application !== "Student Hub" ||
                !sauvegarde.donnees ||
                typeof sauvegarde.donnees !== "object"
            ) {
                throw new Error("Fichier invalide");
            }

            const donnees = sauvegarde.donnees;

            const confirmation = confirm(
                "Voulez-vous vraiment restaurer cette sauvegarde ?"
            );

            if (!confirmation) return;

            const cles = {
                ue: "studentHubUnits",
                activites: "studentHubTasks",
                profil: "studentHubProfile",
                parametres: "studentHubSettings"
            };

            // Vérifier toutes les données avant restauration
            for (const [nom, valeur] of Object.entries(donnees)) {

                if (!(nom in cles)) continue;

                if (valeur !== null) {
                    JSON.parse(valeur);
                }

            }

            // Préserver les données actuelles
            const anciennesDonnees = {};

            Object.values(cles).forEach(cle => {
                anciennesDonnees[cle] = localStorage.getItem(cle);
            });

            try {

                Object.entries(cles).forEach(([nom, cle]) => {

                    const valeur = donnees[nom];

                    if (valeur === null || valeur === undefined) {
                        localStorage.removeItem(cle);
                    } else {
                        localStorage.setItem(cle, valeur);
                    }

                });

            } catch (erreur) {

                Object.entries(anciennesDonnees).forEach(([cle, valeur]) => {

                    if (valeur === null) {
                        localStorage.removeItem(cle);
                    } else {
                        localStorage.setItem(cle, valeur);
                    }

                });

                throw erreur;
            }

            alert("Restauration réussie !");
            location.reload();

        } catch (erreur) {

            console.error(erreur);

            alert("Impossible de restaurer cette sauvegarde.");

        }

    };

    lecteur.readAsText(fichier);
}
// ======================================
// STUDENT HUB — VALIDATION DES SAUVEGARDES
// ======================================

function verifierSauvegarde(sauvegarde) {

    if (!sauvegarde || typeof sauvegarde !== "object") {
        return false;
    }

    if (sauvegarde.application !== "Student Hub") {
        return false;
    }

    if (sauvegarde.version !== "1.0") {
        return false;
    }

    const data = sauvegarde.donnees;

    if (!data || typeof data !== "object") {
        return false;
    }

    // Vérification des UE
    if (data.ue !== null && data.ue !== undefined) {

        const unitsData = JSON.parse(data.ue);

        if (!Array.isArray(unitsData)) return false;

        for (const unit of unitsData) {

            if (
                !unit ||
                typeof unit.name !== "string" ||
                !["S1", "S2"].includes(unit.semester) ||
                !Number.isInteger(Number(unit.credits)) ||
                Number(unit.credits) <= 0 ||
                !Array.isArray(unit.subjects)
            ) {
                return false;
            }

            for (const subject of unit.subjects) {

                if (
                    !subject ||
                    typeof subject.name !== "string" ||
                    !Number.isFinite(Number(subject.grade)) ||
                    Number(subject.grade) < 0 ||
                    Number(subject.grade) > 20
                ) {
                    return false;
                }

            }
        }
    }

    // Vérification des activités
    if (data.activites !== null && data.activites !== undefined) {

        const activities = JSON.parse(data.activites);

        if (
            !Array.isArray(activities) ||
            !activities.every(task => typeof task === "string")
        ) {
            return false;
        }
    }

    // Vérification du profil et des paramètres
    for (const key of ["profil", "parametres"]) {

        if (data[key] !== null && data[key] !== undefined) {

            const value = JSON.parse(data[key]);

            if (
                !value ||
                typeof value !== "object" ||
                Array.isArray(value)
            ) {
                return false;
            }
        }
    }

    return true;
}

