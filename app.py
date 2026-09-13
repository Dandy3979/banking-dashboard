"""
app.py - Banking Dashboard Flask API
Đọc dữ liệu từ 6 file CSV và expose qua REST API
"""

import os
import pandas as pd
from flask import Flask, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__, template_folder="template", static_folder="static")
CORS(app)

# ── Đường dẫn CSV (thư mục data/ cùng cấp với app.py) ──
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

# ── Load toàn bộ CSV 1 lần khi khởi động ──
df_accounts     = pd.read_csv(os.path.join(BASE, "accounts.csv"))
df_branches     = pd.read_csv(os.path.join(BASE, "branches.csv"))
df_customers    = pd.read_csv(os.path.join(BASE, "customers.csv"))
df_cards        = pd.read_csv(os.path.join(BASE, "cards.csv"))
df_transactions = pd.read_csv(os.path.join(BASE, "transactions.csv"))
df_card_txns    = pd.read_csv(os.path.join(BASE, "card_transactions.csv"))

print("✅ Đã load xong 6 file CSV")

# ════════════════════════════════════════════
# SERVE FRONTEND
# ════════════════════════════════════════════
@app.route("/")
def index():
    return render_template("index.html")


# ════════════════════════════════════════════
# API 1: Thống kê tổng quan (KPI cards)
# GET /api/overview
# ════════════════════════════════════════════
@app.route("/api/overview")
def overview():
    return jsonify({
        "total_customers":    int(len(df_customers)),
        "total_accounts":     int(len(df_accounts)),
        "total_branches":     int(len(df_branches)),
        "total_cards":        int(len(df_cards)),
        "total_transactions": int(len(df_transactions)),
        "total_balance":      round(float(df_accounts["balance"].sum()), 2),
        "fraud_count":        int(df_card_txns["is_fraud"].sum()),
        "avg_credit_score":   round(float(df_customers["credit_score"].mean()), 1),
    })


# ════════════════════════════════════════════
# API 2: Số tài khoản theo loại (account_type)
# GET /api/accounts-by-type
# ════════════════════════════════════════════
@app.route("/api/accounts-by-type")
def accounts_by_type():
    result = (
        df_accounts.groupby("account_type")
        .agg(count=("account_id", "count"), total_balance=("balance", "sum"))
        .reset_index()
        .sort_values("count", ascending=False)
    )
    result["total_balance"] = result["total_balance"].round(2)
    return jsonify(result.to_dict(orient="records"))


# ════════════════════════════════════════════
# API 3: Số khách hàng theo bang (state)
# GET /api/customers-by-state
# ════════════════════════════════════════════
@app.route("/api/customers-by-state")
def customers_by_state():
    result = (
        df_customers.groupby("state")
        .size()
        .reset_index(name="total")
        .sort_values("total", ascending=False)
    )
    return jsonify(result.to_dict(orient="records"))


# ════════════════════════════════════════════
# API 4: Giao dịch theo loại (txn_type)
# GET /api/transactions-by-type
# ════════════════════════════════════════════
@app.route("/api/transactions-by-type")
def transactions_by_type():
    result = (
        df_transactions.groupby("txn_type")
        .agg(count=("transaction_id", "count"), total_amount=("amount", "sum"))
        .reset_index()
        .sort_values("count", ascending=False)
    )
    result["total_amount"] = result["total_amount"].round(2)
    return jsonify(result.to_dict(orient="records"))


# ════════════════════════════════════════════
# API 5: Giao dịch theo kênh (channel)
# GET /api/transactions-by-channel
# ════════════════════════════════════════════
@app.route("/api/transactions-by-channel")
def transactions_by_channel():
    result = (
        df_transactions.groupby("channel")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
    )
    return jsonify(result.to_dict(orient="records"))


# ════════════════════════════════════════════
# API 6: Top 10 chi nhánh theo số tài khoản
# GET /api/top-branches
# ════════════════════════════════════════════
@app.route("/api/top-branches")
def top_branches():
    merged = df_accounts.merge(df_branches, on="branch_id", how="left")

    # Xác định tên cột state sau khi merge (có thể là state_y hoặc state)
    state_col = "state_y" if "state_y" in merged.columns else "state"

    result = (
        merged.groupby(["branch_id", "branch_name", "city", state_col])
        .agg(account_count=("account_id", "count"), total_balance=("balance", "sum"))
        .reset_index()
        .rename(columns={state_col: "state"})
        .sort_values("account_count", ascending=False)
        .head(10)
    )
    result["total_balance"] = result["total_balance"].round(2)
    return jsonify(result.to_dict(orient="records"))


# ════════════════════════════════════════════
# API 7: Phân bố loại thẻ (card_type)
# GET /api/cards-by-type
# ════════════════════════════════════════════
@app.route("/api/cards-by-type")
def cards_by_type():
    result = (
        df_cards.groupby("card_type")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
    )
    return jsonify(result.to_dict(orient="records"))


# ════════════════════════════════════════════
# API 8: Giao dịch thẻ theo danh mục + fraud
# GET /api/card-txns-by-category
# ════════════════════════════════════════════
@app.route("/api/card-txns-by-category")
def card_txns_by_category():
    result = (
        df_card_txns.groupby("merchant_category")
        .agg(
            count=("card_txn_id", "count"),
            total_amount=("amount", "sum"),
            fraud_count=("is_fraud", "sum"),
        )
        .reset_index()
        .sort_values("count", ascending=False)
        .head(10)
    )
    result["total_amount"] = result["total_amount"].round(2)
    return jsonify(result.to_dict(orient="records"))


# ════════════════════════════════════════════
# API 9: Phân bố nghề nghiệp khách hàng
# GET /api/customers-by-occupation
# ════════════════════════════════════════════
@app.route("/api/customers-by-occupation")
def customers_by_occupation():
    result = (
        df_customers.groupby("occupation")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
    )
    return jsonify(result.to_dict(orient="records"))


# ── Global error handler: luôn trả JSON, không trả HTML ──
@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"success": False, "error": str(e)}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({"success": False, "error": "Endpoint không tồn tại"}), 404


if __name__ == "__main__":
    app.run(debug=True, port=8000)
