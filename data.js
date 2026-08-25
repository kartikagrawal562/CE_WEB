const SUBJECT_CATALOG = {
    "sem7": {
        title: "7th Semester (Degree)",
        page: "sem7.html",
        subjects: [
            { code: "", name: "", materials: {
                "Lab Manual": [{ name: "", href: "" }],
                "Syllabus": [{ name: "", href: "" }],
                "Unit Notes": [{ name: "", href: "" }],
                "Assignments": [{ name: "", href: "" }],
                "Mid Question Bank": [{ name: "", href: "" }],
                "Final Question Bank": [{ name: "", href: "" }],
                "Question Bank Solutions": [{ name: "", href: "" }]
            }}
        ]
    },
    "sem5": {
        title: "5th Semester (Degree)",
        page: "sem5.html",
        subjects: [
            { code: "", name: "", materials: {
                "Lab Manual": [{ name: "", href: "" }],
                "Syllabus": [{ name: "", href: "" }],
                "Unit Notes": [{ name: "", href: "" }],
                "Assignments": [{ name: "", href: "" }],
                "Mid Question Bank": [{ name: "", href: "" }],
                "Final Question Bank": [{ name: "", href: "" }],
                "Question Bank Solutions": [{ name: "", href: "" }]
            }}
           
        ]
    },
    "sem3": {
        title: "3rd Semester (Degree)",
        page: "sem3.html",
        subjects: [
            { code: "", name: "", materials: {
                "Lab Manual": [{ name: "", href: "" }],
                "Syllabus": [{ name: "", href: "" }],
                "Unit Notes": [{ name: "", href: "" }],
                "Assignments": [{ name: "", href: "" }],
                "Mid Question Bank": [{ name: "", href: "" }],
                "Final Question Bank": [{ name: "", href: "" }],
                "Question Bank Solutions": [{ name: "", href: "" }]
            }}
        ]
    },
    "sem1": {
        title: "1st Semester (Degree)",
        page: "sem1.html",
        subjects: [
             { code: "", name: "", materials: {
                "Lab Manual": [{ name: "", href: "" }],
                "Syllabus": [{ name: "", href: "" }],
                "Unit Notes": [{ name: "", href: "" }],
                "Assignments": [{ name: "", href: "" }],
                "Mid Question Bank": [{ name: "", href: "" }],
                "Final Question Bank": [{ name: "", href: "" }],
                "Question Bank Solutions": [{ name: "", href: "" }]
            }}
        ]
    },
    "sem5dip": {
        title: "5th Semester (Diploma)",
        page: "sem5dip.html",
        subjects: [
             { code: "", name: "", materials: {
                "Lab Manual": [{ name: "", href: "" }],
                "Syllabus": [{ name: "", href: "" }],
                "Unit Notes": [{ name: "", href: "" }],
                "Assignments": [{ name: "", href: "" }],
                "Mid Question Bank": [{ name: "", href: "" }],
                "Final Question Bank": [{ name: "", href: "" }],
                "Question Bank Solutions": [{ name: "", href: "" }]
            }}
        ]
    },
    "sem3dip": {
        title: "3rd Semester (Diploma)",
        page: "sem3dip.html",
        subjects: [
             { code: "", name: "", materials: {
                "Lab Manual": [{ name: "", href: "" }],
                "Syllabus": [{ name: "", href: "" }],
                "Unit Notes": [{ name: "", href: "" }],
                "Assignments": [{ name: "", href: "" }],
                "Mid Question Bank": [{ name: "", href: "" }],
                "Final Question Bank": [{ name: "", href: "" }],
                "Question Bank Solutions": [{ name: "", href: "" }]
            }}
        ]
    },
    "sem1dip": {
        title: "1st Semester (Diploma)",
        page: "sem1dip.html",
        subjects: [
             { code: "", name: "", materials: {
                "Lab Manual": [{ name: "", href: "" }],
                "Syllabus": [{ name: "", href: "" }],
                "Unit Notes": [{ name: "", href: "" }],
                "Assignments": [{ name: "", href: "" }],
                "Mid Question Bank": [{ name: "", href: "" }],
                "Final Question Bank": [{ name: "", href: "" }],
                "Question Bank Solutions": [{ name: "", href: "" }]
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
