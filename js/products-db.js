// This is your "fake" database.
// Add all your products here.
// Make sure the 'image' path matches the files you add to your /images/ folder.

const products = [
    {
        id: "1",
        name: "Classic Denim Jacket",
        price: 79.99,
        description: "A timeless denim jacket that's a perfect layering piece. Made from 100% sturdy cotton.",
        category: "men",
        image: "images/t-shirt.jpeg", // <-- Add 'jacket-1.jpg' to your /images/ folder
        reviews: [
            { user: "Alex", rating: 5, comment: "Great fit and quality!" },
            { user: "Sam", rating: 4, comment: "Solid jacket, a bit stiff at first." }
        ]
    },
    {
        id: "2",
        name: "Striped Summer Dress",
        price: 49.99,
        description: "A light and airy cotton dress, perfect for warm days. Features an adjustable waist tie.",
        category: "women",
        image: "images/t-shirt2.jpeg", // <-- Add 'dress-1.jpg' to your /images/ folder
        reviews: [
            { user: "Maria", rating: 5, comment: "Absolutely love this dress. So comfy." }
        ]
    },
    {
        id: "3",
        name: "Vintage Graphic Tee",
        price: 29.99,
        description: "Soft, pre-washed cotton tee with a retro front graphic. Unisex fit.",
        category: "unisex", // You can use this for items on both men/women pages
        image: "images/t-shirt.jpeg", // <-- Add 'shirt-1.jpg' to your /images/ folder
        reviews: [
            { user: "Jamie", rating: 4, comment: "Cool design, very soft." }
        ]
    },
    {
        id: "4",
        name: "Leather Ankle Boots",
        price: 129.99,
        description: "Genuine leather ankle boots with a low heel. Versatile for any outfit.",
        category: "women",
        image: "images/t-shirt.jpeg", // <-- Add 'boots-1.jpg' to your /images/ folder
        reviews: [
            { user: "Chloe", rating: 5, comment: "Worth the price. They go with everything." },
            { user: "Ben", rating: 3, comment: "Took a while to break in." }
        ]
    }
    // ... Add as many products as you want here
];