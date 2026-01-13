-- =====================================================
-- SAMPLE PRODUCTS DATA
-- Kids Fashion E-commerce
-- =====================================================

-- Insert sizes
INSERT INTO sizes (name, sort_order) VALUES 
    ('3M', 1), ('6M', 2), ('9M', 3), ('12M', 4), ('18M', 5), ('24M', 6),
    ('2T', 7), ('3T', 8), ('4T', 9), ('5T', 10),
    ('XS', 11), ('S', 12), ('M', 13), ('L', 14), ('XL', 15)
ON CONFLICT DO NOTHING;

-- Insert colors
INSERT INTO colors (name, hex_code, sort_order) VALUES 
    ('Trắng', '#FFFFFF', 1),
    ('Đen', '#000000', 2),
    ('Xanh navy', '#1E3A5F', 3),
    ('Xanh dương', '#3B82F6', 4),
    ('Hồng', '#EC4899', 5),
    ('Đỏ', '#EF4444', 6),
    ('Vàng', '#F59E0B', 7),
    ('Xanh lá', '#22C55E', 8),
    ('Tím', '#8B5CF6', 9),
    ('Xám', '#6B7280', 10),
    ('Be', '#D4B896', 11),
    ('Cam', '#F97316', 12)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PRODUCTS
-- =====================================================

-- Product 1: Áo thun bé trai
INSERT INTO products (sku, name, slug, short_description, description, base_price, sale_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'TS-BOY-001',
    'Áo Thun Cotton Bé Trai In Hình Khủng Long',
    'ao-thun-cotton-be-trai-khung-long',
    'Áo thun cotton mềm mại với hình in khủng long dễ thương',
    'Áo thun cotton 100% cao cấp, mềm mại và thoáng mát. Thiết kế với hình in khủng long sống động, phù hợp cho bé trai năng động. Chất liệu thấm hút mồ hôi tốt, an toàn cho làn da nhạy cảm của trẻ.',
    250000, 199000,
    (SELECT id FROM brands WHERE slug = 'carters'),
    'BOY', 2, 8, 'Cotton 100%', 'ACTIVE', true, 150
);

-- Product 2: Váy bé gái
INSERT INTO products (sku, name, slug, short_description, description, base_price, sale_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'DR-GIRL-001',
    'Váy Hoa Nhí Bé Gái Phong Cách Hàn Quốc',
    'vay-hoa-nhi-be-gai-han-quoc',
    'Váy hoa nhí xinh xắn theo phong cách Hàn Quốc',
    'Váy hoa nhí dành cho bé gái với thiết kế phong cách Hàn Quốc hiện đại. Chất liệu vải cotton pha, mềm mại và thoáng mát. Phù hợp cho các dịp đi chơi, dự tiệc.',
    350000, 280000,
    (SELECT id FROM brands WHERE slug = 'zara-kids'),
    'GIRL', 2, 10, 'Cotton Blend', 'ACTIVE', true, 230
);

-- Product 3: Set đồ bé sơ sinh
INSERT INTO products (sku, name, slug, short_description, description, base_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'SET-BABY-001',
    'Set 3 Body Suit Bé Sơ Sinh Organic Cotton',
    'set-body-suit-so-sinh-organic',
    'Bộ 3 body suit chất liệu organic cotton an toàn cho bé',
    'Set 3 body suit dành cho bé sơ sinh với chất liệu organic cotton 100%, đạt chứng nhận GOTS. An toàn tuyệt đối cho làn da nhạy cảm của bé. Thiết kế cài nút bấm tiện lợi.',
    450000,
    (SELECT id FROM brands WHERE slug = 'carters'),
    'UNISEX', 0, 1, 'Organic Cotton', 'ACTIVE', true, 320
);

-- Product 4: Quần jean bé trai
INSERT INTO products (sku, name, slug, short_description, description, base_price, sale_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'JN-BOY-001',
    'Quần Jean Bé Trai Dáng Slim Fit',
    'quan-jean-be-trai-slim-fit',
    'Quần jean dáng slim fit thời trang cho bé trai',
    'Quần jean cao cấp với thiết kế slim fit hiện đại. Chất liệu denim co giãn thoải mái, dễ vận động. Đường may chắc chắn, bền đẹp theo thời gian.',
    380000, 299000,
    (SELECT id FROM brands WHERE slug = 'hm-kids'),
    'BOY', 3, 12, 'Denim Stretch', 'ACTIVE', true, 180
);

-- Product 5: Áo khoác bé gái
INSERT INTO products (sku, name, slug, short_description, description, base_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'JK-GIRL-001',
    'Áo Khoác Lông Cừu Bé Gái Màu Pastel',
    'ao-khoac-long-cuu-be-gai-pastel',
    'Áo khoác lông cừu ấm áp với tông màu pastel dịu dàng',
    'Áo khoác lông cừu cao cấp, siêu mềm mịn và ấm áp. Màu pastel thanh lịch phù hợp với nhiều trang phục. Thiết kế có mũ trùm đáng yêu.',
    550000,
    (SELECT id FROM brands WHERE slug = 'zara-kids'),
    'GIRL', 2, 8, 'Fleece', 'ACTIVE', true, 95
);

-- Product 6: Áo len bé trai
INSERT INTO products (sku, name, slug, short_description, description, base_price, sale_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'SW-BOY-001',
    'Áo Len Bé Trai Họa Tiết Gấu',
    'ao-len-be-trai-hoa-tiet-gau',
    'Áo len ấm áp với họa tiết gấu dễ thương',
    'Áo len cotton pha wool mềm mại, giữ ấm tốt mà không gây ngứa. Họa tiết gấu đáng yêu được dệt tinh xảo. Phù hợp cho mùa thu đông.',
    420000, 350000,
    (SELECT id FROM brands WHERE slug = 'uniqlo-kids'),
    'BOY', 2, 10, 'Cotton Wool Blend', 'ACTIVE', false, 75
);

-- Product 7: Đầm công chúa
INSERT INTO products (sku, name, slug, short_description, description, base_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'DR-GIRL-002',
    'Đầm Công Chúa Bé Gái Dự Tiệc',
    'dam-cong-chua-be-gai-du-tiec',
    'Đầm công chúa lộng lẫy cho các dịp đặc biệt',
    'Đầm công chúa với thiết kế sang trọng, lộng lẫy. Chất liệu satin cao cấp kết hợp voan mềm mại. Phù hợp cho các dịp sinh nhật, tiệc cưới, lễ hội.',
    680000,
    (SELECT id FROM brands WHERE slug = 'zara-kids'),
    'GIRL', 3, 10, 'Satin & Tulle', 'ACTIVE', true, 420
);

-- Product 8: Quần short bé trai
INSERT INTO products (sku, name, slug, short_description, description, base_price, sale_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'SH-BOY-001',
    'Quần Short Thể Thao Bé Trai',
    'quan-short-the-thao-be-trai',
    'Quần short thể thao thoáng mát cho bé năng động',
    'Quần short thể thao với chất liệu polyester thấm hút, nhanh khô. Thiết kế có dây rút điều chỉnh. Phù hợp cho hoạt động thể thao và vui chơi ngoài trời.',
    220000, 175000,
    (SELECT id FROM brands WHERE slug = 'hm-kids'),
    'BOY', 3, 12, 'Polyester', 'ACTIVE', false, 88
);

-- Product 9: Pyjama bé gái
INSERT INTO products (sku, name, slug, short_description, description, base_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'PJ-GIRL-001',
    'Bộ Pyjama Bé Gái Họa Tiết Unicorn',
    'bo-pyjama-be-gai-unicorn',
    'Bộ pyjama mềm mại với họa tiết unicorn đáng yêu',
    'Bộ pyjama cotton 100% mềm mại, thoáng mát cho giấc ngủ ngon. Họa tiết unicorn sinh động, màu sắc tươi sáng. Đường may tỉ mỉ, không gây kích ứng da.',
    320000,
    (SELECT id FROM brands WHERE slug = 'carters'),
    'GIRL', 2, 10, 'Cotton 100%', 'ACTIVE', false, 156
);

-- Product 10: Áo polo bé trai
INSERT INTO products (sku, name, slug, short_description, description, base_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'PL-BOY-001',
    'Áo Polo Bé Trai Classic',
    'ao-polo-be-trai-classic',
    'Áo polo cổ điển thanh lịch cho bé trai',
    'Áo polo với thiết kế cổ điển, thanh lịch. Chất liệu cotton pique cao cấp, thoáng mát và bền màu. Phù hợp cho nhiều dịp từ đi học đến dự tiệc.',
    280000,
    (SELECT id FROM brands WHERE slug = 'babygap'),
    'BOY', 3, 12, 'Cotton Pique', 'ACTIVE', false, 92
);

-- Product 11: Legging bé gái
INSERT INTO products (sku, name, slug, short_description, description, base_price, sale_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'LG-GIRL-001',
    'Quần Legging Bé Gái In Hình',
    'quan-legging-be-gai-in-hinh',
    'Quần legging co giãn với hình in sống động',
    'Quần legging với chất liệu cotton spandex co giãn 4 chiều, thoải mái vận động. Hình in sắc nét, bền màu sau nhiều lần giặt.',
    180000, 145000,
    (SELECT id FROM brands WHERE slug = 'hm-kids'),
    'GIRL', 2, 10, 'Cotton Spandex', 'ACTIVE', false, 210
);

-- Product 12: Set quần áo sơ sinh
INSERT INTO products (sku, name, slug, short_description, description, base_price, brand_id, gender, age_min, age_max, material, status, is_featured, view_count)
VALUES (
    'SET-BABY-002',
    'Set Quần Áo Sơ Sinh 5 Món',
    'set-quan-ao-so-sinh-5-mon',
    'Trọn bộ 5 món thiết yếu cho bé sơ sinh',
    'Set 5 món bao gồm: 2 body suit, 1 quần dài, 1 mũ và 1 yếm. Chất liệu cotton mềm mại, an toàn cho da bé. Màu sắc nhẹ nhàng, phù hợp làm quà tặng.',
    580000,
    (SELECT id FROM brands WHERE slug = 'carters'),
    'UNISEX', 0, 1, 'Cotton 100%', 'ACTIVE', true, 380
);

-- =====================================================
-- PRODUCT CATEGORIES (Many-to-Many)
-- =====================================================

-- Áo thun bé trai -> Boys, Tops, T-Shirts
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'ao-thun-cotton-be-trai-khung-long' AND c.slug IN ('boys', 'tops', 't-shirts');

-- Váy bé gái -> Girls, Dresses
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'vay-hoa-nhi-be-gai-han-quoc' AND c.slug IN ('girls', 'dresses');

-- Set sơ sinh -> Baby
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'set-body-suit-so-sinh-organic' AND c.slug = 'baby';

-- Quần jean -> Boys, Bottoms, Jeans
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'quan-jean-be-trai-slim-fit' AND c.slug IN ('boys', 'bottoms', 'jeans');

-- Áo khoác bé gái -> Girls, Tops
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'ao-khoac-long-cuu-be-gai-pastel' AND c.slug IN ('girls', 'tops');

-- Áo len bé trai -> Boys, Tops, Sweaters
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'ao-len-be-trai-hoa-tiet-gau' AND c.slug IN ('boys', 'tops', 'sweaters');

-- Đầm công chúa -> Girls, Dresses
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'dam-cong-chua-be-gai-du-tiec' AND c.slug IN ('girls', 'dresses');

-- Quần short -> Boys, Bottoms, Shorts
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'quan-short-the-thao-be-trai' AND c.slug IN ('boys', 'bottoms', 'shorts');

-- Pyjama -> Girls
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'bo-pyjama-be-gai-unicorn' AND c.slug = 'girls';

-- Polo -> Boys, Tops, Shirts
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'ao-polo-be-trai-classic' AND c.slug IN ('boys', 'tops', 'shirts');

-- Legging -> Girls, Bottoms
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'quan-legging-be-gai-in-hinh' AND c.slug IN ('girls', 'bottoms');

-- Set sơ sinh 5 món -> Baby
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id FROM products p, categories c 
WHERE p.slug = 'set-quan-ao-so-sinh-5-mon' AND c.slug = 'baby';

-- =====================================================
-- PRODUCT IMAGES
-- =====================================================

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
-- Áo thun bé trai
((SELECT id FROM products WHERE slug = 'ao-thun-cotton-be-trai-khung-long'), 
'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=800&fit=crop', 'Áo thun khủng long - Mặt trước', 1, true),
((SELECT id FROM products WHERE slug = 'ao-thun-cotton-be-trai-khung-long'), 
'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&h=800&fit=crop', 'Áo thun khủng long - Mặt sau', 2, false),

-- Váy bé gái
((SELECT id FROM products WHERE slug = 'vay-hoa-nhi-be-gai-han-quoc'), 
'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&h=800&fit=crop', 'Váy hoa nhí - Mặt trước', 1, true),
((SELECT id FROM products WHERE slug = 'vay-hoa-nhi-be-gai-han-quoc'), 
'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=600&h=800&fit=crop', 'Váy hoa nhí - Chi tiết', 2, false),

-- Set sơ sinh
((SELECT id FROM products WHERE slug = 'set-body-suit-so-sinh-organic'), 
'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop', 'Set body suit - Tổng thể', 1, true),

-- Quần jean
((SELECT id FROM products WHERE slug = 'quan-jean-be-trai-slim-fit'), 
'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop', 'Quần jean - Mặt trước', 1, true),

-- Áo khoác
((SELECT id FROM products WHERE slug = 'ao-khoac-long-cuu-be-gai-pastel'), 
'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop', 'Áo khoác lông cừu', 1, true),

-- Áo len
((SELECT id FROM products WHERE slug = 'ao-len-be-trai-hoa-tiet-gau'), 
'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&h=800&fit=crop', 'Áo len gấu', 1, true),

-- Đầm công chúa
((SELECT id FROM products WHERE slug = 'dam-cong-chua-be-gai-du-tiec'), 
'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&h=800&fit=crop', 'Đầm công chúa', 1, true),

-- Quần short
((SELECT id FROM products WHERE slug = 'quan-short-the-thao-be-trai'), 
'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=800&fit=crop', 'Quần short thể thao', 1, true),

-- Pyjama
((SELECT id FROM products WHERE slug = 'bo-pyjama-be-gai-unicorn'), 
'https://images.unsplash.com/photo-1578897367107-2828e223ab8f?w=600&h=800&fit=crop', 'Pyjama unicorn', 1, true),

-- Polo
((SELECT id FROM products WHERE slug = 'ao-polo-be-trai-classic'), 
'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=800&fit=crop', 'Áo polo classic', 1, true),

-- Legging
((SELECT id FROM products WHERE slug = 'quan-legging-be-gai-in-hinh'), 
'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600&h=800&fit=crop', 'Quần legging', 1, true),

-- Set 5 món
((SELECT id FROM products WHERE slug = 'set-quan-ao-so-sinh-5-mon'), 
'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop', 'Set 5 món sơ sinh', 1, true);

-- =====================================================
-- PRODUCT VARIANTS
-- =====================================================

-- Áo thun bé trai - variants
INSERT INTO product_variants (product_id, size_id, color_id, sku_variant, price_adjustment, is_active)
SELECT 
    (SELECT id FROM products WHERE slug = 'ao-thun-cotton-be-trai-khung-long'),
    s.id, c.id, 
    'TS-BOY-001-' || s.name || '-' || LEFT(c.name, 2),
    0, true
FROM sizes s, colors c 
WHERE s.name IN ('2T', '3T', '4T', '5T', 'XS', 'S') 
AND c.name IN ('Trắng', 'Xanh navy', 'Xám');

-- Váy bé gái - variants
INSERT INTO product_variants (product_id, size_id, color_id, sku_variant, price_adjustment, is_active)
SELECT 
    (SELECT id FROM products WHERE slug = 'vay-hoa-nhi-be-gai-han-quoc'),
    s.id, c.id, 
    'DR-GIRL-001-' || s.name || '-' || LEFT(c.name, 2),
    0, true
FROM sizes s, colors c 
WHERE s.name IN ('2T', '3T', '4T', '5T', 'XS', 'S') 
AND c.name IN ('Hồng', 'Trắng', 'Xanh dương');

-- Set sơ sinh - variants
INSERT INTO product_variants (product_id, size_id, color_id, sku_variant, price_adjustment, is_active)
SELECT 
    (SELECT id FROM products WHERE slug = 'set-body-suit-so-sinh-organic'),
    s.id, c.id, 
    'SET-BABY-001-' || s.name || '-' || LEFT(c.name, 2),
    0, true
FROM sizes s, colors c 
WHERE s.name IN ('3M', '6M', '9M', '12M') 
AND c.name IN ('Trắng', 'Be', 'Hồng');

-- Quần jean - variants
INSERT INTO product_variants (product_id, size_id, color_id, sku_variant, price_adjustment, is_active)
SELECT 
    (SELECT id FROM products WHERE slug = 'quan-jean-be-trai-slim-fit'),
    s.id, c.id, 
    'JN-BOY-001-' || s.name || '-' || LEFT(c.name, 2),
    0, true
FROM sizes s, colors c 
WHERE s.name IN ('3T', '4T', '5T', 'XS', 'S', 'M') 
AND c.name IN ('Xanh navy', 'Đen', 'Xám');

-- Áo khoác - variants
INSERT INTO product_variants (product_id, size_id, color_id, sku_variant, price_adjustment, is_active)
SELECT 
    (SELECT id FROM products WHERE slug = 'ao-khoac-long-cuu-be-gai-pastel'),
    s.id, c.id, 
    'JK-GIRL-001-' || s.name || '-' || LEFT(c.name, 2),
    0, true
FROM sizes s, colors c 
WHERE s.name IN ('2T', '3T', '4T', '5T', 'XS') 
AND c.name IN ('Hồng', 'Tím', 'Be');

-- Đầm công chúa - variants
INSERT INTO product_variants (product_id, size_id, color_id, sku_variant, price_adjustment, is_active)
SELECT 
    (SELECT id FROM products WHERE slug = 'dam-cong-chua-be-gai-du-tiec'),
    s.id, c.id, 
    'DR-GIRL-002-' || s.name || '-' || LEFT(c.name, 2),
    0, true
FROM sizes s, colors c 
WHERE s.name IN ('3T', '4T', '5T', 'XS', 'S') 
AND c.name IN ('Hồng', 'Trắng', 'Tím');

-- =====================================================
-- INVENTORY
-- =====================================================

-- Add inventory for all variants
INSERT INTO inventory (variant_id, quantity, reserved_quantity, low_stock_threshold)
SELECT id, 
    FLOOR(RANDOM() * 50 + 10)::INTEGER, -- Random quantity 10-60
    0, 
    5
FROM product_variants;

-- =====================================================
-- END SAMPLE DATA
-- =====================================================

SELECT 'Sample data inserted successfully!' AS message;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_variants FROM product_variants;
SELECT COUNT(*) AS total_inventory FROM inventory;

