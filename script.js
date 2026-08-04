document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeSelect = document.getElementById('themeSelect');
    const printBtn = document.getElementById('printBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    const addSkillBtn = document.getElementById('addSkillBtn');
    const addStrengthBtn = document.getElementById('addStrengthBtn');
    const addLanguageBtn = document.getElementById('addLanguageBtn');
    const addCertBtn = document.getElementById('addCertBtn');
    const addAchBtn = document.getElementById('addAchBtn');

    const resSkills = document.getElementById('resSkills');
    const resStrengths = document.getElementById('resStrengths');
    const resLanguages = document.getElementById('resLanguages');
    const resCertifications = document.getElementById('resCertifications');
    const resAchievements = document.getElementById('resAchievements');

    // Default Data Backup (for Reset function)
    const originalHTML = {};
    const defaultListHTML = {
        resSkills: resSkills.innerHTML,
        resStrengths: resStrengths.innerHTML,
        resLanguages: resLanguages.innerHTML,
        resCertifications: resCertifications.innerHTML,
        resAchievements: resAchievements.innerHTML
    };

    // Backup individual editables
    document.querySelectorAll('.editable[id]').forEach(el => {
        originalHTML[el.id] = el.innerHTML.trim();
    });

    // ==========================================================================
    // 1. Theme Management
    // ==========================================================================
    const savedTheme = localStorage.getItem('resume-theme') || 'noir';
    themeSelect.value = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('resume-theme', theme);
    });

    // ==========================================================================
    // 2. Data Loading
    // ==========================================================================
    function loadSavedResumeData() {
        // Load individual editable fields
        document.querySelectorAll('.editable[id]').forEach(el => {
            const savedValue = localStorage.getItem(`resume-field-${el.id}`);
            if (savedValue !== null) {
                el.innerHTML = savedValue;
            }
        });

        // Load dynamic lists
        ['resSkills', 'resStrengths', 'resLanguages', 'resCertifications', 'resAchievements'].forEach(listId => {
            const savedList = localStorage.getItem(`resume-list-${listId}`);
            if (savedList !== null) {
                const listEl = document.getElementById(listId);
                listEl.innerHTML = savedList;
            }
            // Add delete buttons to list items
            ensureDeleteButtons(document.getElementById(listId));
        });
    }

    // ==========================================================================
    // 3. Auto-Saving Configuration
    // ==========================================================================
    function saveField(el) {
        if (el.id) {
            localStorage.setItem(`resume-field-${el.id}`, el.innerHTML);
        }
    }

    function saveList(listEl) {
        // Temporarily strip delete buttons to keep saved code clean
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = listEl.innerHTML;
        tempDiv.querySelectorAll('.delete-btn').forEach(btn => btn.remove());
        
        localStorage.setItem(`resume-list-${listEl.id}`, tempDiv.innerHTML);
    }

    // Event delegation for inline edits (autosave on input/blur)
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('editable')) {
            if (e.target.id) {
                saveField(e.target);
            } else {
                // It's a list item
                const parentList = e.target.closest('ul');
                if (parentList) {
                    saveList(parentList);
                }
            }
        }
    });

    // Avoid formatting issues when pasting text
    document.addEventListener('paste', (e) => {
        if (e.target.classList.contains('editable')) {
            e.preventDefault();
            const text = (e.originalEvent || e).clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        }
    });

    // ==========================================================================
    // 4. Dynamic List Actions (Add/Remove)
    // ==========================================================================
    function ensureDeleteButtons(listEl) {
        listEl.querySelectorAll('li').forEach(li => {
            if (!li.querySelector('.delete-btn')) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn no-print';
                deleteBtn.innerHTML = '×';
                deleteBtn.title = 'Remove item';
                deleteBtn.contentEditable = false;
                li.appendChild(deleteBtn);
            }
        });
    }

    function createNewListItem(listEl, placeholderText) {
        const li = document.createElement('li');
        li.className = 'editable';
        li.contentEditable = true;
        li.innerHTML = placeholderText;
        
        listEl.appendChild(li);
        ensureDeleteButtons(listEl);
        saveList(listEl);
        
        // Focus the new item
        li.focus();
        // Place cursor at the end of the text
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(li);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // Add buttons click handlers
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', () => {
            createNewListItem(resSkills, 'New Skill (Basics)');
        });
    }

    if (addStrengthBtn) {
        addStrengthBtn.addEventListener('click', () => {
            createNewListItem(resStrengths, 'New Strength Description');
        });
    }

    if (addLanguageBtn) {
        addLanguageBtn.addEventListener('click', () => {
            createNewListItem(resLanguages, 'New Language');
        });
    }

    if (addCertBtn) {
        addCertBtn.addEventListener('click', () => {
            createNewListItem(resCertifications, 'New Certification');
        });
    }

    if (addAchBtn) {
        addAchBtn.addEventListener('click', () => {
            createNewListItem(resAchievements, 'New Achievement');
        });
    }

    // Event delegation for list item deletion
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const li = e.target.parentElement;
            const parentList = li.parentElement;
            li.remove();
            saveList(parentList);
        }
    });

    // ==========================================================================
    // 5. Printing & Reset Actions
    // ==========================================================================
    printBtn.addEventListener('click', () => {
        window.print();
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all information back to default? All custom edits will be lost.')) {
            // Clear relevant local storage values
            document.querySelectorAll('.editable[id]').forEach(el => {
                localStorage.removeItem(`resume-field-${el.id}`);
            });
            ['resSkills', 'resStrengths', 'resLanguages', 'resCertifications', 'resAchievements'].forEach(listId => {
                localStorage.removeItem(`resume-list-${listId}`);
            });
            localStorage.removeItem('resume-theme');
            
            // Reload page to restore defaults
            window.location.reload();
        }
    });

    // Initialize Page
    loadSavedResumeData();
});
