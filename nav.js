// Underlines the top-nav link for the section currently in view.
(function () {
  const links = [...document.querySelectorAll('.topnav a[href^="#"]')];
  const sections = links.map((link) => document.querySelector(link.getAttribute('href')));
  const nav = document.querySelector('.topnav');

  let lockedUntilScrollEnds = false;

  function setCurrent(index) {
    links.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function update() {
    if (lockedUntilScrollEnds) return;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) return setCurrent(sections.length - 1);

    // The current section is the last one whose top has passed under the nav
    const line = nav.offsetHeight + 40;
    let current = 0;
    sections.forEach((section, i) => {
      if (section && section.getBoundingClientRect().top <= line) current = i;
    });
    setCurrent(current);
  }

  // A clicked link stays underlined until its scroll finishes. Otherwise a short
  // section near the bottom (like Contact) could be skipped over.
  links.forEach((link, i) => {
    link.addEventListener('click', () => {
      setCurrent(i);
      lockedUntilScrollEnds = true;
    });
  });

  let scrollTimer;
  window.addEventListener('scroll', () => {
    // Fallback for browsers without the scrollend event
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => { lockedUntilScrollEnds = false; }, 150);
    update();
  }, { passive: true });
  window.addEventListener('scrollend', () => { lockedUntilScrollEnds = false; });
  window.addEventListener('resize', update);

  update();
})();
