-- CREATE TABLE users (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(600),
--     email VARCHAR(600) UNIQUE,
--     password VARCHAR(600),
--     role ENUM('admin','user') DEFAULT 'user',
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE TABLE categories (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(600) NOT NULL,
--     description TEXT,
--     banner_url VARCHAR(600)  -- banner image for top section
-- );

-- CREATE TABLE sub_categories (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     category_id INT NOT NULL,
--     name VARCHAR(600) NOT NULL,
--     description TEXT,
--     image_url VARCHAR(600),  -- image shown on category page
--     FOREIGN KEY (category_id) REFERENCES categories(id) 
--         ON DELETE CASCADE ON UPDATE CASCADE
-- );

-- CREATE TABLE products (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(600),
--     description TEXT,
--     price DECIMAL(10,2),
--     stock INT,
--     image_url VARCHAR(600),
--     user_id INT,             -- seller or admin
--     sub_category_id INT,     -- product belongs to subcategory
--     FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id)
--         ON DELETE CASCADE ON UPDATE CASCADE,
--     FOREIGN KEY (user_id) REFERENCES users(id)
--         ON DELETE CASCADE ON UPDATE CASCADE
-- );

-- CREATE TABLE cart (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_email VARCHAR(255),          -- NULL for guests
--     session_id VARCHAR(600),          -- Used for guest carts
--     product_id INT NOT NULL,
--     quantity INT NOT NULL,
--     added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
--     FOREIGN KEY (user_email) REFERENCES users(email)
--         ON DELETE CASCADE ON UPDATE CASCADE,
        
--     FOREIGN KEY (product_id) REFERENCES products(id)
--         ON DELETE CASCADE ON UPDATE CASCADE
-- );




-- INSERT INTO categories (name, description, banner_url) VALUES
-- ('Electronics', 
--  'Explore the latest gadgets, smartphones, laptops, and innovative devices to keep you connected and entertained. Includes accessories, wearables, and cutting-edge tech solutions.', 
--  'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg'),

-- ('Fashion', 
--  'Stay trendy with our collection of stylish clothing, footwear, and accessories for all seasons. Featuring both casual and formal wear for men, women, and youth.', 
--  'https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg'),

-- ('Home & Kitchen', 
--  'From modern kitchen appliances to home décor, furniture, and daily essentials—everything you need to make your living space beautiful and functional.', 
--  'https://images.pexels.com/photos/33257995/pexels-photo-33257995.jpeg'),

-- ('Sports', 
--  'Gear up for fitness and outdoor adventures with our premium range of gym equipment, sportswear, outdoor gear, and accessories for various sports and activities.', 
--  'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg'),

-- ('Kids', 
--  'Toys, puzzles, educational games, and fashionable clothing for children of all ages—fun, safe, and designed to inspire creativity and learning.', 
--  'https://images.pexels.com/photos/296301/pexels-photo-296301.jpeg');

-- INSERT INTO categories (name, description, banner_url) VALUES
-- ('Beauty & Personal Care',
--  'Discover a wide range of skincare, haircare, grooming products, and cosmetics designed to keep you looking and feeling your best every day.',
--  'https://images.pexels.com/photos/3373745/pexels-photo-3373745.jpeg'),

-- ('Books & Stationery',
--  'From bestselling novels to academic books, office supplies, and creative stationery items—find everything you need to read, learn, and organize.',
--  'https://images.pexels.com/photos/3747481/pexels-photo-3747481.jpeg'),

-- ('Automotive',
--  'Car and bike accessories, maintenance tools, parts, and essentials to keep your ride smooth, stylish, and road-ready.',
--  'https://images.pexels.com/photos/2449453/pexels-photo-2449453.jpeg'),

-- ('Health & Wellness',
--  'Shop fitness supplements, yoga essentials, medical equipment, and wellness products to support a healthy and active lifestyle.',
--  'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg'),

-- ('Groceries',
--  'Daily essentials including fresh produce, packaged food, beverages, snacks, and organic options delivered straight to your kitchen.',
--  'https://images.pexels.com/photos/4199098/pexels-photo-4199098.jpeg');


-- Beauty & Personal Care (category_id = 15)
INSERT INTO sub_categories (id, category_id, name, description, image_url) VALUES
(16, 15, 'Skincare', 'Face creams, serums, cleansers, and masks', 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg'),
(17, 15, 'Haircare', 'Shampoos, conditioners, oils, and treatments', 'https://images.pexels.com/photos/3735634/pexels-photo-3735634.jpeg'),
(18, 15, 'Makeup', 'Lipsticks, foundations, eyeshadows, and more', 'https://images.pexels.com/photos/3373744/pexels-photo-3373744.jpeg');

-- Books & Stationery (category_id = 16)
INSERT INTO sub_categories (id, category_id, name, description, image_url) VALUES
(19, 16, 'Fiction', 'Novels, short stories, and literature classics', 'https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg'),
(20, 16, 'Academic', 'Textbooks, guides, and reference material', 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg'),
(21, 16, 'Stationery', 'Notebooks, pens, planners, and office supplies', 'https://images.pexels.com/photos/159751/notebook-pen-table-paper-159751.jpeg');

-- Automotive (category_id = 17)
INSERT INTO sub_categories (id, category_id, name, description, image_url) VALUES
(22, 17, 'Car Accessories', 'Covers, seat cushions, and interior add-ons', 'https://images.pexels.com/photos/2449453/pexels-photo-2449453.jpeg'),
(23, 17, 'Bike Accessories', 'Helmets, gloves, and riding gear', 'https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg'),
(24, 17, 'Maintenance Tools', 'Car care kits, lubricants, and repair tools', 'https://images.pexels.com/photos/3806279/pexels-photo-3806279.jpeg');




-- Health & Wellness (category_id = 18)
INSERT INTO sub_categories (id, category_id, name, description, image_url) VALUES
(25, 18, 'Supplements', 'Vitamins, protein powders, and health boosters', 'https://images.pexels.com/photos/4210658/pexels-photo-4210658.jpeg'),
(26, 18, 'Yoga Essentials', 'Mats, blocks, straps, and meditation gear', 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg'),
(27, 18, 'Medical Equipment', 'Thermometers, blood pressure monitors, and more', 'https://images.pexels.com/photos/4021777/pexels-photo-4021777.jpeg');

-- Groceries (category_id = 19)
INSERT INTO sub_categories (id, category_id, name, description, image_url) VALUES
(28, 19, 'Fresh Produce', 'Fruits, vegetables, and organic farm products', 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg'),
(29, 19, 'Packaged Foods', 'Snacks, canned goods, and ready-to-eat meals', 'https://images.pexels.com/photos/4199098/pexels-photo-4199098.jpeg'),
(30, 19, 'Beverages', 'Juices, soft drinks, tea, and coffee', 'https://images.pexels.com/photos/1320945/pexels-photo-1320945.jpeg');



-- INSERT INTO sub_categories (id, category_id, name, description, image_url) VALUES
-- (1, 6, 'Smartphones', 'Latest smartphones from top brands', 'https://images.pexels.com/photos/341523/pexels-photo-341523.jpeg'),
-- (2, 6, 'Laptops', 'Gaming and work laptops', 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg'),
-- (3, 6, 'Accessories', 'Chargers, headphones, and more', 'https://images.pexels.com/photos/1453008/pexels-photo-1453008.jpeg'),
-- (4, 7, 'Mens Clothing', 'T-shirts, jackets, jeans', 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'),
-- (5, 7, 'Womens Clothing', 'Dresses, tops, skirts', 'https://images.pexels.com/photos/1233648/pexels-photo-1233648.jpeg'),


-- (6, 7, 'Footwear', 'Shoes and sandals', 'https://images.pexels.com/photos/19090/pexels-photo.jpg'),
-- (7, 8, 'Furniture', 'Sofas, chairs, and tables', 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'),
-- (8, 8, 'Appliances', 'Refrigerators, microwaves', 'https://media.istockphoto.com/id/1211554164/photo/3d-render-of-home-appliances-collection-set.jpg?s=2048x2048&w=is&k=20&c=T44JxeSxZQlr_SCb34r_uPzdLJ9T52Gikwyke9OjH7c='),
-- (9, 8, 'Decor', 'Paintings, clocks, and vases', 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg'),
-- (10, 9, 'Fitness Equipment', 'Gym and workout gear', 'https://images.pexels.com/photos/7174396/pexels-photo-7174396.jpeg'),
-- (11, 9, 'Outdoor Sports', 'Football, cricket, and more', 'https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg'),
-- (12, 9, 'Indoor Games', 'Table tennis, carrom, and chess', 'https://images.pexels.com/photos/9632593/pexels-photo-9632593.jpeg'),
-- (13, 10, 'Toys', 'Educational and fun toys', 'https://images.pexels.com/photos/191360/pexels-photo-191360.jpeg'),
-- (14, 10, 'Kids Clothing', 'Shirts, pants, dresses', 'https://images.pexels.com/photos/5693889/pexels-photo-5693889.jpeg'),
-- (15, 10, 'Games', 'Board games and puzzles', 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg');



-- Smartphones
INSERT INTO products (id, name, description, price, stock, image_url, user_id, sub_category_id) VALUES
(479, 'iPhone 14 Pro', 'Apple flagship smartphone with A16 Bionic chip.', 1199.99, 25, 'https://media.istockphoto.com/id/1488572507/photo/iphone-14-pro-max-back-and-box-on-wooden-desk-editorial-use.jpg?s=612x612&w=0&k=20&c=JLbG_yqxCT-Ch97C-0KZZ9R-G1r2WfC3JqmlMStof5U=', 6, 1),
(480, 'Samsung Galaxy S23', 'Samsung’s latest flagship with Snapdragon processor.', 999.99, 30, 'https://media.istockphoto.com/id/1578456325/photo/samsung-s23-ultra-mobile-phone-positioned-on-brown-leather-surface-selective-focus.jpg?s=612x612&w=0&k=20&c=36CdDAy36ps4yZv3MQpGej4hapgaKX7PzHaZgBC80xI=', 7, 1),
(481, 'Google Pixel 7 Pro', 'Clean Android experience with amazing camera.', 899.99, 20, 'https://static1.anpoimages.com/wordpress/wp-content/uploads/wm/2024/08/img_5688.jpg', 8, 1),
(482, 'OnePlus 11', 'High-performance smartphone with fast charging.', 749.99, 40, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtZyMeiMx5EwUp5m7D-iqXzN3hEFfx2nQMsg&s', 9, 1),
(483, 'Xiaomi Mi 13', 'Affordable flagship with great performance.', 649.99, 35, 'https://bermorzone.com.ph/wp-content/uploads/2024/06/a8b16bba895dd3ec1b333d4613ceccd0.webp', 6, 1),
(484, 'Sony Xperia 5 IV', 'Compact smartphone with pro camera features.', 1099.99, 15, 'https://media.istockphoto.com/id/1506468200/photo/sony-xperia-sony-smartphone-4k-hdr.jpg?s=612x612&w=0&k=20&c=KYFnyYEgSy5BtE8zbP42JnIv7U3w6hQjz5jxSCAVcys=', 7, 1);

-- Laptops
INSERT INTO products (id, name, description, price, stock, image_url, user_id, sub_category_id) VALUES
(485, 'MacBook Air M2', 'Lightweight laptop with Apple M2 chip.', 1299.99, 20, 'https://media.istockphoto.com/id/1511105272/photo/new-apple-macbook-air-laptop-model.jpg?s=612x612&w=0&k=20&c=sKAAVcBiPdkNglsgtW1JDIMGLyBD62a8oYOurRqSGb4=', 8, 2),
(486, 'Dell XPS 15', 'Premium Windows laptop with i7 and RTX graphics.', 1599.99, 15, 'https://m.media-amazon.com/images/I/81Vep45DQ4L._AC_SL1500_.jpg', 9, 2),
(487, 'HP Spectre x360', '2-in-1 convertible laptop for work and play.', 1399.99, 18, 'https://img-cdn.tnwcdn.com/image?fit=1280%2C720&url=https%3A%2F%2Fcdn0.tnwcdn.com%2Fwp-content%2Fblogs.dir%2F1%2Ffiles%2F2021%2F08%2FHP-Spectre-x360-14-1-of-7.jpg&signature=b273734ba382a58d403431a960fd1708', 6, 2),
(488, 'Lenovo ThinkPad X1 Carbon', 'Business laptop with powerful specs.', 1499.99, 12, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqhFVuYvfCtbYjCIorgCChcV8TBp8hIW5g5w&s', 7, 2),
(489, 'Asus ROG Zephyrus G14', 'Gaming laptop with Ryzen and RTX GPU.', 1699.99, 10, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgPgHp3dkCJr6sQRetsMNpwPgqriA7w5FFWQ&s', 8, 2),
(490, 'Acer Swift 3', 'Budget-friendly ultrabook with sleek design.', 799.99, 25, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReG87tCru8nrt4M6yuXBunKGkykT8OK7VdGw&s', 9, 2);

-- Accessories
INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Wireless Earbuds', 'Noise-cancelling Bluetooth earbuds.', 149.99, 50, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=989&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 6, 3),
('Portable Power Bank', '10000mAh fast charging power bank.', 39.99, 60, 'https://m.media-amazon.com/images/I/71NVBNrF1pL._UF894,1000_QL80_.jpg', 7, 3),
('Wireless Charger', 'Fast charging Qi wireless pad.', 29.99, 80, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcLEX-bKpGrc6slZ3kDjUUkGgYS_1d6GmWrQ&s', 8, 3),
('USB-C Hub', 'Multiport adapter for laptops and tablets.', 49.99, 40, 'https://vmart.pk/cdn/shop/files/Ugreen-60383-6-in-1-USB-C-Hub-4K_4060Hz-6.webp?v=1737627736', 9, 3),
('Gaming Headset', 'Surround sound headset with mic.', 89.99, 30, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWQUmMfRRC4CLc8o5Zm43uFwsmu7Z44aNugA&s', 6, 3),
('Smartwatch Band', 'Replacement bands for smartwatches.', 19.99, 70, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyMWv7aE_FerylVjBG72qdolw-qtaBnz72dQ&s', 7, 3);


-- Mens Clothing
INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
( 'Men’s Cotton T-Shirt', 'Comfortable round-neck cotton t-shirt.', 19.99, 100, 'https://www.jerdoni.com/cdn/shop/products/r1_ee132112-dc56-4493-a7f8-409dd5c29299.jpg?v=1681452565', 8, 4),
( 'Men’s Denim Jacket', 'Stylish casual denim jacket.', 89.99, 40, 'https://img.drz.lazcdn.com/static/pk/p/e67d7c6edd20e31a69583830f9c7f5eb.jpg_720x720q80.jpg', 9, 4),
( 'Men’s Formal Shirt', 'Slim-fit office wear shirt.', 39.99, 60, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIGhbtMWghd2WsbWvnp5C5Fn023IUCZ49qwg&s', 6, 4),
( 'Men’s Chinos', 'Classic chinos for work and casual wear.', 49.99, 50, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGivK3-Mn8fAg1iU7ZynAaD3lLpuzN9VjRIQ&s', 7, 4),
( 'Men’s Hoodie', 'Casual fleece hoodie for winters.', 59.99, 30, 'https://teetall.pk/cdn/shop/products/00123c8df31fed73e730fa4346446d77.webp?v=1695122271&width=533', 8, 4),
( 'Men’s Sneakers', 'Everyday sneakers for comfort and style.', 79.99, 45, 'https://trex.com.pk/uploads/trex/vXadmTUeWNpOew98wPQhKONupziBlO4y5zlW8g0g.jpg', 9, 4);

-- Womens Clothing
INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
( 'Women’s Summer Dress', 'Lightweight floral casual dress.', 59.99, 35, 'https://cdn.shopify.com/s/files/1/0266/6276/4597/files/long_dresses_for_women_by_lov_5779b100-559b-4dd8-9c43-6d47e56d01d2.jpg?v=1649664753', 6, 5),
( 'Women’s Leather Handbag', 'Premium leather handbag.', 129.99, 20, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIQI-MvnfrxTtKdnXTIYHoe6dJpOCfDRSOsg&s', 7, 5),
( 'Women’s Blouse', 'Elegant top for formal and casual wear.', 49.99, 40, 'https://i.pinimg.com/736x/2e/6b/73/2e6b733885d2e15dd63ea7c5ee580c57.jpg', 8, 5),
( 'Women’s Jeans', 'Skinny fit denim jeans.', 69.99, 50, 'https://cdn.thewirecutter.com/wp-content/media/2023/10/womensjeans-2048px-04346.jpg?auto=webp&quality=75&width=1024', 9, 5),
( 'Women’s Winter Coat', 'Woolen coat for winter season.', 149.99, 25, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDYg-TIyEcVN_VN-_XkaGz2jPwvfeSv8IGuw&s', 6, 5),
( 'Women’s Sandals', 'Casual summer sandals.', 39.99, 60, 'https://lamaretail.com/cdn/shop/files/WFS25SD002-TAN-SOFT-LEATHER-MAMA-SANDALS-a77a63_6.jpg?v=1755801179&width=1080', 7, 5);




-- CREATE TABLE orders (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     user_email VARCHAR(255) NOT NULL,
--     state VARCHAR(100) NOT NULL,
--     city VARCHAR(100) NOT NULL,
--     address TEXT NOT NULL,
--     phone_number VARCHAR(20) NOT NULL,
--     order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending'
-- );


-- CREATE TABLE order_items (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     order_id INT NOT NULL,
--     product_id INT NOT NULL,
--     product_name VARCHAR(255) NOT NULL,
--     quantity INT NOT NULL,
--     price DECIMAL(10,2) NOT NULL,
--     FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
--     FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
-- );

-- ALTER TABLE orders
-- ADD payment_method ENUM('card', 'paypal') NOT NULL,
-- ADD payment_status ENUM('Pending', 'Paid', 'Failed') DEFAULT 'Pending',
-- ADD transaction_id VARCHAR(255) NULL,
-- ADD card_last4 CHAR(4) NULL;


INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
( 'Running Shoes', 'Lightweight breathable running shoes', 3500, 40, 'https://media.istockphoto.com/id/1688015574/photo/white-sneaker-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=gz8bGn7h_eaF4uJGJjdZYYhJDrrigHAygo2Vi8tZjH8=', 6, 6),
( 'Leather Sandals', 'Comfortable leather sandals for casual wear', 2200, 50, 'https://media.istockphoto.com/id/1678375756/photo/leather-beige-sandals-birkenstocks-on-white-background-top-view-flat-lay-unisex-summer-shoes.jpg?s=612x612&w=0&k=20&c=yIdTQeR6xFPBGWNAx2h1LXh29ncH76pWRKia7A-Rrxg=', 7, 6),
('Formal Shoes', 'Classic black lace-up formal shoes', 4200, 30, 'https://media.istockphoto.com/id/523113015/photo/mens-brown-shoes.jpg?s=612x612&w=0&k=20&c=3DL6Hz1Is_XaARpwTopjL_uVJFeXu0BWePYM0WT9GW0=', 8, 6),
( 'Sneakers', 'Trendy sneakers for daily wear', 2800, 60, 'https://media.istockphoto.com/id/2206816577/photo/white-woman-trendy-sneakers-on-color-background-top-view.jpg?s=612x612&w=0&k=20&c=erpdHVoYQZMm3hXBN1N35c3yIfOZ8ez8Rhv_CBaLI1c=', 9, 6),
( 'Sports Shoes', 'Durable sports shoes with cushioned sole', 3900, 45, 'https://media.istockphoto.com/id/2149951279/photo/a-pair-of-sneakers-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=-woH4zk3o7MQ3XqffnpDPzGwY7I2_02xkwrIjQ56qOc=', 6, 6)

-- Furniture
INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Wooden Dining Table', 'Solid oak 6-seater dining table', 25000, 10, 'https://media.istockphoto.com/id/1357428297/photo/table-dining-table-round-dining-table.jpg?s=612x612&w=0&k=20&c=ZWXB-my2VWaAVKlsy9i63cGB2iPFIuKPxflij6Oypls=', 7, 7),
('Recliner Chair', 'Comfortable recliner with soft fabric', 18000, 12, 'https://media.istockphoto.com/id/1663634045/photo/lounge-chair-with-clipping-path.jpg?s=612x612&w=0&k=20&c=zDknsy-Ip6vxbcHnwkqYDlrm6Izdhs7wY6bM95WJhf8=', 8, 7),
('Sofa Set', '3-piece modern sofa set', 48000, 8, 'https://media.istockphoto.com/id/522395594/photo/sofa.jpg?s=612x612&w=0&k=20&c=yhOO2IvalWJuJUoYOUFo-kqddeIGnWq3x9tJTskucrg=', 9, 7),
('Study Desk', 'Compact wooden desk for study/work', 9500, 20, 'https://media.istockphoto.com/id/1320870165/photo/office-desk-interior-with-mockup-white-wall.jpg?s=612x612&w=0&k=20&c=BwgBmBKKiJ7--5x0plJ9NKQXIBA3vPjwiHo678n2e4w=', 6, 7),
('Bookshelf', '5-tier bookshelf with modern design', 7200, 18, 'https://media.istockphoto.com/id/2187709387/photo/book-shelves-jam-packed.jpg?s=612x612&w=0&k=20&c=P4UQRzoovvaA-5Mnv8ERoSGSDy0IFav6H1XRkBm031s=', 7, 7)

-- Appliances
INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
( 'Microwave Oven', '20L digital microwave oven', 14500, 25, 'https://media.istockphoto.com/id/1537537480/photo/modern-white-microwave-on-the-kitchen-countertop-using-microwave-everyday-in-the-kitchen-the.jpg?s=612x612&w=0&k=20&c=9U7dr3Dy7mHlt1mMOMRsqG-wBBkDI1vFUTYeXX9Y5As=', 8, 8),
( 'Refrigerator', 'Double-door energy-efficient refrigerator', 42000, 15, 'https://media.istockphoto.com/id/2199401667/photo/modern-kitchen-interior-with-front-view-of-open-refrigerator-filled-with-fruits-vegetables.jpg?s=612x612&w=0&k=20&c=JtL4oahAkVmsgKbG997ar76MyLgmCxcvvNfLvFCQoMI=', 9, 8),
( 'Washing Machine', 'Front-load washing machine with 7kg capacity', 35000, 12, 'https://media.istockphoto.com/id/2082936492/photo/white-washing-machine-wooden-top-cabinet-cupboard-with-rattan-basket-in-laundry-room-in.jpg?s=612x612&w=0&k=20&c=whiBgoBLmbLEUpk7D0CU7VpSBgZW9QhO_Tr0DRSXbck=', 6, 8),
( 'Blender', 'Multi-speed kitchen blender', 4800, 35, 'https://media.istockphoto.com/id/1384863054/photo/blender-appliance-with-glass-container-isolated-on-white-background-3d-realistic-rendering-of.jpg?s=612x612&w=0&k=20&c=ym4bW25Ybfci2rvsr12hR0NYX_wUJ0nFh8G4C2-Qb3A=', 7, 8),
( 'Air Conditioner', '1.5 ton split AC with inverter technology', 62000, 10, 'https://media.istockphoto.com/id/2204532504/photo/high-efficiency-heat-pump.jpg?s=612x612&w=0&k=20&c=-WlxkzKouDWxnloBXmOiIKMc1UcuDx400F145VSd2gQ=', 9, 8)

-- Decor
INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Wall Clock', 'Stylish modern wall clock', 2500, 40, 'https://media.istockphoto.com/id/2117273466/photo/isolated-on-white-background-minimalist-style-wooden-wall-clock-showing-time-at-10-30-or-22-30.jpg?s=612x612&w=0&k=20&c=xi0DZJOF9klrJgjbmxXJIyevFBWJ7hWd4H03e-1Blbo=', 6, 9),
('Canvas Painting', 'Abstract art painting for living room', 7800, 15, 'https://media.istockphoto.com/id/542321570/vector/oil-painting-field-of-daisies-colorfull-art-drawing.jpg?s=612x612&w=0&k=20&c=2_PCtv77ugNeGO_55pXnce491WoLGAT9Y1seveek_MU=', 7, 9),
('Flower Vase', 'Ceramic flower vase', 1800, 50, 'https://media.istockphoto.com/id/95858197/photo/spring-flowers-in-vases.jpg?s=612x612&w=0&k=20&c=2pvRIUSSfRLOHduXHIUwqwQWbYCoQFDxNZY5fpggtsg=', 8, 9),
('Table Lamp', 'Wooden base decorative table lamp', 3600, 25, 'https://media.istockphoto.com/id/534400418/photo/desk-lamp.jpg?s=612x612&w=0&k=20&c=r8fSNGuqsgUrZHWBswRPMv8sdgwP5l67f-ECg-Djoh8=', 9, 9),
('Mirror', 'Large decorative wall mirror', 9200, 12, 'https://media.istockphoto.com/id/1437446760/photo/pawn-seeing-a-queen-in-mirror.jpg?s=612x612&w=0&k=20&c=Y021hEKdmga0nknaadonB06xe7IPMC7VNriJ19e3GOw=', 6, 9)

-- Fitness Equipment
INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
( 'Dumbbell Set', 'Adjustable dumbbell set (2x10kg)', 7200, 30, 'https://media.istockphoto.com/id/2164632100/photo/several-dumbbells-in-a-row-with-incremental-weights-on-a-hardwood-floor-under-a-spotlight.jpg?s=612x612&w=0&k=20&c=WqwExxJ8Sc1_nIbZB6vidDhU7Fdt4rTsyy6b2UNBKgw=', 7, 10),
( 'Treadmill', 'Electric treadmill with digital display', 58000, 8, 'https://media.istockphoto.com/id/2163759573/photo/rear-view-of-man-running-on-treadmill-against-window-in-gym.jpg?s=612x612&w=0&k=20&c=3ucJr_872oZ8noQW_oLonhwup9c49BIUU8Isvh8CXuA=', 8, 10),
( 'Yoga Mat', 'Non-slip yoga mat', 2200, 50, 'https://media.istockphoto.com/id/1907365112/photo/red-exercise-mat-object-shadow-clipping-path.jpg?s=612x612&w=0&k=20&c=hL__Aku3UoLvjXhtGQRlwAC1E52hT_sfGhSNXw2C7m0=', 9, 10),
( 'Pull-up Bar', 'Door-mounted pull-up and chin-up bar', 3500, 20, 'https://media.istockphoto.com/id/509803285/photo/blank-roll-up-banner.jpg?s=612x612&w=0&k=20&c=F01tXLI-wnYf7f-PybO5uo5KfZLfNf513hBMjll1OK4=', 6, 10),
( 'Exercise Bike', 'Indoor cycling exercise bike', 38000, 10, 'https://media.istockphoto.com/id/2026779164/photo/living-room-interior-with-exercise-bike-sofa-and-television-set-exercising-on-tv-at-home.jpg?s=612x612&w=0&k=20&c=xPf1jDKX6dzwQgdhbKtUvRSddPv6qm45d89yn6zW9JA=', 7, 10)

-- Outdoor Sports
INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
( 'Football', 'Official size and weight football', 2800, 40, 'https://media.istockphoto.com/id/2173110289/photo/modern-moulded-soccer-football.jpg?s=612x612&w=0&k=20&c=JkVMx0HkoP72aWpEUhw971rmUX293c1MsESLw8WZnTc=', 8, 11),
( 'Cricket Bat', 'English willow cricket bat', 11500, 15, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwbOUX_5-gMqmNgro_deVo9bNSCsOjoAATFA&s', 9, 11),
( 'Tennis Racket', 'Lightweight graphite tennis racket', 6400, 20, 'https://media.istockphoto.com/id/1505246595/photo/tennis-racket-isolated-on-a-white-background.jpg?s=612x612&w=0&k=20&c=1wx3981ZQJEG1KHELJGoN6ppzs3Y8M1kF42gvrGQWKo=', 6, 11),
( 'Basketball', 'Standard size basketball', 3100, 25, 'https://media.istockphoto.com/id/1991934907/photo/orange-basketball-ball-on-white-background.jpg?s=612x612&w=0&k=20&c=4WINEG3oLq5ckHLtqeLfgzdTmAExL424Br1vly-YidI=', 7, 11),
( 'Badminton Set', '2 rackets and shuttlecock set', 2400, 35, 'https://media.istockphoto.com/id/121594005/photo/racket-and-shuttlecock-badminton.jpg?s=612x612&w=0&k=20&c=CN50ovLPQzgDQHY4BP1rOtvtT0nM6r2wP3puBDmVjT4=', 8, 11)

-- Indoor Games
INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
( 'Carrom Board', 'Standard size polished carrom board', 5500, 18, 'https://media.istockphoto.com/id/465562221/photo/carrom-board-game-angle-view.jpg?s=612x612&w=0&k=20&c=_p8oTb5MFS0XRRfQTZQCBXj1HdTzWRctgpKCX7NeIx0=', 9, 12),
( 'Table Tennis Set', 'Table tennis bat and ball set', 3600, 25, 'https://media.istockphoto.com/id/1425158165/photo/table-tennis-ping-pong-paddles-and-white-ball-on-blue-board.jpg?s=612x612&w=0&k=20&c=KSdi4bEGoxdhaGMnl6CZaqTLbKbobArgrrpLem3oN98=', 6, 12),
( 'Chess Set', 'Wooden chess board with carved pieces', 4200, 22, 'https://media.istockphoto.com/id/2192462590/photo/last-move-in-chess-check-mate-white-king-lying-down-defeated-defocused-backdrop.jpg?s=612x612&w=0&k=20&c=SWhGtaVWAt0OKNwELKRUzYqYql_fRWbrTI-JDfbT8QY=', 7, 12),
('Ludo Board', 'Classic family ludo board game', 1200, 40, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEIOFdJNiGdFNdIVZ9RrkNzFPTPKN5Qug_Zw&s', 8, 12),
( 'Darts Board', 'Magnetic darts board with darts', 2500, 28, 'https://media.istockphoto.com/id/176092856/photo/dartboard.jpg?s=612x612&w=0&k=20&c=yrrlh9rpOqulYEghOQekdl0IgmbEmg-i7H6xs9HS8Fs=', 9, 12)

-- Toys
INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
( 'Building Blocks', 'Colorful plastic building block set', 2600, 40, 'https://media.istockphoto.com/id/2122760638/photo/wooden-block-pyramid-on-table.jpg?s=612x612&w=0&k=20&c=2DXJVwW_JsRNCM7YbODPRvFQF55MdMEKYHARzq-1Erw=', 6, 13),
( 'Doll House', 'Wooden doll house with furniture', 4800, 15, 'https://media.istockphoto.com/id/185318612/photo/two-story-pink-model-play-house-with-white-trim-and-door.jpg?s=612x612&w=0&k=20&c=9jlLLMbiV18_hnqEmG7xCZ8hRUCVDBB2WViBXS_zqJo=', 7, 13),
( 'RC Car', 'Rechargeable remote control car', 6200, 18, 'https://media.istockphoto.com/id/2162211599/photo/remote-control-car-on-dirt-track.jpg?s=612x612&w=0&k=20&c=nQmP5kcLfbq2madEpAOHid_16sdPnH-pvZd1J5nNTyU=', 8, 13),
( 'Soft Toy Bear', 'Large soft toy teddy bear', 3500, 25, 'https://media.istockphoto.com/id/2162222617/photo/cute-brown-plush-bear-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=9SD4KkI1nqkRKY6MvrCHyfdAfIwXZyzLuJJCOx0ROlQ=', 9, 13),
( 'Puzzle Set', '100-piece educational puzzle', 1800, 35, 'https://media.istockphoto.com/id/2157935864/video/stop-motion-animation-of-a-blank-jigsaw-puzzle-being-constructed-to-completion.avif?s=640x640&k=20&c=DmdZeIw4GnSyQwRc5wURhZEFRbrcQRjSlKlPJ6KCzOQ=', 6, 13)

-- Kids Clothing
INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
( 'Kids T-Shirt', 'Cotton printed t-shirt for kids', 900, 50, 'https://media.istockphoto.com/id/470725586/photo/white-children-t-shirt.jpg?s=612x612&w=0&k=20&c=i2WnezD4bdV_575kCGM4rOAHbjfUj8rySAgpie9D0Ak=', 7, 14),
( 'Kids Jeans', 'Denim jeans for boys', 1800, 40, 'https://media.istockphoto.com/id/1278802424/photo/blue-childs-jeans-isolated-on-white-loose-trendy-pants-denim-kids-trousers.jpg?s=612x612&w=0&k=20&c=A6scV6ShakkqS5emmTb01D8rRggOF5taiaI0gF23vfE=', 8, 14),
( 'Girls Dress', 'Floral printed cotton dress', 2200, 30, 'https://media.istockphoto.com/id/508756496/photo/child-girl-cotton-bright-summer-clothes-set-collage-isolated.jpg?s=612x612&w=0&k=20&c=jauV6lRneqCvx11wvjQ_ja4viOQihPgjXiykjw7uSk4=', 9, 14),
( 'Winter Jacket', 'Warm padded jacket for kids', 3500, 20, 'https://media.istockphoto.com/id/184362036/photo/red-winter-jacket-on-white.jpg?s=612x612&w=0&k=20&c=fymNFZ1opFWLEdSTrs8EjA0EAe-JKNyijVdVxM54NYY=', 6, 14),
( 'School Uniform', 'Standard school uniform set', 2600, 25, 'https://media.istockphoto.com/id/1428734254/photo/stylish-school-uniform-for-boy-glasses-and-notebook-on-grey-background-flat-lay.jpg?s=612x612&w=0&k=20&c=qKdON2NVN4-IyCPnrNdxBUom0b0pvQ2yPn4ugjSuuic=', 7, 14)

-- Games
INSERT INTO products ( name, description, price, stock, image_url, user_id, sub_category_id) VALUES
( 'Monopoly', 'Classic monopoly board game', 4800, 20, 'https://media.istockphoto.com/id/2216408338/photo/wooden-block-with-handshake-and-human-icons-business-agreement-partnership-cooperation-and.jpg?s=612x612&w=0&k=20&c=JcbJm9smduBZsCDSdjWbK5g1cSmJo8PXBZITKcqgahQ=', 8, 15),
( 'Scrabble', 'Word-building scrabble game', 3200, 25, 'https://media.istockphoto.com/id/502558269/photo/scrabble-letters.jpg?s=612x612&w=0&k=20&c=12UjZ8LhHljnCZ9Hg1XS9wbK1h9sKu5FhGnCFwzXRL4=', 9, 15),
( 'Jenga', 'Wooden block stacking game', 2200, 30, 'https://media.istockphoto.com/id/2166660399/photo/of-wooden-blocks-is-a-game-on-the-table.jpg?s=612x612&w=0&k=20&c=U4r600LLMNZtnHjM5CNn-QxWQfktD2K3BpwIOWNycpY=', 6, 15),
( 'UNO Cards', 'Card game with 108 cards', 800, 60, 'https://copypencil.pk/cdn/shop/products/2f1335ac933ff7efc76916b63da9889a.jpg?v=1654858910', 7, 15),
( 'Clue Board Game', 'Detective mystery board game', 3600, 18, 'https://media.istockphoto.com/id/164415669/vector/3d-trivia-board-game.jpg?s=612x612&w=0&k=20&c=yPttDAGLAT2qID1KxpHVFE0OBUDcTKKALh3H7mmmZVs=', 8, 15)








-- Healthcare & Fitness (category_id = 18)

INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Whey Protein Powder', 'High-quality protein for muscle recovery.', 49.99, 80, 'https://media.istockphoto.com/id/174988875/photo/chocolate-protein-powder.jpg?s=612x612&w=0&k=20&c=5Cs6u7DuwR5JqI5Q6I9pzcDV1bhxaUuepUPL9bAZcKs=', 6, 25),
('Multivitamin Tablets', 'Daily essential vitamins and minerals.', 19.99, 120, 'https://media.istockphoto.com/id/2117450945/photo/many-different-pills-on-pink-background-prescription-pills-and-vitamins-flat-lay-and-space.jpg?s=612x612&w=0&k=20&c=ceCnTQpO07tNAK9tkGzhACarkBt6XsuBceoO5lEtSx8=', 7, 25),
('Omega-3 Fish Oil', 'Supports heart and brain health.', 24.99, 90, 'https://media.istockphoto.com/id/654379506/photo/two-capsules-omega-3-isolated-on-white-background.jpg?s=612x612&w=0&k=20&c=fAM84_HDeY9sOnTEhIx2po15KCDnuqbpUpbYWO_RM88=', 8, 25),
('Vitamin C Gummies', 'Boosts immunity and skin health.', 14.99, 150, 'https://media.istockphoto.com/id/1396989122/photo/jelly-vitamins-for-children-close-up.jpg?s=612x612&w=0&k=20&c=zm-twviZd7PSTJ2wWGzj1qCK5mNIYjgVA0BJ_L65sD8=', 9, 25),
('Pre-Workout Supplement', 'Energy boost for workouts.', 34.99, 60, 'https://media.istockphoto.com/id/2165293503/vector/set-of-sports-nutrition-products-including-protein-powder-bag-shaker-bottle-protein-bar-and.jpg?s=612x612&w=0&k=20&c=SUeUGkDvJzNe_-mv4Udk5P6S5lNf6r4_p-7nQmSGe3M=', 6, 25);

INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Yoga Mat', 'Non-slip eco-friendly yoga mat.', 29.99, 100, 'https://media.istockphoto.com/id/2170986614/photo/yoga-mat.jpg?s=612x612&w=0&k=20&c=yO1lAZULYAdXLG1Vq4zKxz4SQMai0kbgtlH0s0HsBLo=', 7, 26),
('Yoga Block', 'Foam block for better posture support.', 12.99, 90, 'https://media.istockphoto.com/id/1353803929/photo/pair-of-blue-yoga-blocks.jpg?s=612x612&w=0&k=20&c=7-ZbdHBhqMfF0kQZHBFxSF8gd6tyGVJZUagr7wVW-FQ=', 8, 26),
('Meditation Cushion', 'Comfortable round floor cushion.', 24.99, 70, 'https://media.istockphoto.com/id/481676281/photo/cushions-for-zen-meditation.jpg?s=612x612&w=0&k=20&c=ATRB2uAveT8yVsvaRhqLj1yYBGyHbt3VuGV7tiw8nLM=', 9, 26),
('Resistance Bands', 'Set of 5 workout resistance bands.', 19.99, 85, 'https://media.istockphoto.com/id/2199626658/photo/stylized-resistance-band-with-handles.jpg?s=612x612&w=0&k=20&c=4g54S0XFjhYUojD6Y4l79W8ppDjqV0QxZnmZBBGiZuw=', 6, 26),
('Yoga Strap', 'Adjustable cotton yoga strap.', 9.99, 100, 'https://media.istockphoto.com/id/497629560/photo/yoga-strap.jpg?s=612x612&w=0&k=20&c=Dx7MuTtmEWoSFuIT4nau_8-aLr4b1aaa1gPA6FP1sso=', 7, 26);

INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Digital Thermometer', 'Fast and accurate body temperature reading.', 14.99, 90, 'https://media.istockphoto.com/id/182787080/photo/digital-thermometer.jpg?s=612x612&w=0&k=20&c=y460xmSoeQLG6WanzdYjIa6b6ijBgxZ-E9nCSU_0xLQ=', 8, 27),
('Blood Pressure Monitor', 'Automatic digital BP monitor.', 49.99, 50, 'https://media.istockphoto.com/id/2151557806/photo/detail-of-manual-blood-pressure-isolated-on-white-table.jpg?s=612x612&w=0&k=20&c=An8UCqDoKIU1zQBD6ZgWus29lyMMrvtLPUpruz3bAuQ=', 9, 27),
('Pulse Oximeter', 'Measures oxygen saturation and pulse.', 29.99, 70, 'https://media.istockphoto.com/id/1331801708/photo/portable-pulse-oximeter-device-on-white-background.jpg?s=612x612&w=0&k=20&c=G-4eF2rgGd-bWgXZlwfYPfXI2rMKX9tBhrNGFBbLmKM=', 6, 27),
('Glucometer Kit', 'Blood glucose monitoring device.', 39.99, 60, 'https://media.istockphoto.com/id/97532031/photo/diabetes-kit.jpg?s=612x612&w=0&k=20&c=WNYWqncwtsSFj5wQSQaB0pTxKWYhqKijNkjrBlglmD4=', 7, 27),
('First Aid Kit', 'Compact emergency medical kit.', 24.99, 80, 'https://media.istockphoto.com/id/2167558560/photo/first-aid-kit.jpg?s=612x612&w=0&k=20&c=6U4vvW7c3xA40_ZmmHevTj3frn9bOmG12imrCQ2ZhKE=', 8, 27);

-- Groceries (category_id = 19)

INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Fresh Apples', 'Organic red apples, 1kg.', 3.99, 100, 'https://media.istockphoto.com/id/155375750/photo/red-apples-at-market.jpg?s=612x612&w=0&k=20&c=lmHinxPN20-nIm15ewPYetBPv0US4rYzACe8LOEbe-Q=', 9, 28),
('Bananas', 'Fresh ripe bananas, 1 dozen.', 2.49, 120, 'https://media.istockphoto.com/id/1188907420/video/lots-of-bananas-moving-shot.avif?s=640x640&k=20&c=Ps5ypaMnYwCZKZFRuNTAR9_xa96QrQ6GNFyoM9XQ-RQ=', 6, 28),
('Tomatoes', 'Organic farm tomatoes, 1kg.', 2.99, 90, 'https://media.istockphoto.com/id/536172727/photo/truss-tomato-background.jpg?s=612x612&w=0&k=20&c=Jc5vY54yBH3kDlt3ZlNor9Pm_ReVfSTXyjv5rwH7Rqc=', 7, 28),
('Carrots', 'Fresh crunchy carrots, 1kg.', 1.99, 85, 'https://media.istockphoto.com/id/2150710300/photo/overhead-view-of-freshly-sliced-organic-carrots-on-cutting-board.jpg?s=612x612&w=0&k=20&c=ukr4W-a52GLyqT2jshKF8DHEkPkmvjrP5-cSE0GmZZU=', 8, 28),
('Spinach', 'Green leafy spinach bundle.', 1.49, 70, 'https://media.istockphoto.com/id/157330429/photo/baby-spinach.jpg?s=612x612&w=0&k=20&c=B7m9Orx_E5gNoj1XNYGdL3NXPzEqwi8DBAYoYGL6R7M=', 9, 28);

INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Instant Noodles', 'Pack of 5 spicy noodles.', 4.99, 100, 'https://media.istockphoto.com/id/2032854605/photo/instant-noodles-pattern-background.jpg?s=612x612&w=0&k=20&c=LWWnJ3xHyl-sHpTM1GjkBRrQWcxjdpWAG3HTf57czeE=', 6, 29),
('Canned Beans', 'High-protein canned beans.', 2.99, 80, 'https://media.istockphoto.com/id/2150777817/vector/colorful-canned-goods-including-vegetables-and-fish.jpg?s=612x612&w=0&k=20&c=pZPUroCXjCtc4qpZf6XwS_IolOndioJ8NuMZKghJzbQ=', 7, 29),
('Potato Chips', 'Family pack crispy potato chips.', 3.49, 110, 'https://media.istockphoto.com/id/2187193921/photo/freeze-motion-of-flying-fried-potatoes-chips.jpg?s=612x612&w=0&k=20&c=xOH1TpL0FBp4jyHpgsNFyw4cnqcNI1ImDVJbRvTSGP0=', 8, 29),
('Breakfast Cereal', 'Whole grain cornflakes.', 5.99, 90, 'https://media.istockphoto.com/id/1152410298/video/mother-buys-cereal-from-shelf.avif?s=640x640&k=20&c=x01iJmBJcZOlim6YEgQHYL_AvY_Mh2MxN6nCQkxooMk=', 9, 29),
('Chocolate Bars', 'Pack of 3 premium chocolates.', 6.99, 95, 'https://media.istockphoto.com/id/2167251577/photo/shelf-with-chocolates-at-the-ah-supermarket.jpg?s=612x612&w=0&k=20&c=s_E-aFRo243NygJrw8DsfIJEbrxP8gb1nxpv-eghtmE=', 6, 29);

INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Orange Juice', '1L 100% natural orange juice.', 3.49, 90, 'https://media.istockphoto.com/id/915657126/photo/orange-juice-glass-jar-shot-on-rustic-wooden-table.jpg?s=612x612&w=0&k=20&c=rlj0FwRDQOAV_j8-MUQntzIj8fZegbMewj22nNXxiYc=', 7, 30),
('Green Tea', 'Box of 25 tea bags.', 4.99, 85, 'https://media.istockphoto.com/id/1299342760/photo/glass-cup-of-green-tea-with-fresh-tea-leaves-on-wooden-table-hot-drink-concept.jpg?s=612x612&w=0&k=20&c=Lxa6BAivj5hcdjTXISqulVZIah8C8sl7Vjxs3qm0G20=', 8, 30),
('Coffee Beans', 'Premium roasted coffee beans 500g.', 12.99, 60, 'https://media.istockphoto.com/id/2202893411/photo/top-view-of-roasted-coffee-beans-on-white-background.jpg?s=612x612&w=0&k=20&c=KAHFccM7fDnyF2_PTzj5tXlYlLUIBasvTMDiH_M28S8=', 9, 30),
('Soft Drink Pack', '6-pack assorted soft drinks.', 5.99, 100, 'https://media.istockphoto.com/id/2162110995/photo/soft-drinks.jpg?s=612x612&w=0&k=20&c=fLs6RYC7NPY3oP0r-F2QgiQKeiXC5vtDEpdAJS590-o=', 6, 30),
('Bottled Water', 'Pack of 12 mineral water bottles.', 3.99, 120, 'https://media.istockphoto.com/id/2175286400/photo/stack-of-drinking-water-bottles-blue-water-texture-with-droplets-and-frosty-winter-patterns.jpg?s=612x612&w=0&k=20&c=e89xsHBTNdVD0kkqzgojwImPzPGjpb70Xti7vfB-5aQ=', 7, 30);








-- Beauty & Personal Care: Skincare (sub_category_id = 16)
INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Hydrating Face Cream', 'Moisturizer with hyaluronic acid for all skin types.', 24.99, 60, 'https://m.media-amazon.com/images/I/61pNzL-8ztL._UF1000,1000_QL80_.jpg', 6, 16),
('Vitamin C Serum', 'Brightening serum with Vitamin C and antioxidants.', 19.99, 50, 'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-560w,f_auto,q_auto:best/rockcms/2023-09/230901-vitamin-c-vl-main-bf5812.jpg', 7, 16),
('Gentle Cleanser', 'Foaming face wash for sensitive skin.', 14.99, 70, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxj8E8bUXYNz4GywYKF5_77FtUQ_3n6a57Ig&s', 8, 16),
('Sheet Masks Pack', 'Hydrating and soothing facial masks (set of 5).', 12.99, 100, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpYQEBZ5lulKrEoVSyddv-TvAkQPJc1lDi0A&s', 9, 16),
('Sunscreen SPF 50', 'Broad spectrum sun protection lotion.', 17.99, 80, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQBHrJFj7nXc3Na1hvKF4Eu4MO6Rq6aVV-lQ&s', 6, 16);

-- Beauty & Personal Care: Haircare (sub_category_id = 17)
INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Anti-Dandruff Shampoo', 'Herbal shampoo for dandruff control.', 9.99, 100, 'https://assets.unileversolutions.com/v1/1722623.png', 7, 17),
('Hair Conditioner', 'Moisturizing conditioner with keratin.', 11.99, 80, 'https://lahorebasket.com/cdn/shop/files/loreal-paris-6-oil-nourish-scalp-hair-nourishing-conditioner-for-all-hair-types-175-ml-666687.jpg?v=1737618099&width=1445', 8, 17),
('Argan Hair Oil', 'Nourishing oil for smooth and shiny hair.', 14.99, 50, 'https://images-cdn.ubuy.co.in/6380d18bf7e21f1c554e50c3-ogx-renewing-argan-oil-of-morocco.jpg', 9, 17),
('Hair Serum', 'Leave-in serum for frizz control.', 12.99, 60, 'https://images-static.nykaa.com/media/catalog/product/b/2/b2e2a976923700970449_2.jpg?tr=w-500', 6, 17),
('Hair Mask', 'Deep conditioning mask for damaged hair.', 16.99, 40, 'https://skinstash.pk/cdn/shop/files/Ampoule_6.png?v=1754083295&width=1946', 7, 17);

-- Beauty & Personal Care: Makeup (sub_category_id = 18)
INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Matte Lipstick', 'Long-lasting matte finish lipstick.', 9.99, 90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBj2s8UaGynhc69eqGWilyqfNFnEX4fTXjlQ&s', 8, 18),
('Liquid Foundation', 'Full coverage foundation for all skin tones.', 19.99, 70, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_3_cNuA0YwFNec3nJ5PA3xwPfrHV5gtBXjw&s', 9, 18),
('Eyeshadow Palette', '12-shade eyeshadow palette.', 15.99, 50, 'https://ameena.pk/cdn/shop/files/51795522_2258669861063559_7660750771499040768_n_aa85d74b-9cf8-416d-bbde-fbdd8136d64c.webp?v=1721927269', 6, 18),
('Mascara', 'Waterproof volumizing mascara.', 11.99, 100, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ52qYkwvivODeBU5yqVWJWXKVanV211NaOcw&s', 7, 18),
('Blush Compact', 'Peach-toned powder blush.', 8.99, 80, 'https://houseofrouge.pk/wp-content/uploads/2023/10/s2657518-main-zoom.webp', 8, 18);

-- Books & Stationery: Fiction (sub_category_id = 19)
INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('The Great Gatsby', 'Classic novel by F. Scott Fitzgerald.', 14.99, 40, 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/The_Great_Gatsby_Cover_1925_Retouched.jpg/960px-The_Great_Gatsby_Cover_1925_Retouched.jpg', 9, 19),
('To Kill a Mockingbird', 'Novel by Harper Lee.', 12.99, 30, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS68RY84hFCFEv79YFlT9_dhetWuxhIO9Un6w&s', 6, 19),
('1984', 'Dystopian fiction by George Orwell.', 13.99, 50, 'https://bookabook.pk/cdn/shop/products/71kxa1-0mfL_bbe6ad60-9dff-47b8-8e64-66a115d373ae.jpg?v=1651846714&width=1445', 7, 19),
('Pride and Prejudice', 'Romantic classic by Jane Austen.', 10.99, 60, 'https://m.media-amazon.com/images/M/MV5BMTA1NDQ3NTcyOTNeQTJeQWpwZ15BbWU3MDA0MzA4MzE@._V1_FMjpg_UX1000_.jpg', 8, 19),
('The Hobbit', 'Fantasy novel by J.R.R. Tolkien.', 15.99, 40, 'https://m.media-amazon.com/images/M/MV5BMTcwNTE4MTUxMl5BMl5BanBnXkFtZTcwMDIyODM4OA@@.V1_FMjpg_UX1000.jpg', 9, 19);

-- Books & Stationery: Academic (sub_category_id = 20)
INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Mathematics Textbook', 'Algebra and geometry reference book.', 29.99, 70, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg0KSnl21iBCcb3XPpAlVZryo5m8E_Tl04OA&s', 6, 20),
('Physics for Beginners', 'Basic concepts of physics explained.', 34.99, 40, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1647264118i/58640114.jpg', 7, 20),
('Medical Handbook', 'Reference guide for medical students.', 39.99, 30, 'https://javedbooks.pk/cdn/shop/files/FullSizeRender_712e2051-1100-4c20-a349-722163247f6c.jpg?v=1730411758', 8, 20),
('Programming in Python', 'Beginner to advanced Python programming.', 44.99, 50, 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1577622829i/50076664.jpg', 9, 20),
('Engineering Mechanics', 'Mechanical engineering guide.', 49.99, 20, 'https://m.media-amazon.com/images/I/818Z0o0CcgL.UF894,1000_QL80.jpg', 6, 20);

-- Books & Stationery: Stationery (sub_category_id = 21)
INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Leather Notebook', 'Premium ruled notebook for journaling.', 9.99, 100, 'https://m.media-amazon.com/images/I/81fMzY792wL.AC_SL1500.jpg', 7, 21),
('Gel Pens Set', 'Pack of 10 colorful gel pens.', 6.99, 200, 'https://m.media-amazon.com/images/I/51djsptWinL.jpg', 8, 21),
('Desk Planner', 'Weekly planner for office use.', 7.99, 120, 'https://www.solopress.com/thumbnails/0/215352/48/desk-planners-690x610.jpg', 9, 21),
('Sticky Notes Pack', 'Pack of 12 sticky notes in assorted colors.', 4.99, 150, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKxy_QPVL9ww3FNiAgT5mnI3nOPTFDa9VMtg&s', 6, 21),
('Office Supply Kit', 'Bundle of pens, markers, and clips.', 12.99, 80, 'https://m.media-amazon.com/images/I/71xAmHMoupL.AC_SL1500.jpg', 7, 21);

-- Automotive: Car Accessories (sub_category_id = 22)
INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Car Seat Cover Set', 'Leather seat covers for full car.', 59.99, 30, 'https://m.media-amazon.com/images/I/51HAgVO3uPL.SL500.jpg', 8, 22),
('Steering Wheel Cover', 'Non-slip stylish cover.', 14.99, 100, 'https://m.media-amazon.com/images/I/61idZNIVOVL.UF894,1000_QL80.jpg', 9, 22),
('Car Floor Mats', 'All-weather rubber mats (set of 4).', 29.99, 50, 'https://m.media-amazon.com/images/I/81F1eOy7njL.AC_SL1500.jpg', 6, 22),
('Car Organizer', 'Multi-pocket backseat organizer.', 19.99, 70, 'https://autozcare.com/cdn/shop/products/car-seat-back-organizer.jpg?v=1670507087', 7, 22),
('Dashboard Perfume', 'Car freshener with luxury fragrance.', 9.99, 120, 'https://kingshub.pk/cdn/shop/files/699366f7-5dd0-471d-96b0-2ffbddb36cc6-3d463eef-4501-4795-a926-685c34b47289-_2.jpg?v=1742057614&width=1024', 8, 22);

-- Automotive: Bike Accessories (sub_category_id = 23)
INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Riding Helmet', 'Safety helmet with visor.', 39.99, 60, 'https://www.reisemoto.com/cdn/shop/collections/Helmet-ReiseMoto-9203.jpg?crop=center&height=1200&v=1724133460&width=1200', 9, 23),
('Motorbike Gloves', 'Leather gloves for bikers.', 24.99, 70, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpQvB4NQvXlIuIi70-w-nWdChpPYsSx_njQA&s', 6, 23),
('Bike Cover', 'Waterproof and dustproof cover.', 19.99, 90, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfAb3h06Yc9giAoQSD61zABtFD5K4AEP-w7g&s', 7, 23),
('Knee Guards', 'Protective gear for bikers.', 29.99, 50, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQT5UK23e2-5_Em7AJNVUoPdPmpkzhejZ0snA&s', 8, 23),
('Riding Jacket', 'Waterproof biker jacket.', 79.99, 40, 'https://m.media-amazon.com/images/I/81jwJsWWDLL.UF350,350_QL80.jpg', 9, 23);

-- Automotive: Maintenance Tools (sub_category_id = 24)
INSERT INTO products (name, description, price, stock, image_url, user_id, sub_category_id) VALUES
('Car Wash Kit', 'Complete set for car cleaning.', 34.99, 50, 'https://m.media-amazon.com/images/I/51dxGgutvxL.SL500.jpg', 6, 24),
('Engine Oil 5L', 'Premium synthetic motor oil.', 49.99, 30, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnM2APnr5hVC9EdKuYeiNJRCLS7E_7crlbEQ&s', 7, 24),
('Tire Inflator', 'Portable air pump for cars.', 39.99, 40, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtluX7HwzLVXbKUXHUIziXo15_MChrHJabkQ&s', 8, 24),
('Tool Kit Box', 'Set of essential car repair tools.', 59.99, 25, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF1_z1oHGSPPcTq-saNAlfh1OX68dS2TW_6A&s', 9, 24),
('Car Polish Wax', 'High gloss car polish.', 14.99, 80, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAZ8SU-1Hs8q-mDNULmTMv7BmXLwyt9OjdJw&s', 6, 24);