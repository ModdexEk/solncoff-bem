(() => {
  const recipient = document
    .querySelector(".contacts__email")
    .href.slice("mailto:".length);
  const dialog = document.getElementById("brief-dialog");
  const form = dialog.querySelector("form");
  const { product, width, height, client, contact, message } = form.elements;
  const contactForm = document.getElementById("contact-form");
  const title = dialog.querySelector(".brief__title");
  const result = dialog.querySelector(".brief__result");
  const preview = dialog.querySelector(".brief__preview");
  const email = dialog.querySelector("[data-brief-email]");
  const download = dialog.querySelector("[data-brief-download]");
  const dimensions = dialog.querySelector(".brief__dimensions");
  let opener = null;
  let fileUrl = null;
  let isMessage = false;

  function clearResult() {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    fileUrl = null;
    email.removeAttribute("href");
    download.removeAttribute("href");
    preview.textContent = "";
    title.textContent = isMessage ? "Ваш вопрос" : "Заявка на замер";
    form.hidden = false;
    result.hidden = true;
  }

  function validateContact() {
    const value = contact.value.trim();
    const digits = value.replace(/\D/g, "");
    const isPhone =
      /^\+?[\d\s().-]+$/.test(value) &&
      digits.length >= 7 &&
      digits.length <= 15;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    contact.setCustomValidity(
      value && !isPhone && !isEmail
        ? "Укажите электронную почту или номер телефона из 7–15 цифр."
        : "",
    );
    if (contact.value && !value)
      contact.setCustomValidity("Укажите телефон или электронную почту.");
    client.setCustomValidity(
      client.value && !client.value.trim() ? "Введите ваше имя." : "",
    );
    message.setCustomValidity(
      isMessage && message.value && !message.value.trim()
        ? "Введите ваш вопрос."
        : "",
    );
  }

  function openBrief(selected, trigger, values) {
    opener = trigger;
    isMessage = Boolean(values);
    clearResult();
    form.reset();
    dimensions.open = false;
    dimensions.hidden = isMessage;
    product.closest("label").hidden = isMessage;
    message.closest("label").hidden = !isMessage;
    message.required = isMessage;
    if (Array.from(product.options).some((option) => option.value === selected))
      product.value = selected;
    if (values) {
      client.value = values.get("client");
      contact.value = values.get("contact");
      message.value = values.get("message");
    }
    validateContact();
    dialog.showModal();
    title.focus();
    if (values) form.requestSubmit();
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-brief]");
    if (!trigger || dialog.open) return;
    event.preventDefault();
    const sheet = trigger.closest("dialog[open]");
    if (sheet) sheet.close();
    openBrief(trigger.dataset.brief, sheet ? document.activeElement : trigger);
  });
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    openBrief("consultation", event.submitter, new FormData(contactForm));
  });

  form.addEventListener("input", validateContact);
  form.addEventListener(
    "invalid",
    (event) => {
      if (dimensions.contains(event.target)) dimensions.open = true;
    },
    true,
  );
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    validateContact();
    if (!form.reportValidity()) return;

    const fields = isMessage
      ? []
      : [`Изделие: ${product.selectedOptions[0].textContent}`];
    if (width.value) fields.push(`Ширина проёма: ${width.valueAsNumber} мм`);
    if (height.value) fields.push(`Высота проёма: ${height.valueAsNumber} мм`);
    fields.push(
      `Имя: ${client.value.trim()}`,
      `Контакт: ${contact.value.trim()}`,
    );
    if (isMessage) fields.push(`Вопрос: ${message.value.trim()}`);
    const subject = isMessage
      ? "Вопрос для СолнцOFF"
      : "Заявка на замер — СолнцOFF";
    const body = fields.join("\r\n");
    email.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const file = new Blob(["\uFEFF", subject, "\r\n\r\n", body, "\r\n"], {
      type: "text/plain;charset=utf-8",
    });
    fileUrl = URL.createObjectURL(file);
    download.href = fileUrl;
    preview.textContent = body;
    title.textContent = isMessage ? "Письмо готово" : "Заявка готова";
    form.hidden = true;
    result.hidden = false;
    dialog.scrollTop = 0;
    title.focus();
  });

  dialog.querySelector("[data-brief-edit]").addEventListener("click", () => {
    clearResult();
    (isMessage ? message : product).focus();
  });
  dialog
    .querySelector("[data-brief-close]")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    clearResult();
    form.reset();
    if (opener && !document.querySelector("dialog:modal"))
      opener.focus({ preventScroll: true });
    opener = null;
  });
})();
