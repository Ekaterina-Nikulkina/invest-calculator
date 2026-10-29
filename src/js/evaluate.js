"use strict";

const criteria = require("./criteria");

/*
 * Проверяет, подходит ли критерий под текущий контекст.
 * Например, подходит ли критерий облигаций, если пользователь выбрал акцию.
 *
 * @param {Object|null} obj - Объект условий (например, criterion.appliesTo или criterion.criticalIn).
 * @param {Object} ctx - Контекст пользователя (securityType, goal, rate).
 * @returns {boolean} true, если все поля obj совпадают с ctx.
 */
function matchesFields(obj, ctx) {
  if (!obj) return false;
  const criterionArr = Object.entries(obj);
  return criterionArr.every(([key, value]) => ctx[key] === value);
}

/*
 * Безопасно вызывает функцию-порог критерия, если она существует.
 *
 * @param {Function|undefined} fn - Функция порога (green, yellow или red).
 * @param {number|string} value - Введённое пользователем значение.
 * @param {Object} ctx - Контекст (нужен для порогов, зависящих от ставки ЦБ).
 * @returns {boolean} Результат проверки или false, если функции нет.
 */
function checkThreshold(fn, value, ctx) {
  return fn ? fn(value, ctx) : false;
}

/*
 * Определяет статус одного критерия (green, yellow, red или no_data).
 *
 * @param {Object} criterion - Объект критерия из criteria.js.
 * @param {number|string|undefined} value - Значение, введённое пользователем.
 * @param {Object} ctx - Контекст.
 * @param {Object} metrics - Все введённые метрики (нужны для особых критериев вроде Fair Price).
 * @returns {string} Статус: "green", "yellow", "red" или "no_data".
 */
function getStatus(criterion, value, ctx, metrics) {
  if (value === "" || value === null || value === undefined) {
    return "no_data";
  }
  if (criterion.check) {
    return criterion.check(metrics, ctx);
  }

  if (checkThreshold(criterion.thresholds.green, value, ctx)) {
    return "green";
  }
  if (checkThreshold(criterion.thresholds.yellow, value, ctx)) {
    return "yellow";
  }
  if (checkThreshold(criterion.thresholds.red, value, ctx)) {
    return "red";
  } else {
    return "no_data";
  }
}

/*
 * Вычисляет производные метрики (например, Fair Price), которые нельзя ввести вручную.
 *
 * @param {Object} metrics - Введённые пользователем данные.
 * @param {Object} ctx - Контекст.
 * @returns {Object} Копия metrics с добавленными вычисленными полями.
 */
function calcMetrics(metrics, ctx) {
  const enriched = { ...metrics };

  if (ctx.securityType === "stock" && ctx.goal === "dividend") {
    const price = metrics.price;
    const divAnnual = metrics.dividend_annual;
    const rate = ctx.rate;
    if (price != null && divAnnual != null && rate != null) {
      const annualDividend = (price * divAnnual) / 100;
      const targetedRate = (rate + 4) / 100;
      enriched.fair_price = annualDividend / targetedRate;
    }
  }
  return enriched;
}

/*
 * Главная функция расчёта. Фильтрует критерии по контексту
 * и определяет статус каждого из них.
 *
 * @param {Object} metrics - Введённые пользователем данные.
 * @param {Object} ctx - Контекст.
 * @returns {Array<Object>} Массив результатов вида { id, status, value }.
 */
function evaluate(metrics, ctx) {
  const enrichedMetrics = calcMetrics(metrics, ctx);
  const relevant = criteria.filter((c) => matchesFields(c.appliesTo, ctx));
  return relevant.map((criterion) => {
    const value = enrichedMetrics[criterion.id];
    const status = getStatus(criterion, value, ctx, enrichedMetrics);
    return { id: criterion.id, status, value };
  });
}

/*
 * Формирует итоговый вердикт на основе статусов критериев.
 *
 * @param {Array<Object>} results - Массив результатов из функции evaluate.
 * @param {Object} ctx - Контекст.
 * @returns {Object} Объект вида { verdict: string, attention: Array }.
 */
function getVerdict(results, ctx) {
  // 1. Дополняем результаты — добавляем флаг isCritical
  const enriched = results.map((result) => {
    const fullCriterion = criteria.find((c) => c.id === result.id);
    const isCritical = matchesFields(fullCriterion.criticalIn, ctx);
    return { ...result, isCritical };
  });

  // 2. Собираем все жёлтые и красные критерии для блока "На что обратить внимание"
  const attention = enriched.filter(
    (r) => r.status === "red" || r.status === "yellow",
  );

  // 3. Проверка на критичные красные флаги (мгновенное "НЕ ПОКУПАТЬ")
  const criticalReds = enriched.filter(
    (r) => r.status === "red" && r.isCritical,
  );
  if (criticalReds.length > 0) {
    return { verdict: "НЕ ПОКУПАТЬ", attention };
  }

  // 4. Проверка на НЕ критичные красные флаги
  const notCriticalReds = enriched.filter(
    (r) => r.status === "red" && r.isCritical === false,
  );
  if (notCriticalReds.length >= 2) {
    return { verdict: "НЕ ПОКУПАТЬ", attention };
  }
  if (notCriticalReds.length === 1) {
    return { verdict: "СПОРНО", attention };
  }

  // 5. Проверка, что данных достаточно для расчёта
  const withData = enriched.filter((r) => r.status !== "no_data");
  if (withData.length < 3) {
    return { verdict: "НЕДОСТАТОЧНО ДАННЫХ" };
  }

  // 6. Расчёт доли зелёных критериев и финальный вердикт
  const greens = enriched.filter((r) => r.status === "green").length;
  const greenQuality = greens / withData.length;

  if (greenQuality >= 0.7) {
    return { verdict: "ПОКУПАТЬ", attention };
  }
  if (greenQuality >= 0.4) {
    return { verdict: "СПОРНО", attention };
  }
  return { verdict: "НЕ ПОКУПАТЬ", attention };
}

module.exports = {
  matchesFields,
  checkThreshold,
  getStatus,
  evaluate,
  getVerdict,
};
