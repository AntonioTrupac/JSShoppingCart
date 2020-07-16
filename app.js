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

//buttons
let buttonsDOM = [];

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
     getBagButtons(){
         const buttons = [...document.querySelectorAll('.bag-btn')];
         console.log(buttons);
         buttons.forEach(button =>{
             let id = button.dataset.id;
             let inCart = cart.find(item => item.id === id);
             buttonsDOM = buttons;

             if(inCart){
                 button.innerText = "In Cart";
                 button.disabled = true;
             }else{
                 button.addEventListener("click", (event) =>{
                     event.target.innerText = "In Cart";
                     event.target.disabled = true;
                     //get the product from products
                     let cartItem = { ...LocalStorage.getProduct(id), amount : 1 };
                     //add product to cart
                     cart = [...cart, cartItem];
                     //save cart in local storage
                     LocalStorage.saveCart(cart);
                     //set cart values 
                     this.setCartValue(cart);
                     //add cart item and display it
                     //show the cart

                 })
             }
         });  
    }
    setCartValue(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item =>{
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        console.log(cartTotal,cartItems);
    };
}
//storage
class LocalStorage{
    static saveProducts(products){
        localStorage.setItem("products",JSON.stringify(products));
    }
    //get products by id
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }
    //save cart
    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

document.addEventListener("DOMContentLoaded", () =>{
    const ui = new ProductsUI();
    const products = new Products();

    //get all products
    products.getProducts().then(products => {
         ui.displayProducts(products);
         LocalStorage.saveProducts(products)}).then(() => {
             ui.getBagButtons();
         });
    
    
});

//dark mode
/*
function myFunction() {
    var element = document.body;
    element.classList.toggle("dark-mode");
} */