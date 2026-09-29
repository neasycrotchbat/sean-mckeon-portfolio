/* Back-to-top + contact form. */
(function () {
  'use strict';

  var toTop = document.getElementById('toTop');
  if (toTop) toTop.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Contact form -> FormSubmit (delivers to seanrobertmckeon@gmail.com).
     Note: FormSubmit emails a one-time activation link to that address on
     the first submission; until it's confirmed, submissions aren't relayed. */
  var form = document.getElementById('contactForm');
  if (!form) return;
  var ENDPOINT = 'https://formsubmit.co/ajax/seanrobertmckeon@gmail.com';
  var button = form.querySelector('button');
  var errEl = form.querySelector('.form-error');
  var sentEl = document.querySelector('.form-sent');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    errEl.hidden = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    var data = {
      name: form.elements.name.value,
      email: form.elements.email.value,
      message: form.elements.message.value,
      _honey: form.elements._honey.value,
      _subject: 'seanrobertmckeon.com contact form'
    };
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function () {
      form.hidden = true;
      sentEl.hidden = false;
    }).catch(function () {
      errEl.hidden = false;
      button.disabled = false;
      button.textContent = 'Submit';
    });
  });
})();
