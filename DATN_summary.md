# Đồ Án Tốt Nghiệp
## Xây Dựng Website Quản Lý Tài Liệu Kết Hợp Trí Tuệ Nhân Tạo

**Sinh viên:** Nguyễn Văn Hải — MSSV: 5240081 — Lớp: CNTT 2 — Khóa: 28.1  
**GVHD:** TS. Hoàng Văn Thông  
**Trường:** Đại học Giao thông Vận tải — Khoa CNTT — Năm: 2026

---

## Mục Lục Nhanh

1. [Mở đầu](#1-mở-đầu)
2. [Chương 1 — Khảo sát & Cơ sở lý thuyết](#2-chương-1--khảo-sát--cơ-sở-lý-thuyết)
3. [Chương 2 — Phân tích & Thiết kế hệ thống](#3-chương-2--phân-tích--thiết-kế-hệ-thống)
4. [Chương 3 — Công nghệ & Công cụ phát triển](#4-chương-3--công-nghệ--công-cụ-phát-triển)
5. [Chương 4 — Phát triển & Kiểm thử](#5-chương-4--phát-triển--kiểm-thử)
6. [Kết luận](#6-kết-luận)

---

## 1. Mở Đầu

**Bối cảnh:** Trong kỷ nguyên Industry 4.0, dữ liệu số bùng nổ dẫn đến "quá tải thông tin". Các phương pháp quản lý tài liệu truyền thống (cây thư mục, tìm kiếm từ khóa) không còn đáp ứng được nhu cầu.

**Giải pháp đề xuất:** Website quản lý tài liệu tích hợp AI — không chỉ là "kho chứa file" mà là **trợ lý tri thức chủ động** thông qua kỹ thuật **RAG (Retrieval-Augmented Generation)**.

**Hai nhóm người dùng:**
- **User:** Upload, auto-tag, tóm tắt, tìm kiếm ngữ nghĩa, hỏi đáp AI
- **Admin:** Quản lý danh mục, người dùng, giám sát tài nguyên

**Tech stack:** ReactJS + TypeScript (FE) · .NET 8 Web API (BE) · MySQL + Vector DB (DB) · OpenAI GPT-4o (AI)

---

## 2. Chương 1 — Khảo Sát & Cơ Sở Lý Thuyết

### 2.1 Kết Quả Khảo Sát (30 người, Hà Nội)

| Nhóm | Số lượng | Tỷ lệ |
|---|---|---|
| Sinh viên / Nghiên cứu sinh | 15 | 50% |
| Nhân viên văn phòng | 10 | 33% |
| Quản lý dự án / Kỹ thuật | 5 | 17% |

**Kết quả nổi bật:**
- **80%** gặp khó khăn khi tìm thông tin trong tài liệu cũ
- **50%** mất hơn 1 giờ để đọc hiểu tài liệu 30–50 trang
- **90%** sẵn sàng dùng AI chatbot thay thế phương pháp cũ

**3 Pain Points chính:**
1. Tri thức bị "đóng băng" trong file tĩnh — không thể tương tác
2. Tìm kiếm từ khóa bỏ sót từ đồng nghĩa (80% người dùng gặp khó)
3. Gắn thẻ thủ công tốn thời gian, không nhất quán

### 2.2 Cơ Sở Lý Thuyết AI

#### LLM (Large Language Model)
- **Tokenization:** Chuyển văn bản → chuỗi số (Token). Mỗi LLM có giới hạn Context Window → cần RAG để xử lý tài liệu dài.
- **Attention Mechanism (Self-Attention):** Giúp AI hiểu ngữ nghĩa, xác định mối liên hệ giữa các từ dù đứng xa nhau trong câu.

#### RAG (Retrieval-Augmented Generation)
Giải quyết 2 vấn đề của LLM thuần: **Hallucination** (bịa thông tin) và **không biết dữ liệu nội bộ**.

**Luồng RAG:**
```
[Tài liệu PDF/Docx]
    → Trích xuất văn bản
    → Chunking (~1000 ký tự, có overlap)
    → Embedding (text-embedding-3-small → vector 1536 chiều)
    → Lưu vào Vector DB (Pinecone/FAISS)

[Câu hỏi người dùng]
    → Vector hóa câu hỏi
    → Similarity Search (Cosine Similarity) → Top 3-5 đoạn liên quan
    → Prompt = [System Prompt] + [Context từ file] + [Câu hỏi]
    → Gửi LLM → Câu trả lời chính xác có trích dẫn nguồn
```

**So sánh tìm kiếm từ khóa vs RAG:**

| Tiêu chí | Từ khóa | RAG |
|---|---|---|
| Hiểu ngữ nghĩa | ❌ Chỉ so khớp ký tự | ✅ Hiểu ý nghĩa |
| Từ đồng nghĩa | ❌ Bỏ sót | ✅ Nhận diện được |
| Câu hỏi tự nhiên | ❌ Hạn chế | ✅ Tốt |
| Ví dụ | Tìm "hợp đồng" → chỉ ra đúng từ đó | Tìm "thỏa thuận nhân sự" → vẫn ra "hợp đồng lao động" |

#### Công nghệ sử dụng
- **Frontend:** ReactJS (Component-based, Virtual DOM) + TypeScript
- **Backend:** .NET Core Web API (JIT compiler, RESTful, async/await)
- **Database:** MySQL (quan hệ, ACID, tích hợp EF Core)

---

## 3. Chương 2 — Phân Tích & Thiết Kế Hệ Thống

### 3.1 Danh Sách Use Case

| Mã | Chức năng | Actor | Ưu tiên |
|---|---|---|---|
| UC01 | Đăng nhập / Đăng xuất (JWT) | User, Admin | Cao |
| UC02 | Đăng ký tài khoản | User | Cao |
| UC03 | Quản lý thông tin cá nhân | User, Admin | TB |
| UC04 | Tải lên tài liệu (PDF/Docx/Txt) | User | Cao |
| UC05 | Quản lý tài liệu (CRUD) | User | Cao |
| UC06 | AI Auto-tagging | User | Cao |
| UC07 | AI Summarization | User | Cao |
| UC08 | Document Chat (AI) | User | Cao |
| UC09 | Tìm kiếm ngữ nghĩa | User, Admin | Cao |
| UC10 | Chia sẻ tài liệu nội bộ | User | TB |
| UC11 | Quản lý người dùng | Admin | Cao |
| UC12 | Quản lý danh mục chung | Admin | Cao |
| UC13 | Quản lý nhãn (Tags) | Admin | TB |
| UC14 | Thống kê & Báo cáo | Admin | Thấp |

### 3.2 Các Luồng Nghiệp Vụ Chính

#### Luồng Đăng nhập (JWT)
```
Nhập Email/Password
    → Kiểm tra Email tồn tại trong MySQL
    → BCrypt.Verify(password, hash)
    → Kiểm tra is_active
    → Tạo JWT (UserId, Role, ExpireTime)
    → Lưu Token vào LocalStorage
```

#### Luồng Upload & AI Auto-tagging
```
Chọn file (PDF/Docx/Txt, <20MB)
    → Lưu file vật lý (unique filename)
    → ExtractText() từ PDF/Docx
    → Chunking (~1000 ký tự, overlap 10-15%)
    → Gửi đoạn tiêu biểu → AI gợi ý Tags
    → User xác nhận/chỉnh sửa Tags
    → Lưu metadata vào MySQL + Vector hóa → Vector DB
```

#### Luồng AI Chat (RAG)
```
User nhập câu hỏi
    → Vector hóa câu hỏi
    → SimilaritySearch trong Vector DB (Top 3 đoạn liên quan)
    → Xây dựng Prompt: [System] + [Context] + [Question]
    → Gửi LLM → Streaming response
    → Hiển thị Markdown + Lưu vào bảng Messages
```

#### Luồng Semantic Search
```
Nhập câu truy vấn
    → VectorizeQuery()
    → Cosine Similarity với toàn bộ Vector DB của user
    → Lọc Score > 0.7, sắp xếp giảm dần
    → Trả về danh sách file + đoạn văn liên quan nhất
```

### 3.3 Thiết Kế Cơ Sở Dữ Liệu (9 bảng)

#### Bảng Users
| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| user_id | int | PK, AI | Mã định danh |
| email | varchar(100) | Unique, Not Null | Email đăng nhập |
| password_hash | varchar(255) | Not Null | BCrypt hash |
| full_name | varchar(100) | Not Null | Họ tên |
| avatar_url | varchar(500) | Null | Ảnh đại diện |
| role_id | int | FK | Phân quyền |
| is_active | boolean | Default: true | Trạng thái |
| created_at | datetime | Default: Now | Ngày tạo |

#### Bảng Documents
| Trường | Kiểu | Ràng buộc | Mô tả |
|---|---|---|---|
| doc_id | int | PK, AI | Mã tài liệu |
| title | varchar(255) | Not Null | Tên file |
| file_path | varchar(500) | Not Null | Đường dẫn vật lý |
| file_size | bigint | Not Null | Dung lượng (bytes) |
| file_type | varchar(20) | Not Null | PDF/DOCX/TXT |
| user_id | int | FK | Chủ sở hữu |
| category_id | int | FK | Danh mục |
| upload_date | datetime | Default: Now | Ngày upload |
| is_vectorized | boolean | Default: false | Đã xử lý AI chưa |

#### Các bảng khác
| Bảng | Mô tả |
|---|---|
| Roles | role_id, role_name (1: Admin, 2: User) |
| Categories | category_id, name, description |
| Tags | tag_id, tag_name (Unique) |
| Document_Tags | doc_id + tag_id (PK kép), is_ai_suggested |
| Conversations | conv_id, doc_id, user_id, start_time |
| Messages | message_id, conv_id, sender_type ('User'/'AI'), content, sent_at |
| SharedLinks | share_id, doc_id, shared_with_id, permission ('Read'/'Edit'), expired_at |

**Sơ đồ quan hệ:**
```
Role (1) ──── (N) User (1) ──── (N) Document (N) ──── (N) Tag
                    │                    │              (qua Document_Tags)
                    │                    │
                    └── (N) Conversation (1) ──── (N) Message
                    │
                    └── (N) SharedLink (N) ──── (1) Document
```

---

## 4. Chương 3 — Công Nghệ & Công Cụ Phát Triển

### 4.1 Frontend (ReactJS + TypeScript)

| Thư viện | Vai trò |
|---|---|
| React Hooks (useState, useEffect) | Quản lý state, gọi API bất đồng bộ |
| Tailwind CSS | Utility-first CSS, Responsive, Dark mode |
| Framer Motion | Hiệu ứng Slide/Fade-in, UX mượt mà |
| Lucide React | Icon vector nhẹ, đồng bộ |
| Axios | Gọi HTTP API, quản lý JWT interceptor |

**Virtual DOM:** Khi AI streaming chữ liên tục, chỉ khung chat được re-render — PDF viewer bên cạnh không bị giật.

### 4.2 Backend (.NET 8 Web API)

| Thành phần | Vai trò |
|---|---|
| Controller-based API | AuthController, DocumentController, ChatController |
| Entity Framework Core | Code-First, Migration, LINQ (chống SQL Injection) |
| JWT Middleware | Kiểm tra Token mỗi request, phân quyền Role |
| CORS | Chỉ cho phép FE tin cậy gọi API |
| Async/Await | Xử lý đồng thời nhiều request upload/chat |

### 4.3 Tích Hợp AI

| Thành phần | Chi tiết |
|---|---|
| Trích xuất PDF | Thư viện **PdfPig** — hỗ trợ Unicode tiếng Việt, trích xuất kèm số trang |
| Trích xuất Word | **NPOI / OpenXML** |
| Chunking | Recursive Character Text Splitter, ~1000 ký tự, overlap 10-15% |
| Embedding | `text-embedding-3-small` (OpenAI) → vector 1536 chiều |
| Vector DB | **Pinecone** (cloud) hoặc **FAISS** (local) |
| LLM | GPT-4o / GPT-4-mini qua OpenAI .NET SDK |
| Streaming | Server-Sent Events (SSE) — chữ hiện dần như ChatGPT |

**System Prompt:**
> "Bạn là trợ lý ảo quản lý tài liệu. Chỉ sử dụng thông tin trong phần [Context] được cung cấp để trả lời. Nếu không tìm thấy, hãy trả lời là thông tin không có trong tài liệu. Tuyệt đối không tự bịa đặt kiến thức bên ngoài."

### 4.4 Cấu Trúc Thư Mục

**Backend (.NET):**
```
backend/
├── Controllers/    # HTTP endpoints
├── Services/       # Logic nghiệp vụ, AI, RAG
├── Models/         # Entity classes
├── DTOs/           # Data Transfer Objects
├── Data/           # DbContext, Migrations
└── Uploads/        # File vật lý
```

**Frontend (ReactJS):**
```
src/
├── components/     # UI dùng chung (Header, Sidebar...)
├── pages/          # Từng trang (Login, Dashboard, Chat...)
├── hooks/          # Custom hooks (useChat.ts...)
├── services/       # Axios API calls
├── store/          # Global state (User, Token)
└── assets/         # Hình ảnh, CSS tĩnh
```

---

## 5. Chương 4 — Phát Triển & Kiểm Thử

### 5.1 Môi Trường Triển Khai

| Phần mềm | Phiên bản | Vai trò |
|---|---|---|
| Windows | 10/11 | OS |
| .NET SDK | 8.0 (LTS) | Backend runtime |
| Node.js | 20.x (LTS) | Frontend runtime |
| MySQL Server | 8.0 | Database |
| Visual Studio | 2022 | IDE Backend |
| VS Code | 1.85+ | IDE Frontend |
| Postman | 10.x | Kiểm thử API |
| Git | 2.4x | Version control |

**Cài đặt nhanh:**
```bash
# Backend
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run

# Frontend
npm install
npm start  # Port 3000
```

### 5.2 Giao Diện Các Chức Năng

| Màn hình | Mô tả |
|---|---|
| **Đăng nhập** | Form Email/Password → JWT → LocalStorage |
| **Dashboard** | Danh sách tài liệu dạng bảng (tên, loại, dung lượng, ngày, tags) |
| **Upload Modal** | Kéo thả file → AI phân tích → hiển thị tags gợi ý |
| **Split Screen** | Trái: PDF viewer · Phải: AI Chat sidebar |
| **Semantic Search** | Kết quả kèm đoạn văn liên quan + Similarity Score |
| **Admin Dashboard** | Danh sách user, trạng thái Active/Locked, thống kê |
| **Profile / Settings** | Đổi avatar, mật khẩu, toggle Dark Mode |

### 5.3 Kết Quả Kiểm Thử

| ID | Chức năng | Kết quả |
|---|---|---|
| TC01 | Đăng nhập hợp lệ | ✅ Pass |
| TC02 | Đăng nhập sai thông tin | ✅ Pass |
| TC03 | Gọi API không có JWT → 401 | ✅ Pass |
| TC04 | Upload file PDF hợp lệ | ✅ Pass |
| TC05 | Upload file sai định dạng (.png, .exe) | ✅ Pass |
| TC06 | Xóa tài liệu | ✅ Pass |
| TC07 | AI Chat — câu hỏi đúng ngữ cảnh | ✅ Pass (có trích dẫn) |
| TC08 | AI Chat — câu hỏi ngoài ngữ cảnh | ✅ Pass (AI không bịa) |
| TC09 | Auto-tagging sau upload | ✅ Pass (3/5 nhãn chính xác) |

### 5.4 Hiệu Quả Thực Tế (PDF 50 trang)

| Tiêu chí | Thủ công | Dùng AI | Cải thiện |
|---|---|---|---|
| Tìm thông tin ẩn sâu | 5–10 phút | 5–10 giây | **60 lần** |
| Tóm tắt nội dung chính | 20–30 phút | 15–30 giây | **40 lần** |
| Phân loại / gắn thẻ | Thủ công, tốn thời gian | Tự động hoàn toàn | **100%** |

---

## 6. Kết Luận

### Đã đạt được
- ✅ Website quản lý tài liệu ổn định trên .NET 8 + ReactJS
- ✅ Tích hợp LLM + RAG — hỏi đáp trực tiếp trên tài liệu, độ chính xác cao
- ✅ Giao diện hiện đại, Dark Mode, tương thích đa trình duyệt
- ✅ Bảo mật JWT + BCrypt

### Hạn chế
- Chi phí API GPT-4 còn cao với quy mô cá nhân
- Tốc độ AI phụ thuộc băng thông quốc tế
- Chưa hỗ trợ OCR cho tài liệu dạng ảnh/scan

### Hướng phát triển
- Tích hợp OCR chuyên sâu
- Chạy LLM mã nguồn mở (Llama 3) trên server nội bộ — tiết kiệm chi phí
- Phát triển Mobile App

---

## Tài Liệu Tham Khảo

1. [.NET 8 Web API Documentation](https://learn.microsoft.com/en-us/aspnet/core/)
2. [ReactJS Documentation v18+](https://react.dev/)
3. [OpenAI API Platform](https://platform.openai.com/docs/)
4. [Pinecone Vector Database](https://docs.pinecone.io/)
5. [MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/)
6. Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", ArXiv:2005.11401, 2020
7. [UML Specification — OMG](https://www.omg.org/spec/UML/)
8. [Tailwind CSS Documentation](https://tailwindcss.com/docs)
9. [PdfPig — PDF Library for .NET](https://github.com/trun/PdfPig)
10. [JWT Introduction — Auth0](https://jwt.io/introduction/)
