// 1. suche alle buttons anhand ihrer csss-klasse
const btn = document.querySelectorAll(".form-adding-dinamic");
btn.forEach((item, i) => {
  item.addEventListener("click", (e) => {
    // 1.
    e.preventDefault();
    // 2.
    const div = document.createElement("div");
    div.classList.add("form-group", "mb-1");
    //div.innerHTML = `<label>${document.querySelectorAll('.form-dinamic')[i].querySelector('label span').textContent}</label>`;

    // div.innerHTML = document
    //   .querySelectorAll(".form-dinamic-block")
    //   [i].querySelector(".form-dinamic-block-item").innerHTML;

    // document.querySelectorAll(".form-dinamic-block")[i].append(div);

    div.innerHTML += document
      .querySelectorAll(".form-dinamic")
      [i].querySelector(".form-dinamic-block").innerHTML;
    document.querySelectorAll(".form-dinamic")[i].append(div);

    // 3. Erstelle Eventlistener -> close-btn soll die generierten Zeile wieder löschen wenn dieser geklickt wird
    const closeBtns = document.querySelectorAll(".form-dinamic-close");
    if (closeBtns.length) {
      closeBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.target.parentElement.parentElement.parentElement.removeChild(
            e.target.parentElement.parentElement
          );
        });
      });
    }
    // auto-fill data funktion
    addingHint();
  });
});

const images = document.querySelectorAll(".img-for-modal");
const modal = document.querySelector(".modal-wrapper");

if (modal) {
  images.forEach((img) => {
    img.addEventListener("click", () => {
      document.body.style.overflow = "hidden";
      modal.style.display = "flex";
      modal.innerHTML = `<img src="${img.src}" class="modal-img" />`;
    });
  });
  modal.addEventListener("click", (e) => {
    document.body.style.overflow = "visible";
    if (e.target.classList.contains("modal-wrapper")) {
      modal.innerHTML = "";
      modal.style.display = "none";
    }
  });
}

const addingHint = () => {
  const formHint = document.querySelectorAll(".form-hint");

  if (formHint.length) {
    formHint.forEach((hintItem) => {
      document.addEventListener("click", () => {
        hintItem.parentElement
          .querySelector(".form-hint-dropdown")
          .classList.remove("show");
      });
      hintItem.addEventListener("input", (e) => {
        if (e.target.value.length >= 3) {
          // 1. dropdown einblenden wenn Eingabe >= 3xZeichen
          e.target.parentElement
            .querySelector(".form-hint-dropdown")
            .classList.add("show");
          //2. Request - start
          $.ajax({
            url: `autofill.php?source=${e.target.getAttribute(
              "data-source"
            )}&fieldset=${e.target.getAttribute("data-fieldset")}&value=${
              e.target.value
            }`,
            method: "GET",
            success: function (data) {
              const notFound = e.target.parentElement.querySelector(
                ".form-hint-dropdown > p"
              );
              const dropDownBlock = e.target.parentElement.querySelector(
                ".form-hint-dropdown > div"
              );
              const parent = e.target.parentElement.parentElement.parentElement;

              dropDownBlock.innerHTML = "";
              if (document.querySelector(".positions-container")) {
                document.querySelector(".positions-container").innerHTML = "";
              }

              console.log(data);

              const obj = JSON.parse(data);

              console.log(obj);

              if (obj == null) {
                notFound.style.display = "block";
                return;
              }

              for (var key in obj) {
                (function (key) {
                  // generiere aus response-array eine option mit attributte=value
                  // Orientierung anhand der reihenfolge der Response Values ==> nicht schön
                  // Lösung: Array mit festen Key-Namen zu erhalten

                  const p = document.createElement("p");
                  p.classList.add("dropdown-item");
                  // generiere Option
                  p.setAttribute("data-id", obj[key]["id"]);
                  p.setAttribute("data-name", obj[key]["Name"]);
                  p.setAttribute("data-artnr", obj[key]["Article_Number"]);
                  p.setAttribute("data-desc", obj[key]["Description"]);
                  p.setAttribute("data-menge", 1); // gibt user manuell ein
                  p.setAttribute("data-unit-id", obj[key]["Unit_ID"]); //
                  p.setAttribute("data-einzelpreis", obj[key]["Price"]);
                  p.setAttribute("data-summe", obj[key]["Price"]); // preis * menge
                  p.setAttribute("data-vat", "");
                  p.textContent =
                    obj[key]["Article_Number"] + " - " + obj[key]["Name"];

                  if (
                    obj[key]["serials"] &&
                    Object.keys(obj[key]["serials"]).length > 0
                  ) {
                    console.log(obj[key]["serials"]);

                    let invoiceNumber = e.target
                      .closest("form")
                      .querySelector('input[name="Invoice_Number"]').value;
                    p.setAttribute("data-invoice", invoiceNumber);
                    console.log(invoiceNumber);

                    const divPositions = document.querySelector(
                      ".positions-container"
                    );

                    // Создаем модальное окно выбора серий
                    const divPosition = document.createElement("div");
                    divPosition.setAttribute(
                      "data-artnr",
                      obj[key]["Article_Number"]
                    );
                    divPosition.setAttribute(
                      "data-invoice_number",
                      invoiceNumber
                    );
                    divPosition.classList.add(
                      "d-none",
                      "d-flex",
                      "flex-column",
                      "align-items-end"
                    );
                    divPositions.appendChild(divPosition);

                    const button = document.createElement("button");
                    button.type = "button";
                    button.classList.add(
                      "mt-4",
                      "btn",
                      "btn-info",
                      "text-white",
                      "waves-effect",
                      "waves-light"
                    );
                    button.setAttribute(
                      "data-url",
                      "https://cem-intra.de/position_updater.php?action=serial"
                    );

                    const serials = obj[key].serials;

                    for (let serialKey in serials) {
                      const serialObj = serials[serialKey];
                      console.log(serialObj);

                      const div = document.createElement("div");
                      const span = document.createElement("span");
                      const checkbox = document.createElement("input");

                      div.classList.add(
                        "d-flex",
                        "justify-content-between",
                        "align-items-center",
                        "w-100",
                        "border-bottom",
                        "pb-1"
                      );

                      span.innerHTML = serialObj["serial"];

                      checkbox.type = "checkbox";
                      checkbox.classList.add("form-check-input");
                      checkbox.setAttribute("data-serial", serialObj["serial"]);
                      checkbox.setAttribute(
                        "data-serial_id",
                        serialObj["serial_id"]
                      );

                      div.appendChild(span);
                      div.appendChild(checkbox);
                      divPosition.appendChild(div);
                    }
                    divPosition.appendChild(button);
                    //
                  }

                  if (obj[key]["process"]) {
                    console.log(obj[key]["process"]);

                    p.textContent = obj[key]["Name"];
                    p.setAttribute("data-name", obj[key]["Name"]);
                    p.setAttribute("data-project_id", obj[key]["id"]);

                    let invoiceNumber = e.target
                      .closest("form")
                      .querySelector('input[name="Invoice_Number"]').value;
                    p.setAttribute("data-invoice", invoiceNumber);
                    console.log(invoiceNumber);

                    const divPositions = document.querySelector(
                      ".positions-container"
                    );

                    // Создаем модальное окно выбора процессов
                    const divPosition = document.createElement("div");
                    divPosition.setAttribute("data-project_id", obj[key]["id"]);
                    divPosition.setAttribute(
                      "data-invoice_number",
                      invoiceNumber
                    );
                    divPosition.classList.add(
                      "d-none",
                      "d-flex",
                      "flex-column",
                      "align-items-end"
                    );
                    divPositions.appendChild(divPosition);

                    const button = document.createElement("button");
                    button.type = "button";
                    button.classList.add(
                      "mt-4",
                      "btn",
                      "btn-info",
                      "text-white",
                      "waves-effect",
                      "waves-light"
                    );
                    button.setAttribute(
                      "data-url",
                      "https://cem-intra.de/position_updater.php?action=process"
                    );

                    const process = obj[key].process;

                    for (let processKey in process) {
                      const processObj = process[processKey];
                      console.log(processObj);

                      const div = document.createElement("div");
                      const span = document.createElement("span");
                      const spanNumber = document.createElement("span");
                      const checkbox = document.createElement("input");

                      div.classList.add(
                        "d-flex",
                        "justify-content-between",
                        "align-items-center",
                        "w-100",
                        "border-bottom",
                        "pb-1",
                        "gap-1"
                      );

                      span.innerHTML = processObj["process"];
                      spanNumber.innerHTML = processObj["quantity"];

                      checkbox.type = "checkbox";
                      checkbox.classList.add("form-check-input");
                      checkbox.setAttribute(
                        "data-process",
                        processObj["process"]
                      );
                      checkbox.setAttribute(
                        "data-process_id",
                        processObj["process_id"]
                      );
                      checkbox.setAttribute(
                        "data-quantity",
                        processObj["quantity"]
                      );
                      checkbox.setAttribute(
                        "data-unit_id",
                        processObj["unit_id"]
                      );
                      checkbox.setAttribute("data-price", processObj["price"]);

                      div.appendChild(span);
                      div.appendChild(spanNumber);
                      div.appendChild(checkbox);
                      divPosition.appendChild(div);
                    }
                    divPosition.appendChild(button);

                    // Функция выбора только одного чекбокса для процессов
                    divPositions
                      .querySelectorAll('input[type="checkbox"]')
                      .forEach((checkbox) => {
                        checkbox.addEventListener("click", () => {
                          divPositions
                            .querySelectorAll('input[type="checkbox"]')
                            .forEach((check) => {
                              check.checked = false;
                            });

                          if (!checkbox.checked) {
                            checkbox.checked = true;
                          }
                        });
                      });
                    //
                  }

                  if (
                    (obj[key]["Article_Number"] && !obj[key]["serials"]) ||
                    (obj[key]["serials"] &&
                      Object.keys(obj[key]["serials"]).length == 0) ||
                    (obj[key]["Status"] && obj[key]["process"] == null)
                  ) {
                    console.log("Ничего не найдено");
                    p.classList.add("d-none");
                  }

                  notFound.style.display = "none";
                  dropDownBlock.append(p);

                  p.addEventListener("click", () => {
                    // e.target ist das angeklickte input-feld; .value deren Inhalt
                    e.target.value = obj[key]["Article_Number"];

                    var id = p.getAttribute("data-id");
                    var artnr = p.getAttribute("data-artnr");
                    var name = p.getAttribute("data-name");
                    var desc = p.getAttribute("data-desc");
                    var price = p.getAttribute("data-einzelpreis");
                    var unit_id = p.getAttribute("data-unit-id");
                    let project_id = p.getAttribute("data-project_id");

                    // Открываем position-popup
                    if (p.hasAttribute("data-invoice")) {
                      document.body.style.overflow = "hidden";
                      const popupShadow = document.querySelector(
                        ".position-popup-shadow"
                      );

                      if (
                        popupShadow.querySelectorAll("div[data-artnr]").length >
                        0
                      ) {
                        popupShadow
                          .querySelector(`div[data-artnr="${artnr}"]`)
                          .classList.remove("d-none");
                        popupShadow
                          .querySelector("label[data-artnr]")
                          .classList.remove("d-none");
                        popupShadow.classList.remove("d-none");
                      }

                      if (
                        popupShadow.querySelectorAll("div[data-project_id]")
                          .length > 0
                      ) {
                        popupShadow
                          .querySelector(`div[data-project_id="${project_id}"]`)
                          .classList.remove("d-none");
                        popupShadow
                          .querySelector("label[data-process_id]")
                          .classList.remove("d-none");
                        popupShadow.classList.remove("d-none");
                      }

                      // Отслеживаем клик по закрытию модального окна
                      popupShadow
                        .querySelectorAll(".position-popup-close")
                        .forEach((closeButton) => {
                          closeButton.addEventListener("click", () => {
                            clearPosition(parent); // Очищаем данные позиции
                            closePopup(popupShadow); // Закрываем модальное окно
                          });
                        });
                      //

                      // Отслеживаем клик по кнопке отправке серий
                      popupShadow
                        .querySelectorAll("button")
                        .forEach((button) => {
                          button.addEventListener("click", () => {
                            if (button.closest("div[data-artnr]")) {
                              let serials = [];
                              let selectesCheckboxes = button
                                .closest("div[data-artnr]")
                                .querySelectorAll(
                                  'input[type="checkbox"]:checked'
                                );
                              if (selectesCheckboxes.length === 0) {
                                clearPosition(parent);
                              } else {
                                selectesCheckboxes.forEach((checkbox) => {
                                  let serial_info = {};
                                  let serial_id = checkbox.dataset.serial_id;
                                  let serial = checkbox.dataset.serial;
                                  serial_info.serial_id = serial_id;
                                  serial_info.serial = serial;
                                  serials.push(serial_info);
                                });

                                let popupVat = button
                                  .closest(".position-popup")
                                  .querySelector(
                                    'select[name="series_position_VAT[]"] option[data-default]:checked'
                                  )
                                  .getAttribute("data-default");

                                // POST запрос на отправку серий
                                let reqDataSerial = {};
                                let action_url_serial =
                                  button.getAttribute("data-url");

                                reqDataSerial.Invoice_In = button.closest(
                                  "div[data-invoice_number]"
                                ).dataset.invoice_number;
                                reqDataSerial.serials = serials;

                                console.log(action_url_serial);
                                console.log(reqDataSerial);

                                submitFormData(
                                  reqDataSerial,
                                  action_url_serial
                                );
                                //

                                // Передаем значения количества и VAT
                                parent.querySelector(
                                  'div > input[name^="position_Number[]"]'
                                ).value = selectesCheckboxes.length;
                                parent.querySelector(
                                  `div select[name="position_VAT[]"] option[data-default="${popupVat}"]`
                                ).selected = true;
                                //

                                parent
                                  .querySelector(
                                    'div > input[name^="position_Number[]"]'
                                  )
                                  .dispatchEvent(new Event("input")); // Вызываем принудительно событие input

                                postPositions(parent);
                              }
                            }

                            if (button.closest("div[data-project_id]")) {
                              let processes = [];
                              let selectesCheckboxes = button
                                .closest("div[data-project_id]")
                                .querySelectorAll(
                                  'input[type="checkbox"]:checked'
                                );
                              console.log(selectesCheckboxes);
                              console.log(selectesCheckboxes.length);
                              if (selectesCheckboxes.length === 0) {
                                clearPosition(parent);
                              } else {
                                let selectesCheckbox = button
                                  .closest("div[data-project_id]")
                                  .querySelector(
                                    'input[type="checkbox"]:checked'
                                  );

                                let process_info = {};
                                let process_id =
                                  selectesCheckbox.dataset.process_id;
                                let process = selectesCheckbox.dataset.process;
                                let quantity =
                                  selectesCheckbox.dataset.quantity;
                                let unit_id = selectesCheckbox.dataset.unit_id;
                                let price = selectesCheckbox.dataset.price;

                                process_info.process_id = process_id;
                                process_info.process = process;
                                process_info.quantity = quantity;
                                process_info.unit_id = unit_id;
                                process_info.price = price;
                                processes.push(process_info);

                                let popupVat = button
                                  .closest(".position-popup")
                                  .querySelector(
                                    'select[name="series_position_VAT[]"] option[data-default]:checked'
                                  )
                                  .getAttribute("data-default");

                                // POST запрос на отправку процесса
                                let reqDataProcess = {};
                                let action_url_process =
                                  button.getAttribute("data-url");

                                reqDataProcess.Invoice_In = button.closest(
                                  "div[data-invoice_number]"
                                ).dataset.invoice_number;
                                reqDataProcess.processes = processes;

                                console.log(action_url_process);
                                console.log(reqDataProcess);

                                submitFormData(
                                  reqDataProcess,
                                  action_url_process
                                );
                                //

                                // Передаем значения в позицию
                                parent.querySelector(
                                  'div > input[name^="position_Number[]"]'
                                ).value = quantity;
                                parent.querySelector(
                                  'div > input[name^="position_Price_Per_Unit[]"]'
                                ).value = price;
                                parent.querySelector(
                                  'div > input[name^="position_Number[]"]'
                                ).value = quantity;
                                parent.querySelector(
                                  `div select[name="position_Unit_ID[]"] option[value="${unit_id}"]`
                                ).selected = true;
                                parent.querySelector(
                                  `div select[name="position_VAT[]"] option[data-default="${popupVat}"]`
                                ).selected = true;
                                //

                                parent
                                  .querySelector(
                                    'div > input[name^="position_Number[]"]'
                                  )
                                  .dispatchEvent(new Event("input")); // Вызываем принудительно событие input

                                postPositions(parent);
                              }
                            }

                            closePopup(popupShadow); // Закрываем модальное окно
                          });
                        });
                    }

                    // Suche anhand der CSS-Selektoren wohin, welche Werte eingesetzt werden sollen
                    parent.querySelector(
                      'div > input[name^="position_Product_ID[]"]'
                    ).value = id;

                    if (artnr !== "undefined") {
                      parent.querySelector(
                        'div > input[name^="position_Article_Number[]"]'
                      ).value = "";
                    }

                    parent.querySelector(
                      'div > input[name^="position_Name[]"]'
                    ).value = name;

                    e.target.parentElement.parentElement.querySelector(
                      "input[type=hidden]"
                    ).value = artnr;
                    e.target.parentElement.parentElement.querySelector(
                      ".form-dinamic-block-item-select-text"
                    ).textContent = artnr;

                    if (artnr === "undefined") {
                      e.target.value = name;
                      e.target.parentElement.parentElement.querySelector(
                        ".form-dinamic-block-item-select-text"
                      ).textContent = name;
                      parent.querySelector(
                        'div > input[name^="position_Project_ID[]"]'
                      ).value = project_id;
                      parent.querySelector(
                        'div > input[name^="position_Project_Name[]"]'
                      ).value = name;
                    }

                    parent.querySelector(
                      'div > input[name^="position_Description[]"]'
                    ).value = desc;

                    var selector_path =
                      'div > select[name^="position_Unit_ID[]"] > option[value="' +
                      unit_id +
                      '"]';
                    var elOption = parent.querySelector(selector_path);

                    if (unit_id !== undefined && elOption !== null) {
                      elOption.selected = true;
                    }

                    if (!isNaN(price)) {
                      price = parseFloat(price).toFixed(2);

                      parent.querySelector(
                        'div > input[name^="position_Price_Per_Unit[]"]'
                      ).value = price;

                      // 1. berechne summe  2. runde das ergebnis  3. füge in input-feld ein
                      parent.querySelector(
                        'div > input[name^="position_Number[]"]'
                      ).value = 1;
                      var menge = parent.querySelector(
                        'div > input[name^="position_Number[]"]'
                      ).value;
                      var gpreis = menge * price;
                      gpreis = gpreis.toFixed(2);
                      parent.querySelector(
                        'div > input[name^="position_Amount[]"]'
                      ).value = gpreis;
                      // select.querySelector('option[value=' + ed + ']').selected = true
                    }

                    parent
                      .querySelector('div > input[name^="position_Number[]"]')
                      .dispatchEvent(new Event("input")); // Вызываем принудительно событие input

                    parent
                      .querySelector(".container-dinamic-box")
                      .classList.remove("open");
                  });
                })(key);
              }

              let dropdownItem = hintItem.parentElement.querySelectorAll(
                ".form-hint-dropdown div p"
              );
              let allHidden = true;

              dropdownItem.forEach((p) => {
                if (!p.classList.contains("d-none")) {
                  allHidden = false;
                }
              });

              if (allHidden) {
                notFound.style.display = "block";
                console.log("Показываем сообщение, что не найдено");
                return;
              }
            },
          });
          // .then(res => console.log(res))
        } else {
          e.target.parentElement
            .querySelector(".form-hint-dropdown")
            .classList.remove("show");
        }
      });
    });
  }
};

function postPositions(parent) {
  // Получаем данные позиции для отправки на сервер
  let invoiceID = parent
    .closest("form")
    .querySelector("input[data-invoice-in_id]")
    .getAttribute("data-invoice-in_id");
  let positionProductID = parent.querySelector(
    'input[name="position_Product_ID[]"]'
  ).value;
  let positionName = parent.querySelector(
    'input[name="position_Name[]"]'
  ).value;
  let positionArticleNumber = parent.querySelector(
    'input[name="position_Article_Number[]"]'
  ).value;
  let positionDescription = parent.querySelector(
    'input[name="position_Description[]"]'
  ).value;
  let positionProjectID = parent.querySelector(
    'input[name="position_Project_ID[]"]'
  ).value;
  let positionProjectName = parent.querySelector(
    'input[name="position_Project_Name[]"]'
  ).value;
  let positionNumber = parent.querySelector(
    'input[name="position_Number[]"]'
  ).value;
  let positionUnitID = parent.querySelector(
    'select[name="position_Unit_ID[]"]'
  ).value;
  let positionPricePerUnit = parent.querySelector(
    'input[name="position_Price_Per_Unit[]"]'
  ).value;
  let positionAmount = parent.querySelector(
    'input[name="position_Amount[]"]'
  ).value;
  let positionVAT = parent.querySelector('select[name="position_VAT[]"]').value;
  //

  // POST запрос созданой позиции с выбранными сериями
  let reqDataPosition = {};
  reqDataPosition.position_Invoice_In_ID = invoiceID;
  reqDataPosition.position_Product_ID = positionProductID;
  reqDataPosition.position_Name = positionName;
  reqDataPosition.position_Article_Number = positionArticleNumber;
  reqDataPosition.position_Description = positionDescription;
  reqDataPosition.position_Project_ID = positionProjectID;
  reqDataPosition.position_Project_Name = positionProjectName;
  reqDataPosition.position_Number = positionNumber;
  reqDataPosition.position_Unit_ID = positionUnitID;
  reqDataPosition.position_Price_Per_Unit = positionPricePerUnit;
  reqDataPosition.position_Amount = positionAmount;
  reqDataPosition.position_VAT = positionVAT;

  let action_url_position = parent
    .querySelector('input[name="position_Article_Number[]"]')
    .getAttribute("data-url");

  // Находим все существующие позиции
  let oldPositions = parent
    .closest("form")
    .querySelectorAll(".form-group-table .form-group");
  //
  // Преобразуем коллекцию в массив, применяем forEach() и удаляем все кроме первого
  Array.from(oldPositions).forEach((node, index) => {
    if (index > 0) {
      node.remove();
      console.log("Удалил");
    }
  });
  //

  // Отправляем запрос и после получения обрабатываем
  submitFormData(
    reqDataPosition,
    action_url_position,
    processingPositionsData,
    parent
  );
  console.log(reqDataPosition);
}

// Функция обработки запроса
function processingPositionsData(response, parent) {
  const responePositions = JSON.parse(response);
  const positionData = Object.values(responePositions).find(
    (value) => value.position_data
  );

  const positions = positionData.position_data;

  for (let positionKey in positions) {
    const positionObj = positions[positionKey];
    console.log(positionObj);

    // Вытаскиваем данные
    let positionID = positionObj["id"];
    let samplePositionName = positionObj["Name"];
    let samplePositionArticleNumber = positionObj["Article_Number"];
    let samplePositionDescription = positionObj["Description"];
    let samplePositionProjectID = positionObj["Project_Name"];
    let samplePositionNumber = positionObj["Number"];
    let samplePositionUnitID = positionObj["Unit"];
    let samplePositionPrice_Per_Unit = positionObj["Price_Per_Unit"];
    let samplePositionAmount = positionObj["Amount"];
    let samplePositionDefaultVAT = positionObj["default_vat"];
    let samplePositionVAT = positionObj["VAT"];
    //

    // Создаем элемент
    const div = document.createElement("div");
    console.log("Создал");
    div.innerHTML = parent
      .closest("form")
      .querySelector(".form-group-table .form_position_sample").innerHTML;
    div.classList.add("form-group", "form-dinamic", "p-0", "m-0");
    div.id = "form" + positionID;
    div.querySelector("button").setAttribute("data-id", positionID);
    div
      .querySelector("button")
      .setAttribute(
        "data-url",
        "garbage_handler.php?source=invoice_in_positions&id=" + positionID
      );
    //

    // Вставляем полученные значения в позицию
    div.querySelector("#samplePositionName").textContent = samplePositionName;
    div.querySelector("#samplePositionArticleNumber").textContent =
      samplePositionArticleNumber;
    div.querySelector("#samplePositionDescription").textContent =
      samplePositionDescription;
    div.querySelector("#samplePositionProjectID").textContent =
      samplePositionProjectID;
    div.querySelector("#samplePositionNumber").textContent =
      samplePositionNumber;
    div.querySelector("#samplePositionUnitID").textContent =
      samplePositionUnitID;
    div.querySelector("#samplePositionPrice_Per_Unit").textContent =
      samplePositionPrice_Per_Unit;
    div.querySelector("#samplePositionAmount").textContent =
      samplePositionAmount;
    div
      .querySelector("#samplePositionAmount")
      .setAttribute("data-default", samplePositionDefaultVAT);
    div.querySelector("#samplePositionVAT").textContent = samplePositionVAT;
    //

    // Вставляем элемент в форму
    parent.closest("form").querySelector(".form-group-table").append(div);
    //
  }
  // Проверять наличие класса d-none у div родителя
  if (
    parent
      .closest("form")
      .querySelector(".form-group-table")
      .classList.contains("d-none")
  ) {
    parent
      .closest("form")
      .querySelector(".form-group-table")
      .classList.remove("d-none");
  }
  // Получаем inputs на общие суммы в счете и добавляем слушатель для кнопки удаления
  const inputAmountVat = parent
    .closest("form")
    .querySelector('input[name="Amount"]');

  const inputAmountVat2 = parent
    .closest("form")
    .querySelector('input[name="Amount_2"]');

  handlePositionDelete(parent, inputAmountVat, inputAmountVat2);
  //

  postInvoiceAmount(parent);

  // Удаляем старую позицию
  parent.closest(".form-group.form-dinamic").remove();
}

function clearPosition(parent) {
  // Очищаем данные новой позиции
  parent.querySelector('input[name="position_Name[]"]').value = "";
  parent.querySelector('input[name="position_Article_Number[]"]').value = "";
  parent.querySelector('input[name="position_Description[]"]').value = "";
  parent.querySelector('input[name="position_Project_ID[]"]').value = "";
  parent.querySelector('input[name="position_Number[]"]').value = "0";
  parent.querySelector('input[name="position_Price_Per_Unit[]"]').value = "0";
  parent.querySelector('input[name="position_Amount[]"]').value = "0";
  //

  parent
    .querySelector('div > input[name^="position_Number[]"]')
    .dispatchEvent(new Event("input")); // Вызываем принудительно событие input

  // Удаляем старую позицию
  parent.closest(".form-group.form-dinamic").remove();
}

function closePopup(popupShadow) {
  document.body.style.overflow = "visible";
  popupShadow.classList.add("d-none");
  popupShadow.querySelector("label[data-artnr]").classList.add("d-none");
  popupShadow.querySelector("label[data-process_id]").classList.add("d-none");
}

/* 
****************************************************************************************************************************************
    Dimamand JS codes start
****************************************************************************************************************************************
*/
/* (invoice_in_tpl) updateSum() rechnet menge und preis zu einer summe zusammen  und fügt diese anhand der CSS Selektore in die Felder ein */
function updateSum(el) {
  let a = el.querySelector('div > input[name^="position_Number[]"]').value;
  a = parseFloat(a);
  let b = el.querySelector(
    'div > input[name^="position_Price_Per_Unit[]"]'
  ).value;
  b = parseFloat(b);
  let c = a * b;
  c = parseFloat(c).toFixed(2);
  el.querySelector('div > input[name^="position_Amount[]"]').value = c;
}

const positionDelete = document.querySelectorAll(".position-delete");
if (positionDelete.length) {
  positionDelete.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById(
        "form" + e.target.getAttribute("data-id")
      ).innerHTML = "";
      //document.querySelector('.form-table tbody').removeChild(document.querySelector('.form-table tbody #form' + e.target.getAttribute('data-id')));
      fetch(e.target.getAttribute("data-url"), {
        method: "DELETE",
      });
    });
  });
}

function submitFormData(obj, url, callback, parent) {
  let reqData = obj;
  $.post(url, reqData, function (res, status) {
    console.log("Response Status: " + status);
    console.log("Response Data: " + res);
    if (callback) {
      callback(res, parent);
    }
  });
}

function validateThisForm(el) {
  if (!el.checkValidity()) {
    return false;
  } else {
    return true;
  }

  if ($(el).prop("required")) {
    if ($(el).val().length < 1) {
      $(el).trigger("focus");
      $(el).addClass("danger");
      return false;
    }
  }
  $(el).attr("checked");

  // e.target.checkValidity();

  // 3. callback / result
  return true;
}
function insertDataIntoPosition(position, dataArray) {
  // id
  $(position).find('input[name^="position_Product_ID[]"]').val(dataArray["id"]);
  // name
  $(position).find('input[name^="position_Name[]"]').val(dataArray["Name"]);
  // artnr
  $(position)
    .find('input[name^="position_Article_Number[]"]')
    .val(dataArray["Article_Number"]);
  $(position)
    .find('input[data-source^="product"]')
    .val(dataArray["Article_Number"]);
  // desc
  $(position)
    .find('input[name^="position_Description[]"]')
    .val(dataArray["Description"]);
  // preis
  $(position)
    .find('input[name^="position_Price_Per_Unit[]"]')
    .val(dataArray["Price"]);

  // einheit option wählen
  $(position)
    .find(
      'select[name^="position_Unit_ID[]"] option[value^="' +
        dataArray["P_Unit_ID"] +
        '"]'
    )
    .attr("selected", "selected");

  console.log("------------------stopp--------------------");
  return false;

  var id = dataArray["inserted_product_id"];
  var artnr = dataArray["Article_Number"];
  var name = dataArray["Name"];
  var desc = dataArray["Description"];
  var price = dataArray["Price"];
  var unit_id = dataArray[""];

  // Suche anhand der CSS-Selektoren wohin, welche Werte eingesetzt werden sollen
  position.querySelector('div > input[name^="position_Product_ID[]"]').value =
    id;
  position.querySelector('div > input[name^="position_Name[]"]').value = name;
  e.target.parentElement.querySelector("input[type=hidden]").value = artnr;
  position.querySelector('div > input[name^="position_Description[]"]').value =
    desc;

  var selector_path =
    'div > select[name^="position_Unit_ID[]"] > option[value="' +
    unit_id +
    '"]';
  var elOption = position.querySelector(selector_path);
  elOption.selected = true;

  price = parseFloat(price).toFixed(2);

  position.querySelector(
    'div > input[name^="position_Price_Per_Unit[]"]'
  ).value = price;

  // 1. berechne summe  2. runde das ergebnis  3. füge in input-feld ein
  position.querySelector('div > input[name^="position_Number[]"]').value = 1;
  var menge = position.querySelector(
    'div > input[name^="position_Number[]"]'
  ).value;
  var gpreis = menge * price;
  gpreis = gpreis.toFixed(2);
  position.querySelector('div > input[name^="position_Amount[]"]').value =
    gpreis;
  // select.querySelector('option[value=' + ed + ']').selected = true
}

function createNewPosition(rowid) {
  document.getElementById("form-adding-dinamic-" + rowid).click();
  const empty_pos = $(
    "#invoice_details_" +
      rowid +
      " .form-dinamic .form-group:last-child .form-dinamic-block-item"
  );
  return empty_pos;
}
function createNewProduct(el, e, rowid) {
  var valide = validateThisForm(el);
  console.log("checkValidity() return", valide);
  e.preventDefault();
  e.stopPropagation();
  var action_url = $(el).attr("action");
  var serializedArray = $(el).serializeArray();
  //var serialized = $(el).serialize();
  // prepair request
  var arr = [];
  for (var key in serializedArray) {
    arr[serializedArray[key].name] = serializedArray[key].value;
  }
  var reqData = arr;
  var insertedData = submitFormData(reqData, action_url);
  // serializedArray['inserted_product_id'] = isertedData['id'];

  if (valide) {
    // close modal
    $(
      "#create_new_product_4_invoice_" + rowid + " .modal-footer button"
    ).trigger("click");
    // in Rechnung als Position übertragen
    var emptyPosEl = createNewPosition(rowid);
    insertDataIntoPosition(emptyPosEl, reqData);
    // Eingabe felder Reset
  }
}
function loadDataInModal(elid) {
  const elModal = $(elid);
  $(elid + " select").each(function () {
    if ($(this).attr("data-product-options")) {
      loadProductOptions($(this).attr("data-product-options"), this);
    }
  });
}
function loadProductOptions(val, sel) {
  var el = $(sel).parent();

  const obj = global_products_data[val];
  $(el).find(".movingloader").show();
  var name, id, lang_key;
  for (var key in obj) {
    if (val == "units") {
      global_products_data[val][key].Unit
        ? (name = global_products_data[val][key].Unit)
        : (name = "");
    } else if (val == "Product_Type") {
      global_products_data[val][key].Product_Type
        ? (name = global_products_data[val][key].Product_Type)
        : (name = "");
    } else {
      global_products_data[val][key].Name
        ? (name = global_products_data[val][key].Name)
        : (name = "");
    }
    global_products_data[val][key].id
      ? (id = global_products_data[val][key].id)
      : (id = "");
    global_products_data[val][key].language_keyword
      ? (lang_key = global_products_data[val][key].language_keyword)
      : (lang_key = "");
    $(el)
      .find("select")
      .append(
        '<option value="' + id + '">' + name + " " + lang_key + "</option>"
      );
  }
  // remove on click event
  $(el).find(".movingloader").remove();
  $(el).find("select").removeAttr("data-product-options");
}
const global_products_data = {
  manufacturer: {},
  supplier: {},
  product_types: {},
  product_status: {},
  units: {},
  countries: {},
};
async function getData(url) {
  const request = new Request(url);
  const response = await fetch(request);
  return await response.json();
}
async function updateGloabalProductsData() {
  let obj = [
    "manufacturer",
    "supplier",
    "product_types",
    "product_status",
    "units",
    "countries",
  ];
  var dada = "";
  for (var key in obj) {
    dada = await getData(
      "https://cem-intra.de/data_helper.php?source=" + obj[key]
    );
    dada == null
      ? (global_products_data[obj[key]] = {})
      : (global_products_data[obj[key]] = dada);
  }
}
function preventSubmitProductsForm(form, e) {
  e.preventDefault();
  e.stopPropagation();

  const formData = new FormData(form);
  console.log("formData", formData);

  var array = new Array();
  for (const key of formData.keys()) {
    array[key] = formData.getAll(key);
  }
  console.log(array);

  /*    
    for (const value of data.values()) {
        console.log(value);
    }
    */
  /*
    for (let obj of formData) {
        console.log(' - ', obj);
    }
    */
}

/* on page load ready !!! */
$(document).ready(function () {
  updateGloabalProductsData();
  /*    
    testProductsForm.onsubmit = (e) => {
        console.log('listener');
        e.preventDefault();
        const formData = new FormData(testForm);
      
        console.log("Form Data");
        for (let obj of formData) {
          console.log(obj);
        }
    };
    */
});
/* 
****************************************************************************************************************************************
    Dimamand JS codes end
****************************************************************************************************************************************

{}

*/
