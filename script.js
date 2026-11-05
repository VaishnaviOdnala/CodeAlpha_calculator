
const display = document.getElementById("display");
const previous = document.getElementById("previous");
const buttons = document.querySelector(".buttons");

let current = "0";
let stored = null;
let operator = null;
let waitingForNumber = false;
let justCalculated = false;

function updateDisplay() {
    display.value = current;
}

function resetCalculator() {
    current = "0";
    stored = null;
    operator = null;
    waitingForNumber = false;
    justCalculated = false;
    previous.textContent = "";
    updateDisplay();
}

function formatResult(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    return String(Number(number.toPrecision(12)));
}

function calculate(a, b, op) {
    switch (op) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            return b === 0 ? NaN : a / b;
        case "%":
            return b === 0 ? NaN : a % b;
        default:
            return b;
    }
}

function inputNumber(value) {
    if (current === "Error") {
        current = "0";
        stored = null;
        operator = null;
        previous.textContent = "";
        waitingForNumber = false;
    }

    if (justCalculated && operator === null) {
        current = "0";
        justCalculated = false;
    }

    if (waitingForNumber) {
        current = value === "." ? "0." : value;
        waitingForNumber = false;
    } else if (value === ".") {
        if (!current.includes(".")) {
            current += ".";
        }
    } else {
        current = current === "0" ? value : current + value;
    }

    updateDisplay();
}

function chooseOperator(nextOperator) {
    if (current === "Error") {
        resetCalculator();
    }

    const value = Number(current);

    if (operator !== null && !waitingForNumber) {
        const result = calculate(stored, value, operator);
        current = formatResult(result);

        if (current === "Error") {
            stored = null;
            operator = null;
            previous.textContent = "";
            waitingForNumber = true;
            justCalculated = false;
            updateDisplay();
            return;
        }

        updateDisplay();
    }

    stored = Number(current);
    operator = nextOperator;
    waitingForNumber = true;
    justCalculated = false;
    previous.textContent = `${current} ${operator}`;
}

function showResult() {
    if (
        operator === null ||
        stored === null ||
        waitingForNumber ||
        current === "Error"
    ) {
        return;
    }

    const first = stored;
    const second = Number(current);
    const op = operator;
    const result = calculate(first, second, op);

    previous.textContent = `${first} ${op} ${second} =`;
    current = formatResult(result);

    stored = null;
    operator = null;
    waitingForNumber = true;
    justCalculated = true;

    updateDisplay();
}

function deleteLast() {
    if (current === "Error") {
        resetCalculator();
        return;
    }

    if (waitingForNumber || justCalculated) {
        return;
    }

    current = current.length > 1
        ? current.slice(0, -1)
        : "0";

    if (current === "-") {
        current = "0";
    }

    updateDisplay();
}

function changeSign() {
    if (current === "Error" || Number(current) === 0) {
        return;
    }

    current = current.startsWith("-")
        ? current.slice(1)
        : "-" + current;

    justCalculated = false;
    updateDisplay();
}

// Handle calculator button clicks
buttons.addEventListener("click", function(event) {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    if (button.dataset.value !== undefined) {
        const value = button.dataset.value;

        if (/^[0-9.]$/.test(value)) {
            inputNumber(value);
        } else {
            chooseOperator(value);
        }

        return;
    }

    switch (button.dataset.action) {
        case "clear":
            resetCalculator();
            break;

        case "delete":
            deleteLast();
            break;

        case "sign":
            changeSign();
            break;

        case "calculate":
            showResult();
            break;
    }
});

// Keyboard support
document.addEventListener("keydown", function(event) {
    if (/^[0-9.]$/.test(event.key)) {
        event.preventDefault();
        inputNumber(event.key);
    } else if (["+", "-", "*", "/", "%"].includes(event.key)) {
        event.preventDefault();
        chooseOperator(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        showResult();
    } else if (event.key === "Backspace") {
        event.preventDefault();
        deleteLast();
    } else if (event.key === "Escape") {
        resetCalculator();
    }
});

updateDisplay();
