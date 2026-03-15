/* ============================================================
   IFADAH Digital Solutions — main.js
   ============================================================ */

// ---- Cache-busting: unique version per page load ----
const CACHE_V = '?v=' + Date.now();

// Rewrite all static asset img srcs so browsers never use a cached copy
document.querySelectorAll('img[src^="assets/"]').forEach(el => {
  el.src = el.getAttribute('src').split('?')[0] + CACHE_V;
});

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
  const imgSrc = (p.image || 'assets/images/placeholder.svg') + CACHE_V;
  const media = p.video
    ? `<video class="project-media" src="${p.video}${CACHE_V}" controls preload="none" poster="${p.image ? p.image + CACHE_V : ''}"></video>`
    : `<img class="project-media" src="${imgSrc}" alt="${p.title}" loading="lazy">`;

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
  fetch('data/projects.json' + CACHE_V)
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

  fetch('data/projects.json' + CACHE_V)
    .then(r => r.json())
    .then(projects => {
      allProjects = projects;
      renderProjects('all');
    })
    .catch(() => {
      allProjectsContainer.innerHTML = '<p class="no-projects">Could not load projects. Make sure you are viewing via a web server (GitHub Pages or local server).</p>';
    });

  function renderProjects(filter) {
    const filterLower = filter.toLowerCase();
    const filtered = filter === 'all'
      ? allProjects
      : allProjects.filter(p => (p.category || []).some(c => c.toLowerCase() === filterLower));

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

// ---- Contact form — AJAX submission to Formspree ----
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        contactForm.innerHTML = '<div style="text-align:center;padding:40px 0;"><div style="font-size:2rem;margin-bottom:16px;">✓</div><h3 style="margin-bottom:8px;">Message Sent!</h3><p style="color:var(--text-secondary);">Thanks for reaching out. We\'ll get back to you within 1–2 business days.</p></div>';
      } else {
        btn.textContent = 'Send Message';
        btn.disabled = false;
        alert('Something went wrong. Please try again or email us directly.');
      }
    } catch {
      btn.textContent = 'Send Message';
      btn.disabled = false;
      alert('Network error. Please check your connection and try again.');
    }
  });
}
