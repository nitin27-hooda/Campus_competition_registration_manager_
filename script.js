
const KEY = 'campus_competition_manager_v1';

const seed = {
  users: [
    {
      id: 'u1',
      name: 'Aarav Sharma',
      email: 'student@campus.edu',
      password: 'student123',
      role: 'student',
      regNo: '12400123',
      department: 'CSE',
      year: '2nd Year'
    },
    {
      id: 'u2',
      name: 'Admin User',
      email: 'admin@campus.edu',
      password: 'admin123',
      role: 'admin',
      regNo: 'ADMIN',
      department: 'Student Affairs',
      year: 'Staff'
    }
  ],

  competitions: [
    {
      id: 'c1',
      title: 'CodeSprint 2026',
      category: 'Technology',
      date: '2026-12-05',
      deadline: '2026-11-30',
      venue: 'Block M · Lab 204',
      seats: 80,
      description: 'A programming challenge focused on problem solving, algorithms and creative coding.',
      eligibility: 'All undergraduate students',
      status: 'Open',
      icon: '💻'
    },
    {
      id: 'c2',
      title: 'Campus Innovators Challenge',
      category: 'Innovation',
      date: '2026-12-12',
      deadline: '2026-12-06',
      venue: 'Auditorium 2',
      seats: 60,
      description: 'Present an original idea that solves a real campus or community problem.',
      eligibility: 'Individual or teams of up to 4',
      status: 'Open',
      icon: '💡'
    },
    {
      id: 'c3',
      title: 'DesignVerse Poster Contest',
      category: 'Design',
      date: '2026-11-28',
      deadline: '2026-11-22',
      venue: 'Design Studio',
      seats: 100,
      description: 'Show your visual storytelling skills through a creative poster design.',
      eligibility: 'All students',
      status: 'Open',
      icon: '🎨'
    },
    {
      id: 'c4',
      title: 'Campus Quiz League',
      category: 'Quiz',
      date: '2026-12-18',
      deadline: '2026-12-14',
      venue: 'Seminar Hall A',
      seats: 50,
      description: 'A fast-paced general knowledge and technology quiz for curious minds.',
      eligibility: 'All undergraduate students',
      status: 'Open',
      icon: '🏆'
    }
  ],

  registrations: [
    {
      id: 'r1',
      competitionId: 'c1',
      userId: 'u1',
      date: '2026-11-10',
      status: 'Approved',
      team: 'Solo'
    }
  ]
};

// DATABASE
let db = loadDB();
let currentUser = null;
let activeTab = 'overview';

function loadDB() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || structuredClone(seed);
  } catch (e) {
    return JSON.parse(JSON.stringify(seed));
  }
}

function saveDB() {
  localStorage.setItem(KEY, JSON.stringify(db));
}

function uid(prefix) {
  return prefix + '_' + Date.now().toString(36) +
    Math.random().toString(36).slice(2, 6);
}

function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function fmt(d) {
  if (!d) return '—';

  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function toast(msg) {
  const root = document.getElementById('toastRoot');

  root.innerHTML = `<div class="toast">${esc(msg)}</div>`;

  setTimeout(() => root.innerHTML = '', 2800);
}

// HEADER AND NAVIGATION

function syncHeader() {
  document.getElementById('topLogin').classList.toggle('hidden', !!currentUser);

  document.getElementById('topDashboard').classList.toggle('hidden', !currentUser);

  document.getElementById('topLogout').classList.toggle('hidden', !currentUser);

  document.getElementById('userLabel').textContent =
    currentUser
      ? `${currentUser.name} · ${currentUser.role}`
      : 'Explore campus opportunities';
}

function goHome() {
  renderHome();
  window.scrollTo(0, 0);
}

function showLogin() {
  renderLogin();
  window.scrollTo(0, 0);
}

function goDashboard() {
  if (!currentUser) {
    showLogin();
    return;
  }

  currentUser.role === 'admin'
    ? renderAdmin()
    : renderStudent();

  window.scrollTo(0, 0);
}

function logout() {
  currentUser = null;
  syncHeader();

  toast('You have been logged out.');

  goHome();
}

// HOME PAGE

function renderHome() {
  syncHeader();

  const app = document.getElementById('app');

  app.innerHTML = `
  <div class="container">

    <section class="hero">
      <div>
        <div class="eyebrow">Discover · Participate · Achieve</div>

        <h1>Your next big campus moment starts here.</h1>

        <p>
          Find exciting competitions, register in a few steps
          and keep track of your participation — all in one place.
        </p>

        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px">

          <button class="btn light"
          onclick="document.getElementById('competitionList').scrollIntoView({behavior:'smooth'})">
            Explore competitions
          </button>

          <button class="btn"
          style="background:#ffffff20;color:white;border:1px solid #ffffff55"
          onclick="showLogin()">
            Student / Admin login
          </button>

        </div>
      </div>

      <div class="hero-art">🏅</div>
    </section>

    <div class="stats">

      <div class="stat">
        <span>Available competitions</span>
        <strong>${db.competitions.filter(c => c.status === 'Open').length}</strong>
      </div>

      <div class="stat">
        <span>Student registrations</span>
        <strong>${db.registrations.length}</strong>
      </div>

      <div class="stat">
        <span>Categories</span>
        <strong>${new Set(db.competitions.map(c => c.category)).size}</strong>
      </div>

      <div class="stat">
        <span>One campus platform</span>
        <strong>1</strong>
      </div>

    </div>

    <section id="competitionList">

      <div class="section-head">
        <div>
          <div class="eyebrow" style="color:var(--blue)">
            Find your opportunity
          </div>

          <h2>Upcoming competitions</h2>

          <div class="muted" style="font-size:13px;margin-top:5px">
            Explore events and choose your next challenge.
          </div>
        </div>
      </div>

      <div class="filters">

        <input id="searchBox" class="field"
        placeholder="Search competitions..."
        oninput="renderCompetitionCards()">

        <select id="categoryFilter" class="field"
        onchange="renderCompetitionCards()">

          <option value="">All categories</option>

          ${[...new Set(db.competitions.map(c => c.category))]
            .map(x => `<option>${esc(x)}</option>`).join('')}

        </select>

        <select id="sortFilter" class="field"
        onchange="renderCompetitionCards()">

          <option value="date">Sort: Event date</option>
          <option value="name">Sort: Name</option>

        </select>

      </div>

      <div class="grid" id="cards"></div>

    </section>

  </div>`;

  renderCompetitionCards();
}

// COMPETITION CARDS

function renderCompetitionCards() {
  const holder = document.getElementById('cards');

  if (!holder) return;

  const q = (document.getElementById('searchBox')?.value || '').toLowerCase();

  const cat = document.getElementById('categoryFilter')?.value || '';

  const sort = document.getElementById('sortFilter')?.value || 'date';

  let list = db.competitions.filter(c =>
    (c.title + ' ' + c.description + ' ' + c.category)
      .toLowerCase().includes(q) &&
    (!cat || c.category === cat)
  );

  list.sort((a, b) =>
    sort === 'name'
      ? a.title.localeCompare(b.title)
      : a.date.localeCompare(b.date)
  );

  holder.innerHTML = list.length
    ? list.map(c => `
      <article class="card">

        <div class="card-banner">
          <span>${c.icon || '🏅'}</span>
        </div>

        <div class="card-body">

          <div style="display:flex;justify-content:space-between;gap:8px">

            <span class="tag">${esc(c.category)}</span>

            <span class="status ${c.status === 'Open' ? 'Approved' : 'Rejected'}">
              ${esc(c.status)}
            </span>

          </div>

          <h3 style="margin-top:13px">${esc(c.title)}</h3>

          <p>${esc(c.description)}</p>

          <div class="meta">
            <span>📅 ${fmt(c.date)}</span>
            <span>📍 ${esc(c.venue)}</span>
            <span>👥 ${c.seats} seats</span>
          </div>

          <div class="card-foot">

            <small class="muted">
              Deadline: ${fmt(c.deadline)}
            </small>

            <button class="btn primary small"
            onclick="viewCompetition('${c.id}')">
              View details
            </button>

          </div>

        </div>
      </article>
    `).join('')
    : '<div class="empty" style="grid-column:1/-1">No competitions match your search.</div>';
}

// VIEW COMPETITION DETAILS

function viewCompetition(id) {
  const c = db.competitions.find(x => x.id === id);

  if (!c) return;

  const already = currentUser &&
    db.registrations.some(r =>
      r.competitionId === id &&
      r.userId === currentUser.id &&
      r.status !== 'Cancelled'
    );

  openModal(`
    <div class="modal-head">
      <h2>${esc(c.title)}</h2>
      <button class="close" onclick="closeModal()">✕</button>
    </div>

    <span class="tag">${esc(c.category)}</span>

    <p class="muted" style="line-height:1.7">
      ${esc(c.description)}
    </p>

    <div class="notice">

      <b>Event date:</b> ${fmt(c.date)}<br>

      <b>Registration deadline:</b> ${fmt(c.deadline)}<br>

      <b>Venue:</b> ${esc(c.venue)}<br>

      <b>Eligibility:</b> ${esc(c.eligibility)}<br>

      <b>Available seats:</b> ${c.seats}

    </div>

    ${already
      ? '<p class="success" style="padding:10px;border-radius:9px">You are already registered for this competition.</p>'
      : `<button class="btn primary" style="width:100%"
      onclick="startRegistration('${c.id}')">
        Register for this competition
      </button>`
    }
  `);
}

// MODAL FUNCTIONS

function openModal(content) {
  document.getElementById('modalRoot').innerHTML = `
    <div class="modal" onclick="if(event.target===this)closeModal()">
      <div class="modal-box">
        ${content}
      </div>
    </div>
  `;
}

function closeModal() {
  document.getElementById('modalRoot').innerHTML = '';
}

// STUDENT REGISTRATION

function startRegistration(id) {
  if (!currentUser) {
    closeModal();
    showLogin();
    toast('Please log in as a student to register.');
    return;
  }

  if (currentUser.role !== 'student') {
    toast('Only student accounts can register.');
    return;
  }

  const c = db.competitions.find(x => x.id === id);

  if (!c) return;

  if (c.status !== 'Open' ||
      c.deadline < new Date().toISOString().slice(0, 10)) {
    toast('Registration is closed.');
    return;
  }

  const count = db.registrations.filter(r =>
    r.competitionId === id &&
    r.status !== 'Cancelled'
  ).length;

  if (count >= Number(c.seats)) {
    toast('Sorry, all seats are filled.');
    return;
  }

  if (db.registrations.some(r =>
    r.competitionId === id &&
    r.userId === currentUser.id &&
    r.status !== 'Cancelled'
  )) {
    toast('You have already registered.');
    return;
  }

  openModal(`
    <div class="modal-head">
      <h2>Competition registration</h2>
      <button class="close" onclick="closeModal()">✕</button>
    </div>

    <p class="muted">
      Registering for <b>${esc(c.title)}</b>
    </p>

    <form onsubmit="submitRegistration(event,'${c.id}')">

      <div class="form-group">
        <label>Student name</label>
        <input class="field" value="${esc(currentUser.name)}" disabled>
      </div>

      <div class="form-group" style="margin-top:12px">
        <label>Registration number</label>
        <input class="field" value="${esc(currentUser.regNo)}" disabled>
      </div>

      <div class="form-group" style="margin-top:12px">
        <label>Team name (optional)</label>
        <input class="field" id="teamName"
        placeholder="Enter team name or leave blank for solo">
      </div>

      <div class="notice">
        Please check the event date and eligibility before submitting.
      </div>

      <button class="btn primary" style="width:100%">
        Confirm registration
      </button>

    </form>
  `);
}

function submitRegistration(e, id) {
  e.preventDefault();

  const c = db.competitions.find(x => x.id === id);

  if (!c) return;

  if (db.registrations.some(r =>
    r.competitionId === id &&
    r.userId === currentUser.id &&
    r.status !== 'Cancelled'
  )) {
    toast('Already registered.');
    closeModal();
    return;
  }

  db.registrations.push({
    id: uid('reg'),
    competitionId: id,
    userId: currentUser.id,
    date: new Date().toISOString().slice(0, 10),
    status: 'Pending',
    team: document.getElementById('teamName').value.trim() || 'Solo'
  });

  saveDB();

  closeModal();

  toast('Registration submitted successfully!');

  renderStudent();
}

// LOGIN PAGE

function renderLogin() {
  syncHeader();

  document.getElementById('app').innerHTML = `
    <div class="login-shell">

      <div class="login-card">

        <div class="brand" style="margin-bottom:22px">
          <div class="brandmark">CC</div>
          Campus Competitions
        </div>

        <h1>Welcome back</h1>

        <p class="muted">
          Sign in to manage your campus competition activity.
        </p>

        <form onsubmit="login(event)">

          <div class="form-group">
            <label>Email address</label>
            <input class="field" id="loginEmail"
            type="email" required placeholder="you@campus.edu">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input class="field" id="loginPassword"
            type="password" required placeholder="Enter password">
          </div>

          <button class="btn primary" style="width:100%;margin-top:8px">
            Login
          </button>

        </form>

        <div class="notice">
          <b>Demo student:</b> student@campus.edu / student123<br>
          <b>Demo admin:</b> admin@campus.edu / admin123
        </div>

        <p class="muted" style="font-size:13px">
          New student?
          <button class="link" onclick="renderSignup()">
            Create an account
          </button>
        </p>

        <button class="link" onclick="goHome()">← Back to home</button>

      </div>
    </div>
  `;
}

function login(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail')
    .value.trim().toLowerCase();

  const pass = document.getElementById('loginPassword').value;

  const user = db.users.find(u =>
    u.email.toLowerCase() === email &&
    u.password === pass
  );

  if (!user) {
    toast('Incorrect email or password.');
    return;
  }

  currentUser = user;

  syncHeader();

  toast(`Welcome, ${user.name}!`);

  goDashboard();
}

// STUDENT SIGNUP

function renderSignup() {
  document.getElementById('app').innerHTML = `
    <div class="login-shell">

      <div class="login-card">

        <h1>Create student account</h1>

        <p class="muted">
          Enter your details to join campus competitions.
        </p>

        <form onsubmit="signup(event)">

          <div class="form-group">
            <label>Full name</label>
            <input id="suName" class="field" required>
          </div>

          <div class="form-group">
            <label>College email</label>
            <input id="suEmail" type="email" class="field" required>
          </div>

          <div class="form-group">
            <label>Registration number</label>
            <input id="suReg" class="field" required>
          </div>

          <div class="form-grid">

            <div class="form-group">
              <label>Department</label>
              <input id="suDept" class="field"
              required placeholder="e.g. CSE">
            </div>

            <div class="form-group">
              <label>Year</label>

              <select id="suYear" class="field">
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>

          </div>

          <div class="form-group">
            <label>Password (minimum 6 characters)</label>
            <input id="suPass" type="password"
            minlength="6" class="field" required>
          </div>

          <button class="btn primary" style="width:100%">
            Create account
          </button>

        </form>

        <p class="muted">
          Already registered?
          <button class="link" onclick="showLogin()">Login</button>
        </p>

      </div>
    </div>
  `;
}

function signup(e) {
  e.preventDefault();

  const email = document.getElementById('suEmail')
    .value.trim().toLowerCase();

  if (db.users.some(u => u.email.toLowerCase() === email)) {
    toast('An account with this email already exists.');
    return;
  }

  const user = {
    id: uid('user'),
    name: document.getElementById('suName').value.trim(),
    email,
    password: document.getElementById('suPass').value,
    role: 'student',
    regNo: document.getElementById('suReg').value.trim(),
    department: document.getElementById('suDept').value.trim(),
    year: document.getElementById('suYear').value
  };

  db.users.push(user);

  saveDB();

  currentUser = user;

  syncHeader();

  toast('Account created successfully.');

  renderStudent();
}

// STUDENT DASHBOARD

function renderStudent() {
  syncHeader();

  const mine = db.registrations.filter(r =>
    r.userId === currentUser.id
  );

  const pending = mine.filter(r => r.status === 'Pending').length;

  const approved = mine.filter(r => r.status === 'Approved').length;

  document.getElementById('app').innerHTML = `
    <div class="container">

      <div class="section-head">

        <div>
          <div class="eyebrow" style="color:var(--blue)">
            Student workspace
          </div>

          <h2>Welcome, ${esc(currentUser.name.split(' ')[0])} 👋</h2>

          <div class="muted">
            Here is your competition activity at a glance.
          </div>
        </div>

        <button class="btn primary" onclick="goHome()">
          Explore competitions
        </button>

      </div>

      <div class="stats">

        <div class="stat">
          <span>My registrations</span>
          <strong>${mine.length}</strong>
        </div>

        <div class="stat">
          <span>Approved</span>
          <strong>${approved}</strong>
        </div>

        <div class="stat">
          <span>Pending</span>
          <strong>${pending}</strong>
        </div>

        <div class="stat">
          <span>Available events</span>
          <strong>${db.competitions.filter(c => c.status === 'Open').length}</strong>
        </div>

      </div>

      <div class="panel">
        <h3>My registrations</h3>
        ${registrationTable(mine, true)}
      </div>

      <div class="panel">

        <h3>Student profile</h3>

        <div class="form-grid">

          <div>
            <span class="muted">Name</span>
            <p><b>${esc(currentUser.name)}</b></p>
          </div>

          <div>
            <span class="muted">Registration number</span>
            <p><b>${esc(currentUser.regNo)}</b></p>
          </div>

          <div>
            <span class="muted">Department</span>
            <p><b>${esc(currentUser.department)}</b></p>
          </div>

          <div>
            <span class="muted">Year</span>
            <p><b>${esc(currentUser.year)}</b></p>
          </div>

        </div>

      </div>

    </div>
  `;
}

// REGISTRATION TABLE

function registrationTable(rows, student = false) {
  if (!rows.length) {
    return '<div class="empty">No registrations yet. Explore competitions to get started.</div>';
  }

  return `
    <div class="table-wrap">

      <table>

        <thead>
          <tr>
            <th>Competition</th>
            <th>Registration date</th>
            <th>Team</th>
            <th>Status</th>

            ${student
              ? '<th>Action</th>'
              : '<th>Student</th><th>Action</th>'
            }

          </tr>
        </thead>

        <tbody>

          ${rows.map(r => {

            const c = db.competitions.find(x =>
              x.id === r.competitionId
            ) || {};

            const u = db.users.find(x =>
              x.id === r.userId
            ) || {};

            return `
              <tr>

                <td>
                  <b>${esc(c.title || 'Deleted competition')}</b>
                </td>

                <td>${fmt(r.date)}</td>

                <td>${esc(r.team || 'Solo')}</td>

                <td>
                  <span class="status ${r.status}">
                    ${esc(r.status)}
                  </span>
                </td>

                ${student

                  ? `<td>
                      ${r.status !== 'Cancelled' && r.status !== 'Rejected'
                        ? `<button class="btn danger small"
                        onclick="cancelRegistration('${r.id}')">
                          Cancel
                        </button>`
                        : '—'
                      }
                    </td>`

                  : `<td>
                      ${esc(u.name || 'Unknown')}
                      <br>
                      <small class="muted">${esc(u.regNo || '')}</small>
                    </td>

                    <td>
                      ${r.status === 'Pending'

                        ? `<button class="btn success small"
                        onclick="setStatus('${r.id}','Approved')">
                          Approve
                        </button>

                        <button class="btn danger small"
                        onclick="setStatus('${r.id}','Rejected')">
                          Reject
                        </button>`

                        : '—'
                      }
                    </td>`
                }

              </tr>
            `;

          }).join('')}

        </tbody>

      </table>

    </div>
  `;
}

// CANCEL REGISTRATION

function cancelRegistration(id) {
  const r = db.registrations.find(x => x.id === id);

  if (!r) return;

  if (!confirm('Cancel this registration?')) return;

  r.status = 'Cancelled';

  saveDB();

  toast('Registration cancelled.');

  renderStudent();
}

// ADMIN APPROVAL

function setStatus(id, status) {
  const r = db.registrations.find(x => x.id === id);

  if (!r) return;

  r.status = status;

  saveDB();

  toast(`Registration ${status.toLowerCase()}.`);

  renderAdmin();
}

// ADMIN DASHBOARD

function renderAdmin() {
  syncHeader();

  const pending = db.registrations.filter(r =>
    r.status === 'Pending'
  ).length;

  document.getElementById('app').innerHTML = `
    <div class="container">

      <div class="section-head">

        <div>
          <div class="eyebrow" style="color:var(--blue)">
            Organizer workspace
          </div>

          <h2>Admin dashboard</h2>

          <div class="muted">
            Manage competitions and student registrations.
          </div>
        </div>

        <button class="btn primary" onclick="openCompetitionForm()">
          ＋ Add competition
        </button>

      </div>

      <div class="stats">

        <div class="stat">
          <span>Total competitions</span>
          <strong>${db.competitions.length}</strong>
        </div>

        <div class="stat">
          <span>Total registrations</span>
          <strong>${db.registrations.length}</strong>
        </div>

        <div class="stat">
          <span>Pending requests</span>
          <strong>${pending}</strong>
        </div>

        <div class="stat">
          <span>Registered students</span>
          <strong>${db.users.filter(u => u.role === 'student').length}</strong>
        </div>

      </div>

      <div class="navtabs">

        <button class="tab ${activeTab === 'overview' ? 'active' : ''}"
        onclick="adminTab('overview')">
          Overview
        </button>

        <button class="tab ${activeTab === 'competitions' ? 'active' : ''}"
        onclick="adminTab('competitions')">
          Manage competitions
        </button>

        <button class="tab ${activeTab === 'registrations' ? 'active' : ''}"
        onclick="adminTab('registrations')">
          Registrations
        </button>

        <button class="tab ${activeTab === 'reports' ? 'active' : ''}"
        onclick="adminTab('reports')">
          Reports
        </button>

      </div>

      <div id="adminContent"></div>

    </div>
  `;

  renderAdminContent();
}

// ADMIN TABS

function adminTab(tab) {
  activeTab = tab;
  renderAdmin();
}

function renderAdminContent() {
  const root = document.getElementById('adminContent');

  if (!root) return;

  // OVERVIEW

  if (activeTab === 'overview') {

    root.innerHTML = `

      <div class="panel">

        <h3>Recent registrations</h3>

        ${registrationTable(
          [...db.registrations].reverse().slice(0, 6),
          false
        )}

      </div>

      <div class="panel">

        <h3>Quick actions</h3>

        <button class="btn primary"
        onclick="adminTab('competitions')">
          Manage competitions
        </button>

        <button class="btn outline"
        onclick="adminTab('registrations')">
          Review registrations
        </button>

      </div>

    `;
  }

  // MANAGE COMPETITIONS

  if (activeTab === 'competitions') {

    root.innerHTML = `

      <div class="panel">

        <div class="section-head" style="margin:0 0 15px">

          <h3>All competitions</h3>

          <button class="btn primary small"
          onclick="openCompetitionForm()">
            ＋ Add new
          </button>

        </div>

        <div class="table-wrap">

          <table>

            <thead>
              <tr>
                <th>Competition</th>
                <th>Category</th>
                <th>Event date</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              ${db.competitions.map(c => `

                <tr>

                  <td><b>${esc(c.title)}</b></td>

                  <td>${esc(c.category)}</td>

                  <td>${fmt(c.date)}</td>

                  <td>${c.seats}</td>

                  <td>${esc(c.status)}</td>

                  <td>

                    <button class="btn outline small"
                    onclick="openCompetitionForm('${c.id}')">
                      Edit
                    </button>

                    <button class="btn danger small"
                    onclick="deleteCompetition('${c.id}')">
                      Delete
                    </button>

                  </td>

                </tr>

              `).join('')}

            </tbody>

          </table>

        </div>

      </div>

    `;
  }

  // REGISTRATIONS

  if (activeTab === 'registrations') {

    root.innerHTML = `

      <div class="panel">

        <h3>Student registration requests</h3>

        <div class="filters">

          <input class="field" id="regSearch"
          placeholder="Search student or competition..."
          oninput="filterRegistrationRows()">

          <select class="field" id="regStatus"
          onchange="filterRegistrationRows()">

            <option value="">All statuses</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Cancelled</option>

          </select>

        </div>

        <div id="regTable">
          ${registrationTable(db.registrations, false)}
        </div>

      </div>

    `;
  }

  // REPORTS

  if (activeTab === 'reports') {

    const approved = db.registrations.filter(r =>
      r.status === 'Approved'
    ).length;

    root.innerHTML = `

      <div class="stats">

        <div class="stat">
          <span>All registrations</span>
          <strong>${db.registrations.length}</strong>
        </div>

        <div class="stat">
          <span>Approved</span>
          <strong>${approved}</strong>
        </div>

        <div class="stat">
          <span>Pending</span>
          <strong>${db.registrations.filter(r => r.status === 'Pending').length}</strong>
        </div>

        <div class="stat">
          <span>Rejected / Cancelled</span>
          <strong>${db.registrations.filter(r =>
            ['Rejected', 'Cancelled'].includes(r.status)
          ).length}</strong>
        </div>

      </div>

      <div class="panel">

        <h3>Competition-wise report</h3>

        <div class="table-wrap">

          <table>

            <thead>
              <tr>
                <th>Competition</th>
                <th>Registrations</th>
                <th>Approved</th>
                <th>Pending</th>
              </tr>
            </thead>

            <tbody>

              ${db.competitions.map(c => {

                const rows = db.registrations.filter(r =>
                  r.competitionId === c.id
                );

                return `

                  <tr>

                    <td>${esc(c.title)}</td>

                    <td>${rows.length}</td>

                    <td>${rows.filter(r =>
                      r.status === 'Approved'
                    ).length}</td>

                    <td>${rows.filter(r =>
                      r.status === 'Pending'
                    ).length}</td>

                  </tr>

                `;

              }).join('')}

            </tbody>

          </table>

        </div>

        <button class="btn outline" onclick="exportCSV()">
          Export registrations CSV
        </button>

      </div>

    `;
  }
}

// FILTER REGISTRATIONS

function filterRegistrationRows() {
  const q = (document.getElementById('regSearch')?.value || '')
    .toLowerCase();

  const s = document.getElementById('regStatus')?.value || '';

  const rows = db.registrations.filter(r => {

    const u = db.users.find(x => x.id === r.userId) || {};

    const c = db.competitions.find(x =>
      x.id === r.competitionId
    ) || {};

    return (u.name + ' ' + u.regNo + ' ' + c.title)
      .toLowerCase()
      .includes(q) &&
      (!s || r.status === s);

  });

  document.getElementById('regTable').innerHTML =
    registrationTable(rows, false);
}

// ADD / EDIT COMPETITION FORM

function openCompetitionForm(id = '') {

  const c = db.competitions.find(x => x.id === id) || {
    title: '',
    category: 'Technology',
    date: '',
    deadline: '',
    venue: '',
    seats: 50,
    description: '',
    eligibility: 'All students',
    status: 'Open',
    icon: '🏅'
  };

  openModal(`

    <div class="modal-head">

      <h2>${id ? 'Edit competition' : 'Add competition'}</h2>

      <button class="close" onclick="closeModal()">✕</button>

    </div>

    <form onsubmit="saveCompetition(event,'${id}')">

      <div class="form-grid">

        <div class="form-group full">

          <label>Competition title *</label>

          <input id="cTitle" class="field"
          required value="${esc(c.title)}">

        </div>

        <div class="form-group">

          <label>Category *</label>

          <select id="cCategory" class="field">

            <option ${c.category === 'Technology' ? 'selected' : ''}>Technology</option>
            <option ${c.category === 'Innovation' ? 'selected' : ''}>Innovation</option>
            <option ${c.category === 'Design' ? 'selected' : ''}>Design</option>
            <option ${c.category === 'Sports' ? 'selected' : ''}>Sports</option>
            <option ${c.category === 'Quiz' ? 'selected' : ''}>Quiz</option>
            <option ${c.category === 'Cultural' ? 'selected' : ''}>Cultural</option>
            <option ${c.category === 'Other' ? 'selected' : ''}>Other</option>

          </select>

        </div>

        <div class="form-group">

          <label>Seats *</label>

          <input id="cSeats" type="number" min="1"
          class="field" required value="${c.seats}">

        </div>

        <div class="form-group">

          <label>Event date *</label>

          <input id="cDate" type="date"
          class="field" required value="${c.date}">

        </div>

        <div class="form-group">

          <label>Registration deadline *</label>

          <input id="cDeadline" type="date"
          class="field" required value="${c.deadline}">

        </div>

        <div class="form-group full">

          <label>Venue *</label>

          <input id="cVenue" class="field"
          required value="${esc(c.venue)}">

        </div>

        <div class="form-group full">

          <label>Description *</label>

          <textarea id="cDesc" class="field"
          required>${esc(c.description)}</textarea>

        </div>

        <div class="form-group full">

          <label>Eligibility</label>

          <input id="cEligibility" class="field"
          value="${esc(c.eligibility)}">

        </div>

        <div class="form-group">

          <label>Status</label>

          <select id="cStatus" class="field">

            <option ${c.status === 'Open' ? 'selected' : ''}>Open</option>
            <option ${c.status === 'Closed' ? 'selected' : ''}>Closed</option>

          </select>

        </div>

        <div class="form-group">

          <label>Card emoji</label>

          <input id="cIcon" class="field"
          value="${esc(c.icon)}">

        </div>

      </div>

      <button class="btn primary"
      style="width:100%;margin-top:17px">

        ${id ? 'Save changes' : 'Create competition'}

      </button>

    </form>

  `);
}

// SAVE COMPETITION

function saveCompetition(e, id) {
  e.preventDefault();

  const data = {

    title: document.getElementById('cTitle').value.trim(),

    category: document.getElementById('cCategory').value,

    seats: Number(document.getElementById('cSeats').value),

    date: document.getElementById('cDate').value,

    deadline: document.getElementById('cDeadline').value,

    venue: document.getElementById('cVenue').value.trim(),

    description: document.getElementById('cDesc').value.trim(),

    eligibility: document.getElementById('cEligibility').value.trim(),

    status: document.getElementById('cStatus').value,

    icon: document.getElementById('cIcon').value.trim() || '🏅'

  };

  if (data.deadline > data.date) {
    toast('Deadline should not be after the event date.');
    return;
  }

  if (id) {

    Object.assign(
      db.competitions.find(x => x.id === id),
      data
    );

  } else {

    db.competitions.push({
      id: uid('comp'),
      ...data
    });

  }

  saveDB();

  closeModal();

  toast(id ? 'Competition updated.' : 'Competition created.');

  activeTab = 'competitions';

  renderAdmin();
}

// DELETE COMPETITION

function deleteCompetition(id) {
  const c = db.competitions.find(x => x.id === id);

  if (!c) return;

  if (!confirm(
    `Delete "${c.title}"? Related registration records will remain in the demo.`
  )) return;

  db.competitions = db.competitions.filter(x => x.id !== id);

  saveDB();

  toast('Competition deleted.');

  renderAdmin();
}

// EXPORT CSV REPORT

function exportCSV() {

  const rows = [

    [
      'Competition',
      'Student',
      'Registration No',
      'Date',
      'Team',
      'Status'
    ],

    ...db.registrations.map(r => {

      const c = db.competitions.find(x =>
        x.id === r.competitionId
      ) || {};

      const u = db.users.find(x =>
        x.id === r.userId
      ) || {};

      return [
        c.title || '',
        u.name || '',
        u.regNo || '',
        r.date,
        r.team,
        r.status
      ];

    })

  ];

  const csv = rows.map(row =>
    row.map(v =>
      '"' + String(v ?? '').replace(/"/g, '""') + '"'
    ).join(',')
  ).join('\n');

  const a = document.createElement('a');

  a.href = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv' })
  );

  a.download = 'campus-competition-registrations.csv';

  a.click();

  URL.revokeObjectURL(a.href);
}

// INITIALIZE WEBSITE

saveDB();

goHome();
