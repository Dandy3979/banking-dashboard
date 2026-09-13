# Banking Analytics Dashboard

Ứng dụng web phân tích dữ liệu ngân hàng, xây dựng bằng Flask + Chart.js, đọc dữ liệu trực tiếp từ 6 file CSV.

---

## Công nghệ sử dụng

| Công nghệ | Mục đích |
|---|---|
| Python / Flask | Backend API server |
| Flask-CORS | Xử lý cross-origin request |
| Pandas | Đọc và xử lý dữ liệu CSV |
| HTML5 / CSS3 | Giao diện frontend |
| JavaScript ES6 | Logic gọi API, xử lý sự kiện |
| Chart.js 4 | Vẽ biểu đồ (CDN) |
| Font Awesome 6 | Icon (CDN) |
| Google Fonts (Poppins) | Font chữ (CDN) |

---

## Cách chạy

> Yêu cầu: Python 3.8+, pip, kết nối Internet (để tải CDN)

**Bước 1: Clone repo**
```bash
git clone https://github.com/TenBan/banking-dashboard.git
cd banking-dashboard
```

**Bước 2: Chuẩn bị dữ liệu CSV**

> ⚠️ File CSV không được lưu trong repo vì dung lượng lớn. Bạn cần tự chuẩn bị 6 file CSV và đặt vào đúng đường dẫn.

Tải bộ dữ liệu tại: *(cập nhật link thực tế vào đây)*

Sau khi tải về, đặt các file vào thư mục `data/` trong project:

```
banking-dashboard/
└── data/
    ├── accounts.csv
    ├── branches.csv
    ├── customers.csv
    ├── cards.csv
    ├── transactions.csv
    └── card_transactions.csv
```

**Bước 3: Cài thư viện**
```bash
pip install -r requirement.txt
```

**Bước 4: Chạy Flask server**
```bash
python app.py
```

**Bước 5: Mở trình duyệt**
```
http://127.0.0.1:8000
```

> Terminal phải giữ nguyên đang chạy. Đóng terminal thì server tắt.

---

## Cấu trúc thư mục

```
banking-dashboard/
│
├── app.py                  # Flask API server (9 endpoints)
├── README.md               # Tài liệu dự án
├── requirement.txt         # Thư viện cần cài
├── .gitignore
│
├── data/                   # Dữ liệu CSV
│   ├── accounts.csv
│   ├── branches.csv
│   ├── customers.csv
│   ├── cards.csv
│   ├── transactions.csv
│   └── card_transactions.csv
│
├── template/
│   └── index.html          # Giao diện dashboard
│
└── static/
    ├── style.css           # CSS: layout, card, responsive
    └── script.js           # JavaScript: gọi API, vẽ Chart.js
```

---

## Nguồn dữ liệu (6 file CSV)

> ⚠️ File `transactions.csv` (116MB) và `card_transactions.csv` (125MB) vượt giới hạn 100MB của GitHub nên không được lưu trong repo. Tải toàn bộ dữ liệu tại link bên dưới.

**📥 [Tải toàn bộ 6 file CSV tại Google Drive](https://drive.google.com/drive/folders/1iBbOUZQrPKvsBGphx5_PhvB-gVYzLQqq?usp=sharing)**

Sau khi tải về, đặt vào thư mục `data/`:

```
banking-dashboard/
└── data/
    ├── accounts.csv
    ├── branches.csv
    ├── customers.csv
    ├── cards.csv
    ├── transactions.csv
    └── card_transactions.csv
```

| File | Mô tả | Số dòng |
|---|---|---|
| `accounts.csv` | Thông tin tài khoản ngân hàng | ~95,000 |
| `branches.csv` | Danh sách chi nhánh | ~150 |
| `customers.csv` | Thông tin khách hàng | ~60,000 |
| `cards.csv` | Thẻ tín dụng / ghi nợ | ~50,000 |
| `transactions.csv` | Giao dịch tài khoản | ~200,000 |
| `card_transactions.csv` | Giao dịch thẻ (có flag gian lận) | ~150,000 |

---

## API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Giao diện dashboard |
| GET | `/api/overview` | KPI tổng quan hệ thống |
| GET | `/api/accounts-by-type` | Số tài khoản theo loại |
| GET | `/api/customers-by-state` | Số khách hàng theo bang |
| GET | `/api/transactions-by-type` | Giao dịch theo loại |
| GET | `/api/transactions-by-channel` | Giao dịch theo kênh |
| GET | `/api/top-branches` | Top 10 chi nhánh |
| GET | `/api/cards-by-type` | Phân bố loại thẻ |
| GET | `/api/card-txns-by-category` | GD thẻ theo danh mục + gian lận |
| GET | `/api/customers-by-occupation` | Khách hàng theo nghề nghiệp |

---

## Tính năng dashboard

- **8 KPI cards** — Tổng khách hàng, tài khoản, chi nhánh, thẻ, giao dịch, tổng số dư, gian lận, credit score trung bình
- **Biểu đồ Doughnut** — Loại tài khoản, kênh giao dịch, loại thẻ
- **Biểu đồ Bar đứng** — Giao dịch theo loại, khách hàng theo bang
- **Biểu đồ Bar ngang** — Nghề nghiệp khách hàng, danh mục giao dịch thẻ
- **Biểu đồ 2 lớp** — So sánh tổng giao dịch vs giao dịch gian lận theo danh mục
- **Bộ lọc bang** — Lọc biểu đồ khách hàng theo từng bang
- **Bảng Top 10 chi nhánh** — Có progress bar tỷ lệ và tổng số dư
- **Responsive** — Hiển thị tốt trên Desktop, Tablet, Mobile

---

## Màu sắc chủ đạo

| Ý nghĩa | Màu | Hex |
|---|---|---|
| Primary | Xanh navy | `#1565c0` |
| Success | Xanh lá | `#43a047` |
| Warning | Cam | `#fb8c00` |
| Danger / Fraud | Đỏ | `#e53935` |
| Info | Cyan | `#00acc1` |
