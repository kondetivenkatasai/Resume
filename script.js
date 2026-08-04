document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Inputs & Config
    const themeSelect = document.getElementById('themeSelect');
    const printBtn = document.getElementById('printBtn');
    const downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Add Buttons
    const addSkillBtn = document.getElementById('addSkillBtn');
    const addStrengthBtn = document.getElementById('addStrengthBtn');
    const addLanguageBtn = document.getElementById('addLanguageBtn');
    const addCertBtn = document.getElementById('addCertBtn');
    const addAchBtn = document.getElementById('addAchBtn');
    const addProjectBtn = document.getElementById('addProjectBtn');

    // List Elements
    const resSkills = document.getElementById('resSkills');
    const resStrengths = document.getElementById('resStrengths');
    const resLanguages = document.getElementById('resLanguages');
    const resCertifications = document.getElementById('resCertifications');
    const resAchievements = document.getElementById('resAchievements');
    const resProjects = document.getElementById('resProjects');

    // List of dynamic list identifiers to map for saving/restoring
    const listIds = ['resSkills', 'resStrengths', 'resLanguages', 'resCertifications', 'resAchievements', 'resProjects'];

    // Backup individual editables
    const originalHTML = {};
    document.querySelectorAll('.editable[id]').forEach(el => {
        originalHTML[el.id] = el.innerHTML.trim();
    });

    // Backup default list states
    const defaultListHTML = {};
    listIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            defaultListHTML[id] = el.innerHTML;
        }
    });

    // ==========================================================================
    // 1. Theme Management
    // ==========================================================================
    if (themeSelect) {
        const savedTheme = localStorage.getItem('resume-theme') || 'noir';
        themeSelect.value = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);

        themeSelect.addEventListener('change', (e) => {
            const theme = e.target.value;
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('resume-theme', theme);
        });
    }

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
        listIds.forEach(listId => {
            const savedList = localStorage.getItem(`resume-list-${listId}`);
            const listEl = document.getElementById(listId);
            if (listEl) {
                if (savedList !== null) {
                    listEl.innerHTML = savedList;
                }
                // Add delete buttons to list items
                ensureDeleteButtons(listEl);
            }
        });

        // Load project delete buttons
        ensureProjectDeleteButtons();

        // Enforce spellcheck="false" on all contenteditables to prevent red squiggly underlines
        document.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.setAttribute('spellcheck', 'false');
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
        if (!listEl) return;
        // Temporarily strip delete buttons to keep saved code clean
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = listEl.innerHTML;
        tempDiv.querySelectorAll('.delete-btn').forEach(btn => btn.remove());
        tempDiv.querySelectorAll('.delete-project-btn').forEach(btn => btn.remove());
        
        localStorage.setItem(`resume-list-${listEl.id}`, tempDiv.innerHTML);
    }

    // Event delegation for inline edits (autosave on input/blur)
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('editable')) {
            // If it's inside the projects list, save the projects list
            const parentProjects = e.target.closest('#resProjects');
            if (parentProjects) {
                saveList(parentProjects);
                return;
            }

            if (e.target.id) {
                saveField(e.target);
            } else {
                // It's a list item of skills, strengths, etc.
                const parentList = e.target.closest('ul') || e.target.closest('ol');
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
        if (!listEl || listEl.id === 'resProjects') return; // Projects handle delete buttons separately
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

    function ensureProjectDeleteButtons() {
        const resProjectsEl = document.getElementById('resProjects');
        if (!resProjectsEl) return;
        resProjectsEl.querySelectorAll('.project-item').forEach(item => {
            if (!item.querySelector('.delete-project-btn')) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-project-btn no-print';
                deleteBtn.innerHTML = '×';
                deleteBtn.title = 'Remove Project';
                deleteBtn.contentEditable = false;
                item.appendChild(deleteBtn);
            }
        });
    }

    function createNewListItem(listEl, placeholderText) {
        if (!listEl) return;
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

    function createNewProject() {
        const resProjectsEl = document.getElementById('resProjects');
        if (!resProjectsEl) return;
        
        const newItem = document.createElement('div');
        newItem.className = 'project-item';
        newItem.innerHTML = `
            <div class="project-header">
                <div class="project-title">
                    <strong class="editable project-title-text" contenteditable="true" spellcheck="false" data-placeholder="Project Name">New Project Name</strong>
                    <span class="meta-separator">|</span>
                    <span class="editable project-tech" contenteditable="true" spellcheck="false" data-placeholder="Tech Stack/Tools">Tools used</span>
                </div>
            </div>
            <ul class="list-bulleted editable" contenteditable="true" spellcheck="false" data-placeholder="Project details...">
                <li>Describe a key contribution or detail of the project.</li>
                <li>Click and edit this text freely. Press Enter for new bullets.</li>
            </ul>
        `;
        
        resProjectsEl.appendChild(newItem);
        ensureProjectDeleteButtons();
        saveList(resProjectsEl);
        
        // Focus the title of the new project
        newItem.querySelector('.project-title-text').focus();
    }

    // Add buttons click handlers (safe-checked)
    if (addSkillBtn && resSkills) {
        addSkillBtn.addEventListener('click', () => {
            createNewListItem(resSkills, 'New Skill (Basics)');
        });
    }

    if (addStrengthBtn && resStrengths) {
        addStrengthBtn.addEventListener('click', () => {
            createNewListItem(resStrengths, 'New Strength Description');
        });
    }

    if (addLanguageBtn && resLanguages) {
        addLanguageBtn.addEventListener('click', () => {
            createNewListItem(resLanguages, 'New Language');
        });
    }

    if (addCertBtn && resCertifications) {
        addCertBtn.addEventListener('click', () => {
            createNewListItem(resCertifications, 'New Certification');
        });
    }

    if (addAchBtn && resAchievements) {
        addAchBtn.addEventListener('click', () => {
            createNewListItem(resAchievements, 'New Achievement');
        });
    }

    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => {
            createNewProject();
        });
    }

    // Event delegation for list item deletion & project deletion
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const li = e.target.parentElement;
            const parentList = li.parentElement;
            li.remove();
            saveList(parentList);
        } else if (e.target.classList.contains('delete-project-btn')) {
            const item = e.target.closest('.project-item');
            const parent = item.parentElement;
            item.remove();
            saveList(parent);
        }
    });

    // ==========================================================================
    // 5. Printing & Reset Actions
    // ==========================================================================
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    if (downloadHtmlBtn) {
        downloadHtmlBtn.addEventListener('click', () => {
            // Fetch style.css and script.js contents, inline them into a single file
            Promise.all([
                fetch('style.css').then(r => r.text()),
                fetch('script.js').then(r => r.text())
            ]).then(([cssContent, jsContent]) => {
                // Get the current document HTML
                let htmlContent = document.documentElement.outerHTML;
                
                // Parse it into a DOM object to manipulate
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                
                // Remove the floating settings panel from the downloaded file
                const controlPanel = doc.getElementById('controlPanel');
                if (controlPanel) controlPanel.remove();
                
                // Replace external style link with inline style tag
                const styleLink = doc.querySelector('link[href="style.css"]');
                if (styleLink) {
                    const styleTag = doc.createElement('style');
                    styleTag.textContent = cssContent;
                    styleLink.parentNode.replaceChild(styleTag, styleLink);
                }
                
                // Replace external script link with inline script tag
                const scriptTagEl = doc.querySelector('script[src="script.js"]');
                if (scriptTagEl) {
                    const scriptTag = doc.createElement('script');
                    // Strip the download button handlers and reset handlers to keep download files static and clean
                    scriptTag.textContent = `
                        document.addEventListener('DOMContentLoaded', () => {
                            // Enforce spellcheck="false" on all contenteditables
                            document.querySelectorAll('[contenteditable="true"]').forEach(el => {
                                el.setAttribute('spellcheck', 'false');
                            });
                        });
                    `;
                    scriptTagEl.parentNode.replaceChild(scriptTag, scriptTagEl);
                }
                
                // Serialize and trigger download
                const blob = new Blob([doc.documentElement.outerHTML], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                
                // Create a clean filename
                const rawName = document.getElementById('resName')?.innerText || 'Yenuboyana_Akash';
                const cleanName = rawName.trim().replace(/\s+/g, '_');
                a.download = `${cleanName}_Resume.html`;
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }).catch(err => {
                console.error('Error creating offline HTML bundle:', err);
                alert('Could not download HTML file. Please try printing to PDF instead.');
            });
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all information back to default? All custom edits will be lost.')) {
                // Clear relevant local storage values
                document.querySelectorAll('.editable[id]').forEach(el => {
                    localStorage.removeItem(`resume-field-${el.id}`);
                });
                listIds.forEach(listId => {
                    localStorage.removeItem(`resume-list-${listId}`);
                });
                localStorage.removeItem('resume-theme');
                
                // Reload page to restore defaults
                window.location.reload();
            }
        });
    }

    // Initialize Page
    loadSavedResumeData();
});
