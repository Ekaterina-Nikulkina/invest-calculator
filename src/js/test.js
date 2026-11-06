"use strict";

/*
 * Автотесты для проверки логики движка.
 * Запуск: node test.js
 */

const criteria = require("./criteria.js");
const {
  matchesFields,
  checkThreshold,
  getStatus,
  evaluate,
  getVerdict,
} = require("./evaluate.js");

function autoTest(actual, expected, testName) {
  const ok = actual === expected;
  console.log(
    `${ok ? "✅" : "❌"} ${testName} : получили "${actual}", ожидали "${expected}"`,
  );
}

const tests = [
  {
    name: "Критичный red → НЕ ПОКУПАТЬ",
    metrics: {
      debt_ebitda: 1.2,
      roe: 22,
      dividend_annual: 12,
      dividend_policy: "Прописана в документах компании",
    },
    ctx: { securityType: "stock", goal: "dividend", rate: 16 },
    expected: "НЕ ПОКУПАТЬ",
  },
  {
    name: "2 не-критичных red → НЕ ПОКУПАТЬ",
    metrics: {
      roe: 10,
      payout_ratio: 95,
      debt_ebitda: 1.0,
      dividend_policy: "Прописана в документах компании",
    },
    ctx: {
      securityType: "stock",
      goal: "dividend",
      rate: 14,
    },
    expected: "НЕ ПОКУПАТЬ",
  },
  {
    name: "1 не-критичный red → СПОРНО",
    metrics: {
      roe: 10,
      payout_ratio: 40,
      debt_ebitda: 1.0,
      dividend_policy: "Прописана в документах компании",
    },
    ctx: {
      securityType: "stock",
      goal: "dividend",
      rate: 14,
    },
    expected: "СПОРНО",
  },
  {
    name: "Всё зелёное → ПОКУПАТЬ",
    metrics: {
      roe: 25,
      payout_ratio: 40,
      debt_ebitda: 1.0,
      dividend_policy: "Прописана в документах компании",
    },
    ctx: {
      securityType: "stock",
      goal: "dividend",
      rate: 14,
    },
    expected: "ПОКУПАТЬ",
  },
  {
    name: "Много жёлтых → СПОРНО",
    metrics: {
      roe: 25,
      payout_ratio: 40,
      debt_ebitda: 2.0,
      dividend_policy: "Прописана в документах компании",
      dividend_profit: 5,
      dividend_annual: 18,
    },
    ctx: {
      securityType: "stock",
      goal: "dividend",
    },
    expected: "СПОРНО",
  },
  {
    name: "Мало данных → НЕДОСТАТОЧНО ДАННЫХ",
    metrics: { roe: 25, pe: 5 },
    ctx: {
      securityType: "stock",
      goal: "growth",
    },
    expected: "НЕДОСТАТОЧНО ДАННЫХ",
  },
  {
    name: "Облигации → ПОКУПАТЬ",
    metrics: {
      ytm: 18,
      credit_rating: "Высокий (AAA, AA)",
      duration: 3,
      bond_type: "ОФЗ (государственная)",
    },
    ctx: {
      securityType: "bond",
    },
    expected: "ПОКУПАТЬ",
  },
  {
    name: "Fair Price: цена ниже справедливой → ПОКУПАТЬ",
    metrics: {
      price: 100,
      debt_ebitda: 1.0,
      roe: 25,
      dividend_policy: "Прописана в документах компании",
      dividend_profit: 9,
      dividend_annual: 20,
      payout_ratio: 50,
    },
    ctx: { securityType: "stock", goal: "dividend", rate: 14 },
    expected: "ПОКУПАТЬ",
  },
  {
    name: "Fair Price: нет данных по price → всё равно ПОКУПАТЬ",
    metrics: {
      debt_ebitda: 1.0,
      roe: 25,
      dividend_policy: "Прописана в документах компании",
      dividend_annual: 20,
    },
    ctx: { securityType: "stock", goal: "dividend", rate: 14 },
    expected: "ПОКУПАТЬ",
  },
];

tests.forEach((test) => {
  const result = getVerdict(evaluate(test.metrics, test.ctx), test.ctx);
  autoTest(result.verdict, test.expected, test.name);
});
