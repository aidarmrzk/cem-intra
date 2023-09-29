// При загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  // Проверка чекбокса Vat при загрузке страницы
  document.querySelectorAll("#checkbox-vat2").forEach((checkboxVat) => {
    letChechbox(checkboxVat);
  });
  //

  // Проверяем список существующих позиций для добавления класса d-none
  document.querySelectorAll("#checkbox-vat2").forEach((checkboxVat) => {
    let tableItems = checkboxVat
      .closest("form")
      .querySelectorAll(".form-group-table .form-dinamic-block-item");

    if (tableItems.length <= 1) {
      checkboxVat
        .closest("form")
        .querySelector(".form-group-table")
        .classList.add("d-none");
    }

    document.querySelectorAll("#user_update").forEach((button) => {
      button.addEventListener("click", () => {
        button.closest("form").submit();
      });
    });
  });
  //

  // Рассчет суммы без НДС
  document.querySelectorAll('form input[name="Amount"]').forEach((input) => {
    input.addEventListener("input", () => {
      let amountNetto = input
        .closest("form")
        .querySelector('input[name="Amount_Netto"]');

      let vat = input.closest("form").querySelector('input[name="VAT"]');

      amountNetto.value =
        parseFloat(input.value) -
        (parseFloat(input.value) * parseFloat(vat.value)) / 100;
    });
  });
  document.querySelectorAll('form input[name="Amount_2"]').forEach((input) => {
    input.addEventListener("input", () => {
      let amountNetto2 = input
        .closest("form")
        .querySelector('input[name="Amount_Netto_2"]');

      let vat2 = input.closest("form").querySelector('input[name="VAT_2"]');

      amountNetto2.value =
        parseFloat(input.value) -
        (parseFloat(input.value) * parseFloat(vat2.value)) / 100;
    });
  });
  //

  // Анимация аккордеона
  document.querySelectorAll(".card-product .summary").forEach((summary) => {
    summary.addEventListener("click", () => {
      const parentSummary = summary.closest(".card-product");

      if (!parentSummary.classList.contains("open")) {
        parentSummary.classList.add("open");
      } else {
        parentSummary.classList.remove("open");
      }
    });
  });
  //

  // Находим все кнопки добавления новой позиции
  document.querySelectorAll("#button-add-form").forEach((button) => {
    // Получаем inputs на общие суммы в счете
    const inputAmountVat = button
      .closest("form")
      .querySelector('input[name="Amount"]');

    const inputAmountVat2 = button
      .closest("form")
      .querySelector('input[name="Amount_2"]');
    //

    // Устанавливаем значения VAT и VAT_2 в счете
    button.closest("form").querySelector('input[name="VAT"]').value = button
      .closest("form")
      .querySelector(
        'select[name="position_VAT[]"] option[data-default="1"]'
      ).value;

    button.closest("form").querySelector('input[name="VAT_2"]').value = button
      .closest("form")
      .querySelector(
        'select[name="position_VAT[]"] option[data-default="0"]'
      ).value;
    //

    // Функция для кнопок удаления существующих позиций
    handlePositionDelete(button, inputAmountVat, inputAmountVat2);
    //

    // Событие для добавления новой позиции
    button.addEventListener("click", () => {
      // Создание поля добавления новой позиции
      const parentButton = button.closest("form");
      if (
        parentButton.querySelector("#form-adding").classList.contains("d-none")
      ) {
        parentButton.querySelector("#form-adding").classList.remove("d-none");
      } else {
        const div = document.createElement("div");
        div.classList.add("form-group", "form-dinamic", "mb-0");

        div.innerHTML = document.querySelectorAll(
          "#form-adding .form-group"
        )[0].innerHTML;

        if (div.querySelector(".form-dinamic-block > label")) {
          div.querySelector(".form-dinamic-block > label").remove();
        }

        parentButton.querySelector("#form-adding").append(div);
      }
      //

      addClickHandlers(parentButton); // Функция аккордеона для addingHint

      // getRequired();
      deleteForm(parentButton, inputAmountVat, inputAmountVat2);
      calculateAmount(parentButton, inputAmountVat, inputAmountVat2);
      changeSelectVat(parentButton, inputAmountVat, inputAmountVat2);
      addingHint();
    });
    //
  });
  //
});
//

function handlePositionDelete(button, inputAmountVat, inputAmountVat2) {
  const positionDelete = button
    .closest("form")
    .querySelectorAll(".invoice-position-delete");

  if (positionDelete.length) {
    positionDelete.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();

        item
          .closest(".form-dinamic-block-item")
          .querySelector("span[data-default]").textContent = "0";

        let amountPositions = item
          .closest(".form-group-table")
          .querySelectorAll("span[data-default]");
        let selectsVat = item
          .closest("form")
          .querySelectorAll('#form-adding select[name="position_VAT[]"]');
        let checkboxVat = item.closest("form").querySelector("#checkbox-vat2");

        calculateSum(
          amountPositions,
          selectsVat,
          inputAmountVat,
          inputAmountVat2,
          checkboxVat
        );

        // Функция отправки инфо счета с суммами на сервер
        postInvoiceAmount(item);
        //

        let tableItems = item
          .closest(".form-group-table")
          .querySelectorAll(".form-dinamic-block-item");

        if (tableItems.length <= 2) {
          item.closest(".form-group-table").classList.add("d-none");

          if (item.closest("form").querySelector("div.alert.alert-danger")) {
            item
              .closest("form")
              .querySelector("div.alert.alert-danger")
              .classList.add("d-none");
          }
          if (item.closest("form").querySelector("div.alert.alert-success")) {
            item
              .closest("form")
              .querySelector("div.alert.alert-success")
              .classList.add("d-none");
          }
        }

        document.getElementById(
          "form" + e.target.getAttribute("data-id")
        ).innerHTML = "";
        fetch(e.target.getAttribute("data-url"), {
          method: "DELETE",
        });
      });
    });
  }
}

// Событие кнопки для удаления созданной позиции
function deleteForm(parentButton, inputAmountVat, inputAmountVat2) {
  let amountPositions = parentButton.querySelectorAll(
    ".form-group-table span[data-default]"
  );
  let checkboxVat = parentButton.querySelector("#checkbox-vat2");

  parentButton.querySelectorAll(".form-dinamic-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      btn.closest(".form-group").remove();

      let selectsVat = parentButton.querySelectorAll(
        '#form-adding select[name="position_VAT[]"]'
      );

      calculateSum(
        amountPositions,
        selectsVat,
        inputAmountVat,
        inputAmountVat2,
        checkboxVat
      );
    });
  });
}
//

// Назначаем обязательные поля созданной позиции
function getRequired() {
  document
    .querySelectorAll('#form-adding input[name="position_Name[]"]')
    .forEach((input) => {
      input.required = true;
    });

  document
    .querySelectorAll('#form-adding input[name="position_Number[]"]')
    .forEach((input) => {
      input.required = true;
      input.addEventListener("input", () => {
        let value = parseFloat(input.value);
        if (value < 0) {
          input.value = "";
        }
      });
    });

  document
    .querySelectorAll('#form-adding input[name="position_Price_Per_Unit[]"]')
    .forEach((input) => {
      input.required = true;
      input.addEventListener("input", () => {
        let value = parseFloat(input.value);
        if (value < 0) {
          input.value = "";
        }
      });
    });
}
//

// Отслеживание события input количество и input цена
function calculateAmount(parentButton, inputAmountVat, inputAmountVat2) {
  let amountPositions = parentButton.querySelectorAll(
    ".form-group-table span[data-default]"
  );
  let selectsVat = parentButton.querySelectorAll(
    '#form-adding select[name="position_VAT[]"]'
  );
  let checkboxVat = parentButton.querySelector("#checkbox-vat2");

  parentButton
    .querySelectorAll(
      '#form-adding input[name="position_Number[]"], #form-adding input[name="position_Price_Per_Unit[]"]'
    )
    .forEach((input) => {
      input.addEventListener("input", () => {
        let inputParent = input.closest(".form-dinamic-block-item");
        let input1 = parseFloat(
          inputParent.querySelector('input[name="position_Number[]"]').value
        );
        let input2 = parseFloat(
          inputParent.querySelector('input[name="position_Price_Per_Unit[]"]')
            .value
        );

        if (!isNaN(input1) && !isNaN(input2) && input1 >= 0 && input2 >= 0) {
          let amount = input1 * input2;
          inputParent.querySelector('input[name="position_Amount[]"]').value =
            amount;

          calculateSum(
            amountPositions,
            selectsVat,
            inputAmountVat,
            inputAmountVat2,
            checkboxVat
          );
        }
      });
    });
}
//

// Отслеживаем событие select VAT
function changeSelectVat(parentButton, inputAmountVat, inputAmountVat2) {
  let amountPositions = parentButton.querySelectorAll(
    ".form-group-table span[data-default]"
  );
  let selectsVat = parentButton.querySelectorAll(
    '#form-adding select[name="position_VAT[]"]'
  );
  let checkboxVat = parentButton.querySelector("#checkbox-vat2");

  selectsVat.forEach((selectVat) => {
    selectVat.addEventListener("change", () => {
      calculateSum(
        amountPositions,
        selectsVat,
        inputAmountVat,
        inputAmountVat2,
        checkboxVat
      );
    });
  });
}

// Расчет итоговой суммы счета
function calculateSum(
  amountPositions,
  selectsVat,
  inputAmountVat,
  inputAmountVat2,
  checkboxVat
) {
  // Считаем сумму готовых позиций
  let totalPositionVat = 0;
  let totalPositionVat2 = 0;

  amountPositions.forEach((span) => {
    let defaultOption = span.getAttribute("data-default");
    let numStr = span.textContent;

    // Удаляем пробелы и заменяем запятые на точки
    let formattedNumStr = numStr.replace(/ /g, "").replace(",", ".");
    let value = parseFloat(formattedNumStr);

    console.log(value);

    if (defaultOption === "1") {
      totalPositionVat += value;
    } else if (defaultOption === "0") {
      totalPositionVat2 += value;
    }
  });

  // Считаем сумму новых позиций
  let totalNewPositionVat = 0;
  let totalNewPositionVat2 = 0;

  selectsVat.forEach((select) => {
    let defaultOption = select
      .querySelector("option:checked")
      .getAttribute("data-default");

    let value = parseFloat(
      select
        .closest(".form-dinamic-block-item")
        .querySelector('input[name="position_Amount[]"]').value
    );
    if (!isNaN(value)) {
      if (defaultOption === "1") {
        totalNewPositionVat += value;
      } else if (defaultOption === "0") {
        totalNewPositionVat2 += value;
      }
    }
  });
  //

  // Считаем общие суммы
  inputAmountVat.value = totalPositionVat + totalNewPositionVat;
  console.log(inputAmountVat.value);

  inputAmountVat.dispatchEvent(new Event("input")); // Вызываем принудительно событие input

  inputAmountVat2.value = totalPositionVat2 + totalNewPositionVat2;
  console.log(inputAmountVat2.value);

  inputAmountVat2.dispatchEvent(new Event("input")); // Вызываем принудительно событие input
  //

  // Проверяем чекбокс VAT_2
  if (inputAmountVat2.value <= 0) {
    checkboxVat.checked = false;
  } else if (inputAmountVat2.value > 0) {
    checkboxVat.checked = true;
  }
  letChechbox(checkboxVat);
}
//

// Скрываем или открываем поле VAT_2
function letChechbox(checkboxVat) {
  if (checkboxVat.checked) {
    checkboxVat
      .closest("form")
      .querySelectorAll(".box-vat2")
      .forEach((box) => {
        box.classList.remove("d-none");
      });
    console.log("Открыли чекбокс VAT_2 ");
  } else {
    checkboxVat
      .closest("form")
      .querySelectorAll(".box-vat2")
      .forEach((box) => {
        box.classList.add("d-none");
      });
    console.log("Скрыли чекбокс VAT_2");
  }
}
//

// Отправляем суммы на сервер
function postInvoiceAmount(item) {
  let formInvoice = item.closest("form");

  let amountPositions = item
    .closest("form")
    .querySelectorAll(".form-group-table span[data-default]");

  // Считаем сумму готовых позиций
  let totalPositionVat = 0;
  let totalPositionVat2 = 0;

  amountPositions.forEach((span) => {
    let defaultOption = span.getAttribute("data-default");
    let value = parseFloat(span.textContent);

    if (defaultOption === "1") {
      totalPositionVat += value;
    } else if (defaultOption === "0") {
      totalPositionVat2 += value;
    }
  });
  //

  let invoiceID = formInvoice
    .querySelector("input[data-invoice-in_id]")
    .getAttribute("data-invoice-in_id");

  let vat = formInvoice.querySelector('input[name="VAT"]').value;
  let amountNetto =
    totalPositionVat - (totalPositionVat * parseFloat(vat)) / 100;

  let vat2 = formInvoice.querySelector('input[name="VAT_2"]').value;
  let amountNetto2 =
    totalPositionVat2 - (totalPositionVat2 * parseFloat(vat2)) / 100;

  let invoiceData = {};
  invoiceData.position_Invoice_In_ID = invoiceID;
  invoiceData.Amount = totalPositionVat;
  invoiceData.Amount_Netto = amountNetto;
  invoiceData.VAT = vat;
  invoiceData.Amount_2 = totalPositionVat2;
  invoiceData.Amount_Netto_2 = amountNetto2;
  invoiceData.VAT_2 = vat2;

  let action_url_invoice =
    "https://cem-intra.de/position_updater.php?action=invoice";

  submitFormData(invoiceData, action_url_invoice);

  console.log(invoiceData);
}

// Обязательство для выбора проектов
function checkForm() {
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault(); // Отменяем отправку формы
      let submitForm = true;

      form
        .querySelectorAll("#form-adding .form-dinamic-block-item")
        .forEach((block) => {
          let inputArtnr = block.querySelector(
            'input[name="position_Article_Number[]"]'
          ).value;

          let inputProject = block.querySelector(
            'input[name="position_Project_ID[]"]'
          ).value;

          if (inputArtnr !== "" && inputProject == "") {
            submitForm = false;
            block
              .querySelector(".form-dinamic-block-item-select.project")
              .classList.add("border-danger");
            console.log("Для отправки выберите проект");
          }
        });

      if (submitForm) {
        form.submit(); // Отправляем форму
      }
    });
  });
}
//

// Добавление отслеживания только на последний элемент
function addClickHandlers(parentButton) {
  let formDinamicBlockItems = parentButton.querySelectorAll(
    ".form-dinamic-block-item-select"
  );

  // Определение индексов двух последних элементов
  let lastIndex = formDinamicBlockItems.length - 1;
  let secondToLastIndex = formDinamicBlockItems.length - 2;

  // Добавление обработчиков событий только для двух последних элементов
  formDinamicBlockItems.forEach((item, index) => {
    if (index === lastIndex || index === secondToLastIndex) {
      item.addEventListener("click", handleClick);
    }
  });
}
//

// Анимация аккордеона для addingHint
function handleClick() {
  const parentE = this.closest(".container-dinamic-box");

  if (!parentE.classList.contains("open")) {
    parentE.classList.add("open");
  } else {
    parentE.classList.remove("open");
  }
}
//
