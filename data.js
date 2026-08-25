const SUBJECT_CATALOG = {
    "sem7": {
        title: "7th Semester (Degree)",
        page: "sem7.html",
        subjects: [
            { code: "CE701", name: "Artificial Intelligence", materials: {
                "Lab Manual": [{ name: "AI Lab Manual.pdf", href: "#" }],
                "Syllabus": [{ name: "Syllabus - CE701.pdf", href: "#" }],
                "Unit Notes": [{ name: "Unit 1 - Intro to AI & Agents.pdf", href: "#" }, { name: "Unit 2 - Uninformed Search.pdf", href: "#" }],
                "Assignments": [{ name: "Assignment 1 - BFS & DFS in Python.pdf", href: "#" }],
                "Mid Question Bank": [{ name: "Mid QBank - AI.pdf", href: "#" }],
                "Final Question Bank": [{ name: "Final Prep - AI.pdf", href: "#" }],
                "Question Bank Solutions": [{ name: "Model Answers - AI QBank.pdf", href: "#" }]
            }}
        ]
    },
    "sem5": {
        title: "5th Semester (Degree)",
        page: "sem5.html",
        subjects: [
            { code: "CE501", name: "Operating Systems", materials: {
                "Lab Manual": [{ name: "OS Lab Manual - Unix Command.pdf", href: "#" }],
                "Syllabus": [{ name: "Syllabus - CE501.pdf", href: "#" }],
                "Unit Notes": [{ name: "Unit 1 - Process Management.pdf", href: "#" }, { name: "Unit 2 - Thread Scheduling.pdf", href: "#" }],
                "Assignments": [{ name: "Assignment 1 - Shell Scripting.pdf", href: "#" }],
                "Mid Question Bank": [{ name: "Mid QBank - OS.pdf", href: "#" }],
                "Final Question Bank": [{ name: "Final Prep - OS.pdf", href: "#" }]
            }}
           
        ]
    },
    "sem3": {
        title: "3rd Semester (Degree)",
        page: "sem3.html",
        subjects: [
            { code: "CE301", name: "Data Structures", materials: {
                "Lab Manual": [{ name: "DS Lab Manual.pdf", href: "#" }],
                "Syllabus": [{ name: "Syllabus - CE301.pdf", href: "#" }],
                "Unit Notes": [{ name: "Unit 1 - Arrays and Linked Lists.pdf", href: "#" }, { name: "Unit 2 - Stacks and Queues.pdf", href: "#" }],
                "Assignments": [{ name: "Assignment 1 - Recursion & Linked Lists.pdf", href: "#" }],
                "Mid Question Bank": [{ name: "Mid QBank - DS.pdf", href: "#" }],
                "Final Question Bank": [{ name: "Final Prep - DS.pdf", href: "#" }]
            }}
        ]
    },
    "sem1": {
        title: "1st Semester (Degree)",
        page: "sem1.html",
        subjects: [
            { code: "CE101", name: "Engineering Mathematics - I", materials: {
                "Lab Manual": [
                    { name: "Lab Manual - Practical Set 1.pdf", href: "#" },
                    { name: "Lab Manual - Observation Sheet.pdf", href: "#" }
                ],
                "Syllabus": [
                    { name: "Syllabus - CE101.pdf", href: "#" }
                ],
                "Unit Notes": [
                    { name: "Unit 1 Notes.pdf", href: "#" },
                    { name: "Unit 2 Notes.pdf", href: "#" },
                    { name: "Unit 3 Notes.pdf", href: "#" }
                ],
                "Assignments": [
                    { name: "Assignment 1.pdf", href: "#" },
                    { name: "Assignment 2.pdf", href: "#" }
                ],
                "Mid Question Bank": [
                    { name: "Mid QBank - Important Questions.pdf", href: "#" },
                    { name: "Mid QBank - Unit Wise.pdf", href: "#" }
                ],
                "Final Question Bank": [
                    { name: "Final QBank - Full Course.pdf", href: "#" },
                    { name: "Final QBank - Sample Paper.pdf", href: "#" }
                ],
                "Question Bank Solutions": [
                    { name: "Solution Key - Mid.pdf", href: "#" },
                    { name: "Solution Key - Final.pdf", href: "#" },
                    { name: "Model Answers - All Units.pdf", href: "#" }
                ]
            }}
        ]
    },
    "sem5dip": {
        title: "5th Semester (Diploma)",
        page: "sem5dip.html",
        subjects: [
            { code: "DCE501", name: "Operating Systems (Dip)", materials: {
                "Lab Manual": [{ name: "Diploma OS Practicals.pdf", href: "#" }],
                "Syllabus": [{ name: "Syllabus - DCE501.pdf", href: "#" }],
                "Unit Notes": [{ name: "OS Memory Management.pdf", href: "#" }]
            }}
        ]
    },
    "sem3dip": {
        title: "3rd Semester (Diploma)",
        page: "sem3dip.html",
        subjects: [
            { code: "DCE301", name: "Advanced Data Structures (Dip)", materials: {
                "Lab Manual": [{ name: "ADS Lab Manual.pdf", href: "#" }],
                "Syllabus": [{ name: "Syllabus - DCE301.pdf", href: "#" }],
                "Unit Notes": [{ name: "Tree and Graph Structures.pdf", href: "#" }]
            }}
        ]
    },
    "sem1dip": {
        title: "1st Semester (Diploma)",
        page: "sem1dip.html",
        subjects: [
            { code: "DCE101", name: "Basic Mathematics (Dip)", materials: {
                "Syllabus": [{ name: "Syllabus - DCE101.pdf", href: "#" }],
                "Unit Notes": [{ name: "Algebra and Trigonometry.pdf", href: "#" }]
            }}
        ]
    }
};

// Retrieve custom subjects added by user in local storage
function getCustomSubjects() {
    return JSON.parse(localStorage.getItem('custom_subjects') || '[]');
}

// Save a custom subject added by user
function addCustomSubject(semId, code, name) {
    const custom = getCustomSubjects();
    custom.push({ semId, code, name });
    localStorage.setItem('custom_subjects', JSON.stringify(custom));
}

// Get the full list of subjects including custom subjects
function getSubjectsForSemester(semId) {
    const defaultData = SUBJECT_CATALOG[semId];
    if (!defaultData) return [];
    
    const subjects = [...defaultData.subjects];
    const custom = getCustomSubjects();
    
    custom.forEach(sub => {
        if (sub.semId === semId) {
            // Check if already exists in default to avoid duplicate codes
            if (!subjects.some(s => s.code === sub.code)) {
                subjects.push({
                    code: sub.code,
                    name: sub.name,
                    materials: {}
                });
            }
        }
    });
    
    return subjects;
}

// Find a subject's metadata by its code across all semesters
function findSubjectByCode(code) {
    // Check custom subjects first
    const custom = getCustomSubjects();
    const customMatch = custom.find(sub => sub.code === code);
    if (customMatch) {
        const semDetails = SUBJECT_CATALOG[customMatch.semId];
        return {
            code: customMatch.code,
            name: customMatch.name,
            semesterId: customMatch.semId,
            semesterTitle: semDetails ? semDetails.title : "Custom Semester",
            materials: {}
        };
    }
    
    // Check catalog default subjects
    for (const semId in SUBJECT_CATALOG) {
        const match = SUBJECT_CATALOG[semId].subjects.find(sub => sub.code === code);
        if (match) {
            return {
                code: match.code,
                name: match.name,
                semesterId: semId,
                semesterTitle: SUBJECT_CATALOG[semId].title,
                materials: match.materials
            };
        }
    }
    
    return null;
}
