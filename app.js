const cartBtn = document.querySelector('.cart-btn');
const closeCart = document.querySelector('.close-cart');
const clearCart = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

//
let cart = [];

//getting the products
class Products{
    async getProducts(){
        try{
            let result = await fetch('products.json');
            let data = await result.json(); //getting data in JSON format

            let products = data.items;
            products = products.map(item =>{
                const {title,price} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {title, price, id, image};
            });
            return products;

        }catch (error){
            console.log(error);
        }
    }
}
//display products
class ProductsUI{
    displayProducts(products){
        let result = '';
        products.forEach(product =>{
            result += `
            <!-- single product -->
                <article class="product">
                    <div class="img-container">
                        <img src=${product.image} alt="product" class="product-img">
                        <button class="bag-btn" data-id=${product.id}>
                             <i class="fas fa-shopping-cart" aria-hidden="true"></i>
                             add to bag
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>
                <!-- single product -->
            `
        });
        productsDOM.innerHTML = result; //inserting content with innerHtml
    }
     
}
//storage
class LocalStorage{

}

document.addEventListener("DOMContentLoaded", () =>{
    const ui = new ProductsUI();
    const products = new Products();

    //get all products
    products.getProducts().then(products => ui.displayProducts(products));
});