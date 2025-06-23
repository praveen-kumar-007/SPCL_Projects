document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENT SELECTION ---
    const newTaskForm = document.getElementById('new-task-form');
    const newTaskInput = document.getElementById('new-task-input');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const emptyState = document.getElementById('empty-state');
    
    // Counters
    const countAll = document.getElementById('count-all');
    const countActive = document.getElementById('count-active');
    const countCompleted = document.getElementById('count-completed');

    // Theme Switcher
    const themeToggle = document.getElementById('theme-toggle-checkbox');
    const body = document.body;

    // --- STATE MANAGEMENT ---
    let tasks = [];
    let currentFilter = 'all';

    // --- LOCAL STORAGE ---
    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));
    const loadTasks = () => JSON.parse(localStorage.getItem('tasks')) || [];
    const saveTheme = (theme) => localStorage.setItem('theme', theme);
    const loadTheme = () => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            body.classList.add('dark-theme');
            themeToggle.checked = true;
        }
    };

    // --- RENDER & UI ---
    const renderTasks = () => {
        taskList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        emptyState.classList.toggle('visible', filteredTasks.length === 0);

        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;

            taskItem.innerHTML = `
                <label class="checkbox-container">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"></path></svg>
                    </span>
                </label>
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="task-action-btn edit-btn" aria-label="Edit task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="task-action-btn delete-btn" aria-label="Delete task">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            taskList.appendChild(taskItem);
        });
        
        updateCounters();
    };
    
    const updateCounters = () => {
        const activeCount = tasks.filter(t => !t.completed).length;
        const completedCount = tasks.length - activeCount;

        // Animate counter if value changes
        animateCounter(countAll, tasks.length);
        animateCounter(countActive, activeCount);
        animateCounter(countCompleted, completedCount);
    };
    
    const animateCounter = (element, newValue) => {
        const oldValue = parseInt(element.textContent, 10);
        if (oldValue !== newValue) {
            element.classList.add('update-anim');
            setTimeout(() => {
                element.textContent = newValue;
                element.classList.remove('update-anim');
            }, 200);
        }
    };

    // --- CORE LOGIC ---
    const addTask = (text) => {
        if (text.trim() === '') {
            newTaskInput.focus();
            return;
        }
        tasks.unshift({ id: Date.now(), text: text.trim(), completed: false });
        saveTasks();
        renderTasks();
    };

    const deleteTask = (id) => {
        const taskElement = document.querySelector(`[data-id='${id}']`);
        if (taskElement) {
            taskElement.classList.add('removing');
            taskElement.addEventListener('animationend', () => {
                tasks = tasks.filter(task => task.id != id);
                saveTasks();
                renderTasks();
            }, { once: true });
        }
    };
    
    // This function handles the logic for marking a task as complete or incomplete.
    const toggleComplete = (id) => {
        const task = tasks.find(task => task.id == id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            
            // Re-render only if the filter is not 'all' to avoid tasks disappearing
            if(currentFilter !== 'all') {
                renderTasks();
            } else {
                // If filter is 'all', just update the class for a smoother animation
                const taskElement = document.querySelector(`[data-id='${id}']`);
                taskElement.classList.toggle('completed');
                updateCounters();
            }
        }
    };

    const editTask = (id, taskTextElement) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = taskTextElement.textContent;
        input.className = 'task-text-input'; // You'll need to style this class
        
        taskTextElement.replaceWith(input);
        input.focus();
        input.select();

        const save = () => {
            const newText = input.value.trim();
            if (newText) {
                const task = tasks.find(t => t.id == id);
                task.text = newText;
                saveTasks();
            }
            renderTasks();
        };

        input.addEventListener('blur', save);
        input.addEventListener('keydown', e => (e.key === 'Enter' && input.blur()));
    };

    const clearCompleted = () => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    };

    // --- EVENT LISTENERS ---
    newTaskForm.addEventListener('submit', e => {
        e.preventDefault();
        addTask(newTaskInput.value);
        newTaskInput.value = '';
    });

    taskList.addEventListener('click', e => {
        const target = e.target.closest('.task-checkbox, .delete-btn, .edit-btn');
        if (!target) return;
        
        const taskItem = target.closest('.task-item');
        const taskId = taskItem.dataset.id;

        if (target.classList.contains('task-checkbox')) toggleComplete(taskId);
        if (target.classList.contains('delete-btn')) deleteTask(taskId);
        if (target.classList.contains('edit-btn')) editTask(taskId, taskItem.querySelector('.task-text'));
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);

    themeToggle.addEventListener('change', () => {
        body.classList.toggle('dark-theme');
        saveTheme(body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    // --- INITIALIZATION ---
    const init = () => {
        loadTheme();
        tasks = loadTasks();
        renderTasks();
    };

    init();
});