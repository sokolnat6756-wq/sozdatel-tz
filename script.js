(function () {
  "use strict";

  var UNKNOWN = "Пока не знаю";
  var form = document.getElementById("spec-form");
  var resultArea = document.getElementById("result");
  var actionsList = document.getElementById("actions-list");
  var addActionBtn = document.getElementById("add-action");
  var clearBtn = document.getElementById("clear-btn");
  var actionCounter = 0;
  var assembledOnce = false;

  function trim(value) {
    return (value || "").replace(/^\s+|\s+$/g, "");
  }

  function isFilled(value) {
    return trim(value).length > 0;
  }

  function getRadioValue(name) {
    var checked = form.querySelector('input[name="' + name + '"]:checked');
    return checked ? checked.value : "";
  }

  function getCheckedValues(name) {
    var nodes = form.querySelectorAll('input[name="' + name + '"]:checked');
    var values = [];
    for (var i = 0; i < nodes.length; i++) {
      values.push(nodes[i].value);
    }
    return values;
  }

  function preserveMultiline(text) {
    return trim(text);
  }

  function asBulletList(text) {
    var cleaned = preserveMultiline(text);
    if (!cleaned) return "";
    var lines = cleaned.split(/\r?\n/);
    var items = [];
    for (var i = 0; i < lines.length; i++) {
      var line = trim(lines[i]);
      if (!line) continue;
      line = line.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, "");
      items.push("- " + line);
    }
    return items.length ? items.join("\n") : "";
  }

  function createActionRow(value) {
    actionCounter += 1;
    var id = "action-" + actionCounter;
    var row = document.createElement("div");
    row.className = "dynamic-item";
    row.dataset.actionRow = "1";

    var input = document.createElement("input");
    input.type = "text";
    input.id = id;
    input.name = "action";
    input.setAttribute("aria-label", "Действие пользователя");
    input.placeholder = "Например: Добавить привычку";
    input.value = value || "";
    input.autocomplete = "off";

    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-icon";
    removeBtn.setAttribute("aria-label", "Удалить действие");
    removeBtn.title = "Удалить";
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", function () {
      var rows = actionsList.querySelectorAll("[data-action-row]");
      if (rows.length <= 1) {
        input.value = "";
        input.focus();
        return;
      }
      row.remove();
      updateRemoveButtons();
    });

    row.appendChild(input);
    row.appendChild(removeBtn);
    return row;
  }

  function updateRemoveButtons() {
    var rows = actionsList.querySelectorAll("[data-action-row]");
    for (var i = 0; i < rows.length; i++) {
      var btn = rows[i].querySelector(".btn-icon");
      if (btn) {
        btn.disabled = rows.length <= 1;
      }
    }
  }

  function getActions() {
    var inputs = actionsList.querySelectorAll('input[name="action"]');
    var actions = [];
    for (var i = 0; i < inputs.length; i++) {
      var value = trim(inputs[i].value);
      if (value) actions.push(value);
    }
    return actions;
  }

  function clearFieldError(fieldEl, errorEl) {
    if (fieldEl) fieldEl.classList.remove("has-error");
    if (errorEl) {
      errorEl.hidden = true;
      errorEl.textContent = "";
    }
  }

  function setFieldError(fieldEl, errorEl, message, focusTarget) {
    if (fieldEl) fieldEl.classList.add("has-error");
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = message;
    }
    return focusTarget || null;
  }

  function validate() {
    var firstFocus = null;

    var ideaField = document.getElementById("product-idea").closest(".field");
    var ideaError = document.getElementById("error-product-idea");
    var audienceField = document.getElementById("audience").closest(".field");
    var audienceError = document.getElementById("error-audience");
    var taskField = document.getElementById("user-task").closest(".field");
    var taskError = document.getElementById("error-user-task");
    var actionsField = document.getElementById("actions-field");
    var actionsError = document.getElementById("error-actions");

    clearFieldError(ideaField, ideaError);
    clearFieldError(audienceField, audienceError);
    clearFieldError(taskField, taskError);
    clearFieldError(actionsField, actionsError);

    if (!isFilled(document.getElementById("product-idea").value)) {
      firstFocus = setFieldError(
        ideaField,
        ideaError,
        "Опишите, что хотите создать.",
        document.getElementById("product-idea")
      ) || firstFocus;
    }

    if (!isFilled(document.getElementById("audience").value)) {
      var focus = setFieldError(
        audienceField,
        audienceError,
        "Укажите, для кого создаётся продукт.",
        document.getElementById("audience")
      );
      if (!firstFocus) firstFocus = focus;
    }

    if (!isFilled(document.getElementById("user-task").value)) {
      var focusTask = setFieldError(
        taskField,
        taskError,
        "Опишите задачу пользователя.",
        document.getElementById("user-task")
      );
      if (!firstFocus) firstFocus = focusTask;
    }

    if (getActions().length === 0) {
      var firstAction = actionsList.querySelector('input[name="action"]');
      var focusAction = setFieldError(
        actionsField,
        actionsError,
        "Добавьте хотя бы одно действие пользователя.",
        firstAction
      );
      if (!firstFocus) firstFocus = focusAction;
    }

    if (firstFocus) {
      firstFocus.focus();
      if (typeof firstFocus.scrollIntoView === "function") {
        firstFocus.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    return true;
  }

  function collectData() {
    return {
      projectName: trim(document.getElementById("project-name").value),
      productIdea: preserveMultiline(document.getElementById("product-idea").value),
      productType: getRadioValue("productType"),
      audience: preserveMultiline(document.getElementById("audience").value),
      userTask: preserveMultiline(document.getElementById("user-task").value),
      actions: getActions(),
      pages: preserveMultiline(document.getElementById("pages").value),
      inputData: preserveMultiline(document.getElementById("input-data").value),
      userResult: preserveMultiline(document.getElementById("user-result").value),
      flagAuth: getRadioValue("flagAuth"),
      flagPay: getRadioValue("flagPay"),
      flagSave: getRadioValue("flagSave"),
      flagAi: getRadioValue("flagAi"),
      outOfScope: preserveMultiline(document.getElementById("out-of-scope").value),
      designStyle: preserveMultiline(document.getElementById("design-style").value),
      references: preserveMultiline(document.getElementById("references").value),
      devices: getCheckedValues("device"),
      tech: preserveMultiline(document.getElementById("tech").value),
      constraints: preserveMultiline(document.getElementById("constraints").value),
      successSignal: preserveMultiline(document.getElementById("success-signal").value),
      mustWork: preserveMultiline(document.getElementById("must-work").value)
    };
  }

  function pushSection(parts, title, body) {
    parts.push("## " + title);
    parts.push("");
    parts.push(body);
    parts.push("");
  }

  function buildDocument(data) {
    var clarifications = [];
    var parts = [];

    var title = data.projectName || "Цифровой продукт без названия";
    parts.push("# " + title);
    parts.push("");
    parts.push("> Документ собран из ответов пользователя. Незаполненные пункты отмечены как требующие уточнения.");
    parts.push("");

    // 1. Название и описание
    var section1 = [];
    section1.push("**Название:** " + (data.projectName || "не указано"));
    section1.push("");
    section1.push("**Тип продукта:** " + (data.productType || "не указан"));
    section1.push("");
    section1.push("**Описание:**");
    section1.push(data.productIdea);
    pushSection(parts, "1. Название и описание продукта", section1.join("\n"));

    // 2. ЦА
    pushSection(
      parts,
      "2. Целевая аудитория",
      data.audience
    );

    // 3. Задача и результат
    var section3 = [];
    section3.push("**Задача пользователя:**");
    section3.push(data.userTask);
    section3.push("");
    if (isFilled(data.userResult)) {
      section3.push("**Ожидаемый результат для пользователя:**");
      section3.push(data.userResult);
    } else {
      section3.push("**Ожидаемый результат для пользователя:** нужно уточнить.");
      clarifications.push("Какой результат должен получать пользователь после основных действий?");
    }
    pushSection(parts, "3. Задача и ожидаемый результат", section3.join("\n"));

    // 4. Состав первой версии
    var section4 = [];
    section4.push("Основные действия первой версии:");
    for (var i = 0; i < data.actions.length; i++) {
      section4.push("- " + data.actions[i]);
    }
    pushSection(parts, "4. Состав первой версии", section4.join("\n"));

    // 5. Сценарий
    var section5;
    if (data.actions.length > 0) {
      section5 =
        "Пользовательский сценарий отдельным текстом не описан.\n" +
        "Известны только основные действия — их последовательность нужно уточнить.\n\n" +
        "Известные действия:\n" +
        data.actions.map(function (a) { return "- " + a; }).join("\n");
      clarifications.push("Опишите основной пользовательский сценарий: с чего начинается путь, какие шаги идут друг за другом и чем завершается.");
    } else {
      section5 = "Пользовательский сценарий не описан — нужно уточнить.";
      clarifications.push("Опишите основной пользовательский сценарий.");
    }
    pushSection(parts, "5. Основной пользовательский сценарий", section5);

    // 6. Страницы
    if (isFilled(data.pages)) {
      var pagesList = asBulletList(data.pages);
      pushSection(
        parts,
        "6. Страницы, экраны или разделы",
        pagesList || data.pages
      );
    } else {
      pushSection(
        parts,
        "6. Страницы, экраны или разделы",
        "Не указаны — нужно уточнить."
      );
      clarifications.push("Какие страницы, экраны или разделы нужны в первой версии?");
    }

    // 7. Данные и результаты
    var section7 = [];
    if (isFilled(data.inputData)) {
      section7.push("**Вводимые данные:**");
      section7.push(data.inputData);
    } else {
      section7.push("**Вводимые данные:** не указаны — нужно уточнить.");
      clarifications.push("Какие данные пользователь вводит?");
    }
    section7.push("");
    if (isFilled(data.userResult)) {
      section7.push("**Результаты, которые получает пользователь:**");
      section7.push(data.userResult);
    } else {
      section7.push("**Результаты, которые получает пользователь:** не указаны — нужно уточнить.");
    }
    pushSection(parts, "7. Вводимые данные и результаты", section7.join("\n"));

    // 8. Флаги
    var section8 = [];
    section8.push("- Регистрация / вход: " + data.flagAuth);
    section8.push("- Оплата: " + data.flagPay);
    section8.push("- Сохранение данных: " + data.flagSave);
    section8.push("- AI / нейросеть: " + data.flagAi);
    section8.push("");

    var needsServices = [];
    if (data.flagAuth === "Да") {
      needsServices.push("авторизацию");
      section8.push("Нужно отдельно определить сервис и способ безопасного подключения авторизации. Не запрашивать и не хранить пароли, токены и секретные ключи в открытом виде в коде проекта без согласованного подхода.");
    } else if (data.flagAuth === UNKNOWN) {
      clarifications.push("Нужна ли регистрация / вход в первой версии?");
    }

    if (data.flagPay === "Да") {
      needsServices.push("оплату");
      section8.push("Нужно отдельно определить платёжный сервис и способ безопасного подключения. Не запрашивать секретные ключи в диалоге без отдельной команды.");
    } else if (data.flagPay === UNKNOWN) {
      clarifications.push("Нужна ли оплата в первой версии?");
    }

    if (data.flagSave === "Да") {
      section8.push("Нужно отдельно определить, где и как сохраняются данные (локально или на сервере), и согласовать это перед реализацией.");
    } else if (data.flagSave === UNKNOWN) {
      clarifications.push("Нужно ли сохранение данных в первой версии, и где они должны храниться?");
    }

    if (data.flagAi === "Да") {
      needsServices.push("AI");
      section8.push("Нужно отдельно определить AI-сервис и способ безопасного подключения. Не запрашивать API-ключи без отдельной команды.");
    } else if (data.flagAi === UNKNOWN) {
      clarifications.push("Нужны ли AI-возможности в первой версии?");
    }

    if (needsServices.length) {
      section8.push("");
      section8.push(
        "Для пунктов «Да» (" +
          needsServices.join(", ") +
          ") перед реализацией нужно согласовать конкретные сервисы и безопасный способ подключения."
      );
    }

    pushSection(
      parts,
      "8. Регистрация, оплата, сохранение данных и AI",
      section8.join("\n")
    );

    // 9. Дизайн
    var section9 = [];
    if (isFilled(data.designStyle)) {
      section9.push("**Стиль, цвета и настроение:**");
      section9.push(data.designStyle);
    } else {
      section9.push("**Стиль, цвета и настроение:** не указаны — нужно уточнить.");
      clarifications.push("Какой желаемый стиль, цвета и настроение у продукта?");
    }
    section9.push("");
    if (isFilled(data.references)) {
      section9.push("**Референсы:**");
      section9.push(data.references);
    } else {
      section9.push("**Референсы:** не указаны.");
    }
    section9.push("");
    if (data.devices.length) {
      section9.push("**Где будут пользоваться:** " + data.devices.join(", "));
    } else {
      section9.push("**Где будут пользоваться:** не указано — нужно уточнить.");
      clarifications.push("Где будут пользоваться продуктом: компьютер, телефон или оба?");
    }
    pushSection(parts, "9. Дизайн и адаптивность", section9.join("\n"));

    // 10. Технологии
    var section10 = [];
    if (isFilled(data.tech)) {
      section10.push("**Технологии / платформа (по словам пользователя):**");
      section10.push(data.tech);
    } else {
      section10.push("Предложи подходящие технологии и объясни выбор перед реализацией.");
    }
    section10.push("");
    if (isFilled(data.constraints)) {
      section10.push("**Дополнительные ограничения и пожелания:**");
      section10.push(data.constraints);
    } else {
      section10.push("**Дополнительные ограничения и пожелания:** не указаны.");
    }
    section10.push("");
    section10.push(
      "Не обещай, что любой описанный продукт можно создать только на HTML, CSS и JavaScript: выбор стека должен соответствовать типу продукта и требованиям."
    );
    pushSection(parts, "10. Технологии и ограничения", section10.join("\n"));

    // 11. Вне объёма
    if (isFilled(data.outOfScope)) {
      var outList = asBulletList(data.outOfScope);
      pushSection(
        parts,
        "11. Что не входит в первую версию",
        outList || data.outOfScope
      );
    } else {
      pushSection(
        parts,
        "11. Что не входит в первую версию",
        "Не указано. Если есть функции, которые точно не нужны сейчас, уточните их отдельно."
      );
      clarifications.push("Что сознательно не нужно включать в первую версию?");
    }

    // 12. Критерии приёмки
    var section12 = [];
    if (isFilled(data.successSignal)) {
      section12.push("**Как пользователь поймёт, что продукт работает:**");
      section12.push(data.successSignal);
    } else {
      section12.push("**Как пользователь поймёт, что продукт работает:** не указано — нужно уточнить.");
      clarifications.push("Как пользователь поймёт, что продукт работает?");
    }
    section12.push("");
    if (isFilled(data.mustWork)) {
      section12.push("**Действия, которые обязательно должны успешно выполняться:**");
      var mustList = asBulletList(data.mustWork);
      section12.push(mustList || data.mustWork);
    } else {
      section12.push("**Действия, которые обязательно должны успешно выполняться:** не указаны — нужно уточнить.");
      clarifications.push("Какие действия обязательно должны успешно выполняться в первой версии?");
    }
    pushSection(parts, "12. Критерии приёмки", section12.join("\n"));

    // 13. Уточнения
    var section13;
    if (clarifications.length) {
      section13 = clarifications
        .map(function (q, idx) {
          return (idx + 1) + ". " + q;
        })
        .join("\n");
    } else {
      section13 = "Существенных пробелов по обязательным полям не выявлено. При реализации всё равно уточняй детали, если встретятся противоречия.";
    }
    pushSection(parts, "13. Вопросы, которые нужно уточнить", section13);

    // 14. Инструкция
    var instruction =
      "Сначала изучи требования. Если есть существенные неопределённости, задай уточняющие вопросы. Затем предложи план реализации первой версии. Не добавляй функции вне согласованного объёма. После реализации объясни, как запустить проект и проверить критерии приёмки. Не выполняй публикацию, commit или push без отдельной команды.";
    pushSection(parts, "14. Инструкция приложению для разработки", instruction);

    return parts.join("\n").replace(/\n{3,}/g, "\n\n");
  }

  function formHasData() {
    var textControls = form.querySelectorAll("input[type='text'], textarea");
    for (var i = 0; i < textControls.length; i++) {
      if (textControls[i].id === "result") continue;
      if (isFilled(textControls[i].value)) return true;
    }

    var actions = getActions();
    if (actions.length) return true;

    var devices = getCheckedValues("device");
    if (devices.length) return true;

    if (isFilled(resultArea.value)) return true;

    var flags = ["flagAuth", "flagPay", "flagSave", "flagAi"];
    for (var f = 0; f < flags.length; f++) {
      if (getRadioValue(flags[f]) !== UNKNOWN) return true;
    }

    var productType = getRadioValue("productType");
    if (productType && productType !== "Сайт") return true;

    return false;
  }

  function resetForm() {
    form.reset();
    actionsList.innerHTML = "";
    actionsList.appendChild(createActionRow(""));
    updateRemoveButtons();
    resultArea.value = "";
    assembledOnce = false;

    var errors = form.querySelectorAll(".field-error");
    for (var i = 0; i < errors.length; i++) {
      errors[i].hidden = true;
      errors[i].textContent = "";
    }
    var fields = form.querySelectorAll(".field.has-error");
    for (var j = 0; j < fields.length; j++) {
      fields[j].classList.remove("has-error");
    }
  }

  addActionBtn.addEventListener("click", function () {
    var row = createActionRow("");
    actionsList.appendChild(row);
    updateRemoveButtons();
    row.querySelector("input").focus();
  });

  clearBtn.addEventListener("click", function () {
    if (formHasData()) {
      var ok = window.confirm(
        "Очистить форму и готовое ТЗ? Введённые ответы будут удалены."
      );
      if (!ok) return;
    }
    resetForm();
    document.getElementById("project-name").focus();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validate()) return;

    if (assembledOnce && isFilled(resultArea.value)) {
      var ok = window.confirm(
        "Готовое ТЗ будет собрано заново. Ручные правки в поле результата будут заменены. Продолжить?"
      );
      if (!ok) return;
    }

    var data = collectData();
    resultArea.value = buildDocument(data);
    assembledOnce = true;
    resultArea.focus();
  });

  // Старт: одно пустое действие
  actionsList.appendChild(createActionRow(""));
  updateRemoveButtons();
})();
