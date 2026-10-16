  // Initialize Lucide Icons on load
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
            initApp();
        });

        // Initialize default seed user if none exists
        function initApp() {
            let users = JSON.parse(localStorage.getItem('secureauth_users')) || [];
            if (users.length === 0) {
                // Seed a default demo user
                users.push({
                    name: 'Demo User',
                    email: 'demo@example.com',
                    password: 'password123',
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem('secureauth_users', JSON.stringify(users));
            }

            // Check if user is already logged in
            const activeSession = localStorage.getItem('secureauth_session');
            if (activeSession) {
                try {
                    const user = JSON.parse(activeSession);
                    loadDashboard(user);
                    switchView('dashboard');
                } catch (e) {
                    localStorage.removeItem('secureauth_session');
                    switchView('login');
                }
            } else {
                switchView('login');
            }
        }

        // View Switcher Function
        function switchView(viewName) {
            const views = document.querySelectorAll('.view');
            views.forEach(v => {
                v.classList.add('hidden');
            });

            const targetView = document.getElementById(`${viewName}-view`);
            if (targetView) {
                targetView.classList.remove('hidden');
            }
            // Re-initialize icons for newly visible elements
            setTimeout(() => lucide.createIcons(), 50);
        }

        // Toast Notification System
        function showToast(message, type = 'success') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            
            const bgColor = type === 'success' ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/90 border-rose-500/30 text-rose-300';
            const iconName = type === 'success' ? 'check-circle' : 'alert-circle';

            toast.className = `pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 transform translate-y-2 opacity-0 ${bgColor}`;
            toast.innerHTML = `
                <i data-lucide="${iconName}" class="w-5 h-5 flex-shrink-0"></i>
                <span class="text-sm font-medium">${message}</span>
            `;

            container.appendChild(toast);
            lucide.createIcons();

            // Fade in
            setTimeout(() => {
                toast.classList.remove('translate-y-2', 'opacity-0');
            }, 10);

            // Remove after 3.5 seconds
            setTimeout(() => {
                toast.classList.add('translate-y-2', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }

        // Custom Modal helper
        function showCustomModal(title, message) {
            document.getElementById('modal-title').innerText = title;
            document.getElementById('modal-message').innerText = message;
            document.getElementById('custom-modal').classList.remove('hidden');
        }

        function closeCustomModal() {
            document.getElementById('custom-modal').classList.add('hidden');
        }

        // Password Visibility Toggle
        function togglePasswordVisibility(inputId, iconId) {
            const input = document.getElementById(inputId);
            const icon = document.getElementById(iconId);
            if (input.type === 'password') {
                input.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                input.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        }

        // Handle Sign Up
        function handleSignup(event) {
            event.preventDefault();
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim().toLowerCase();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;

            // Validation checks
            if (!name || !email || !password) {
                showToast('All fields are required.', 'error');
                return;
            }

            if (password.length < 6) {
                showToast('Password must be at least 6 characters long.', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showToast('Passwords do not match.', 'error');
                return;
            }

            let users = JSON.parse(localStorage.getItem('secureauth_users')) || [];

            // Check if email already exists
            const existingUser = users.find(u => u.email === email);
            if (existingUser) {
                showToast('An account with this email already exists.', 'error');
                return;
            }

            // Save new user
            const newUser = {
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('secureauth_users', JSON.stringify(users));

            // Reset Form
            document.getElementById('signup-form').reset();

            // Redirect to Login with Success Toast
            switchView('login');
            // Pre-fill login email for convenience
            document.getElementById('login-email').value = email;
            showToast('Account created successfully! Please sign in.', 'success');
        }

        // Handle Login
        function handleLogin(event) {
            event.preventDefault();
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                showToast('Please enter both email and password.', 'error');
                return;
            }

            let users = JSON.parse(localStorage.getItem('secureauth_users')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                showToast('Invalid email address or password.', 'error');
                return;
            }

            // Save session
            const sessionData = {
                name: user.name,
                email: user.email,
                loginTime: new Date().toLocaleString()
            };
            localStorage.setItem('secureauth_session', JSON.stringify(sessionData));

            // Reset login form
            document.getElementById('login-form').reset();

            // Load and show dashboard
            loadDashboard(sessionData);
            switchView('dashboard');
            showToast('Successfully logged in!', 'success');
        }

        // Load Dashboard Data
        function loadDashboard(session) {
            document.getElementById('dashboard-welcome-name').innerText = `Welcome back, ${session.name}!`;
            document.getElementById('dashboard-user-email').innerText = session.email;
            document.getElementById('user-avatar-initials').innerText = session.name.charAt(0).toUpperCase();
            document.getElementById('last-login-time').innerText = session.loginTime || 'Just now';
        }

        // Handle Logout
        function handleLogout() {
            localStorage.removeItem('secureauth_session');
            document.getElementById('login-email').value = '';
            document.getElementById('login-password').value = '';
            switchView('login');
            showToast('You have been securely signed out.', 'success');
        }

        // Demo Account Reset Helper
        function seedDemoAccount() {
            let users = JSON.parse(localStorage.getItem('secureauth_users')) || [];
            if (!users.some(u => u.email === 'demo@example.com')) {
                users.push({
                    name: 'Demo User',
                    email: 'demo@example.com',
                    password: 'password123',
                    createdAt: new Date().toISOString()
                });
                localStorage.setItem('secureauth_users', JSON.stringify(users));
            }
            showToast('Demo account (demo@example.com / password123) verified in cache.', 'success');
        }

        // ================= GEMINI API INTEGRATION =================
        function setAiPrompt(promptText) {
            document.getElementById('ai-prompt-input').value = promptText;
        }

        async function askGeminiAI() {
            const promptInput = document.getElementById('ai-prompt-input');
            const prompt = promptInput.value.trim();
            const submitBtn = document.getElementById('ai-submit-btn');
            const responseContainer = document.getElementById('ai-response-container');
            const responseTextEl = document.getElementById('ai-response-text');

            if (!prompt) {
                showToast('Please enter a study prompt or question.', 'error');
                return;
            }

            // Disable button and show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Generating...</span>`;
            lucide.createIcons();

            responseContainer.classList.remove('hidden');
            responseTextEl.innerHTML = '<span class="text-slate-400 animate-pulse">Thinking and consulting Gemini AI knowledge base...</span>';

            const systemPrompt = "You are an expert academic tutor and study assistant inside an e-learning student portal. Provide clear, concise, and structured answers helpful for students.";
            const apiKey = ""; // Canvas provides runtime API key
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            };

            // Implement exponential backoff for robustness
            let retries = 3;
            let delay = 1000;
            let success = false;
            let resultData = null;

            while (retries > 0 && !success) {
                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        resultData = await response.json();
                        success = true;
                    } else {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                } catch (err) {
                    retries--;
                    if (retries === 0) {
                        break;
                    }
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                }
            }

            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i data-lucide="send" class="w-4 h-4"></i><span>Ask Gemini AI</span>`;
            lucide.createIcons();

            if (success && resultData && resultData.candidates && resultData.candidates[0].content) {
                const text = resultData.candidates[0].content.parts[0].text;
                responseTextEl.innerText = text;
                showToast('Gemini response generated successfully!', 'success');
            } else {
                responseTextEl.innerText = 'Sorry, we encountered an error connecting to Gemini AI. Please check your network connection and try again.';
                showToast('Failed to generate AI response.', 'error');
            }
        }

        function copyAiResponse() {
            const text = document.getElementById('ai-response-text').innerText;
            document.execCommand('copy');
            showToast('Response copied to clipboard!', 'success');
        }

        // Tab Switcher for Dashboard
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.dashboard-tab-content');
    tabs.forEach(t => t.classList.add('hidden'));

    const targetTab = document.getElementById(`tab-content-${tabName}`);
    if (targetTab) targetTab.classList.remove('hidden');

    // Update active button styles
    const buttons = document.querySelectorAll('[id^="tab-btn-"]');
    buttons.forEach(btn => {
        btn.className = "px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition flex items-center gap-2";
    });

    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    if (activeBtn) {
        activeBtn.className = "px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 text-white transition flex items-center gap-2";
    }

    setTimeout(() => lucide.createIcons(), 50);
}

// Load Dashboard Info & Initialize Local Storage Data
function loadDashboard(user) {
    const welcomeEl = document.getElementById('dashboard-welcome-name');
    const emailEl = document.getElementById('dashboard-user-email');
    const avatarEl = document.getElementById('user-avatar-initials');
    
    if (welcomeEl) welcomeEl.innerText = `Welcome back, ${user.name}! 👋`;
    if (emailEl) emailEl.innerText = `Connected profile: ${user.email} • Node status: Online`;
    if (avatarEl && user.name) {
        avatarEl.innerText = user.name.charAt(0).toUpperCase();
    }

    // Populate Profile Tab
    document.getElementById('profile-display-name').innerText = user.name;
    document.getElementById('profile-display-email').innerText = user.email;
    document.getElementById('profile-name-input').value = user.name;
    document.getElementById('profile-email-input').value = user.email;
    const profileAvatar = document.getElementById('profile-avatar-initials');
    if (profileAvatar) profileAvatar.innerText = user.name.charAt(0).toUpperCase();

    renderAttendance();
    renderBooks();
}

// Handle Profile Update
function handleProfileUpdate(event) {
    event.preventDefault();
    const newName = document.getElementById('profile-name-input').value.trim();
    const activeSession = JSON.parse(localStorage.getItem('secureauth_session'));

    if (!activeSession) return;

    activeSession.name = newName;
    localStorage.setItem('secureauth_session', JSON.stringify(activeSession));

    // Update users array storage as well
    let users = JSON.parse(localStorage.getItem('secureauth_users')) || [];
    users = users.map(u => u.email === activeSession.email ? { ...u, name: newName } : u);
    localStorage.setItem('secureauth_users', JSON.stringify(users));

    loadDashboard(activeSession);
    showToast('Profile updated successfully!', 'success');
}

// Enhanced Attendance Function with Selected Course
function markAttendance() {
    const courseSelect = document.getElementById('attendance-course-select');
    const selectedCourse = courseSelect ? courseSelect.value : 'Software Engineering (CSC 301)';
    const activeSession = JSON.parse(localStorage.getItem('secureauth_session'));
    const studentName = activeSession ? activeSession.name : 'Unknown Student';

    let attendance = JSON.parse(localStorage.getItem('secureauth_attendance')) || [];
    const now = new Date().toLocaleString();
    
    attendance.unshift({
        course: selectedCourse,
        student: studentName,
        date: now,
        status: 'Present'
    });

    localStorage.setItem('secureauth_attendance', JSON.stringify(attendance));
    renderAttendance();
    showToast(`Attendance checked in for ${selectedCourse}!`, 'success');
}

function renderAttendance() {
    const tableBody = document.getElementById('attendance-table-body');
    let attendance = JSON.parse(localStorage.getItem('secureauth_attendance'));
    
    if (!attendance || attendance.length === 0) {
        attendance = [
            { course: 'Data Structures & Algorithms (CSC 303)', student: 'Demo User', date: 'Oct 14, 2026 - 10:00 AM', status: 'Present' },
            { course: 'Web Application Development (CSC 305)', student: 'Demo User', date: 'Oct 12, 2026 - 02:00 PM', status: 'Present' }
        ];
        localStorage.setItem('secureauth_attendance', JSON.stringify(attendance));
    }

    tableBody.innerHTML = attendance.map(item => `
        <tr class="hover:bg-slate-950/40">
            <td class="p-3 font-medium text-white">${item.course}</td>
            <td class="p-3 text-slate-300">${item.student || 'Student'}</td>
            <td class="p-3 text-slate-400">${item.date}</td>
            <td class="p-3"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">${item.status}</span></td>
        </tr>
    `).join('');

    const statsAttendance = document.getElementById('stats-attendance-count');
    if (statsAttendance) statsAttendance.innerText = attendance.length;
}

// Enhanced Book Upload with Uploader Tracking
function handleBookUpload(event) {
    event.preventDefault();
    const title = document.getElementById('book-title').value.trim();
    const category = document.getElementById('book-category').value.trim();
    const desc = document.getElementById('book-desc').value.trim();
    const activeSession = JSON.parse(localStorage.getItem('secureauth_session'));
    const uploaderEmail = activeSession ? activeSession.email : 'demo@example.com';

    let books = JSON.parse(localStorage.getItem('secureauth_books')) || [];
    
    // Assign a unique ID and track uploader email
    const newBook = {
        id: 'book_' + Date.now(),
        title,
        category,
        desc,
        uploader: uploaderEmail,
        date: new Date().toLocaleDateString()
    };

    books.unshift(newBook);
    localStorage.setItem('secureauth_books', JSON.stringify(books));
    document.getElementById('upload-book-form').reset();
    renderBooks();
    showToast('Study material uploaded successfully!', 'success');
}

// Delete Book Function (Only allows deleting materials uploaded by the current user)
function deleteBook(bookId) {
    let books = JSON.parse(localStorage.getItem('secureauth_books')) || [];
    const activeSession = JSON.parse(localStorage.getItem('secureauth_session'));
    const currentUserEmail = activeSession ? activeSession.email : '';

    const book = books.find(b => b.id === bookId);
    if (!book) return;

    // Check ownership or allow demo management
    if (book.uploader && book.uploader !== currentUserEmail) {
        showToast('You can only delete materials uploaded by you.', 'error');
        return;
    }

    books = books.filter(b => b.id !== bookId);
    localStorage.setItem('secureauth_books', JSON.stringify(books));
    renderBooks();
    showToast('Material deleted successfully.', 'success');
}

function renderBooks() {
    const container = document.getElementById('books-list-container');
    let books = JSON.parse(localStorage.getItem('secureauth_books'));
    const activeSession = JSON.parse(localStorage.getItem('secureauth_session'));
    const currentUserEmail = activeSession ? activeSession.email : '';

    if (!books || books.length === 0) {
        books = [
            { id: 'default_1', title: 'Django REST Framework Complete Guide', category: 'Backend', desc: 'Comprehensive guide to building REST APIs.', uploader: 'system', date: 'Oct 2026' },
            { id: 'default_2', title: 'Advanced Tailwind CSS & UI Patterns', category: 'Frontend', desc: 'Modern styling techniques and responsive design.', uploader: 'system', date: 'Oct 2026' }
        ];
        localStorage.setItem('secureauth_books', JSON.stringify(books));
    }

    container.innerHTML = books.map(book => {
        const canDelete = !book.uploader || book.uploader === currentUserEmail || book.uploader === 'system';
        return `
            <div class="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <span class="text-xs font-semibold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">${book.category}</span>
                    <h4 class="text-sm font-bold text-white mt-1">${book.title}</h4>
                    <p class="text-xs text-slate-400 mt-0.5">${book.desc || 'No description provided.'}</p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <button onclick="showToast('Downloading material...', 'success')" class="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-xl text-xs font-medium transition flex items-center gap-1">
                        <i data-lucide="download" class="w-3.5 h-3.5"></i> Download
                    </button>
                    ${canDelete ? `
                        <button onclick="deleteBook('${book.id}')" class="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-medium transition flex items-center gap-1" title="Delete Material">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    const statsBooks = document.getElementById('stats-books-count');
    if (statsBooks) statsBooks.innerText = books.length;
    setTimeout(() => lucide.createIcons(), 50);
}