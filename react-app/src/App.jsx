import { useState, useEffect } from "react";
import { evaluate, getVerdict } from "../../src/js/evaluate.js";
import criteria from "../../src/js/criteria.js";

const stockExample = {
  paperName: "Татнефть (TATN)",
  securityType: "stock",
  goal: "dividend",
  rate: 14,
  price: 600,
  roe: 19.61,
  debt_ebitda: -0.5,
  dividend_policy: "Прописана в документах компании",
  dividend_profit: 10.4,
  dividend_annual: 8.72,
  payout_ratio: 45.23,
  pe: 4.99,
  eps: 8.4,
  net_profit: 14.45,
  ytm: "",
  credit_rating: "",
  duration: "",
  bond_type: "",
  industry: "oil_gas",
};

const bondExample = {
  paperName: "ОФЗ 26238",
  securityType: "bond",
  goal: "dividend",
  rate: 14,
  price: 519.5,
  roe: "",
  debt_ebitda: "",
  dividend_policy: "",
  dividend_profit: "",
  dividend_annual: "",
  payout_ratio: "",
  pe: "",
  eps: "",
  net_profit: "",
  ytm: 16.11,
  credit_rating: "Высокий (AAA, AA)",
  duration: 15,
  bond_type: "ОФЗ (государственная)",
};

const Hint = ({ id }) => {
  const criterion = criteria.find((c) => c.id === id);
  if (!criterion || !criterion.hint) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "6px",
        marginTop: "6px",
      }}
    >
      <span
        style={{
          background: "var(--border-color)",
          borderRadius: "50%",
          width: "16px",
          height: "16px",
          fontSize: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "var(--text-color)",
          marginTop: "2px",
        }}
      >
        ?
      </span>
      <span
        style={{
          fontSize: "12px",
          color: "var(--text-muted)",
          lineHeight: "1.4",
        }}
      >
        {criterion.hint}
      </span>
    </div>
  );
};

const AttentionItem = ({ item, getCriterionTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const criterion = criteria.find((c) => c.id === item.id);
  const shortMessage = criterion?.messages?.[item.status];

  return (
    <li
      style={{
        marginBottom: "12px",
        listStyle: "none",
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <div style={{ flex: 1 }}>
          <strong>{getCriterionTitle(item.id)}</strong> —
          {item.status === "green" && " 🟢 Отлично"}
          {item.status === "yellow" && " 🟡 Спорно"}
          {item.status === "red" && " 🔴 Плохо"}
          (значение:{" "}
          {typeof item.value === "number" ? item.value.toFixed(2) : item.value})
        </div>

        {criterion?.hint && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: "var(--border-color)",
              border: "none",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-color)",
              flexShrink: 0,
              marginTop: "2px",
            }}
            title="Где взять этот показатель?"
          >
            ?
          </button>
        )}
      </div>

      {shortMessage && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "13px",
            color: "var(--text-color)",
            fontStyle: "italic",
            opacity: 0.8,
          }}
        >
          {shortMessage}
        </div>
      )}

      {isOpen && criterion?.hint && (
        <div
          style={{
            marginTop: "8px",
            padding: "10px",
            fontSize: "12px",
            background: "var(--input-bg)",
            borderRadius: "6px",
            color: "var(--text-muted)",
            borderLeft: "3px solid var(--primary)",
          }}
        >
          <strong>Где найти:</strong> {criterion.hint}
        </div>
      )}
    </li>
  );
};

function App() {
  const [formData, setFormData] = useState({
    paperName: "",
    securityType: "stock",
    goal: "dividend",
    rate: 14,
    price: "",
    roe: "",
    debt_ebitda: "",
    dividend_policy: "",
    dividend_profit: "",
    dividend_annual: "",
    payout_ratio: "",
    pe: "",
    eps: "",
    net_profit: "",
    ytm: "",
    credit_rating: "",
    duration: "",
    bond_type: "",
    industry: "other",
  });
  const [result, setResult] = useState(null);
  const [resultsArray, setResultsArray] = useState([]);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("calcHistory");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheck = () => {
    const metrics = {
      price: formData.price ? Number(formData.price) : null,
      roe: formData.roe ? Number(formData.roe) : null,
      debt_ebitda: formData.debt_ebitda ? Number(formData.debt_ebitda) : null,
      dividend_policy: formData.dividend_policy || null,
      dividend_profit: formData.dividend_profit
        ? Number(formData.dividend_profit)
        : null,
      dividend_annual: formData.dividend_annual
        ? Number(formData.dividend_annual)
        : null,
      payout_ratio: formData.payout_ratio
        ? Number(formData.payout_ratio)
        : null,
      pe: formData.pe ? Number(formData.pe) : null,
      eps: formData.eps ? Number(formData.eps) : null,
      net_profit: formData.net_profit ? Number(formData.net_profit) : null,
      ytm: formData.ytm ? Number(formData.ytm) : null,
      credit_rating: formData.credit_rating || null,
      duration: formData.duration ? Number(formData.duration) : null,
      bond_type: formData.bond_type || null,
    };

    const ctx = {
      securityType: formData.securityType,
      goal: formData.goal,
      rate: Number(formData.rate),
      industry: formData.industry,
      bond_type: formData.bond_type,
    };

    const evaluatedResults = evaluate(metrics, ctx);
    const finalVerdict = getVerdict(evaluatedResults, ctx);

    setResult(finalVerdict);
    setResultsArray(evaluatedResults);

    // --- СОХРАНЕНИЕ В ИСТОРИЮ ---
    const historyItem = {
      id: Date.now(),
      date: new Date().toLocaleString("ru-RU", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      formData: { ...formData },
      verdict: finalVerdict.verdict,
      name:
        formData.paperName ||
        (formData.securityType === "stock"
          ? "Без названия (Акция)"
          : "Без названия (Облигация)"),
    };

    const newHistory = [historyItem, ...history].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("calcHistory", JSON.stringify(newHistory));
  };

  const fillExample = (data) => {
    setFormData(data);
    setResult(null);
    setResultsArray([]);
  };

  const loadFromHistory = (item) => {
    setFormData(item.formData);
    setResult(null);
    setResultsArray([]);
  };

  const deleteFromHistory = (e, id) => {
    e.stopPropagation();
    const newHistory = history.filter((item) => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem("calcHistory", JSON.stringify(newHistory));
  };

  const getCriterionTitle = (id) => {
    const found = criteria.find((c) => c.id === id);
    return found ? found.title : id;
  };

  const filledFieldsCount = Object.keys(formData).filter(
    (key) => formData[key] !== "" && key !== "securityType" && key !== "goal",
  ).length;

  const isFormValid = filledFieldsCount >= 3;

  return (
    <div className="app-container">
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        title="Переключить тему"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          paddingRight: "30px",
          paddingLeft: "30px",
        }}
      >
        <h1 style={{ margin: "0 0 10px 0" }}>Инвестиционный калькулятор</h1>
        <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "14px" }}>
          Оценка проводится по строгим критериям консервативной стратегии.
          Калькулятор не является инвестиционной рекомендацией.
        </p>
      </div>

      <div className="layout">
        {/* ЛЕВАЯ КОЛОНКА: ФОРМА */}
        <div className="card">
          <div className="form-group">
            <label>Название бумаги (для истории):</label>
            <input
              type="text"
              name="paperName"
              value={formData.paperName}
              onChange={handleChange}
              placeholder="Например: Лукойл, ОФЗ 26244"
            />
          </div>
          <div className="form-group">
            <label>Тип бумаги:</label>
            <div className="radio-group">
              <label
                className={`radio-label ${formData.securityType === "stock" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="securityType"
                  value="stock"
                  checked={formData.securityType === "stock"}
                  onChange={handleChange}
                />
                Акция
              </label>
              <label
                className={`radio-label ${formData.securityType === "bond" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="securityType"
                  value="bond"
                  checked={formData.securityType === "bond"}
                  onChange={handleChange}
                />
                Облигация
              </label>
            </div>
          </div>

          {formData.securityType === "stock" && (
            <div className="form-group">
              <label>Цель покупки:</label>
              <div className="radio-group">
                <label
                  className={`radio-label ${formData.goal === "dividend" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="goal"
                    value="dividend"
                    checked={formData.goal === "dividend"}
                    onChange={handleChange}
                  />
                  Дивиденды
                </label>
                <label
                  className={`radio-label ${formData.goal === "growth" ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="goal"
                    value="growth"
                    checked={formData.goal === "growth"}
                    onChange={handleChange}
                  />
                  Рост
                </label>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Ставка ЦБ РФ (%):</label>
            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Цена (₽): </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          {formData.securityType === "stock" && (
            <>
              <div className="form-group">
                <label>Отрасль компании:</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                >
                  <option value="other">Другое / По умолчанию</option>
                  <option value="oil_gas">Нефть и газ</option>
                  <option value="banks">Банки</option>
                  <option value="metallurgy">Металлургия</option>
                  <option value="it">IT и телеком</option>
                  <option value="retail">Ритейл</option>
                </select>
              </div>
              <h3>Общие показатели:</h3>
              <div className="form-group">
                <label>ROE (%): </label>
                <input
                  type="number"
                  name="roe"
                  value={formData.roe}
                  onChange={handleChange}
                />
                <Hint id="roe" />
              </div>
              <div className="form-group">
                <label>Долг/EBITDA: </label>
                <input
                  type="number"
                  name="debt_ebitda"
                  value={formData.debt_ebitda}
                  onChange={handleChange}
                />
                <Hint id="debt_ebitda" />
              </div>
              <div className="form-group">
                <label>Дивидендная политика: </label>
                <select
                  name="dividend_policy"
                  value={formData.dividend_policy}
                  onChange={handleChange}
                >
                  <option value="">Не выбрано</option>
                  <option value="Прописана в документах компании">
                    Прописана
                  </option>
                  <option value="Выплаты разовые, политики нет">
                    Разовые выплаты
                  </option>
                </select>
                <Hint id="dividend_policy" />
              </div>
              <div className="form-group">
                <label>Средняя див. доходность за 5 лет (%): </label>
                <input
                  type="number"
                  name="dividend_profit"
                  value={formData.dividend_profit}
                  onChange={handleChange}
                />
                <Hint id="dividend_profit" />
              </div>
            </>
          )}

          {formData.securityType === "stock" &&
            formData.goal === "dividend" && (
              <>
                <h3>Дивидендные показатели:</h3>
                <div className="form-group">
                  <label>Дивидендная доходность (%): </label>
                  <input
                    type="number"
                    name="dividend_annual"
                    value={formData.dividend_annual}
                    onChange={handleChange}
                  />
                  <Hint id="dividend_annual" />
                </div>
                <div className="form-group">
                  <label>Payout Ratio (%): </label>
                  <input
                    type="number"
                    name="payout_ratio"
                    value={formData.payout_ratio}
                    onChange={handleChange}
                  />
                  <Hint id="payout_ratio" />
                </div>
              </>
            )}

          {formData.securityType === "stock" && formData.goal === "growth" && (
            <>
              <h3>Показатели роста:</h3>
              <div className="form-group">
                <label>P/E: </label>
                <input
                  type="number"
                  name="pe"
                  value={formData.pe}
                  onChange={handleChange}
                />
                <Hint id="pe" />
              </div>
              <div className="form-group">
                <label>Рост EPS за 5 лет (%): </label>
                <input
                  type="number"
                  name="eps"
                  value={formData.eps}
                  onChange={handleChange}
                />
                <Hint id="eps" />
              </div>
              <div className="form-group">
                <label>Net Profit Margin (%): </label>
                <input
                  type="number"
                  name="net_profit"
                  value={formData.net_profit}
                  onChange={handleChange}
                />
                <Hint id="net_profit" />
              </div>
            </>
          )}

          {formData.securityType === "bond" && (
            <>
              <h3>Показатели облигации:</h3>
              <div className="form-group">
                <label>YTM (%): </label>
                <input
                  type="number"
                  name="ytm"
                  value={formData.ytm}
                  onChange={handleChange}
                />
                <Hint id="ytm" />
              </div>
              <div className="form-group">
                <label>Кредитный рейтинг: </label>
                <select
                  name="credit_rating"
                  value={formData.credit_rating}
                  onChange={handleChange}
                >
                  <option value="">Не выбрано</option>
                  <option value="Высокий (AAA, AA)">Высокий</option>
                  <option value="Средний (A, BBB)">Средний</option>
                  <option value="Низкий (BB и ниже)">Низкий</option>
                </select>
                <Hint id="credit_rating" />
              </div>
              <div className="form-group">
                <label>Дюрация (лет): </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                />
                <Hint id="duration" />
              </div>
              <div className="form-group">
                <label>Тип облигации: </label>
                <select
                  name="bond_type"
                  value={formData.bond_type}
                  onChange={handleChange}
                >
                  <option value="">Не выбрано</option>
                  <option value="ОФЗ (государственная)">ОФЗ</option>
                  <option value="Корпоративная, надёжный эмитент">
                    Надёжный эмитент
                  </option>
                  <option value="Корпоративная, малоизвестный эмитент">
                    Малоизвестный эмитент
                  </option>
                  <option value="Валютная">Валютная</option>
                </select>
                <Hint id="bond_type" />
              </div>
            </>
          )}

          <button
            className="btn-submit"
            onClick={handleCheck}
            disabled={!isFormValid}
          >
            Проверить бумагу
          </button>

          <button
            onClick={() => fillExample(stockExample)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              backgroundColor: "transparent",
              color: "var(--text-color)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "var(--border-color)")
            }
            onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            Заполнить примером (Татнефть (TATN))
          </button>
          <button
            onClick={() => fillExample(bondExample)}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              backgroundColor: "transparent",
              color: "var(--text-color)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "var(--border-color)")
            }
            onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            Заполнить примером (ОФЗ 26238)
          </button>
        </div>

        {/* ПРАВАЯ КОЛОНКА: РЕЗУЛЬТАТ */}
        <div className="card">
          <h2>Результат</h2>
          {!result ? (
            <p style={{ color: "var(--text-muted)" }}>
              Заполните данные и нажмите «Проверить», чтобы увидеть вердикт.
            </p>
          ) : (
            <div>
              <div
                style={{
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  backgroundColor:
                    result.verdict === "ПОКУПАТЬ"
                      ? "#d4edda"
                      : result.verdict === "СПОРНО"
                        ? "#fff3cd"
                        : "#f8d7da",
                  borderLeft: `6px solid ${result.verdict === "ПОКУПАТЬ" ? "#28a745" : result.verdict === "СПОРНО" ? "#ffc107" : "#dc3545"}`,
                }}
              >
                <h2 style={{ margin: 0, color: "#333" }}>
                  Вердикт: {result.verdict}
                </h2>
              </div>

              {resultsArray?.find(
                (r) => r.id === "fair_price" && r.status !== "no_data",
              ) && (
                <div
                  style={{
                    marginBottom: "15px",
                    padding: "10px",
                    background: "var(--input-bg)",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <strong>Справедливая цена:</strong> ~
                  {resultsArray
                    .find((r) => r.id === "fair_price")
                    .value.toFixed(2)}{" "}
                  ₽
                  <br />
                  <span
                    style={{ fontSize: "12px", color: "var(--text-muted)" }}
                  >
                    (Текущая цена: {formData.price} ₽)
                  </span>
                </div>
              )}

              <h3>На что обратить внимание:</h3>
              {result.attention && result.attention.length > 0 ? (
                <ul style={{ paddingLeft: 0 }}>
                  {result.attention.map((item) => (
                    <AttentionItem
                      key={item.id}
                      item={item}
                      getCriterionTitle={getCriterionTitle}
                    />
                  ))}
                </ul>
              ) : (
                <p>Проблемных критериев нет.</p>
              )}
            </div>
          )}
        </div>

        {/* БЛОК ИСТОРИИ */}
        {history.length > 0 && (
          <div
            className="card"
            style={{ marginTop: "20px", gridColumn: "1 / -1" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0 }}>История проверок (последние 5)</h3>
              <button
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem("calcHistory");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "12px",
                  textDecoration: "underline",
                }}
              >
                Очистить всё
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: "10px",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              }}
            >
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  style={{
                    padding: "10px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    position: "relative",
                    backgroundColor: "var(--input-bg)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "scale(1.02)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {item.date}
                  </div>
                  <div style={{ fontWeight: "bold", marginTop: "4px" }}>
                    {item.name}
                  </div>
                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "14px",
                      color:
                        item.verdict === "ПОКУПАТЬ"
                          ? "#28a745"
                          : item.verdict === "СПОРНО"
                            ? "#ffc107"
                            : "#dc3545",
                    }}
                  >
                    {item.verdict}
                  </div>
                  <button
                    onClick={(e) => deleteFromHistory(e, item.id)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
