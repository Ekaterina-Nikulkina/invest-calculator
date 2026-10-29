"use strict";

/* 
* Конфигурация критериев для оценки акций и облигаций.
  
* Пороги рассчитаны под консервативную инвестиционную стратегию.
* Все данные для расчётов пользователь берёт из карточки бумаги в приложении Т-Инвестиции. */

const criteria = [
  {
    id: "debt_ebitda",
    title: "Долг/EBITDA",
    appliesTo: { securityType: "stock" },
    criticalIn: { securityType: "stock" },
    unit: "",
    thresholds: {
      green: (v) => v < 1.5,
      yellow: (v) => v >= 1.5 && v <= 2.5,
      red: (v) => v > 2.5,
    },
    hint: "Показатель 'Долг/EBITDA' можно найти в карточке бумаги. Если найти не удалось — оставьте поле пустым, критерий будет отмечен как 'нет данных'.",
  },
  {
    id: "roe",
    title: "ROE",
    appliesTo: { securityType: "stock" },
    criticalIn: null,
    unit: "%",
    thresholds: {
      green: (v) => v > 20,
      yellow: (v) => v >= 15 && v <= 20,
      red: (v) => v < 15,
    },
    hint: "Показатель 'ROE'  показывает, сколько прибыли компания генерирует на собственный капитал. Значение указано в карточке бумаги в разделе 'Показатели' в Т-Инвестициях.",
  },
  {
    id: "dividend_policy",
    title: "Дивидендная политика",
    appliesTo: { securityType: "stock" },
    criticalIn: null,
    unit: "",
    thresholds: {
      green: (v) => v === "Прописана в документах компании",
      red: (v) => v === "Выплаты разовые, политики нет",
    },
    hint: "Дивидендная политика — это документ на сайте компании в разделе 'Инвесторам', где указано, какую долю прибыли компания обязуется направлять на дивиденды. Историю дивидендных выплат можно найти в разделе 'Дивиденды' в Т-Инвестициях",
  },
  {
    id: "dividend_profit",
    title: "Средняя дивидендная доходность за 5 лет",
    appliesTo: { securityType: "stock" },
    criticalIn: { securityType: "stock", goal: "dividend" },
    unit: "%",
    thresholds: {
      green: (v) => v > 8,
      yellow: (v) => v >= 4 && v <= 8,
      red: (v) => v < 4,
    },
    hint: "Показатель 'Средний див. доход за 5 лет' есть в карточке бумаги в разделе 'Показатели' в Т-Инвестициях.",
  },
  {
    id: "dividend_annual",
    title: "Дивидендная доходность (годовая)",
    appliesTo: { securityType: "stock", goal: "dividend" },
    criticalIn: { securityType: "stock", goal: "dividend" },
    unit: "%",
    thresholds: {
      green: (v, ctx) => v >= ctx.rate + 3,
      yellow: (v, ctx) => v >= ctx.rate + 1 && v < ctx.rate + 3,
      red: (v, ctx) => v < ctx.rate + 1,
    },
    hint: "Показатель 'Дивидендная доходность (годовая)' есть в карточке бумаги в разделе 'Показатели' в Т-Инвестициях.",
  },
  {
    id: "payout_ratio",
    title: "Payout Ratio",
    appliesTo: { securityType: "stock", goal: "dividend" },
    criticalIn: null,
    unit: "%",
    thresholds: {
      green: (v) => v >= 30 && v <= 70,
      yellow: (v) => (v >= 20 && v < 30) || (v > 70 && v <= 90),
      red: (v) => v < 20 || v > 90,
    },
    hint: "Показатель 'Payout Ratio (коэффициент выплат)' показывает, какую долю чистой прибыли компания направляет на дивиденды. Значение указано в карточке бумаги в разделе 'Показатели' в Т-Инвестициях.",
  },
  {
    id: "fair_price",
    title: "Fair Price",
    appliesTo: { securityType: "stock", goal: "dividend" },
    criticalIn: null,
    unit: "₽",
    check: (metrics, ctx) => {
      return metrics.price <= metrics.fair_price ? "green" : "red";
    },
    hint: "Fair Price — это цена, при которой доходность бумаги равна вашей целевой (ставка ЦБ + 4%). Если текущая цена выше — бумага переоценена",
  },
  {
    id: "pe",
    title: "P/E",
    appliesTo: { securityType: "stock", goal: "growth" },
    criticalIn: { securityType: "stock", goal: "growth" },
    unit: "",
    thresholds: {
      green: (v) => v < 6,
      yellow: (v) => v >= 6 && v <= 8,
      red: (v) => v > 8,
    },
    hint: "Показатель 'P/E (цена / прибыль)' есть в карточке бумаги в разделе 'Показатели' в Т-Инвестициях.",
  },
  {
    id: "eps",
    title: "Рост EPS за 5 лет",
    appliesTo: { securityType: "stock", goal: "growth" },
    criticalIn: null,
    unit: "%",
    thresholds: {
      green: (v) => v > 15,
      yellow: (v) => v >= 5 && v <= 15,
      red: (v) => v < 5,
    },
    hint: "Показатель 'Рост EPS (средний за 5 лет)' показывает, как в среднем росла прибыль на акцию за последние 5 лет. Значение есть в карточке бумаги в разделе 'Показатели' в Т-Инвестициях.",
  },
  {
    id: "net_profit",
    title: "Net Profit Margin",
    appliesTo: { securityType: "stock", goal: "growth" },
    criticalIn: null,
    unit: "%",
    thresholds: {
      green: (v) => v > 20,
      yellow: (v) => v >= 10 && v <= 20,
      red: (v) => v < 10,
    },
    hint: "Показатель 'Net Profit Margin (чистая рентабельность)' показывает, какую долю выручки компания превращает в чистую прибыль. Значение показателя есть в карточке бумаги в разделе 'Показатели' в Т-Инвестициях.",
  },
  {
    id: "ytm",
    title: "YTM",
    appliesTo: { securityType: "bond" },
    criticalIn: { securityType: "bond" },
    unit: "%",
    thresholds: {
      green: (v, ctx) => v >= ctx.rate + 2,
      yellow: (v, ctx) => v >= ctx.rate + 1 && v < ctx.rate + 2,
      red: (v, ctx) => v < ctx.rate + 1,
    },
    hint: "Показатель 'YTM (доходность к погашению)' есть в карточке бумаги в разделе 'О выпуске' в Т-Инвестициях.",
  },
  {
    id: "credit_rating",
    title: "Кредитный рейтинг",
    appliesTo: { securityType: "bond" },
    criticalIn: { securityType: "bond" },
    unit: "",
    thresholds: {
      green: (v) => v === "Высокий (AAA, AA)",
      yellow: (v) => v === "Средний (A, BBB)",
      red: (v) => v === "Низкий (BB и ниже)",
    },
    hint: "Кредитный рейтинг присваивают агентства АКРА и Эксперт РА. Обычно он указан в карточке облигации в разделе 'О выпуске' в Т-Инвестициях. Если рейтинга нет — выбирайте по типу эмитента: государственные и крупные корпоративные эмитенты обычно имеют высокий рейтинг.",
  },
  {
    id: "duration",
    title: "Дюрация",
    appliesTo: { securityType: "bond" },
    criticalIn: null,
    unit: "лет",
    thresholds: {
      green: (v) => v < 5,
      yellow: (v) => v >= 5 && v <= 7,
      red: (v) => v > 7,
    },
    hint: "Дюрация — это средний срок, за который облигация вернёт вложенные деньги. Чем она больше, тем сильнее цена облигации реагирует на изменение ставки ЦБ. Если не знаете — оставьте пустым.",
  },
  {
    id: "bond_type",
    title: "Тип облигации",
    appliesTo: { securityType: "bond" },
    criticalIn: null,
    unit: "",
    thresholds: {
      green: (v) =>
        v === "ОФЗ (государственная)" ||
        v === "Корпоративная, надёжный эмитент",
      yellow: (v) =>
        v === "Корпоративная, малоизвестный эмитент" || v === "Валютная",
    },
    hint: "ОФЗ — самый надёжный инструмент на российском рынке. Корпоративные облигации надёжных эмитентов (например, крупных банков и госкомпаний) близки к ним по надёжности.",
  },
];

module.exports = criteria;
