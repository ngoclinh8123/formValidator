function Validator(options) {
  var selectorRules = {};

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  //ham thuc hien
  function validate(inputElement, rule) {
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);
    var errorMessage;

    //lay ra cac rule cua selector
    var rules = selectorRules[rule.selector];

    //lap qua tung rule va kiem tra
    //neu co loi thi dung kiem tra
    for (var i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }

    return !errorMessage;
  }

  //lay element cua form
  var formElement = document.querySelector(options.form);
  if (formElement) {
    //khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      //lap qua tung rule va kiem tra
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);

        var isValid = validate(inputElement, rule);

        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        //truong hop onSubmit voi javascript
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]");
          var formValue = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            switch (input.type) {
              case "checkbox":
                if (!input.matches(":checked")) {
                  values[input.name] = "";
                  return values;
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }

                values[input.name].push(input.value);
                break;
              case "radio":
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;
                break;

              case "file":
                values[input.name] = input.files;
                break;

              default:
                values[input.name] = input.value;
            }

            return values;
          },
          {});

          options.onSubmit(formValue);
        }

        //truong hop onSubmit voi hanh vi mac dinh
        else {
          formElement.submit();
        }
      }
    };

    //lap qua moi rule va xu ly
    options.rules.forEach(function (rule) {
      //luu lai cac rule
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        if (inputElement) {
          //khi blur khoi input
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };

          //khi nguoi dung nhap
          inputElement.oninput = function () {
            var errorElement = getParent(
              inputElement,
              options.formGroupSelector
            ).querySelector(options.errorSelector);
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove(
              "invalid"
            );
          };
        }
      });
    });
  }
}

// dinh nghia cac rule
//nguyen tac rule
//1.khi co loi tra message loi
//2.khi khong loi tra undefined
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "Vui l??ng nh???p tr?????ng n??y ";
    },
  };
};
Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(value)
        ? undefined
        : message || "Tr?????ng n??y ph???i l?? email ";
    },
  };
};
Validator.isMinLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `Vui l??ng nh???p t???i thi???u ${min} k?? t??? `;
    },
  };
};
Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Gi?? tr??? nh???p l???i Kh??ng ch??nh x??c ";
    },
  };
};
