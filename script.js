// Bloom & Bash interactions and booking submission
const burger = document.getElementById('burgerBtn');
const navLinks = document.getElementById('navLinks');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((element) => io.observe(element));
} else {
  revealEls.forEach((element) => element.classList.add('in'));
}

const form = document.getElementById('bookingForm');
const message = document.getElementById('formMsg');
const submitButton = form?.querySelector('button[type="submit"]');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!message || !submitButton) return;

  submitButton.disabled = true;
  submitButton.textContent = 'Saving request...';
  message.className = 'form-msg show';
  message.textContent = 'Saving your request...';

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    message.className = 'form-msg show success';
    message.textContent = result.message;
    form.reset();
  } catch (error) {
    message.className = 'form-msg show error';
    message.textContent = error.message || 'Something went wrong. Please try again.';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Send booking request';
  }
});
