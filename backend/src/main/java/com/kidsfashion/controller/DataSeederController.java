package com.kidsfashion.controller;

import com.kidsfashion.dto.response.ApiResponse;
import com.kidsfashion.entity.*;
import com.kidsfashion.entity.enums.Gender;
import com.kidsfashion.entity.enums.ProductStatus;
import com.kidsfashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.*;

/**
 * Data Seeder Controller - FOR DEVELOPMENT ONLY
 * Provides endpoints to seed sample data into the database
 */
@RestController
@RequestMapping("/seed")
@RequiredArgsConstructor
public class DataSeederController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final SizeRepository sizeRepository;
    private final ColorRepository colorRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryRepository inventoryRepository;
    private final ProductImageRepository imageRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @PostMapping("/clean-carts")
    @Transactional
    public ResponseEntity<ApiResponse<String>> cleanCarts() {
        cartItemRepository.deleteAll();
        cartRepository.deleteAll();
        return ResponseEntity.ok(ApiResponse.success("All carts and cart items deleted"));
    }

    @PostMapping("/products")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Object>>> seedProducts() {
        // Check if products already exist
        if (productRepository.count() > 0) {
            return ResponseEntity.ok(ApiResponse.success("Products already seeded", 
                Map.of("existingCount", productRepository.count())));
        }

        // Seed sizes
        List<Size> sizes = seedSizes();
        
        // Seed colors
        List<Color> colors = seedColors();
        
        // Get existing brands and categories
        Map<String, Brand> brands = new HashMap<>();
        brandRepository.findAll().forEach(b -> brands.put(b.getSlug(), b));
        
        Map<String, Category> categories = new HashMap<>();
        categoryRepository.findAll().forEach(c -> categories.put(c.getSlug(), c));

        // Create products
        List<Product> products = createProducts(brands, categories);
        
        // Create variants and inventory
        int variantCount = createVariantsAndInventory(products, sizes, colors);

        Map<String, Object> result = new HashMap<>();
        result.put("productsCreated", products.size());
        result.put("variantsCreated", variantCount);
        result.put("sizesCreated", sizes.size());
        result.put("colorsCreated", colors.size());

        return ResponseEntity.ok(ApiResponse.success("Sample data seeded successfully", result));
    }

    private List<Size> seedSizes() {
        List<Size> sizes = new ArrayList<>();
        String[][] sizeData = {
            {"3M", "1"}, {"6M", "2"}, {"9M", "3"}, {"12M", "4"}, {"18M", "5"}, {"24M", "6"},
            {"2T", "7"}, {"3T", "8"}, {"4T", "9"}, {"5T", "10"},
            {"XS", "11"}, {"S", "12"}, {"M", "13"}, {"L", "14"}, {"XL", "15"}
        };
        
        for (String[] data : sizeData) {
            if (sizeRepository.findByName(data[0]).isEmpty()) {
                Size size = Size.builder()
                    .name(data[0])
                    .sortOrder(Integer.parseInt(data[1]))
                    .build();
                sizes.add(sizeRepository.save(size));
            } else {
                sizes.add(sizeRepository.findByName(data[0]).get());
            }
        }
        return sizes;
    }

    private List<Color> seedColors() {
        List<Color> colors = new ArrayList<>();
        String[][] colorData = {
            {"Trắng", "#FFFFFF", "1"},
            {"Đen", "#000000", "2"},
            {"Xanh navy", "#1E3A5F", "3"},
            {"Xanh dương", "#3B82F6", "4"},
            {"Hồng", "#EC4899", "5"},
            {"Đỏ", "#EF4444", "6"},
            {"Vàng", "#F59E0B", "7"},
            {"Xanh lá", "#22C55E", "8"},
            {"Tím", "#8B5CF6", "9"},
            {"Xám", "#6B7280", "10"},
            {"Be", "#D4B896", "11"},
            {"Cam", "#F97316", "12"}
        };
        
        for (String[] data : colorData) {
            if (colorRepository.findByName(data[0]).isEmpty()) {
                Color color = Color.builder()
                    .name(data[0])
                    .hexCode(data[1])
                    .sortOrder(Integer.parseInt(data[2]))
                    .build();
                colors.add(colorRepository.save(color));
            } else {
                colors.add(colorRepository.findByName(data[0]).get());
            }
        }
        return colors;
    }

    private List<Product> createProducts(Map<String, Brand> brands, Map<String, Category> categories) {
        List<Product> products = new ArrayList<>();

        // Product 1: Áo thun bé trai
        Product p1 = Product.builder()
            .sku("TS-BOY-001")
            .name("Áo Thun Cotton Bé Trai In Hình Khủng Long")
            .slug("ao-thun-cotton-be-trai-khung-long")
            .shortDescription("Áo thun cotton mềm mại với hình in khủng long dễ thương")
            .description("Áo thun cotton 100% cao cấp, mềm mại và thoáng mát. Thiết kế với hình in khủng long sống động, phù hợp cho bé trai năng động. Chất liệu thấm hút mồ hôi tốt, an toàn cho làn da nhạy cảm của trẻ.")
            .basePrice(new BigDecimal("250000"))
            .salePrice(new BigDecimal("199000"))
            .brand(brands.get("carters"))
            .gender(Gender.BOYS)
            .ageMin(2).ageMax(8)
            .material("Cotton 100%")
            .status(ProductStatus.ACTIVE)
            .isFeatured(true)
            .viewCount(150L)
            .build();
        p1.addCategory(categories.get("boys"));
        p1.addCategory(categories.get("tops"));
        p1.addCategory(categories.get("t-shirts"));
        products.add(productRepository.save(p1));
        addProductImage(p1, "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=800&fit=crop", true);

        // Product 2: Váy bé gái
        Product p2 = Product.builder()
            .sku("DR-GIRL-001")
            .name("Váy Hoa Nhí Bé Gái Phong Cách Hàn Quốc")
            .slug("vay-hoa-nhi-be-gai-han-quoc")
            .shortDescription("Váy hoa nhí xinh xắn theo phong cách Hàn Quốc")
            .description("Váy hoa nhí dành cho bé gái với thiết kế phong cách Hàn Quốc hiện đại. Chất liệu vải cotton pha, mềm mại và thoáng mát. Phù hợp cho các dịp đi chơi, dự tiệc.")
            .basePrice(new BigDecimal("350000"))
            .salePrice(new BigDecimal("280000"))
            .brand(brands.get("zara-kids"))
            .gender(Gender.GIRLS)
            .ageMin(2).ageMax(10)
            .material("Cotton Blend")
            .status(ProductStatus.ACTIVE)
            .isFeatured(true)
            .viewCount(230L)
            .build();
        p2.addCategory(categories.get("girls"));
        p2.addCategory(categories.get("dresses"));
        products.add(productRepository.save(p2));
        addProductImage(p2, "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&h=800&fit=crop", true);

        // Product 3: Set sơ sinh
        Product p3 = Product.builder()
            .sku("SET-BABY-001")
            .name("Set 3 Body Suit Bé Sơ Sinh Organic Cotton")
            .slug("set-body-suit-so-sinh-organic")
            .shortDescription("Bộ 3 body suit chất liệu organic cotton an toàn cho bé")
            .description("Set 3 body suit dành cho bé sơ sinh với chất liệu organic cotton 100%, đạt chứng nhận GOTS. An toàn tuyệt đối cho làn da nhạy cảm của bé. Thiết kế cài nút bấm tiện lợi.")
            .basePrice(new BigDecimal("450000"))
            .brand(brands.get("carters"))
            .gender(Gender.UNISEX)
            .ageMin(0).ageMax(1)
            .material("Organic Cotton")
            .status(ProductStatus.ACTIVE)
            .isFeatured(true)
            .viewCount(320L)
            .build();
        p3.addCategory(categories.get("baby"));
        products.add(productRepository.save(p3));
        addProductImage(p3, "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop", true);

        // Product 4: Quần jean
        Product p4 = Product.builder()
            .sku("JN-BOY-001")
            .name("Quần Jean Bé Trai Dáng Slim Fit")
            .slug("quan-jean-be-trai-slim-fit")
            .shortDescription("Quần jean dáng slim fit thời trang cho bé trai")
            .description("Quần jean cao cấp với thiết kế slim fit hiện đại. Chất liệu denim co giãn thoải mái, dễ vận động. Đường may chắc chắn, bền đẹp theo thời gian.")
            .basePrice(new BigDecimal("380000"))
            .salePrice(new BigDecimal("299000"))
            .brand(brands.get("hm-kids"))
            .gender(Gender.BOYS)
            .ageMin(3).ageMax(12)
            .material("Denim Stretch")
            .status(ProductStatus.ACTIVE)
            .isFeatured(true)
            .viewCount(180L)
            .build();
        p4.addCategory(categories.get("boys"));
        p4.addCategory(categories.get("bottoms"));
        p4.addCategory(categories.get("jeans"));
        products.add(productRepository.save(p4));
        addProductImage(p4, "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop", true);

        // Product 5: Áo khoác
        Product p5 = Product.builder()
            .sku("JK-GIRL-001")
            .name("Áo Khoác Lông Cừu Bé Gái Màu Pastel")
            .slug("ao-khoac-long-cuu-be-gai-pastel")
            .shortDescription("Áo khoác lông cừu ấm áp với tông màu pastel dịu dàng")
            .description("Áo khoác lông cừu cao cấp, siêu mềm mịn và ấm áp. Màu pastel thanh lịch phù hợp với nhiều trang phục. Thiết kế có mũ trùm đáng yêu.")
            .basePrice(new BigDecimal("550000"))
            .brand(brands.get("zara-kids"))
            .gender(Gender.GIRLS)
            .ageMin(2).ageMax(8)
            .material("Fleece")
            .status(ProductStatus.ACTIVE)
            .isFeatured(true)
            .viewCount(95L)
            .build();
        p5.addCategory(categories.get("girls"));
        p5.addCategory(categories.get("tops"));
        products.add(productRepository.save(p5));
        addProductImage(p5, "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop", true);

        // Product 6: Áo len
        Product p6 = Product.builder()
            .sku("SW-BOY-001")
            .name("Áo Len Bé Trai Họa Tiết Gấu")
            .slug("ao-len-be-trai-hoa-tiet-gau")
            .shortDescription("Áo len ấm áp với họa tiết gấu dễ thương")
            .description("Áo len cotton pha wool mềm mại, giữ ấm tốt mà không gây ngứa. Họa tiết gấu đáng yêu được dệt tinh xảo. Phù hợp cho mùa thu đông.")
            .basePrice(new BigDecimal("420000"))
            .salePrice(new BigDecimal("350000"))
            .brand(brands.get("uniqlo-kids"))
            .gender(Gender.BOYS)
            .ageMin(2).ageMax(10)
            .material("Cotton Wool Blend")
            .status(ProductStatus.ACTIVE)
            .isFeatured(false)
            .viewCount(75L)
            .build();
        p6.addCategory(categories.get("boys"));
        p6.addCategory(categories.get("tops"));
        p6.addCategory(categories.get("sweaters"));
        products.add(productRepository.save(p6));
        addProductImage(p6, "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&h=800&fit=crop", true);

        // Product 7: Đầm công chúa
        Product p7 = Product.builder()
            .sku("DR-GIRL-002")
            .name("Đầm Công Chúa Bé Gái Dự Tiệc")
            .slug("dam-cong-chua-be-gai-du-tiec")
            .shortDescription("Đầm công chúa lộng lẫy cho các dịp đặc biệt")
            .description("Đầm công chúa với thiết kế sang trọng, lộng lẫy. Chất liệu satin cao cấp kết hợp voan mềm mại. Phù hợp cho các dịp sinh nhật, tiệc cưới, lễ hội.")
            .basePrice(new BigDecimal("680000"))
            .brand(brands.get("zara-kids"))
            .gender(Gender.GIRLS)
            .ageMin(3).ageMax(10)
            .material("Satin & Tulle")
            .status(ProductStatus.ACTIVE)
            .isFeatured(true)
            .viewCount(420L)
            .build();
        p7.addCategory(categories.get("girls"));
        p7.addCategory(categories.get("dresses"));
        products.add(productRepository.save(p7));
        addProductImage(p7, "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&h=800&fit=crop", true);

        // Product 8: Quần short
        Product p8 = Product.builder()
            .sku("SH-BOY-001")
            .name("Quần Short Thể Thao Bé Trai")
            .slug("quan-short-the-thao-be-trai")
            .shortDescription("Quần short thể thao thoáng mát cho bé năng động")
            .description("Quần short thể thao với chất liệu polyester thấm hút, nhanh khô. Thiết kế có dây rút điều chỉnh. Phù hợp cho hoạt động thể thao và vui chơi ngoài trời.")
            .basePrice(new BigDecimal("220000"))
            .salePrice(new BigDecimal("175000"))
            .brand(brands.get("hm-kids"))
            .gender(Gender.BOYS)
            .ageMin(3).ageMax(12)
            .material("Polyester")
            .status(ProductStatus.ACTIVE)
            .isFeatured(false)
            .viewCount(88L)
            .build();
        p8.addCategory(categories.get("boys"));
        p8.addCategory(categories.get("bottoms"));
        p8.addCategory(categories.get("shorts"));
        products.add(productRepository.save(p8));
        addProductImage(p8, "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=800&fit=crop", true);

        // Product 9: Pyjama
        Product p9 = Product.builder()
            .sku("PJ-GIRL-001")
            .name("Bộ Pyjama Bé Gái Họa Tiết Unicorn")
            .slug("bo-pyjama-be-gai-unicorn")
            .shortDescription("Bộ pyjama mềm mại với họa tiết unicorn đáng yêu")
            .description("Bộ pyjama cotton 100% mềm mại, thoáng mát cho giấc ngủ ngon. Họa tiết unicorn sinh động, màu sắc tươi sáng. Đường may tỉ mỉ, không gây kích ứng da.")
            .basePrice(new BigDecimal("320000"))
            .brand(brands.get("carters"))
            .gender(Gender.GIRLS)
            .ageMin(2).ageMax(10)
            .material("Cotton 100%")
            .status(ProductStatus.ACTIVE)
            .isFeatured(false)
            .viewCount(156L)
            .build();
        p9.addCategory(categories.get("girls"));
        products.add(productRepository.save(p9));
        addProductImage(p9, "https://images.unsplash.com/photo-1578897367107-2828e223ab8f?w=600&h=800&fit=crop", true);

        // Product 10: Polo
        Product p10 = Product.builder()
            .sku("PL-BOY-001")
            .name("Áo Polo Bé Trai Classic")
            .slug("ao-polo-be-trai-classic")
            .shortDescription("Áo polo cổ điển thanh lịch cho bé trai")
            .description("Áo polo với thiết kế cổ điển, thanh lịch. Chất liệu cotton pique cao cấp, thoáng mát và bền màu. Phù hợp cho nhiều dịp từ đi học đến dự tiệc.")
            .basePrice(new BigDecimal("280000"))
            .brand(brands.get("babygap"))
            .gender(Gender.BOYS)
            .ageMin(3).ageMax(12)
            .material("Cotton Pique")
            .status(ProductStatus.ACTIVE)
            .isFeatured(false)
            .viewCount(92L)
            .build();
        p10.addCategory(categories.get("boys"));
        p10.addCategory(categories.get("tops"));
        p10.addCategory(categories.get("shirts"));
        products.add(productRepository.save(p10));
        addProductImage(p10, "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&h=800&fit=crop", true);

        // Product 11: Legging
        Product p11 = Product.builder()
            .sku("LG-GIRL-001")
            .name("Quần Legging Bé Gái In Hình")
            .slug("quan-legging-be-gai-in-hinh")
            .shortDescription("Quần legging co giãn với hình in sống động")
            .description("Quần legging với chất liệu cotton spandex co giãn 4 chiều, thoải mái vận động. Hình in sắc nét, bền màu sau nhiều lần giặt.")
            .basePrice(new BigDecimal("180000"))
            .salePrice(new BigDecimal("145000"))
            .brand(brands.get("hm-kids"))
            .gender(Gender.GIRLS)
            .ageMin(2).ageMax(10)
            .material("Cotton Spandex")
            .status(ProductStatus.ACTIVE)
            .isFeatured(false)
            .viewCount(210L)
            .build();
        p11.addCategory(categories.get("girls"));
        p11.addCategory(categories.get("bottoms"));
        products.add(productRepository.save(p11));
        addProductImage(p11, "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600&h=800&fit=crop", true);

        // Product 12: Set 5 món
        Product p12 = Product.builder()
            .sku("SET-BABY-002")
            .name("Set Quần Áo Sơ Sinh 5 Món")
            .slug("set-quan-ao-so-sinh-5-mon")
            .shortDescription("Trọn bộ 5 món thiết yếu cho bé sơ sinh")
            .description("Set 5 món bao gồm: 2 body suit, 1 quần dài, 1 mũ và 1 yếm. Chất liệu cotton mềm mại, an toàn cho da bé. Màu sắc nhẹ nhàng, phù hợp làm quà tặng.")
            .basePrice(new BigDecimal("580000"))
            .brand(brands.get("carters"))
            .gender(Gender.UNISEX)
            .ageMin(0).ageMax(1)
            .material("Cotton 100%")
            .status(ProductStatus.ACTIVE)
            .isFeatured(true)
            .viewCount(380L)
            .build();
        p12.addCategory(categories.get("baby"));
        products.add(productRepository.save(p12));
        addProductImage(p12, "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=800&fit=crop", true);

        return products;
    }

    private void addProductImage(Product product, String imageUrl, boolean isPrimary) {
        ProductImage image = ProductImage.builder()
            .product(product)
            .imageUrl(imageUrl)
            .altText(product.getName())
            .sortOrder(1)
            .isPrimary(isPrimary)
            .build();
        imageRepository.save(image);
    }

    private int createVariantsAndInventory(List<Product> products, List<Size> sizes, List<Color> colors) {
        int count = 0;
        Random random = new Random();

        // Map sizes and colors by name for easy lookup
        Map<String, Size> sizeMap = new HashMap<>();
        sizes.forEach(s -> sizeMap.put(s.getName(), s));
        
        Map<String, Color> colorMap = new HashMap<>();
        colors.forEach(c -> colorMap.put(c.getName(), c));

        // Define variants for each product
        Map<String, String[][]> productVariants = new HashMap<>();
        productVariants.put("ao-thun-cotton-be-trai-khung-long", new String[][]{
            {"2T", "3T", "4T", "5T", "XS", "S"},
            {"Trắng", "Xanh navy", "Xám"}
        });
        productVariants.put("vay-hoa-nhi-be-gai-han-quoc", new String[][]{
            {"2T", "3T", "4T", "5T", "XS", "S"},
            {"Hồng", "Trắng", "Xanh dương"}
        });
        productVariants.put("set-body-suit-so-sinh-organic", new String[][]{
            {"3M", "6M", "9M", "12M"},
            {"Trắng", "Be", "Hồng"}
        });
        productVariants.put("quan-jean-be-trai-slim-fit", new String[][]{
            {"3T", "4T", "5T", "XS", "S", "M"},
            {"Xanh navy", "Đen", "Xám"}
        });
        productVariants.put("ao-khoac-long-cuu-be-gai-pastel", new String[][]{
            {"2T", "3T", "4T", "5T", "XS"},
            {"Hồng", "Tím", "Be"}
        });
        productVariants.put("ao-len-be-trai-hoa-tiet-gau", new String[][]{
            {"2T", "3T", "4T", "5T", "XS", "S"},
            {"Xanh navy", "Xám", "Be"}
        });
        productVariants.put("dam-cong-chua-be-gai-du-tiec", new String[][]{
            {"3T", "4T", "5T", "XS", "S"},
            {"Hồng", "Trắng", "Tím"}
        });
        productVariants.put("quan-short-the-thao-be-trai", new String[][]{
            {"3T", "4T", "5T", "XS", "S", "M"},
            {"Đen", "Xanh navy", "Xám"}
        });
        productVariants.put("bo-pyjama-be-gai-unicorn", new String[][]{
            {"2T", "3T", "4T", "5T", "XS"},
            {"Hồng", "Tím", "Trắng"}
        });
        productVariants.put("ao-polo-be-trai-classic", new String[][]{
            {"3T", "4T", "5T", "XS", "S", "M"},
            {"Trắng", "Xanh navy", "Đỏ"}
        });
        productVariants.put("quan-legging-be-gai-in-hinh", new String[][]{
            {"2T", "3T", "4T", "5T", "XS", "S"},
            {"Đen", "Hồng", "Tím"}
        });
        productVariants.put("set-quan-ao-so-sinh-5-mon", new String[][]{
            {"3M", "6M", "9M", "12M"},
            {"Trắng", "Be", "Xanh dương"}
        });

        for (Product product : products) {
            String[][] variantDef = productVariants.get(product.getSlug());
            if (variantDef == null) continue;

            String[] productSizes = variantDef[0];
            String[] productColors = variantDef[1];

            for (String sizeName : productSizes) {
                Size size = sizeMap.get(sizeName);
                if (size == null) continue;

                for (String colorName : productColors) {
                    Color color = colorMap.get(colorName);
                    if (color == null) continue;

                    String skuVariant = product.getSku() + "-" + sizeName + "-" + colorName.substring(0, Math.min(2, colorName.length()));
                    
                    ProductVariant variant = ProductVariant.builder()
                        .product(product)
                        .size(size)
                        .color(color)
                        .skuVariant(skuVariant)
                        .priceAdjustment(BigDecimal.ZERO)
                        .isActive(true)
                        .build();
                    variant = variantRepository.save(variant);

                    // Create inventory
                    Inventory inventory = Inventory.builder()
                        .variant(variant)
                        .quantity(random.nextInt(50) + 10) // 10-60 items
                        .reservedQuantity(0)
                        .lowStockThreshold(5)
                        .build();
                    inventoryRepository.save(inventory);
                    
                    count++;
                }
            }
        }

        return count;
    }
}

