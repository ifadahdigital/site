/* ============================================================
   IFADAH Digital Solutions — main.js
   ============================================================ */

// ---- Mobile Navigation ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    hamburger.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
  });
}

// ---- Highlight active nav link ----
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add('active');
  }
});

// ============================================================
// PROJECT RENDERING — reads from data/projects.json
// Used on: index.html (featured only) and projects.html (all)
// ============================================================

/**
 * Build a project card HTML string from a project object.
 * Fields in projects.json:
 *   id, title, description, category[], tech[], image, video,
 *   linkedinUrl, githubUrl, year, featured
 */
function buildProjectCard(p) {
  const media = p.video
    ? `<iframe class="project-media" src="${p.video}" title="${p.title}" allowfullscreen></iframe>`
    : `<img class="project-media" src="${p.image || 'assets/images/placeholder.svg'}" alt="${p.title}" loading="lazy">`;

  const tags = (p.tech || [])
    .map(t => `<span class="tag">${t}</span>`)
    .join('');

  const links = [];
  if (p.linkedinUrl) {
    links.push(`<a href="${p.linkedinUrl}" target="_blank" rel="noopener"><i class="fab fa-linkedin"></i> LinkedIn</a>`);
  }
  if (p.githubUrl) {
    links.push(`<a href="${p.githubUrl}" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>`);
  }
  const linksHtml = links.length
    ? `<div class="project-links">${links.join('')}</div>`
    : '';

  const categoryBadge = (p.category || [])
    .map(c => `<span class="tag" style="background:#E8F5E9;color:#2E7D32;">${c}</span>`)
    .join('');

  return `
    <div class="project-card" data-category="${(p.category || []).join(' ')}">
      ${media}
      <div class="project-body">
        <div class="project-year">${p.year || ''} &nbsp; ${categoryBadge}</div>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="tech-tags">${tags}</div>
        ${linksHtml}
      </div>
    </div>`;
}

// ---- Render featured projects on homepage ----
const featuredContainer = document.getElementById('featured-projects');
if (featuredContainer) {
  fetch('data/projects.json')
    .then(r => r.json())
    .then(projects => {
      const featured = projects.filter(p => p.featured).slice(0, 3);
      featuredContainer.innerHTML = featured.map(buildProjectCard).join('');
    })
    .catch(() => {
      featuredContainer.innerHTML = '<p style="color:#999;text-align:center;">Projects loading failed. Open via a local server or GitHub Pages.</p>';
    });
}

// ---- Render all projects with filter on projects.html ----
const allProjectsContainer = document.getElementById('all-projects');
const filterBtns = document.querySelectorAll('.filter-btn');

if (allProjectsContainer) {
  let allProjects = [];

  fetch('data/projects.json')
    .then(r => r.json())
    .then(projects => {
      allProjects = projects;
      renderProjects('all');
    })
    .catch(() => {
      allProjectsContainer.innerHTML = '<p class="no-projects">Could not load projects. Make sure you are viewing via a web server (GitHub Pages or local server).</p>';
    });

  function renderProjects(filter) {
    const filtered = filter === 'all'
      ? allProjects
      : allProjects.filter(p => (p.category || []).includes(filter));

    if (filtered.length === 0) {
      allProjectsContainer.innerHTML = '<p class="no-projects">No projects in this category yet.</p>';
    } else {
      allProjectsContainer.innerHTML = filtered.map(buildProjectCard).join('');
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(btn.dataset.filter);
    });
  });
}

// ---- Contact form (no-op, wire to backend/Formspree later) ----
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Message Sent!';
    btn.disabled = true;
    btn.style.background = '#2E7D32';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      btn.style.background = '';
      contactForm.reset();
    }, 3000);
  });
}
