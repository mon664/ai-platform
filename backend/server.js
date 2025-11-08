const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../web')));

// 한글 인코딩을 위한 응답 헤더 설정
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

// File upload configuration
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Database setup with UTF-8 encoding
const db = new sqlite3.Database(process.env.DB_PATH || './database/business_data.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Set encoding to UTF-8
        db.run("PRAGMA encoding = 'UTF-8'");
    }
});

// Initialize database tables
function initializeDatabase() {
    // Products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        unit TEXT,
        unit_price REAL,
        cost REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Inventory table
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        quantity REAL,
        min_quantity REAL,
        location TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`);

    // Sales table
    db.run(`CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        total_amount REAL NOT NULL,
        payment_status TEXT DEFAULT 'pending',
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
    )`);

    // Sales items table
    db.run(`CREATE TABLE IF NOT EXISTS sales_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER,
        product_id INTEGER,
        quantity REAL,
        unit_price REAL,
        total REAL,
        FOREIGN KEY (sale_id) REFERENCES sales (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`);

    // Production orders table
    db.run(`CREATE TABLE IF NOT EXISTS production_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        quantity REAL,
        status TEXT DEFAULT 'pending',
        assigned_to TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        notes TEXT,
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`);

    // Temperature records table
    db.run(`CREATE TABLE IF NOT EXISTS temperature_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location TEXT NOT NULL,
        temperature REAL NOT NULL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
    )`);

    // HACCP records table
    db.run(`CREATE TABLE IF NOT EXISTS haccp_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        check_type TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT,
        inspector TEXT,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Suppliers table
    db.run(`CREATE TABLE IF NOT EXISTS suppliers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Purchase orders table
    db.run(`CREATE TABLE IF NOT EXISTS purchase_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_id INTEGER,
        total_amount REAL,
        status TEXT DEFAULT 'pending',
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        received_date DATETIME,
        notes TEXT,
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
    )`);

    // Purchase order items table
    db.run(`CREATE TABLE IF NOT EXISTS purchase_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        purchase_order_id INTEGER,
        product_id INTEGER,
        quantity REAL,
        unit_price REAL,
        total REAL,
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
    )`);

    // AI 콘텐츠 생성 관련 테이블들

    // 쇼츠(Shorts) 생성 관리 테이블
    db.run(`CREATE TABLE IF NOT EXISTS shorts_videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        script_content TEXT,
        video_url TEXT,
        thumbnail_url TEXT,
        status TEXT DEFAULT 'draft',
        platform TEXT,
        tags TEXT,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        published_at DATETIME,
        ai_generated BOOLEAN DEFAULT 0,
        duration INTEGER,
        scene_count INTEGER,
        image_style TEXT
    )`);

    // 스토리 장면 생성 관리 테이블
    db.run(`CREATE TABLE IF NOT EXISTS story_generations (
        id TEXT PRIMARY KEY,
        story_prompt TEXT NOT NULL,
        scene_count INTEGER NOT NULL,
        aspect_ratio TEXT,
        image_style TEXT,
        mood TEXT,
        scenes_data TEXT, -- JSON 형태로 장면 데이터 저장
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 캐릭터 생성 관리 테이블
    db.run(`CREATE TABLE IF NOT EXISTS character_generations (
        id TEXT PRIMARY KEY,
        prompt TEXT NOT NULL,
        character_name TEXT,
        description TEXT,
        image_url TEXT,
        image_style TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ai_generated BOOLEAN DEFAULT 1
    )`);

    // 블로그 포스트 관리 테이블
    db.run(`CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        content TEXT,
        excerpt TEXT,
        author TEXT DEFAULT 'AI Assistant',
        status TEXT DEFAULT 'draft',
        tags TEXT,
        featured_image TEXT,
        meta_title TEXT,
        meta_description TEXT,
        view_count INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        published_at DATETIME,
        ai_generated BOOLEAN DEFAULT 0
    )`);

    // 자동 블로그 생성 기록 테이블
    db.run(`CREATE TABLE IF NOT EXISTS auto_blog_generations (
        id TEXT PRIMARY KEY,
        keyword TEXT NOT NULL,
        target_tokens INTEGER,
        blog_post_id TEXT,
        generation_status TEXT DEFAULT 'pending',
        generation_time REAL,
        cost_estimate REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (blog_post_id) REFERENCES blog_posts (id)
    )`);

    // Insert sample data if empty
    insertSampleData();
}

// Insert sample data
function insertSampleData() {
    // Check if products table is empty
    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (err) return;

        if (row.count === 0) {
            // Sample products
            const sampleProducts = [
                ['김치찌개', '완제품', '개', 15000, 5250],
                ['된장찌개', '완제품', '개', 12000, 4200],
                ['순대', '완제품', '개', 8000, 2800],
                ['배추김치', '원자재', 'kg', 3000, 1050],
                ['두부', '원자재', 'kg', 5000, 1750],
                ['파', '원자재', 'kg', 8000, 2800],
                ['된장', '원자재', 'kg', 2000, 700]
            ];

            const insertProduct = db.prepare("INSERT INTO products (name, category, unit, unit_price, cost) VALUES (?, ?, ?, ?, ?)");
            sampleProducts.forEach(product => {
                insertProduct.run(product);
            });
            insertProduct.finalize();

            // Sample inventory
            setTimeout(() => {
                const sampleInventory = [
                    [1, 45, 50, '냉장고 A'],
                    [2, 30, 40, '냉장고 A'],
                    [3, 15, 25, '냉장고 B'],
                    [4, 80, 100, '창고 1'],
                    [5, 5, 10, '창고 1']
                ];

                const insertInventory = db.prepare("INSERT INTO inventory (product_id, quantity, min_quantity, location) VALUES (?, ?, ?, ?)");
                sampleInventory.forEach(item => {
                    insertInventory.run(item);
                });
                insertInventory.finalize();
            }, 100);

            // Sample supplier
            db.run("INSERT INTO suppliers (name, contact_person, phone, email) VALUES (?, ?, ?, ?)",
                ['농산물 직판장', '김영업', '010-1234-5678', 'kim@email.com']);

            console.log('Sample data inserted successfully');
        }
    });
}

// API Routes

// Products
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products ORDER BY name", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/products', (req, res) => {
    const { name, category, unit, unit_price, cost } = req.body;

    db.run(
        "INSERT INTO products (name, category, unit, unit_price, cost) VALUES (?, ?, ?, ?, ?)",
        [name, category, unit, unit_price, cost],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Product created successfully' });
        }
    );
});

// Inventory
app.get('/api/inventory', (req, res) => {
    const query = `
        SELECT i.id, i.quantity, i.min_quantity, i.location, i.last_updated,
               p.name as product_name, p.unit, p.unit_price
        FROM inventory i
        JOIN products p ON i.product_id = p.id
        ORDER BY p.name
    `;

    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.put('/api/inventory/:id', (req, res) => {
    const { quantity, min_quantity, location } = req.body;
    const { id } = req.params;

    db.run(
        "UPDATE inventory SET quantity = ?, min_quantity = ?, location = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?",
        [quantity, min_quantity, location, id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Inventory item not found' });
                return;
            }
            res.json({ message: 'Inventory updated successfully' });
        }
    );
});

// Sales
app.get('/api/sales', (req, res) => {
    const { period } = req.query;
    let dateFilter = '';

    if (period === 'daily') {
        dateFilter = "WHERE DATE(order_date) = DATE('now', 'localtime')";
    } else if (period === 'weekly') {
        dateFilter = "WHERE order_date >= DATE('now', '-7 days', 'localtime')";
    } else if (period === 'monthly') {
        dateFilter = "WHERE order_date >= DATE('now', '-30 days', 'localtime')";
    }

    const query = `
        SELECT s.*,
               GROUP_CONCAT(p.name || ' x ' || si.quantity || '개') as items_list,
               GROUP_CONCAT(si.total) as items_total
        FROM sales s
        LEFT JOIN sales_items si ON s.id = si.sale_id
        LEFT JOIN products p ON si.product_id = p.id
        ${dateFilter}
        GROUP BY s.id
        ORDER BY s.order_date DESC
    `;

    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/sales', (req, res) => {
    const { customer_name, items, notes } = req.body;

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // Create sale record
        const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

        db.run(
            "INSERT INTO sales (customer_name, total_amount, notes) VALUES (?, ?, ?)",
            [customer_name, total_amount, notes],
            function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    res.status(500).json({ error: err.message });
                    return;
                }

                const saleId = this.lastID;

                // Create sale items
                const insertItem = db.prepare("INSERT INTO sales_items (sale_id, product_id, quantity, unit_price, total) VALUES (?, ?, ?, ?, ?)");

                items.forEach(item => {
                    insertItem.run([saleId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]);
                });

                insertItem.finalize((err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    db.run("COMMIT");
                    res.json({ id: saleId, message: 'Sale created successfully' });
                });
            }
        );
    });
});

// Production Orders
app.get('/api/production-orders', (req, res) => {
    const query = `
        SELECT po.*, p.name as product_name, p.unit
        FROM production_orders po
        JOIN products p ON po.product_id = p.id
        ORDER BY po.created_at DESC
    `;

    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/production-orders', (req, res) => {
    const { product_id, quantity, assigned_to, notes } = req.body;

    db.run(
        "INSERT INTO production_orders (product_id, quantity, assigned_to, notes) VALUES (?, ?, ?, ?)",
        [product_id, quantity, assigned_to, notes],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Production order created successfully' });
        }
    );
});

// Temperature Records
app.get('/api/temperature-records', (req, res) => {
    const { location, date } = req.query;
    let query = "SELECT * FROM temperature_records WHERE 1=1";
    const params = [];

    if (location) {
        query += " AND location = ?";
        params.push(location);
    }

    if (date) {
        query += " AND DATE(recorded_at) = ?";
        params.push(date);
    }

    query += " ORDER BY recorded_at DESC";

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/temperature-records', (req, res) => {
    const { location, temperature, notes } = req.body;

    db.run(
        "INSERT INTO temperature_records (location, temperature, notes) VALUES (?, ?, ?)",
        [location, temperature, notes],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'Temperature recorded successfully' });
        }
    );
});

// HACCP Records
app.get('/api/haccp-records', (req, res) => {
    const { date, check_type } = req.query;
    let query = "SELECT * FROM haccp_records WHERE 1=1";
    const params = [];

    if (date) {
        query += " AND DATE(recorded_at) = ?";
        params.push(date);
    }

    if (check_type) {
        query += " AND check_type = ?";
        params.push(check_type);
    }

    query += " ORDER BY recorded_at DESC";

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/haccp-records', (req, res) => {
    const { check_type, status, details, inspector } = req.body;

    db.run(
        "INSERT INTO haccp_records (check_type, status, details, inspector) VALUES (?, ?, ?, ?)",
        [check_type, status, details, inspector],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, message: 'HACCP record created successfully' });
        }
    );
});

const axios = require('axios');

// ... (기존 코드는 그대로 유지) ...

// AI Chat Processing
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    try {
        // Process the message and return appropriate response
        const response = await processChatMessage(message);
        res.json({ response });
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Dolibarr Sale/Purchase Functions (converted to JS with axios)
async function saveDolSale(data) {
    const apiKey = process.env.DOLIBARR_API_KEY;
    const baseUrl = process.env.DOLIBARR_URL;

    const payload = {
        ref: `SALE-${Date.now()}`,
        date: Math.floor(new Date(data.date).getTime() / 1000),
        array_lines: [{
            description: data.product,
            qty: data.quantity,
            subprice: data.price,
            total_ht: data.quantity * data.price,
            total_ttc: data.quantity * data.price * 1.1
        }]
    };

    const response = await axios.post(`${baseUrl}/api/index.php/orders`, payload, {
        headers: {
            'Content-Type': 'application/json',
            'DOLAPIKEY': apiKey
        }
    });

    return response.data;
}

async function saveDolPurchase(data) {
    const apiKey = process.env.DOLIBARR_API_KEY;
    const baseUrl = process.env.DOLIBARR_URL;

    const payload = {
        ref: `PUR-${Date.now()}`,
        date: Math.floor(new Date(data.date).getTime() / 1000),
        array_lines: [{
            description: data.product,
            qty: data.quantity,
            subprice: data.price,
            total_ht: data.quantity * data.price,
            total_ttc: data.quantity * data.price * 1.1
        }]
    };

    const response = await axios.post(`${baseUrl}/api/index.php/supplierorders`, payload, {
        headers: {
            'Content-Type': 'application/json',
            'DOLAPIKEY': apiKey
        }
    });

    return response.data;
}


// Enhanced AI analysis function placeholder
async function analyzeWithGLM(message) {
    console.log(`Analyzing message with GLM: ${message}`);
    // This is a placeholder. In a real implementation, this would call an AI API.
    if (message.includes('판매')) {
        // Example: "강원삼푸터에 김치찌개 500개 판매"
        const parts = message.split(' ');
        return {
            action: 'sale',
            data: {
                product: parts.find(p => p.includes('김치찌개')) || 'Unknown Product',
                quantity: parseInt(parts.find(p => !isNaN(parseInt(p)))) || 0,
                price: 10000, // Assuming a default price
                customer: parts[0],
                date: new Date().toISOString()
            }
        };
    } else if (message.includes('구매')) {
        const parts = message.split(' ');
        return {
            action: 'purchase',
            data: {
                product: parts.find(p => p.includes('김치')) || 'Unknown Product',
                quantity: parseInt(parts.find(p => !isNaN(parseInt(p)))) || 0,
                price: 5000, // Assuming a default price
                vendor: parts[0],
                date: new Date().toISOString()
            }
        };
    }
    return { action: 'none', data: {} };
}


async function processChatMessage(message) {
    // First, check for Dolibarr-related actions
    const aiResult = await analyzeWithGLM(message);
    
    if (aiResult.action === 'sale') {
        const result = await saveDolSale(aiResult.data);
        return `✅ 판매 등록 완료! Dolibarr 주문 ID: ${result}`;
    } else if (aiResult.action === 'purchase') {
        const result = await saveDolPurchase(aiResult.data);
        return `✅ 구매 등록 완료! Dolibarr 발주 ID: ${result}`;
    }

    // If not a Dolibarr action, proceed with existing logic
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('매출') && lowerMessage.includes('분석')) {
        return await getSalesAnalysis();
    } else if (lowerMessage.includes('재고') && lowerMessage.includes('현황')) {
        return await getInventoryStatus();
    } else if (lowerMessage.includes('생산') && lowerMessage.includes('지시')) {
        return await handleProductionRequest(message);
    } else if (lowerMessage.includes('위생') && lowerMessage.includes('점검')) {
        return await handleHealthCheck();
    } else if (lowerMessage.includes('온도') && lowerMessage.includes('기록')) {
        return await handleTemperatureRequest(message);
    } else {
        return `이해했습니다! "${message}" 작업을 처리하겠습니다. (Dolibarr 연동 없음)`;
    }
}

async function getSalesAnalysis() {
    return new Promise((resolve) => {
        db.all(`
            SELECT
                DATE(order_date) as date,
                COUNT(*) as orders,
                SUM(total_amount) as total_sales
            FROM sales
            WHERE DATE(order_date) >= DATE('now', '-7 days', 'localtime')
            GROUP BY DATE(order_date)
            ORDER BY date DESC
        `, (err, rows) => {
            if (err) {
                resolve('매출 데이터를 가져오는 중 오류가 발생했습니다.');
                return;
            }

            let response = '📊 지난 7일간 매출 현황입니다:\n\n';
            let totalSales = 0;
            let totalOrders = 0;

            rows.forEach(row => {
                response += `• ${row.date}: ${row.orders}건, ${(row.total_sales/10000).toFixed(1)}만원\n`;
                totalSales += row.total_sales;
                totalOrders += row.orders;
            });

            response += `\n📈 총매출: ${(totalSales/10000).toFixed(1)}만원`;
            response += `\n📦 총 주문: ${totalOrders}건`;
            response += `\n💰 평균 객단가: ${Math.round(totalSales/totalOrders).toLocaleString()}원`;

            resolve(response);
        });
    });
}

async function getInventoryStatus() {
    return new Promise((resolve) => {
        const query = `
            SELECT i.quantity, i.min_quantity, p.name, p.unit
            FROM inventory i
            JOIN products p ON i.product_id = p.id
        `;

        db.all(query, (err, rows) => {
            if (err) {
                resolve('재고 데이터를 가져오는 중 오류가 발생했습니다.');
                return;
            }

            let response = '📦 현재 재고 현황입니다:\n\n';
            let lowStockCount = 0;

            rows.forEach(row => {
                const percentage = (row.quantity / row.min_quantity * 100).toFixed(0);
                const status = percentage < 50 ? '🔴 부족' : percentage < 80 ? '🟡 주의' : '🟢 정상';
                response += `• ${row.name}: ${row.quantity}/${row.min_quantity}${row.unit} (${percentage}%) ${status}\n`;

                if (percentage < 80) lowStockCount++;
            });

            if (lowStockCount > 0) {
                response += `\n⚠️ ${lowStockCount}개 품목의 재고가 부족합니다. 발주가 필요합니다.`;
            } else {
                response += '\n✅ 모든 재고가 정상 수준입니다.';
            }

            resolve(response);
        });
    });
}

async function handleProductionRequest(message) {
    // Extract product and quantity from message
    const match = message.match(/(.+)\s+(\d+)개/);
    if (!match) {
        return '🏭 생산 지시 형식: "제품명 수량개" (예: 김치찌개 100개)';
    }

    const [, product, quantity] = match;

    return new Promise((resolve) => {
        db.get("SELECT id FROM products WHERE name LIKE ?", [`${product}%`], (err, row) => {
            if (err || !row) {
                resolve(`❌ "${product}" 제품을 찾을 수 없습니다.`);
                return;
            }

            const productionOrder = {
                product_id: row.id,
                quantity: parseInt(quantity),
                assigned_to: 'AI 담당자',
                status: 'pending'
            };

            db.run(
                "INSERT INTO production_orders (product_id, quantity, assigned_to, status) VALUES (?, ?, ?, ?)",
                [productionOrder.product_id, productionOrder.quantity, productionOrder.assigned_to, productionOrder.status],
                function(err) {
                    if (err) {
                        resolve('생산 지시 생성 중 오류가 발생했습니다.');
                        return;
                    }

                    resolve(`✅ ${product} ${quantity}개 생산 지시가 생성되었습니다.\n지시 번호: #${this.lastID}\n담당자: ${productionOrder.assigned_to}\n상태: ${productionOrder.status}`);
                }
            );
        });
    });
}

async function handleHealthCheck() {
    return new Promise((resolve) => {
        const today = new Date().toISOString().split('T')[0];

        db.all(`
            SELECT check_type, status, details
            FROM haccp_records
            WHERE DATE(recorded_at) = ?
            ORDER BY recorded_at DESC
        `, [today], (err, rows) => {
            if (err) {
                resolve('위생점검 기록을 가져오는 중 오류가 발생했습니다.');
                return;
            }

            if (rows.length === 0) {
                resolve('🛡️ 오늘 위생점검 기록이 없습니다. 점검을 시작해주세요.');
                return;
            }

            let response = '🛡️ 오늘 위생점검 현황:\n\n';
            let allGood = true;

            rows.forEach(row => {
                const status = row.status === '양호' ? '✅' : '⚠️';
                response += `${status} ${row.check_type}: ${row.details}\n`;
                if (row.status !== '양호') allGood = false;
            });

            if (allGood) {
                response += '\n✅ 모든 점검 항목이 정상입니다.';
            } else {
                response += '\n⚠️ 일부 항목에 주의가 필요합니다.';
            }

            resolve(response);
        });
    });
}

async function handleTemperatureRequest(message) {
    // Extract temperature from message
    const match = message.match(/(\d+\.?\d*)도/);
    if (!match) {
        return '🌡️ 온도 기록 형식: "온도도" (예: 4도, -18도)';
    }

    const temperature = parseFloat(match[1]);

    return new Promise((resolve) => {
        const location = '냉장고 A'; // Default location

        db.run(
            "INSERT INTO temperature_records (location, temperature, notes) VALUES (?, ?, ?)",
            [location, temperature, 'AI 경리봇 자동 기록'],
            function(err) {
                if (err) {
                    resolve('온도 기록 중 오류가 발생했습니다.');
                    return;
                }

                const status = temperature >= 0 && temperature <= 10 ? '✅ 정상' : '⚠️ 이상';
                resolve(`🌡️ 온도 기록 완료:\n• 위치: ${location}\n• 온도: ${temperature}°C ${status}\n• 시간: ${new Date().toLocaleTimeString()}`);
            }
        );
    });
}

// File upload for invoice/image processing
app.post('/api/upload-invoice', upload.single('invoice'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Here you would implement OCR or image processing
    // For now, just return file info
    res.json({
        message: 'Invoice uploaded successfully',
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
    });
});

const { exec } = require('child_process');

// ... (기존 코드) ...

// Cron Job for Auto-Blog
app.get('/api/cron/auto-blog', (req, res) => {
    const token = req.query.token;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || token !== cronSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Execute the TypeScript cron job script using ts-node
    exec('ts-node ./api/cron/auto-blog.ts', (error, stdout, stderr) => {
        if (error) {
            console.error(`Cron job execution error: ${error.message}`);
            return res.status(500).json({ error: 'Cron job failed', details: stderr });
        }
        console.log(`Cron job output: ${stdout}`);
        res.status(200).json({ success: true, message: 'Cron job executed successfully', output: stdout });
    });
});


// Analytics endpoints
app.get('/api/analytics/dashboard', (req, res) => {
    const analytics = {};

    // Get today's sales
    db.get("SELECT COUNT(*) as orders, COALESCE(SUM(total_amount), 0) as sales FROM sales WHERE DATE(order_date) = DATE('now', 'localtime')", (err, todaySales) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        analytics.today = todaySales;

        // Get low stock items
        db.all(`
            SELECT p.name, i.quantity, i.min_quantity, (i.quantity * 100.0 / i.min_quantity) as percentage
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            WHERE i.quantity < i.min_quantity
            ORDER BY percentage ASC
        `, (err, lowStock) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            analytics.lowStock = lowStock;

            // Get pending production orders
            db.get("SELECT COUNT(*) as count FROM production_orders WHERE status = 'pending'", (err, pendingProduction) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                analytics.pendingProduction = pendingProduction;

                res.json(analytics);
            });
        });
    });
});

// AI 쇼츠 생성 API
app.post('/api/shorts/generate', upload.single('protagonistImage'), async (req, res) => {
    try {
        const { mode, input, duration, sceneCount, imageStyle, ttsVoice, ttsSpeed } = req.body;

        if (!input || !input.trim()) {
            return res.status(400).json({ error: '입력 내용이 필요합니다.' });
        }

        console.log('🎬 쇼츠 생성 시작:', { mode, input, duration, sceneCount });

        // 쇼츠 대본 생성
        const script = await generateShortsScript(mode, input, duration, sceneCount);

        // 음성 파일 생성 (데모에서는 URL만 반환)
        const audioUrl = await generateShortsAudio(script, ttsVoice, ttsSpeed);

        // 장면 이미지 생성
        const images = await generateSceneImages(script, sceneCount, imageStyle, req.file);

        // 결과 저장
        const shortsId = uuidv4();
        await saveShortsResult(shortsId, {
            mode,
            input,
            duration,
            sceneCount,
            imageStyle,
            script,
            audioUrl,
            images,
            createdAt: new Date().toISOString()
        });

        res.json({
            success: true,
            id: shortsId,
            script,
            audioUrl,
            images,
            totalScenes: parseInt(sceneCount),
            successfulImages: images.length
        });

    } catch (error) {
        console.error('쇼츠 생성 오류:', error);
        res.status(500).json({ error: '쇼츠 생성 중 오류가 발생했습니다.' });
    }
});

// 입력 개선 API
app.post('/api/shorts/improve', async (req, res) => {
    try {
        const { input, mode } = req.body;

        if (!input || !input.trim()) {
            return res.status(400).json({ error: '입력 내용이 필요합니다.' });
        }

        // AI를 통한 입력 개선 (데모)
        const improved = await improveShortsInput(input, mode);

        res.json({ improved });

    } catch (error) {
        console.error('입력 개선 오류:', error);
        res.status(500).json({ error: '입력 개선 중 오류가 발생했습니다.' });
    }
});

// 이미지 재생성 API
app.post('/api/shorts/regenerate', async (req, res) => {
    try {
        const { shortsId, sceneIndex, imageStyle } = req.body;

        // 해당 장면 이미지 재생성
        const newImageUrl = await regenerateSceneImage(sceneIndex, imageStyle);

        res.json({ imageUrl: newImageUrl, sceneIndex });

    } catch (error) {
        console.error('이미지 재생성 오류:', error);
        res.status(500).json({ error: '이미지 재생성 중 오류가 발생했습니다.' });
    }
});

// 쇼츠 생성 결과 조회 API
app.get('/api/shorts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getShortsResult(id);

        if (!result) {
            return res.status(404).json({ error: '쇼츠 생성 결과를 찾을 수 없습니다.' });
        }

        res.json(result);

    } catch (error) {
        console.error('쇼츠 결과 조회 오류:', error);
        res.status(500).json({ error: '쇼츠 결과 조회 중 오류가 발생했습니다.' });
    }
});

// 쇼츠 생성 목록 API
app.get('/api/shorts', async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const results = await getShortsList(parseInt(limit), parseInt(offset));

        res.json(results);

    } catch (error) {
        console.error('쇼츠 목록 조회 오류:', error);
        res.status(500).json({ error: '쇼츠 목록 조회 중 오류가 발생했습니다.' });
    }
});

// 쇼츠 관련 헬퍼 함수
async function generateShortsScript(mode, input, duration, sceneCount) {
    // AI를 통한 쇼츠 대본 생성 (데모)
    const scriptTemplate = `[장면 1]
안녕하세요! 오늘은 ${input}에 대한 특별한 이야기를 들려드릴게요.

[장면 2]
많은 분들이 궁금해하는 ${input}의 매력을 지금부터 공개합니다!

[장면 3]
이런 멋진 경험과 감동을 놓치지 마세요.

[장면 4]
직접 확인하고 체험해보시면 분명 만족하실 거예요.

[장면 5]
여러분의 소중한 시간을 위해 준비했습니다. 감사합니다!`;

    return scriptTemplate;
}

async function generateShortsAudio(script, voice, speed) {
    // TTS를 통한 음성 생성 (데모에서는 URL만 반환)
    return `/api/audio/preview/${uuidv4()}.wav`;
}

async function generateSceneImages(script, sceneCount, style, protagonistImage) {
    const images = [];

    for (let i = 0; i < parseInt(sceneCount); i++) {
        // AI 이미지 생성 (데모에서는 샘플 이미지 URL 사용)
        const imageUrl = `https://picsum.photos/seed/scene${Date.now()}_${i}/400/600.jpg`;
        images.push({
            sceneNumber: i + 1,
            imageUrl: imageUrl,
            prompt: `${input} - 장면 ${i + 1}, ${style} 스타일`
        });
    }

    return images;
}

async function improveShortsInput(input, mode) {
    // AI를 통한 입력 개선 (데모)
    const improvements = [
        '더 흥미롭고 구체적인 내용으로',
        '시청자의 호기심을 자극하는',
        '시각적으로 표현하기 좋은',
        '트렌디한 요소를 추가한'
    ];

    const randomImprovement = improvements[Math.floor(Math.random() * improvements.length)];
    return `${randomImprovement} ${input}`;
}

async function regenerateSceneImage(sceneIndex, imageStyle) {
    // 새로운 이미지 생성
    return `https://picsum.photos/seed/regen_${Date.now()}_${sceneIndex}/400/600.jpg`;
}

async function saveShortsResult(id, result) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO shorts_videos (
                id, title, description, script_content, video_url,
                thumbnail_url, status, platform, tags, created_at,
                ai_generated, duration, scene_count, image_style
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            `쇼츠: ${result.input}`,
            result.mode === 'keyword' ? `키워드: ${result.input}` : result.input,
            result.script,
            result.audioUrl,
            result.images[0]?.imageUrl || '',
            'completed',
            'shorts',
            JSON.stringify([result.input]),
            result.createdAt,
            1,
            result.duration,
            result.sceneCount,
            result.imageStyle
        ], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

async function getShortsResult(id) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM shorts_videos WHERE id = ?
        `, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function getShortsList(limit, offset) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT id, title, description, thumbnail_url, view_count,
                   like_count, share_count, created_at, status
            FROM shorts_videos
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// AI 장면 생성기 API
app.post('/api/generate', upload.fields([{ name: 'protagonistImage', maxCount: 1 }, { name: 'supportingImage', maxCount: 1 }]), async (req, res) => {
    try {
        const { storyPrompt, sceneCount, aspectRatio, imageStyle, mood } = req.body;
        const protagonistImage = req.files?.protagonistImage?.[0];
        const supportingImage = req.files?.supportingImage?.[0];

        if (!storyPrompt || !storyPrompt.trim()) {
            return res.status(400).json({ error: '스토리 프롬프트가 필요합니다.' });
        }

        console.log('📖 장면 생성 시작:', { storyPrompt, sceneCount, aspectRatio });

        // 스토리 장면 생성
        const scenes = await generateStoryScenes({
            storyPrompt,
            sceneCount: parseInt(sceneCount) || 12,
            aspectRatio,
            imageStyle,
            mood,
            protagonistImage,
            supportingImage
        });

        // 결과 저장
        const storyId = uuidv4();
        await saveStoryResult(storyId, {
            storyPrompt,
            sceneCount,
            aspectRatio,
            imageStyle,
            mood,
            scenes,
            createdAt: new Date().toISOString()
        });

        res.json({
            success: true,
            id: storyId,
            scenes,
            totalScenes: scenes.length
        });

    } catch (error) {
        console.error('장면 생성 오류:', error);
        res.status(500).json({ error: '장면 생성 중 오류가 발생했습니다.' });
    }
});

// 장면 재생성 API
app.post('/api/generate/regenerate', async (req, res) => {
    try {
        const { storyId, sceneIndex, storyPrompt, imageStyle, mood } = req.body;

        // 특정 장면 재생성
        const newImageUrl = await regenerateStoryScene(sceneIndex, storyPrompt, imageStyle, mood);

        res.json({ imageUrl: newImageUrl, sceneIndex });

    } catch (error) {
        console.error('장면 재생성 오류:', error);
        res.status(500).json({ error: '장면 재생성 중 오류가 발생했습니다.' });
    }
});

// 스토리 생성 결과 조회 API
app.get('/api/story/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getStoryResult(id);

        if (!result) {
            return res.status(404).json({ error: '스토리 생성 결과를 찾을 수 없습니다.' });
        }

        res.json(result);

    } catch (error) {
        console.error('스토리 결과 조회 오류:', error);
        res.status(500).json({ error: '스토리 결과 조회 중 오류가 발생했습니다.' });
    }
});

// 장면 생성기 헬퍼 함수
async function generateStoryScenes(params) {
    const scenes = [];
    const { storyPrompt, sceneCount, aspectRatio, imageStyle, mood } = params;

    // 스토리 구조 생성
    const storyStructure = generateStoryStructure(storyPrompt, sceneCount);

    for (let i = 0; i < sceneCount; i++) {
        const scene = {
            number: i + 1,
            title: storyStructure[i].title,
            description: storyStructure[i].description,
            imageUrl: `https://picsum.photos/seed/story_${Date.now()}_${i}/400/600.jpg`,
            prompt: `${storyPrompt} - 장면 ${i + 1}: ${storyStructure[i].title}, ${imageStyle} 스타일, ${mood} 분위기`,
            aspectRatio,
            imageStyle,
            mood
        };

        // AI 이미지 생성 시뮬레이션 (실제로는 AI API 호출)
        await new Promise(resolve => setTimeout(resolve, 500)); // 생성 시간 시뮬레이션

        scenes.push(scene);
    }

    return scenes;
}

function generateStoryStructure(prompt, sceneCount) {
    // 기본 스토리 구조 생성
    const structures = {
        8: [
            { title: '도입', description: '이야기의 시작, 주인공 소개' },
            { title: '문제 제시', description: '주인공이 마주한 문제' },
            { title: '갈등 심화', description: '문제가 더 복잡해짐' },
            { title: '전환점', description: '상황이 바뀌는 중요한 순간' },
            { title: '고난', description: '가장 힘든 시련' },
            { title: '해결의 실마리', description: '문제 해결의 단서' },
            { title: '클라이맥스', description: '이야기의 절정' },
            { title: '결말', description: '이야기의 마무리' }
        ],
        12: [
            { title: '평온한 일상', description: '이야기 시작 전의 평화로운 모습' },
            { title: '사건 발생', description: '이야기를 움직이는 첫 번째 사건' },
            { title: '호기심', description: '주인공의 관심과 탐구 시작' },
            { title: '첫 번째 장애물', description: '주인공이 맞닥뜨린 첫 번째 어려움' },
            { title: '조력자 등장', description: '도움을 주는 인물의 등장' },
            { title: '새로운 발견', description: '중요한 정보나 단서 발견' },
            { title: '배신이나 위기', description: '예상치 못한 위기 상황' },
            { title: '희망의 빛', description: '어두운 상황 속 희망 발견' },
            { title: '마지막 준비', description: '결전을 위한 준비' },
            { title: '클라이맥스', description: '이야기의 가장 절정된 순간' },
            { title: '결과', description: '클라이맥스의 결과' },
            { title: '새로운 시작', description: '변화된 삶의 시작' }
        ],
        16: [
            { title: '서장: 평화', description: '모든 것이 평화로운 시작' },
            { title: '전조', description: '변화가 올 것을 암시' },
            { title: '첫 번째 균열', description: '평온이 깨지기 시작' },
            { title: '작은 사건', description: '크지 않은 중요한 사건' },
            { title: '호기심 발동', description: '주인공의 적극적인 탐색 시작' },
            { title: '첫 번째 단서', description: '문제 해결의 첫 단서' },
            { title: '미궁', description: '더 복잡해진 상황' },
            { title: '동맹', description: '함께하는 사람들의 등장' },
            { title: '첫 번째 실패', description: '첫 번째 시도의 실패' },
            { title: '재기', description: '실패 후 다시 일어서는 모습' },
            { title: '핵심 진실', description: '가장 중요한 사실 발견' },
            { title: '최후의 선택', description: '가장 중요한 선택의 순간' },
            { title: '대결', description: '최종적인 대결이나 대면' },
            { title: '희생', description: '무언가를 포기하는 순간' },
            { title: '승리', description: '목표 달성의 순간' },
            { title: '새로운 여정', description: '끝이자 새로운 시작' }
        ]
    };

    return structures[sceneCount] || structures[12];
}

async function regenerateStoryScene(sceneIndex, storyPrompt, imageStyle, mood) {
    // 새로운 장면 이미지 생성
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `https://picsum.photos/seed/regen_story_${Date.now()}_${sceneIndex}/400/600.jpg`;
}

async function saveStoryResult(id, result) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO story_generations (
                id, story_prompt, scene_count, aspect_ratio, image_style, mood,
                scenes_data, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            result.storyPrompt,
            result.sceneCount,
            result.aspectRatio,
            result.imageStyle,
            result.mood,
            JSON.stringify(result.scenes),
            result.createdAt
        ], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

async function getStoryResult(id) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM story_generations WHERE id = ?
        `, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// AI 캐릭터 생성기 API
app.post('/api/character', upload.single('referenceImage'), async (req, res) => {
    try {
        const { prompt, characterName, imageStyle, imageRatio, quality, tags } = req.body;
        const referenceImage = req.file;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ error: '캐릭터 설명이 필요합니다.' });
        }

        console.log('👤 캐릭터 생성 시작:', { prompt, characterName, imageStyle });

        // 캐릭터 이미지 생성
        const character = await generateCharacterImage({
            prompt: prompt.trim(),
            characterName: characterName?.trim() || 'AI 생성 캐릭터',
            imageStyle: imageStyle || 'realistic',
            imageRatio: imageRatio || '1:1',
            quality: quality || 'standard',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            referenceImage
        });

        // 결과 저장
        const characterId = uuidv4();
        await saveCharacterResult(characterId, character);

        res.json({
            success: true,
            id: characterId,
            ...character
        });

    } catch (error) {
        console.error('캐릭터 생성 오류:', error);
        res.status(500).json({ error: '캐릭터 생성 중 오류가 발생했습니다.' });
    }
});

// 캐릭터 생성 히스토리 API
app.get('/api/character/history', async (req, res) => {
    try {
        const { limit = 12, offset = 0 } = req.query;
        const history = await getCharacterHistory(parseInt(limit), parseInt(offset));

        res.json(history);

    } catch (error) {
        console.error('캐릭터 히스토리 조회 오류:', error);
        res.status(500).json({ error: '캐릭터 히스토리 조회 중 오류가 발생했습니다.' });
    }
});

// 캐릭터 상세 조회 API
app.get('/api/character/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const character = await getCharacterById(id);

        if (!character) {
            return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
        }

        res.json(character);

    } catch (error) {
        console.error('캐릭터 조회 오류:', error);
        res.status(500).json({ error: '캐릭터 조회 중 오류가 발생했습니다.' });
    }
});

// 캐릭터 삭제 API
app.delete('/api/character/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await deleteCharacter(id);

        res.json({ success: true, message: '캐릭터가 삭제되었습니다.' });

    } catch (error) {
        console.error('캐릭터 삭제 오류:', error);
        res.status(500).json({ error: '캐릭터 삭제 중 오류가 발생했습니다.' });
    }
});

// 캐릭터 생성기 헬퍼 함수
async function generateCharacterImage(params) {
    const { prompt, characterName, imageStyle, imageRatio, quality, tags } = params;

    // AI 이미지 생성 시뮬레이션 (실제로는 AI API 호출)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 이미지 URL 생성 (데모)
    const imageUrl = `https://picsum.photos/seed/character_${Date.now()}/500/500.jpg`;

    return {
        name: characterName,
        description: prompt,
        imageUrl: imageUrl,
        imageStyle: imageStyle,
        imageRatio: imageRatio,
        quality: quality,
        tags: tags,
        createdAt: new Date().toISOString()
    };
}

async function saveCharacterResult(id, character) {
    return new Promise((resolve, reject) => {
        db.run(`
            INSERT INTO character_generations (
                id, prompt, character_name, description, image_url, image_style,
                tags, created_at, ai_generated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            character.description,
            character.name,
            character.description,
            character.imageUrl,
            character.imageStyle,
            JSON.stringify(character.tags),
            character.createdAt,
            1
        ], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
}

async function getCharacterHistory(limit, offset) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT id, character_name, description, image_url, image_style, tags, created_at
            FROM character_generations
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset], (err, rows) => {
            if (err) reject(err);
            else {
                // tags JSON을 파싱
                const processedRows = rows.map(row => ({
                    ...row,
                    tags: JSON.parse(row.tags || '[]')
                }));
                resolve(processedRows);
            }
        });
    });
}

async function getCharacterById(id) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT * FROM character_generations WHERE id = ?
        `, [id], (err, row) => {
            if (err) reject(err);
            else if (row) {
                // tags JSON을 파싱
                resolve({
                    ...row,
                    tags: JSON.parse(row.tags || '[]')
                });
            } else {
                resolve(null);
            }
        });
    });
}

async function deleteCharacter(id) {
    return new Promise((resolve, reject) => {
        db.run(`
            DELETE FROM character_generations WHERE id = ?
        `, [id], function(err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

// Start server
initializeDatabase();

app.listen(PORT, () => {
    console.log(`🚀 AI Assistant Backend Server running on port ${PORT}`);
    console.log(`🌐 API available at http://localhost:${PORT}`);
    console.log(`📁 Database: ${process.env.DB_PATH}`);
    console.log(`🎬 쇼츠 생성 API: /api/shorts/*`);
});